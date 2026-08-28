import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  FiArrowRight, 
  FiCheckCircle, 
  FiShield, 
  FiCpu, 
  FiZap, 
  FiUsers, 
  FiVideo, 
  FiMessageSquare,
  FiShare2,
  FiLock,
  FiTerminal,
  FiExternalLink
} from 'react-icons/fi';

const Landing = () => {
  const { user } = useAuthStore();

  const features = [
    {
      icon: 'forum',
      title: 'True Real-Time Messaging',
      desc: 'Instant delivery powered by Socket.IO with comprehensive presence tracking and live typing indicators.',
      badge: 'Socket.IO',
      highlight: 'Sub-50ms Latency',
      gradient: 'from-emerald-500/20 to-teal-500/10'
    },
    {
      icon: 'video_camera_front',
      title: 'P2P Audio & Video Calls',
      desc: 'Crystal clear peer-to-peer connections using WebRTC, backed by reliable STUN/TURN global relay infrastructure.',
      badge: 'WebRTC Mesh',
      highlight: 'HD Quality P2P',
      gradient: 'from-teal-500/20 to-cyan-500/10'
    },
    {
      icon: 'add_reaction',
      title: 'Rich Message Interactions',
      desc: 'Organize conversations with emoji reactions, threaded replies, and seamless file & image sharing.',
      badge: 'Interactive',
      highlight: 'Reactions & Media',
      gradient: 'from-emerald-500/20 to-green-500/10'
    },
    {
      icon: 'link',
      title: 'Smart Link Previews',
      desc: 'Automatically parses OpenGraph metadata to display rich interactive media cards for links in the chat stream.',
      badge: 'OpenGraph Parser',
      highlight: 'Live Previews',
      gradient: 'from-teal-500/20 to-emerald-500/10',
      isWide: true
    },
    {
      icon: 'group',
      title: 'Advanced Group Admin',
      desc: 'Fine-grained roles, group member management, member kick/leave, and custom group avatars.',
      badge: 'Management',
      highlight: 'Role Controls',
      gradient: 'from-emerald-500/20 to-teal-500/10'
    },
    {
      icon: 'security',
      title: 'Enterprise-Grade Security',
      desc: 'Secured with bcryptjs salted password hashing, robust JWT authentication, and sanitized inputs.',
      badge: 'Security',
      highlight: 'JWT + Bcrypt',
      gradient: 'from-teal-500/20 to-emerald-500/10'
    }
  ];

  const techStack = [
    { name: 'React 18', role: 'Frontend UI', icon: '⚡' },
    { name: 'Node.js & Express', role: 'API Server', icon: '🟢' },
    { name: 'Socket.IO 4', role: 'Real-Time Engine', icon: '📡' },
    { name: 'WebRTC & TURN', role: 'Audio/Video P2P', icon: '📹' },
    { name: 'MongoDB Atlas', role: 'Cloud Database', icon: '🍃' },
    { name: 'Tailwind CSS', role: 'Design System', icon: '🎨' },
    { name: 'Zustand', role: 'State Management', icon: '🐻' },
    { name: 'JWT & Bcrypt', role: 'Authentication', icon: '🔐' },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans antialiased overflow-x-hidden selection:bg-primary/30 selection:text-white">
      
      {/* Aurora Ambient Background Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -right-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-[75%] -left-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-surface-glass backdrop-blur-xl border-b border-border-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-105">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                forum
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                ChatSphere
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-primary font-medium">Real-Time Suite</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Experience
            </a>
            <a href="#tech-stack" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Tech Stack
            </a>
            <a href="#architecture" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Architecture
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <Link
                to="/chat"
                className="primary-gradient-btn px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-emerald-glow"
              >
                <span>Open Chat</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="primary-gradient-btn px-5 py-2.5 rounded-lg text-sm font-semibold shadow-emerald-glow flex items-center gap-2"
                >
                  <span>Sign Up Free</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">

        {/* Hero Section */}
        <section className="pt-20 pb-20 sm:pt-28 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high/80 border border-primary/30 text-xs font-medium text-primary mb-8 shadow-sm backdrop-blur-md animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>Next-Generation Real-Time Messaging &amp; Video Calling</span>
            <span className="text-text-muted">|</span>
            <span className="text-on-surface-variant">v1.0 Live</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15] mb-6">
            Real-Time Communication,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
              Reimagined.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-muted max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            A production-grade full-stack communication platform featuring instant WebSocket chat, 
            low-latency WebRTC audio/video calls, rich link previews, threaded messages, and group channels.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to={user ? "/chat" : "/register"}
              className="w-full sm:w-auto primary-gradient-btn px-8 py-4 rounded-xl text-base font-bold flex items-center justify-center gap-3 shadow-emerald-glow-lg transition-transform hover:-translate-y-0.5"
            >
              <span>{user ? "Launch ChatSphere App" : "Get Started for Free"}</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#demo"
              className="w-full sm:w-auto bento-card px-8 py-4 rounded-xl text-base font-semibold text-white hover:bg-surface-bright/80 transition-all flex items-center justify-center gap-2 border border-border-glass"
            >
              <span>Explore Interactive UI</span>
              <span className="material-symbols-outlined text-lg">visibility</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20 text-left">
            <div className="bento-card p-4 text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary mb-1">&lt; 50ms</div>
              <div className="text-xs uppercase tracking-wider text-text-muted">Message Delivery</div>
            </div>
            <div className="bento-card p-4 text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-teal-400 mb-1">1080p HD</div>
              <div className="text-xs uppercase tracking-wider text-text-muted">P2P Video Streams</div>
            </div>
            <div className="bento-card p-4 text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">STUN / TURN</div>
              <div className="text-xs uppercase tracking-wider text-text-muted">Global NAT Relay</div>
            </div>
            <div className="bento-card p-4 text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-xs uppercase tracking-wider text-text-muted">Responsive &amp; Dark</div>
            </div>
          </div>

          {/* Interactive Hero UI Preview Showcase */}
          <div id="demo" className="relative max-w-6xl mx-auto rounded-2xl overflow-hidden border border-border-glass shadow-[0_20px_80px_rgba(0,0,0,0.8)] bg-dark-400/90 backdrop-blur-2xl text-left">
            
            {/* Window Top Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-glass bg-surface-container-lowest/90">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-text-muted">chatsphere.app/chat</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  WebSocket Connected
                </span>
              </div>
            </div>

            {/* Simulated Chat Interface Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
              
              {/* Left Sidebar Mockup */}
              <div className="hidden md:block md:col-span-4 border-r border-border-glass bg-surface-container-low/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-sm font-semibold text-white">Direct Messages &amp; Groups</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">4 Online</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-surface-container-highest/60 border border-primary/30 flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-dark-400 text-sm">
                        TC
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-dark-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-sm font-semibold text-white truncate">Tech Team Alpha</span>
                        <span className="text-[10px] text-text-muted">12:45 PM</span>
                      </div>
                      <p className="text-xs text-primary truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Alex is typing...
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl hover:bg-surface-container-high/40 transition-colors flex items-center gap-3 opacity-80">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm">
                        SK
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-dark-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-sm font-semibold text-white truncate">Sarah Jenkins</span>
                        <span className="text-[10px] text-text-muted">11:30 AM</span>
                      </div>
                      <p className="text-xs text-text-muted truncate">WebRTC call connected successfully!</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl hover:bg-surface-container-high/40 transition-colors flex items-center gap-3 opacity-80">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
                        DR
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-500 rounded-full border-2 border-dark-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-sm font-semibold text-white truncate">David Rivera</span>
                        <span className="text-[10px] text-text-muted">Yesterday</span>
                      </div>
                      <p className="text-xs text-text-muted truncate">Sent an attachment: project-schema.json</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Chat Stream Mockup */}
              <div className="md:col-span-8 p-6 flex flex-col justify-between bg-dark-300/40 relative">
                
                {/* Chat Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border-glass mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-primary font-bold text-sm">
                      TC
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Tech Team Alpha</h4>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> 8 members active
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-surface-container-high border border-border-glass text-primary flex items-center gap-1 text-xs">
                      <span className="material-symbols-outlined text-sm">videocam</span>
                      <span>Start Call</span>
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="space-y-4 flex-1">
                  
                  {/* Incoming Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      SK
                    </div>
                    <div className="space-y-1 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">Sarah Jenkins</span>
                        <span className="text-[10px] text-text-muted">12:43 PM</span>
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-none bg-surface-container-high border border-border-glass text-sm text-on-surface">
                        Check out the updated documentation on the WebRTC TURN cluster! 🚀
                      </div>
                      {/* Rich Link Preview Card */}
                      <div className="mt-2 rounded-xl bg-surface-container-lowest border border-border-glass p-3 flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-primary text-xl flex-shrink-0">
                          <FiTerminal />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">Metered TURN Relay &amp; ICE Candidate Matrix</h5>
                          <p className="text-[11px] text-text-muted truncate">Interactive architectural overview of high-speed P2P traversal</p>
                          <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                            webrtc.chatsphere.io <FiExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                      {/* Emoji Reactions Bar */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest border border-border-glass text-xs flex items-center gap-1 text-white">
                          🔥 3
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest border border-border-glass text-xs flex items-center gap-1 text-white">
                          ❤️ 2
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Outgoing Message */}
                  <div className="flex items-start justify-end gap-3">
                    <div className="space-y-1 max-w-[80%] text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] text-text-muted">12:44 PM</span>
                        <span className="text-xs font-semibold text-primary">You</span>
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tr-none bg-primary text-dark-400 font-medium text-sm text-left shadow-emerald-glow">
                        Awesome! Connecting through Socket.IO room and joining the video call now.
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-primary">
                        <span>Delivered</span>
                        <FiCheckCircle className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Video Call Tile Floating Simulation */}
                  <div className="p-3 rounded-xl bg-surface-container-high/90 border border-emerald-500/40 flex items-center justify-between shadow-emerald-glow">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-lg">videocam</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Active Video Session in Progress</div>
                        <div className="text-[11px] text-text-muted">2 Participants connected via WebRTC</div>
                      </div>
                    </div>
                    <Link
                      to={user ? "/chat" : "/login"}
                      className="px-3 py-1.5 rounded-lg bg-primary text-dark-400 text-xs font-bold hover:bg-primary-light transition-colors"
                    >
                      Join Call
                    </Link>
                  </div>
                </div>

                {/* Input Field Simulation */}
                <div className="mt-4 pt-3 border-t border-border-glass flex items-center gap-3">
                  <div className="flex-1 bg-surface-container-high border border-border-glass rounded-xl px-4 py-2.5 text-sm text-text-muted flex items-center justify-between">
                    <span>Type your message here...</span>
                    <div className="flex items-center gap-2 text-text-muted">
                      <span className="material-symbols-outlined text-base">sentiment_satisfied</span>
                      <span className="material-symbols-outlined text-base">attach_file</span>
                    </div>
                  </div>
                  <Link
                    to={user ? "/chat" : "/register"}
                    className="p-2.5 rounded-xl bg-primary text-dark-400 hover:scale-105 transition-transform"
                  >
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid Section */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-primary font-bold bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              Complete Feature Suite
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mt-4 mb-4 tracking-tight">
              Everything you need to connect.
            </h2>
            <p className="text-text-muted text-base sm:text-lg">
              Engineered with modern protocols to deliver an uninterrupted, low-latency collaboration experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`bento-card p-8 border border-border-glass hover:border-primary/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-emerald-glow ${
                  feature.isWide ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-border-glass flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {feature.icon}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-surface-container-highest border border-border-glass text-primary">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed mb-4">
                  {feature.desc}
                </p>

                <div className="pt-4 border-t border-border-glass/60 flex items-center justify-between text-xs text-on-surface-variant font-medium">
                  <span className="text-primary flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    {feature.highlight}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary flex items-center gap-1">
                    Learn more &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Showcase */}
        <section id="tech-stack" className="py-20 border-y border-border-glass bg-surface-container-lowest/50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-widest text-teal-400 font-bold bg-teal-400/10 px-3.5 py-1.5 rounded-full border border-teal-400/20">
                Under The Hood
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-3">
                Modern Full-Stack Architecture
              </h2>
              <p className="text-text-muted text-sm sm:text-base">
                Built with industry standard technologies for optimal concurrency, speed, and developer experience.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {techStack.map((tech, idx) => (
                <div 
                  key={idx}
                  className="bento-card p-5 border border-border-glass hover:border-primary/40 transition-all text-center flex flex-col items-center justify-center group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-300">
                    {tech.icon}
                  </span>
                  <div className="font-bold text-white text-base group-hover:text-primary transition-colors">
                    {tech.name}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {tech.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System Architecture Flow */}
        <section id="architecture" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bento-card p-8 sm:p-12 border border-border-glass relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs uppercase tracking-widest text-primary font-bold bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
                  Reliable Networking
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Seamless WebRTC Signaling &amp; Socket.IO Concurrency
                </h2>
                <p className="text-text-muted leading-relaxed text-sm sm:text-base">
                  When a call is initiated, the backend orchestrates SDP offer/answer exchange and ICE candidate routing through dedicated Socket.IO signaling channels. WebRTC peer connections establish direct P2P mesh streaming, backed by Metered TURN servers for NAT traversal.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiZap />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Full-Duplex Audio &amp; Video</h4>
                      <p className="text-xs text-text-muted">Direct hardware-accelerated streams with zero relay overhead.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiShield />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Encrypted Handshakes</h4>
                      <p className="text-xs text-text-muted">DTLS-SRTP encryption ensures confidential peer streams.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-dark-400/80 rounded-xl p-6 border border-border-glass font-mono text-xs text-text-muted space-y-3">
                <div className="text-primary font-bold flex items-center gap-2">
                  <FiTerminal className="w-4 h-4" /> Real-Time Signaling Pipeline
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-border-glass text-slate-300 space-y-1">
                  <p className="text-emerald-400">// Client A sends call invite</p>
                  <p>socket.emit('callUser', &#123; userToCall, signalData &#125;)</p>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-border-glass text-slate-300 space-y-1">
                  <p className="text-teal-400">// Server routes to target socket</p>
                  <p>io.to(recipientSocket).emit('callReceived', &#123; signal, from &#125;)</p>
                </div>
                <div className="p-3 bg-surface-container-lowest rounded-lg border border-border-glass text-slate-300 space-y-1">
                  <p className="text-cyan-400">// Direct WebRTC peer connection active</p>
                  <p className="text-emerald-400">peer.on('stream', remoteStream =&gt; play(remoteStream))</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Bottom Banner */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bento-card p-10 sm:p-16 border border-primary/30 relative overflow-hidden shadow-emerald-glow-lg">
            <div className="absolute inset-0 emerald-glow-bg-strong opacity-40 pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
                Ready to elevate your communication?
              </h2>
              <p className="text-text-muted text-base sm:text-lg mb-8 leading-relaxed">
                Join ChatSphere today to experience lightning-fast encrypted chat, crystal clear audio/video calls, and seamless group collaboration.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={user ? "/chat" : "/register"}
                  className="w-full sm:w-auto primary-gradient-btn px-8 py-4 rounded-xl text-base font-bold shadow-emerald-glow-lg flex items-center justify-center gap-2"
                >
                  <span>{user ? "Open Chat Application" : "Create Free Account"}</span>
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    className="w-full sm:w-auto bento-card px-8 py-4 rounded-xl text-base font-semibold text-white hover:bg-surface-bright/80 transition-colors border border-border-glass"
                  >
                    Sign In to Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border-glass bg-surface-container-lowest py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                forum
              </span>
            </div>
            <span className="font-display font-bold text-white text-lg">ChatSphere</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#demo" className="hover:text-primary transition-colors">Experience</a>
            <a href="#tech-stack" className="hover:text-primary transition-colors">Tech Stack</a>
            <Link to="/login" className="hover:text-primary transition-colors">Log In</Link>
            <Link to="/register" className="hover:text-primary transition-colors">Register</Link>
          </div>

          <div className="text-xs text-text-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>&copy; {new Date().getFullYear()} ChatSphere. Engineered for the modern web.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
