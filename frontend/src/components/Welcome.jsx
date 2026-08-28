import { useAuthStore } from '../store/authStore';

const Welcome = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 min-h-screen relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container-highest/30 via-background to-background">
      {/* Background Aurora Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] emerald-glow-bg rounded-full blur-3xl pointer-events-none opacity-50"></div>

      {/* Main Dashboard Hero Content */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center relative z-10 animate-fade-in-up">
        {/* Glowing Chat Icon Badge */}
        <div className="w-24 h-24 rounded-3xl bg-primary-container mx-auto mb-6 flex items-center justify-center shadow-[0_0_45px_rgba(16,185,129,0.35)] border-4 border-surface-container relative group transition-transform duration-300 hover:scale-105">
          <span className="material-symbols-outlined text-on-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            chat
          </span>
          <div className="absolute inset-0 rounded-3xl border border-white/20"></div>
        </div>

        {/* Welcome Greeting */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-2 flex items-center justify-center gap-3">
            Welcome, {user?.username}! <span className="animate-wave text-3xl">👋</span>
          </h1>
          <p className="font-body text-text-muted text-base">
            Select a conversation from the sidebar to start messaging
          </p>
        </div>

        {/* Features Bento Card */}
        <div className="bento-card w-full p-6 md:p-8 border border-border-glass shadow-glass backdrop-blur-xl">
          <h3 className="font-display text-lg font-semibold text-center mb-6 text-on-surface flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">verified</span>
            Platform Capabilities
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FeatureItem icon="bolt" text="Real-time messaging" />
            <FeatureItem icon="edit_note" text="Live typing indicators" />
            <FeatureItem icon="wifi_tethering" text="Online/offline presence" />
            <FeatureItem icon="done_all" text="Read & delivery receipts" />
            <FeatureItem icon="add_reaction" text="Message reactions" />
            <FeatureItem icon="videocam" text="HD WebRTC Video Calls" />
            <FeatureItem icon="attach_file" text="File & Media sharing" />
            <FeatureItem icon="format_quote" text="Replies & Quoted chats" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low/60 border border-border-glass-light hover:border-primary/30 transition-colors">
    <div className="w-7 h-7 rounded-md flex items-center justify-center bg-primary/15 border border-primary/30 text-primary shrink-0">
      <span className="material-symbols-outlined text-sm font-semibold">{icon}</span>
    </div>
    <span className="font-body text-xs font-medium text-on-surface truncate">{text}</span>
  </div>
);

export default Welcome;
