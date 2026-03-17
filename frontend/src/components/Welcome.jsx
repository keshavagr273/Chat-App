import { FiMessageCircle } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const Welcome = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0b101a] text-center w-full">
      <div className="flex flex-col items-center max-w-lg mt-[-5%] transition-all duration-500 animate-fade-in-up">
        <div className="w-[110px] h-[110px] bg-secondary rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-secondary/20 border-4 border-[#1c2438]">
          <FiMessageCircle className="text-[55px] text-white stroke-[1.5]" />
        </div>
        
        <h2 className="text-[32px] font-bold text-gray-100 mb-3 tracking-tight flex items-center gap-3">
          Welcome, {user?.username}! <span className="text-[28px] animate-wave origin-bottom-right">👋</span>
        </h2>
        
        <p className="text-[#8e9bb0] mb-10 text-[15px] max-w-sm">
          Select a chat to start messaging
        </p>
        
        <div className="bg-[#141b2d] rounded-xl p-7 w-full max-w-[320px] shadow-xl border border-[#212a40]">
          <h3 className="text-gray-200 font-semibold mb-5 text-[15px] flex items-center justify-center tracking-wide">
            Features:
          </h3>
          <ul className="text-[#8e9bb0] text-[13px] space-y-3.5 text-left font-medium">
            <FeatureItem text="Real-time messaging" />
            <FeatureItem text="Typing indicators" />
            <FeatureItem text="Online/offline status" />
            <FeatureItem text="Read receipts" />
            <FeatureItem text="Message reactions" />
            <FeatureItem text="Edit & delete messages" />
          </ul>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }) => (
  <li className="flex items-center gap-3">
    <div className="w-5 h-5 rounded bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center shrink-0">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <span className="text-gray-300 group-hover:text-gray-200 transition-colors">{text}</span>
  </li>
);

export default Welcome;
