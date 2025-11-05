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
      <div className="bg-ti-surface border border-ti-border rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Header */}
        <div className="border-b border-ti-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">AI Study Companion</h1>
              <p className="text-sm text-ti-text-tertiary">Always here to help</p>
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
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    message.role === 'user'
                      ? 'bg-ti-primary-600 text-white'
                      : 'bg-ti-surface-hover text-ti-text-primary'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-xs opacity-70">
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
              <div className="bg-ti-surface-hover rounded-xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-ti-text-tertiary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-ti-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-ti-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
              className="flex-1 min-h-[60px] max-h-[120px] text-ti-ink-900"
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
      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-ti-text-secondary">
          <strong>Note:</strong> This AI is a support tool, not a crisis service. If you're in immediate danger, call 999
          or contact Samaritans of Singapore at 1767.
        </p>
      </div>
    </div>
  );
};
