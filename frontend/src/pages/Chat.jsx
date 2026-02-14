import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { initSocket, disconnectSocket } from '../utils/socket';
import { useSocket } from '../hooks/useSocket';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import Welcome from '../components/Welcome';
import IncomingCall from '../components/IncomingCall';
import OutgoingCall from '../components/OutgoingCall';
import ActiveCall from '../components/ActiveCall';

const Chat = () => {
  const { user, token } = useAuthStore();
  const { selectedChat, fetchChats } = useChatStore();

  // Initialize socket and setup listeners
  useSocket();

  useEffect(() => {
    if (token) {
      initSocket(token);
      fetchChats();
    }

    return () => {
      disconnectSocket();
    };
  }, [token]);

  return (
    <div className="flex h-screen bg-dark-300">
      <Sidebar />
      <div className="flex-1">
        {selectedChat ? <ChatBox /> : <Welcome />}
      </div>

      {/* Call Components */}
      <IncomingCall />
      <OutgoingCall />
      <ActiveCall />
    </div>
  );
};

export default Chat;
