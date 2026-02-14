import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useCallStore } from '../store/callStore';
import { FiMoreVertical, FiPhone, FiVideo, FiTrash2, FiUserX, FiInfo } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import { getUserMedia, createPeerConnection, createOffer, addStreamToPeer } from '../utils/webrtc';
import toast from 'react-hot-toast';

const ChatHeader = () => {
  const { user } = useAuthStore();
  const { selectedChat, onlineUsers, clearMessages, deleteChat } = useChatStore();
  const { startCall, setLocalStream, setPeerConnection, setRemoteStream, isInCall, isCalling } = useCallStore();
  const [showMenu, setShowMenu] = useState(false);
  const socket = getSocket();

  if (!selectedChat) return null;

  const getChatInfo = () => {
    if (selectedChat.isGroupChat) {
      return {
        name: selectedChat.chatName,
        avatar: selectedChat.groupAvatar || 'https://ui-avatars.com/api/?background=random&name=Group',
        status: `${selectedChat.users.length} members`
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
      console.log(`🔄 Initiating ${callType} call to ${otherUser.username}`);
      toast.loading('Setting up call...', { id: 'call-setup' });

      // Get user media
      console.log(`🎬 Requesting ${callType} media...`);
      const stream = await getUserMedia(callType);
      console.log('🎞️ Got local stream with tracks:', stream.getTracks().map(t => `${t.kind}: enabled=${t.enabled}, readyState=${t.readyState}`));
      setLocalStream(stream);

      // Create peer connection
      const peerConnection = createPeerConnection();

      // Set peer connection IMMEDIATELY - this is critical for call_accepted handler
      setPeerConnection(peerConnection);
      console.log('✅ Peer connection created and stored in state');

      // Add connection state handlers
      peerConnection.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'failed') {
          toast.error('Connection failed. Please try again.');
          const { endCall } = useCallStore.getState();
          endCall();
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', peerConnection.connectionState);
        
        if (peerConnection.connectionState === 'connected') {
          console.log('✅✅✅ PEER CONNECTION FULLY CONNECTED ✅✅✅');
          console.log('🎉 Media should now flow between peers!');
        } else if (peerConnection.connectionState === 'connecting') {
          console.log('🔍 Connection establishing...');
        } else if (peerConnection.connectionState === 'failed') {
          console.error('❌❌❌ PEER CONNECTION FAILED ❌❌❌');
        } else if (peerConnection.connectionState === 'disconnected') {
          console.warn('⚠️ Peer connection disconnected');
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
        console.log('📊 ICE gathering state:', peerConnection.iceGatheringState);
        console.log('📊 Signaling state:', peerConnection.signalingState);

        if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
          console.log('✅✅✅ ICE CONNECTION ESTABLISHED ✅✅✅');
          console.log('🎉 Peer-to-peer connection successful!');
        } else if (peerConnection.iceConnectionState === 'checking') {
          console.log('🔍 ICE checking - looking for best connection path...');
        } else if (peerConnection.iceConnectionState === 'failed') {
          console.error('❌❌❌ ICE CONNECTION FAILED ❌❌❌');
          console.error('Possible causes:');
          console.error('1. Both devices behind strict NAT/firewall');
          console.error('2. TURN server not reachable');
          console.error('3. Network blocking WebRTC traffic');
          console.error('4. Testing on same network/device (some routers block hairpinning)');
          toast.error('Unable to establish connection. Try from different networks.');
          
          // Try to restart ICE
          console.log('♻️ Attempting ICE restart...');
          peerConnection.restartIce();
          
          setTimeout(() => {
            if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
              console.error('❌ ICE restart failed, ending call');
              const { endCall } = useCallStore.getState();
              endCall();
            }
          }, 5000);
        } else if (peerConnection.iceConnectionState === 'disconnected') {
          console.warn('⚠️ ICE connection disconnected - attempting recovery');
          toast.error('Connection lost, attempting to reconnect...');

      // Handle remote stream - THIS IS CRITICAL FOR CALLER TOO
      peerConnection.ontrack = (event) => {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║         CALLER: REMOTE TRACK RECEIVED                     ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('📺 Track kind:', event.track.kind);
        console.log('📺 Track readyState:', event.track.readyState);
        console.log('📺 Track enabled:', event.track.enabled);
        console.log('📺 Track muted:', event.track.muted);
        console.log('📺 Track label:', event.track.label);

        if (event.streams && event.streams[0]) {
          console.log('✅✅✅ CALLER RECEIVED REMOTE STREAM ✅✅✅');
          console.log('Stream ID:', event.streams[0].id);
          console.log('Stream active:', event.streams[0].active);
          console.log('Stream tracks:', event.streams[0].getTracks().map(t => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
            muted: t.muted
          })));
          setRemoteStream(event.streams[0]);
          console.log('✅ Remote stream set in call store');
        } else {
          console.warn('⚠️⚠️⚠️ RECEIVED TRACK WITHOUT STREAM');
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Caller sending ICE candidate');
          socket.emit('ice_candidate', {
            to: otherUser._id,
            candidate: event.candidate
          });
        } else {
          console.log('✅ ICE gathering complete for caller');
        }
      };

      // Create and send offer
      console.log('📤 Creating offer...');
      const offer = await createOffer(peerConnection);
      console.log('✅ Offer created:', offer.type);

      // Start call (sets isCalling to true but NOT isInCall yet)
      startCall(callType, otherUser);

      // Send call request to other user
      console.log(`📡 Emitting initiate_call to ${otherUser._id}`);
      socket.emit('initiate_call', {
        to: otherUser._id,
        callType,
        offer
      });

      toast.success(`Calling ${otherUser.username}...`, { id: 'call-setup' });

    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error(error.message || 'Failed to start call', { id: 'call-setup' });

      // Clean up on error
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
    toast('Chat info feature coming soon!', {
      icon: 'ℹ️',
      duration: 3000
    });
    setShowMenu(false);
  };

  return (
    <div className="h-16 bg-dark-200 border-b border-gray-700 px-6 flex items-center justify-between">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-200"></div>
          )}
        </div>
        <div>
          <h3 className="text-white font-semibold">{name}</h3>
          <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
            {status}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleVoiceCall}
          className="text-gray-400 hover:text-white transition"
          title="Voice Call"
        >
          <FiPhone className="text-xl" />
        </button>
        <button
          onClick={handleVideoCall}
          className="text-gray-400 hover:text-white transition"
          title="Video Call"
        >
          <FiVideo className="text-xl" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white transition"
            title="More Options"
          >
            <FiMoreVertical className="text-xl" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-dark-300 border border-gray-700 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={handleChatInfo}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-200 flex items-center gap-3 transition"
                >
                  <FiInfo className="text-lg" />
                  <span>Chat Info</span>
                </button>
                <button
                  onClick={handleClearMessages}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-200 flex items-center gap-3 transition"
                >
                  <FiUserX className="text-lg" />
                  <span>Clear Messages</span>
                </button>
                <button
                  onClick={handleDeleteChat}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-dark-200 flex items-center gap-3 transition"
                >
                  <FiTrash2 className="text-lg" />
                  <span>Delete Chat</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
