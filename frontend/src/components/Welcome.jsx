import { FiMessageCircle } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const Welcome = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-dark-300">
      <div className="text-center">
        <div className="inline-block p-6 bg-gradient-to-r from-primary to-secondary rounded-full mb-6">
          <FiMessageCircle className="text-6xl text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome, {user?.username}! 👋
        </h2>
        <p className="text-gray-400 mb-6">
          Select a chat to start messaging
        </p>
        <div className="bg-dark-200 rounded-lg p-6 max-w-md">
          <h3 className="text-white font-semibold mb-3">Features:</h3>
          <ul className="text-gray-400 text-sm space-y-2 text-left">
            <li>✅ Real-time messaging</li>
            <li>✅ Typing indicators</li>
            <li>✅ Online/offline status</li>
            <li>✅ Read receipts</li>
            <li>✅ Message reactions</li>
            <li>✅ Edit & delete messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
