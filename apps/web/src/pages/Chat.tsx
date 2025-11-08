import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, TextArea } from '@talkitout/ui';
import { chatAPI, checkInAPI } from '../api/client';
import toast from 'react-hot-toast';
import { Mic, MicOff, Send } from 'lucide-react';
import { MessageBubble } from '../components/MessageBubble';
import { useAuth } from '../contexts/AuthContext';
import {
  initializeVoiceClient,
  isVoiceEnabled,
  startBrowserRecognition,
  isBrowserSpeechSupported,
} from '../lib/voiceClient';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [stopRecordingFn, setStopRecordingFn] = useState<(() => Promise<string>) | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const moods = [
    { value: 4, emoji: '😊', label: 'Pretty good' },
    { value: 3, emoji: '😐', label: 'Okay, I guess' },
    { value: 2, emoji: '😕', label: 'Not great' },
    { value: 1, emoji: '😰', label: 'Stressed' },
  ];

  useEffect(() => {
    loadHistory();
    initVoice();
    checkTodayMood();

    // Load auto-play preference from localStorage (default to true if not set)
    const savedAutoPlay = localStorage.getItem('autoPlayVoice');
    if (savedAutoPlay !== null) {
      setAutoPlayVoice(savedAutoPlay === 'true');
    } else {
      // Set default to true and save to localStorage
      setAutoPlayVoice(true);
      localStorage.setItem('autoPlayVoice', 'true');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show mood selector if no messages and hasn't checked in today
  useEffect(() => {
    if (messages.length === 0 && !hasCheckedInToday) {
      setShowMoodSelector(true);
    }
  }, [messages, hasCheckedInToday]);

  const checkTodayMood = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const response = await checkInAPI.getMine({
        startDate: today.toISOString(),
        limit: 1,
      });

      const hasCheckin = response.data.checkIns && response.data.checkIns.length > 0;
      setHasCheckedInToday(hasCheckin);
    } catch (error) {
      console.error('Error checking today mood:', error);
    }
  };

  const initVoice = async () => {
    try {
      await initializeVoiceClient();
      setVoiceEnabled(isVoiceEnabled());
    } catch (error) {
      console.error('Failed to initialize voice client:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await chatAPI.getHistory({ limit: 50 });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleClearChat = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete all chat messages? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      await chatAPI.clearHistory();
      setMessages([]);
      setShowMoodSelector(true);
      setHasCheckedInToday(false);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      toast.error('Failed to clear chat history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMoodSelect = async (moodValue: number, moodLabel: string) => {
    try {
      // Hide the mood selector immediately so user sees their message
      setShowMoodSelector(false);

      // Save mood check-in
      await checkInAPI.create({ mood: moodValue });
      setHasCheckedInToday(true);

      // Send a message indicating mood selection
      const moodMessage = `I'm feeling ${moodLabel.toLowerCase()}`;
      await handleSend(moodMessage);
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood');
      // Show mood selector again if there's an error
      setShowMoodSelector(true);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(textToSend);
      const { userMessage: savedUserMsg, aiMessage } = response.data;

      // Track the new AI message ID for auto-play
      setLastMessageId(aiMessage.id || aiMessage._id);

      setMessages((prev) => [
        ...prev,
        {
          ...savedUserMsg,
          role: 'user',
        },
        {
          ...aiMessage,
          role: 'assistant',
        },
      ]);
    } catch (error: any) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    // Check if browser supports speech recognition
    if (!isBrowserSpeechSupported() && !isRecordingAudio) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecordingAudio) {
      // Stop recording
      if (stopRecordingFn) {
        try {
          setIsLoading(true);
          const transcript = await stopRecordingFn();
          setIsRecordingAudio(false);
          setStopRecordingFn(null);

          if (transcript && transcript.length > 3) {
            // Auto-send if transcript has more than 3 characters
            await handleSend(transcript);
          } else if (transcript) {
            // Otherwise just populate the input
            setInput(transcript);
            toast.success('Transcribed! Edit or send.');
          } else {
            toast.error('No speech detected');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Failed to transcribe audio');
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      // Start browser-based speech recognition with real-time transcript updates
      try {
        const stopFn = await startBrowserRecognition((transcript) => {
          // Update input field in real-time as user speaks
          setInput(transcript);
        });
        setStopRecordingFn(() => stopFn);
        setIsRecordingAudio(true);
        toast.success('Listening... Speak now', {
          duration: 2000,
          icon: '🎙️',
        });
      } catch (error: any) {
        console.error('Speech recognition error:', error);
        if (error.message.includes('not-allowed')) {
          toast.error('Microphone access denied');
        } else {
          toast.error(error.message || 'Failed to start speech recognition');
        }
      }
    }
  };

  const suggestedPrompts = [
    "I'm feeling stressed today",
    'Can we just talk?',
    'I need help organizing things',
    'How can I feel better?',
  ];

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border-2 border-ti-beige-300 rounded-3xl overflow-hidden shadow-card flex flex-col" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
        {/* Header */}
        <div className="border-b-2 border-ti-beige-300 p-4 bg-gradient-to-r from-ti-green-500/5 to-ti-teal-500/5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-ti-ink-900 flex items-center">
                <span className="mr-2">💬</span> Let's Talk
              </h1>
              <p className="text-sm text-ti-ink/70 mt-1">I'm here to listen and support you</p>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearChat}
                className="shrink-0 text-red-600 hover:bg-red-50 px-3 py-2 text-lg"
                title="Clear all chat messages"
              >
                🗑️
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* Mood Selector - First Message */}
          {showMoodSelector && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-6"
            >
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-ti-green-500/15 border-2 border-ti-green-500/40">
                <p className="whitespace-pre-wrap leading-relaxed mb-4"> What's your mood like today?</p>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMoodSelect(mood.value, mood.label)}
                      className="px-4 py-2 bg-white border-2 border-ti-beige-300 rounded-full text-sm font-medium hover:border-ti-green-500 hover:bg-ti-green-50 transition-all flex items-center gap-2"
                    >
                      <span className="text-lg">{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {messages.length === 0 && !showMoodSelector && (
            <div className="text-center py-12 max-w-2xl mx-auto">
              <motion.div
                className="text-7xl mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                💬
              </motion.div>
              <h2 className="text-2xl font-bold text-ti-ink-900 mb-3">Hey {user?.name}! I'm here for you 👋</h2>
              <p className="text-lg text-ti-ink/70 mb-6">
                Whether you need to talk about your day, work through something tough, or just chat—I'm all ears.
                What's on your mind?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {suggestedPrompts.map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-6 py-3 bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message, idx) => {
              const messageId = message._id || message.id;
              const shouldAutoPlay = autoPlayVoice && messageId === lastMessageId && message.role === 'assistant';

              return (
                <MessageBubble
                  key={messageId || idx}
                  message={message}
                  index={idx}
                  autoPlay={shouldAutoPlay}
                />
              );
            })}
          </AnimatePresence>

          {isLoading && !isRecordingAudio && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-ti-surface-hover rounded-xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-ti-text-tertiary rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-ti-text-tertiary rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-2 h-2 bg-ti-text-tertiary rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t-2 border-ti-beige-300 p-4 bg-ti-beige-50/30 shrink-0">
          <div className="flex space-x-3">
            {/* Microphone Button - Always visible and clickable */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleMicClick}
                disabled={false}
                className={`rounded-xl px-4 ${
                  isRecordingAudio
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-ti-green-500 hover:bg-ti-green-600 text-white'
                }`}
                aria-label={isRecordingAudio ? 'Stop recording' : 'Start recording'}
              >
                {isRecordingAudio ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            </motion.div>

            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isRecordingAudio ? 'Recording... tap mic to stop' : "Share what's on your mind..."}
              className="flex-1 min-h-[60px] max-h-[120px] bg-white border-2 border-ti-beige-300 rounded-xl focus:ring-2 focus:ring-ti-green-500 focus:border-ti-green-500"
              disabled={isLoading || isRecordingAudio}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || isRecordingAudio}
                isLoading={isLoading && !isRecordingAudio}
                className="bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white rounded-xl px-6 shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
          <p className="text-xs text-ti-ink/60 mt-2">
            {voiceEnabled
              ? 'Press Enter to send, Shift+Enter for new line, or use the mic to record'
              : 'Press Enter to send, Shift+Enter for new line'}
          </p>
        </div>
      </div>

      {/* Crisis Notice */}
      <div className="mt-6 p-4 bg-peach-50 border-2 border-ti-peach-100 rounded-2xl">
        <p className="text-sm text-ti-ink-800">
          <strong className="text-ti-ink-900">💛 Important:</strong> I'm here to support you, but I'm not a
          crisis service. If you're in immediate danger, please call <strong>Emergency 999</strong> or contact{' '}
          <strong>Samaritans of Singapore at 1767</strong>.
        </p>
      </div>
    </div>
  );
};
