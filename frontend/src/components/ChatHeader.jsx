import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useCallStore } from '../store/callStore';
import { FiMoreVertical, FiPhone, FiVideo, FiTrash2, FiUserX, FiInfo } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import { getUserMedia, createPeerConnection, createOffer, addStreamToPeer } from '../utils/webrtc';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import ChatInfoModal from './ChatInfoModal';

const ChatHeader = () => {
  const { user } = useAuthStore();
  const { selectedChat, onlineUsers, clearMessages, deleteChat } = useChatStore();
  const { startCall, setLocalStream, setPeerConnection, setRemoteStream, isInCall, isCalling } = useCallStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const socket = getSocket();

  if (!selectedChat) return null;

  const getChatInfo = () => {
    if (selectedChat.isGroupChat) {
      return {
        name: selectedChat.chatName || 'Group Chat',
        avatar: selectedChat.groupAvatar || 'https://ui-avatars.com/api/?background=171b26&color=4edea3&name=Group',
        status: `${selectedChat.users.length} members`,
        isOnline: false
      };
    } else {
      const otherUser = selectedChat.users.find(u => u._id !== user._id);
      const isOnline = onlineUsers.includes(otherUser?._id);
      return {
        name: otherUser?.username || 'Unknown',
        avatar: otherUser?.avatar,
        status: isOnline ? 'Online' : 'Offline',
        isOnline
      };
    }
  };

  const { name, avatar, status, isOnline } = getChatInfo();

  const initiateCall = async (callType) => {
    if (isInCall || isCalling) {
      toast.error('You are already in a call');
      return;
    }

    if (!socket) {
      toast.error('Connection error. Please refresh the page.');
      return;
    }

    // Don't allow group calls (for now)
    if (selectedChat.isGroupChat) {
      toast.error('Group calls are not supported yet');
      return;
    }

    const otherUser = selectedChat.users.find(u => u._id !== user._id);

    if (!otherUser) {
      toast.error('User not found');
      return;
    }

    try {
      toast.loading('Setting up call...', { id: 'call-setup' });

      // Get user media
      const stream = await getUserMedia(callType);
      setLocalStream(stream);

      // Fetch fresh TURN credentials from backend (uses Metered.ca if configured)
      let iceServers = null;
      try {
        const { data } = await api.get('/turn');
        iceServers = data.iceServers;
      } catch (e) {
        console.warn('Could not fetch TURN credentials, falling back to STUN only:', e.message);
      }

      // Create peer connection with TURN credentials
      const peerConnection = createPeerConnection(iceServers);

      // Set peer connection IMMEDIATELY - this is critical for call_accepted handler
      setPeerConnection(peerConnection);

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice_candidate', {
            to: otherUser._id,
            candidate: event.candidate
          });
        }
      };

      // Add connection state handlers
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'failed') {
          toast.error('Connection failed. Please try again.');
          const { endCall } = useCallStore.getState();
          endCall();
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'failed') {
          toast.error('Unable to establish connection. Please check your network.');

          peerConnection.restartIce();

          setTimeout(() => {
            if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
              const { endCall } = useCallStore.getState();
              endCall();
            }
          }, 5000);
        } else if (peerConnection.iceConnectionState === 'disconnected') {
          toast.error('Connection lost, attempting to reconnect...');
        }
      };

      // Add local stream to peer connection
      addStreamToPeer(peerConnection, stream);

      // Create and send offer
      const offer = await createOffer(peerConnection);

      // Start call
      startCall(callType, otherUser);

      // Send call request to other user
      socket.emit('initiate_call', {
        to: otherUser._id,
        callType,
        offer
      });

      toast.success(`Calling ${otherUser.username}...`, { id: 'call-setup' });

    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error(error.message || 'Failed to start call', { id: 'call-setup' });

      setLocalStream(null);
      setPeerConnection(null);
    }
  };

  const handleVoiceCall = () => {
    initiateCall('voice');
  };

  const handleVideoCall = () => {
    initiateCall('video');
  };

  const handleDeleteChat = async () => {
    setShowMenu(false);

    const confirmDelete = window.confirm(
      selectedChat.isGroupChat
        ? `Are you sure you want to delete the group "${selectedChat.chatName}"? This action cannot be undone.`
        : `Are you sure you want to delete this chat? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteChat(selectedChat._id);
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleClearMessages = async () => {
    setShowMenu(false);

    const confirmClear = window.confirm(
      'Are you sure you want to clear all messages in this chat? This action cannot be undone.'
    );

    if (!confirmClear) return;

    try {
      await clearMessages(selectedChat._id);
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleChatInfo = () => {
    setShowInfoModal(true);
    setShowMenu(false);
  };

  return (
    <header className="h-16 bg-surface-container/80 backdrop-blur-xl border-b border-border-glass px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Contact / Group Info */}
      <div 
        onClick={handleChatInfo}
        className="flex items-center gap-3 cursor-pointer group p-1 -ml-1 rounded-xl hover:bg-surface-container-highest/50 transition-colors"
      >
        <Avatar
          src={avatar}
          name={name}
          className="w-10 h-10 border border-primary/30"
          showStatus={!selectedChat.isGroupChat}
          isOnline={isOnline}
        />
        <div>
          <h3 className="font-display font-semibold text-on-surface text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
            {name}
            {selectedChat.isGroupChat && (
              <span className="material-symbols-outlined text-xs text-text-muted">groups</span>
            )}
          </h3>
          <p className={`text-[11px] font-label font-medium flex items-center gap-1 ${
            isOnline ? 'text-primary' : 'text-text-muted'
          }`}>
            {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
            {status}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {!selectedChat.isGroupChat && (
          <>
            <button
              onClick={handleVoiceCall}
              className="p-2 text-text-muted hover:text-primary hover:bg-surface-container-highest rounded-xl transition-all active:scale-95"
              title="Voice Call"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                call
              </span>
            </button>
            <button
              onClick={handleVideoCall}
              className="p-2 text-text-muted hover:text-primary hover:bg-surface-container-highest rounded-xl transition-all active:scale-95"
              title="Video Call"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                videocam
              </span>
            </button>
          </>
        )}

        <button
          onClick={handleChatInfo}
          className="p-2 text-text-muted hover:text-primary hover:bg-surface-container-highest rounded-xl transition-all active:scale-95"
          title="Conversation Details"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            info
          </span>
        </button>

        {/* Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-text-muted hover:text-primary hover:bg-surface-container-highest rounded-xl transition-all active:scale-95"
            title="More Options"
          >
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bento-card p-1.5 z-20 border border-border-glass shadow-2xl animate-fade-in-up">
                <button
                  onClick={handleChatInfo}
                  className="w-full px-3 py-2 text-left text-xs font-display font-medium text-on-surface hover:bg-surface-container-highest rounded-lg flex items-center gap-2.5 transition"
                >
                  <span className="material-symbols-outlined text-base text-primary">info</span>
                  <span>Chat Info</span>
                </button>
                <button
                  onClick={handleClearMessages}
                  className="w-full px-3 py-2 text-left text-xs font-display font-medium text-on-surface hover:bg-surface-container-highest rounded-lg flex items-center gap-2.5 transition"
                >
                  <span className="material-symbols-outlined text-base text-yellow-400">cleaning_services</span>
                  <span>Clear History</span>
                </button>
                <div className="h-[1px] bg-border-glass my-1"></div>
                <button
                  onClick={handleDeleteChat}
                  className="w-full px-3 py-2 text-left text-xs font-display font-medium text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2.5 transition"
                >
                  <span className="material-symbols-outlined text-base text-red-400">delete</span>
                  <span>Delete Chat</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ChatInfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
        chat={selectedChat}
        currentUser={user}
        onlineUsers={onlineUsers}
      />
    </header>
  );
};

export default ChatHeader;
