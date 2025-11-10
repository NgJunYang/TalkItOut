import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@talkitout/ui';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { speakWithBrowser } from '../lib/voiceClient';
import toast from 'react-hot-toast';

interface Message {
  id?: string;
  _id?: string;
  role: 'user' | 'assistant';
  text: string;
  sentiment?: string;
  severity?: number;
  createdAt: string | Date;
}

interface MessageBubbleProps {
  message: Message;
  index: number;
  autoPlay?: boolean;
  onSpeechStateChange?: (isSpeaking: boolean) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  autoPlay,
  onSpeechStateChange,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);

  const notifySpeechState = (state: boolean) => {
    if (message.role === 'assistant') {
      onSpeechStateChange?.(state);
    }
  };

  const handleSpeak = async () => {
    // If already speaking, stop it
    if (isSpeakingThis) {
      window.speechSynthesis.cancel();
      setIsSpeakingThis(false);
      setIsPlayingAudio(false);
      notifySpeechState(false);
      return;
    }

    // Otherwise, start speaking
    setIsPlayingAudio(true);
    setIsSpeakingThis(true);
    notifySpeechState(true);

    try {
      await speakWithBrowser(message.text);
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Unable to play audio right now.');
    } finally {
      setIsSpeakingThis(false);
      setIsPlayingAudio(false);
      notifySpeechState(false);
    }
  };

  // Auto-play for assistant messages if enabled
  React.useEffect(() => {
    if (autoPlay && message.role === 'assistant') {
      // Auto-play the most recent assistant message
      handleSpeak().catch((err) => {
        // Silently fail - TTS not available
        console.warn('TTS not available:', err.message);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, message.role, message.text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-[26px] px-5 py-3.5 shadow-soft ${
          message.role === 'user'
            ? 'border border-[#ead9c3] bg-[#fff7ec] text-[#2f2015]'
            : 'border border-[#b28757] bg-[#c9a375] text-[#1f130c]'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-[#70563d] opacity-80">{formatRelativeTime(message.createdAt)}</span>
          <div className="flex items-center gap-2">
            {message.role === 'user' && message.sentiment && (
              <span className="rounded-full border border-[#ead9c3] bg-white/60 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[#8b6947]">
                {message.sentiment}
              </span>
            )}
            {/* Speaker button for assistant messages */}
            {message.role === 'assistant' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleSpeak}
                className={`rounded-full border p-1.5 transition ${
                  isSpeakingThis
                    ? 'border-[#8b6947] bg-[#8b6947] text-white'
                    : 'border-[#ead9c3] bg-[#fff4e4] text-[#6b4b32]'
                }`}
                aria-label={isSpeakingThis ? 'Stop speaking' : 'Play audio'}
                disabled={isPlayingAudio && !isSpeakingThis}
              >
                {isPlayingAudio ? (
                  isSpeakingThis ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
