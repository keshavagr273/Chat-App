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
  const { token } = useAuthStore();
  const { selectedChat, fetchChats } = useChatStore();

  // Initialize socket and setup listeners
  useSocket();

  useEffect(() => {
    if (token) {
      fetchChats();
    }
  }, [token]);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans text-on-surface">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Dynamic Main Workspace */}
      <main className="flex-1 flex flex-col h-full bg-background relative z-0 overflow-hidden">
        {selectedChat ? <ChatBox /> : <Welcome />}
      </main>

      {/* WebRTC Video / Audio Call Overlays */}
      <IncomingCall />
      <OutgoingCall />
      <ActiveCall />
    </div>
  );
};

export default Chat;
