import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge, TextArea } from '@talkitout/ui';
import { chatAPI } from '../api/client';
import toast from 'react-hot-toast';
import { formatRelativeTime } from '@talkitout/ui';

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await chatAPI.getHistory({ limit: 50 });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(userMessage);
      const { userMessage: savedUserMsg, aiMessage } = response.data;

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

  const suggestedPrompts = [
    'Make a 1-hour study plan',
    'I feel overwhelmed',
    'Plan for math test',
    'Help me focus better',
  ];

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const getSentimentVariant = (sentiment?: string) => {
    if (sentiment === 'pos') return 'positive';
    if (sentiment === 'neg') return 'negative';
    return 'neutral';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-ti-border rounded-2xl overflow-hidden shadow-soft-lg relative" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-mint/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-peach/20 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

        {/* Header */}
        <div className="border-b border-ti-border p-4 bg-white/80 backdrop-blur-sm relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-ink">💬 AI Study Companion</h1>
              <p className="text-sm text-ti-text-secondary">Always here to help you grow</p>
            </div>
            <Button size="sm" variant="ghost" onClick={loadHistory}>
              ↻ Refresh
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 200px)' }}>
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-ti-text-tertiary mb-6">Try one of these prompts:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    size="sm"
                    variant="secondary"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-green text-white shadow-soft'
                      : 'bg-gradient-to-br from-accent-mint/40 to-white border border-brand-green/20 text-ink'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className={`text-xs ${message.role === 'user' ? 'text-white/70' : 'text-ti-text-tertiary'}`}>
                      {formatRelativeTime(message.createdAt)}
                    </span>
                    {message.role === 'user' && message.sentiment && (
                      <Badge variant={getSentimentVariant(message.sentiment)} className="text-xs">
                        {message.sentiment}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-accent-mint/40 to-white border border-brand-green/20 rounded-2xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-brand-green rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2.5 h-2.5 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-ti-border p-4">
          <div className="flex space-x-2">
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Share what's on your mind..."
              className="flex-1 min-h-[60px] max-h-[120px]"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} isLoading={isLoading}>
              Send
            </Button>
          </div>
          <p className="text-xs text-ti-text-tertiary mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Crisis Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 p-4 bg-gradient-to-r from-accent-peach/30 to-yellow-50 border-2 border-orange-200 rounded-2xl"
      >
        <p className="text-sm text-ink">
          <span className="font-bold text-orange-700">⚠️ Note:</span> This AI is a support tool, not a crisis service. If you're in immediate danger, call <span className="font-semibold">999</span>{' '}
          or contact Samaritans of Singapore at <span className="font-semibold">1767</span>.
        </p>
      </motion.div>
    </div>
  );
};
