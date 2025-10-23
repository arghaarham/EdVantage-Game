import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, MessageCircle, Minus } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ChatBoxProps {
  playerId: string;
  username: string;
}

export function ChatBox({ playerId, username }: ChatBoxProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fetchInterval = useRef<any>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5d90d85a/chat/messages`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch messages:', response.status);
        return;
      }
      
      const data = await response.json();
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    if (!playerId) return;
    
    fetchMessages();
    fetchInterval.current = setInterval(fetchMessages, 1500);

    return () => {
      if (fetchInterval.current) clearInterval(fetchInterval.current);
    };
  }, [playerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5d90d85a/chat/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playerId,
            username,
            message: input,
          }),
        }
      );
      setInput('');
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isMinimized) {
    return (
      <div className="absolute bottom-4 left-4">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600/80 backdrop-blur-sm hover:bg-blue-700"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 w-96 bg-black/80 backdrop-blur-lg rounded-lg border border-white/20 flex flex-col h-96">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-white" />
          <h3 className="text-white">Global Chat</h3>
        </div>
        <Button
          onClick={() => setIsMinimized(true)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm">
            <span className="text-blue-400">{msg.username}:</span>{' '}
            <span className="text-white">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/20 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
        />
        <Button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}