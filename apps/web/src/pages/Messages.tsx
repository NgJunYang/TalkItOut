import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, TextArea } from '@talkitout/ui';
import { counselorMessagesAPI } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Mail, MailOpen, Send } from 'lucide-react';

interface CounselorMessage {
  _id: string;
  from: {
    _id: string;
    name: string;
    role: string;
  };
  to?: {
    _id: string;
    name: string;
    role: string;
  };
  text: string;
  read: boolean;
  createdAt: string;
}

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CounselorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<CounselorMessage | null>(null);
  const [threadMessages, setThreadMessages] = useState<CounselorMessage[]>([]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await counselorMessagesAPI.getReceivedMessages();
      const messagesData = response.data.messages || [];

      // Transform the API response to match the component's expected structure
      const transformedMessages = messagesData.map((msg: any) => ({
        _id: msg._id,
        from: {
          _id: msg.fromUserId._id,
          name: msg.fromUserId.name,
          role: msg.fromUserId.role,
        },
        text: msg.text,
        read: msg.read,
        createdAt: msg.createdAt,
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = async (message: CounselorMessage) => {
    setSelectedMessage(message);
    setReplyText('');

    // Load conversation thread
    await loadThread(message._id);

    // Mark as read
    if (!message.read) {
      try {
        await counselorMessagesAPI.markAsRead(message._id);
        setMessages(prev =>
          prev.map(m => m._id === message._id ? { ...m, read: true } : m)
        );
      } catch (error) {
        console.error('Failed to mark message as read:', error);
        toast.error('Failed to mark message as read');
      }
    }
  };

  const loadThread = async (messageId: string) => {
    setIsLoadingThread(true);
    try {
      const response = await counselorMessagesAPI.getThread(messageId);
      const threadData = response.data.messages || [];

      // Transform thread messages
      const transformedThread = threadData.map((msg: any) => ({
        _id: msg._id,
        from: {
          _id: msg.fromUserId._id,
          name: msg.fromUserId.name,
          role: msg.fromUserId.role,
        },
        to: msg.toUserId ? {
          _id: msg.toUserId._id,
          name: msg.toUserId.name,
          role: msg.toUserId.role,
        } : undefined,
        text: msg.text,
        read: msg.read,
        createdAt: msg.createdAt,
      }));

      setThreadMessages(transformedThread);
    } catch (error) {
      console.error('Failed to load thread:', error);
      toast.error('Failed to load conversation');
      setThreadMessages([]);
    } finally {
      setIsLoadingThread(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage || isSendingReply) return;

    setIsSendingReply(true);
    try {
      await counselorMessagesAPI.replyToMessage(selectedMessage._id, replyText);
      toast.success('Reply sent successfully');
      setReplyText('');

      // Reload the thread to show the new reply
      await loadThread(selectedMessage._id);
    } catch (error: any) {
      console.error('Failed to send reply:', error);
      toast.error(error?.response?.data?.message || 'Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ti-green-600 mx-auto mb-4" />
          <p className="text-ti-ink/70">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900 mb-2">Messages from Counselor</h1>
        <p className="text-ti-ink/70">
          {unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-ti-ink-900 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Inbox ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📬</div>
                  <p className="text-ti-ink/70">No messages yet</p>
                  <p className="text-sm text-ti-ink/50 mt-1">Your counselor hasn't sent you any messages</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {messages.map((message) => (
                    <motion.div
                      key={message._id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleMessageClick(message)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedMessage?._id === message._id
                          ? 'bg-ti-green-50 border-ti-green-500 shadow-soft'
                          : message.read
                          ? 'bg-ti-beige-50/50 border-ti-beige-200 hover:border-ti-green-300'
                          : 'bg-ti-beige-100 border-ti-green-300 hover:border-ti-green-500'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {message.read ? (
                            <MailOpen className="w-4 h-4 text-ti-ink/40" />
                          ) : (
                            <Mail className="w-4 h-4 text-ti-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-sm ${message.read ? 'text-ti-ink-700' : 'text-ti-ink-900'}`}>
                              {message.from.name}
                            </span>
                            {!message.read && <Badge variant="positive" className="text-xs">New</Badge>}
                          </div>
                          <p className={`text-xs line-clamp-2 ${message.read ? 'text-ti-ink/50' : 'text-ti-ink/70'}`}>
                            {message.text}
                          </p>
                          <p className="text-xs text-ti-ink/40 mt-1">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2">
          {!selectedMessage ? (
            <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="text-6xl mb-4">💌</div>
                  <p className="text-ti-ink-800">Select a message to read</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
              <CardHeader className="border-b-2 border-ti-beige-300">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-ti-ink-900 text-xl">
                      Conversation with {selectedMessage.from.name}
                    </CardTitle>
                    <p className="text-sm text-ti-ink/60 mt-1">
                      Started {new Date(selectedMessage.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="info">{selectedMessage.from.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Conversation Thread */}
                {isLoadingThread ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ti-green-600 mx-auto mb-2" />
                    <p className="text-sm text-ti-ink/60">Loading conversation...</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                    {threadMessages.map((msg) => {
                      const messageAuthorId = (msg.from as any)?.id || (msg.from as any)?._id || msg.from;
                      const currentUserId = user?.id || (user as any)?._id;
                      const isFromMe = messageAuthorId && currentUserId ? messageAuthorId === currentUserId : false;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-xl ${
                              isFromMe
                                ? 'bg-ti-green-500 text-white'
                                : 'bg-ti-beige-100 text-ti-ink-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${isFromMe ? 'text-white/90' : 'text-ti-ink/70'}`}>
                                {msg.from.name}
                              </span>
                              <span className={`text-xs ${isFromMe ? 'text-white/70' : 'text-ti-ink/50'}`}>
                                {new Date(msg.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Section */}
                <div className="mt-6 pt-6 border-t-2 border-ti-beige-300">
                  <h3 className="text-sm font-medium text-ti-ink-900 mb-3 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Reply to {selectedMessage.from.name}
                  </h3>
                  <div className="space-y-3">
                    <TextArea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="min-h-[100px] bg-white border-2 border-ti-beige-300 rounded-xl focus:ring-2 focus:ring-ti-green-500 focus:border-ti-green-500"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSendingReply}
                        isLoading={isSendingReply}
                        className="bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white rounded-xl px-6 shadow-md hover:shadow-lg"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
