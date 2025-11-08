import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@talkitout/ui';
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
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index, autoPlay }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);

  const getSentimentVariant = (sentiment?: string) => {
    if (sentiment === 'pos') return 'positive';
    if (sentiment === 'neg') return 'negative';
    return 'neutral';
  };

  const handleSpeak = async () => {
    // If already speaking, stop it
    if (isSpeakingThis) {
      window.speechSynthesis.cancel();
      setIsSpeakingThis(false);
      setIsPlayingAudio(false);
      return;
    }

    // Otherwise, start speaking
    setIsPlayingAudio(true);
    setIsSpeakingThis(true);

    try {
      await speakWithBrowser(message.text);
      setIsSpeakingThis(false);
      setIsPlayingAudio(false);
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeakingThis(false);
      setIsPlayingAudio(false);
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
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          message.role === 'user'
            ? 'bg-ti-beige-100 text-ti-ink-900 border-2 border-ti-beige-300'
            : 'bg-ti-green-500/15 border-2 border-ti-green-500/40 text-ti-ink'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-xs opacity-70">{formatRelativeTime(message.createdAt)}</span>
          <div className="flex items-center gap-2">
            {message.role === 'user' && message.sentiment && (
              <Badge variant={getSentimentVariant(message.sentiment)} className="text-xs">
                {message.sentiment}
              </Badge>
            )}
            {/* Speaker button for assistant messages */}
            {message.role === 'assistant' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSpeak}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSpeakingThis
                    ? 'bg-ti-green-500 text-white'
                    : 'bg-ti-beige-100 text-ti-ink-700 hover:bg-ti-green-100'
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
