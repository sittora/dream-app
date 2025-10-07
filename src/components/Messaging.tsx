import { motion } from 'framer-motion';
import { Send, User } from 'lucide-react';
import React, { useState } from 'react';

import type { Message, User as UserType } from '../types';

interface MessagingProps {
  currentUser: UserType;
  friends: UserType[];
}

const Messaging = ({ currentUser, friends }: MessagingProps) => {
  const [selectedFriend, setSelectedFriend] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriend || !newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedFriend.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="h-[600px] dream-card">
      <div className="flex h-full">
        <div className="w-1/3 border-r border-burgundy/20 p-4">
          <h3 className="font-cinzel text-lg mb-4">Friends</h3>
          <div className="space-y-2">
            {friends.map(friend => (
              <button
                key={friend.id}
                onClick={() => setSelectedFriend(friend)}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  selectedFriend?.id === friend.id
                    ? 'bg-burgundy/20'
                    : 'hover:bg-burgundy/10'
                }`}
              >
                <User className="w-5 h-5" />
                <span>{friend.username}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedFriend ? (
            <>
              <div className="p-4 border-b border-burgundy/20">
                <h3 className="font-cinzel text-lg">{selectedFriend.username}</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages
                  .filter(
                    m =>
                      (m.senderId === currentUser.id &&
                        m.receiverId === selectedFriend.id) ||
                      (m.senderId === selectedFriend.id &&
                        m.receiverId === currentUser.id)
                  )
                  .map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUser.id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === currentUser.id
                            ? 'bg-burgundy/20'
                            : 'bg-mystic-900/50'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </motion.div>
                    </div>
                  ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-burgundy/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field"
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a friend to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;