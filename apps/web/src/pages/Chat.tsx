import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, TextArea } from '@talkitout/ui';
import { chatAPI, checkInAPI } from '../api/client';
import toast from 'react-hot-toast';
import { Mic, MicOff, Send, VolumeX, MessageCircle } from 'lucide-react';
import { MessageBubble } from '../components/MessageBubble';
import { useAuth } from '../contexts/AuthContext';
import {
  initializeVoiceClient,
  isVoiceEnabled,
  startBrowserRecognition,
  isBrowserSpeechSupported,
  stopAllSpeech,
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
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);

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

  const handleStopSpeaking = () => {
    stopAllSpeech();
    setIsAssistantSpeaking(false);
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div
        className="flex flex-col overflow-hidden rounded-[32px] border border-border bg-surface shadow-soft"
        style={{ height: 'calc(100vh - 180px)', minHeight: '520px' }}
      >
        {/* Header */}
        <div className="border-b border-border/70 bg-[#f3e5d3] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-black">Talk</p>
              <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold text-text">
                <MessageCircle className="h-6 w-6 text-brown1" />
                Let's Talk
              </h1>
              <p className="mt-1 text-sm text-black/70">I'm here to listen and support you.</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearChat}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-beige2/70"
                title="Clear all chat messages"
              >
                Clear chat
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[#fdf6ec] px-6 py-6">
          {showMoodSelector && (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="max-w-[80%] rounded-3xl border border-border bg-white/85 px-5 py-4 shadow-soft">
                <p className="mb-4 text-base font-semibold text-black">What's your mood like today?</p>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleMoodSelect(mood.value, mood.label)}
                      className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:bg-beige2/70 focus-visible:ring-2 focus-visible:ring-beige1"
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
            <div className="mx-auto max-w-2xl rounded-[28px] border border-border bg-white/90 px-8 py-12 text-center shadow-soft">
              <motion.div
                className="mb-6 text-6xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                ??
              </motion.div>
              <h2 className="mb-3 text-2xl font-semibold text-text">Hi {user?.name}! I'm right here.</h2>
              <p className="mb-6 text-base text-muted">
                Whether you need to talk about your day, work through something tough, or just breathe for a moment,
                this space is yours.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {suggestedPrompts.map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handlePromptClick(prompt)}
                    className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-text shadow-soft hover:bg-beige2/70"
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
                  onSpeechStateChange={setIsAssistantSpeaking}
                />
              );
            })}
          </AnimatePresence>

          {isLoading && !isRecordingAudio && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="rounded-2xl border border-border bg-white/80 px-4 py-3 shadow-soft">
                <div className="flex space-x-2">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brown1/60" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brown1/40" style={{ animationDelay: '0.1s' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brown1/20" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border/70 bg-[#f3e5d3] px-4 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                <Button
                  onClick={handleMicClick}
                  disabled={false}
                  className={`rounded-2xl px-4 py-3 text-text shadow-soft ${
                    isRecordingAudio
                      ? 'bg-[#b58758] text-white'
                      : 'bg-[var(--beige-1)] text-[#2f2015] hover:brightness-110'
                  }`}
                  aria-label={isRecordingAudio ? 'Stop recording' : 'Start recording'}
                >
                  {isRecordingAudio ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: isAssistantSpeaking ? 1.03 : 1 }} whileTap={{ scale: isAssistantSpeaking ? 0.96 : 1 }}>
                <Button
                  onClick={handleStopSpeaking}
                  disabled={!isAssistantSpeaking}
                  className={`rounded-2xl px-4 py-3 transition ${
                    isAssistantSpeaking
                      ? 'bg-[#8b6947] text-white shadow-soft'
                      : 'cursor-not-allowed border border-border bg-[#eadcc6] text-muted opacity-70'
                  }`}
                  aria-label="Stop the assistant from speaking"
                  title="Stop the assistant from speaking"
                >
                  <VolumeX className="w-5 h-5" />
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
                className="flex-1 min-h-[60px] max-h-[120px] rounded-2xl border border-border bg-white/90 px-4 py-3 text-[#2f2015] placeholder:text-[#a88866] placeholder:opacity-90 focus:border-[var(--beige-1)] focus:ring-2 focus:ring-[var(--beige-1)]"
                disabled={isLoading || isRecordingAudio}
              />
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading || isRecordingAudio}
                  isLoading={isLoading && !isRecordingAudio}
                  className="rounded-2xl bg-[var(--beige-1)] px-6 py-3 font-semibold text-[#2f2015] shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
            <p className="text-xs text-muted">
              {voiceEnabled
                ? 'Press Enter to send, Shift+Enter for a new line, or use the mic to record.'
                : 'Press Enter to send, Shift+Enter for a new line.'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface px-5 py-4 shadow-soft">
        <p className="text-sm text-muted">
          <strong className="text-text">Important:</strong> I'm here to support you, but I'm not a crisis service. If
          you're in immediate danger, please call <strong>Emergency 999</strong> or contact{' '}
          <strong>Samaritans of Singapore at 1767</strong>.
        </p>
      </div>
    </div>
  );
};
