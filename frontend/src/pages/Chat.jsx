import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

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
      fetchChats();
    }
  }, [token]);

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] relative z-0">
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
