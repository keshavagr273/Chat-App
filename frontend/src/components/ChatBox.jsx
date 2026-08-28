import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../utils/socket';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatBox = () => {
  const { selectedChat, fetchMessages } = useChatStore();
  const { user } = useAuthStore();
  const socket = getSocket();

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);

      // Join chat room
      if (socket) {
        socket.emit('join_chat', selectedChat._id);
      }

      // Mark messages as read
      if (socket) {
        socket.emit('mark_chat_read', { chatId: selectedChat._id });
      }
    }

    return () => {
      if (socket && selectedChat) {
        socket.emit('leave_chat', selectedChat._id);
      }
    };
  }, [selectedChat?._id]);

  if (!selectedChat) return null;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Subtle Aurora Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] emerald-glow-bg rounded-full blur-3xl pointer-events-none opacity-20"></div>

      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default ChatBox;
