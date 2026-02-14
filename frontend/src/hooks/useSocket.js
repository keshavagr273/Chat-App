import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useCallStore } from '../store/callStore';
import { getSocket } from '../utils/socket';
import {
  getUserMedia,
  createPeerConnection,
  createOffer,
  createAnswer,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  addStreamToPeer
} from '../utils/webrtc';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const {
    addMessage,
    updateLatestMessage,
    addOnlineUser,
    removeOnlineUser,
    setOnlineUsers,
    setTyping,
    removeTyping,
    updateMessage,
    deleteMessage,
    selectedChat,
    removeChat,
    clearChatMessages
  } = useChatStore();

  const { user } = useAuthStore();

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    // Online users
    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('user_online', ({ userId }) => {
      addOnlineUser(userId);
    });

    socket.on('user_offline', ({ userId }) => {
      removeOnlineUser(userId);
    });

    // Messages
    socket.on('receive_message', (message) => {
      if (selectedChat?._id === message.chat._id) {
        addMessage(message);
      }
      updateLatestMessage(message.chat._id, message);
    });

    socket.on('message_delivered', ({ messageId, deliveredTo }) => {
      updateMessage(messageId, { deliveredTo });
    });

    socket.on('message_read', ({ messageId, userId, readAt }) => {
      updateMessage(messageId, {
        readBy: [{ user: userId, readAt }]
      });
    });

    // Typing indicators
    socket.on('typing', ({ chatId, username, userId }) => {
      if (userId !== user._id) {
        setTyping(chatId, userId, username);
      }
    });

    socket.on('stop_typing', ({ chatId }) => {
      removeTyping(chatId);
    });

    // Reactions
    socket.on('reaction_added', ({ messageId, userId, emoji }) => {
      updateMessage(messageId, {
        reactions: [{ user: userId, emoji }]
      });
    });

    socket.on('reaction_removed', ({ messageId, userId }) => {
      // Handle reaction removal
    });

    // Edit and Delete
    socket.on('message_edited', ({ messageId, content, editedAt }) => {
      updateMessage(messageId, {
        content,
        isEdited: true,
        editedAt
      });
    });

    socket.on('message_deleted', ({ messageId, deletedAt }) => {
      deleteMessage(messageId);
    });

    // Chat management events
    socket.on('chat_deleted', ({ chatId, deletedBy }) => {
      if (deletedBy !== user._id) {
        toast('This chat has been deleted', { icon: '🗑️' });
        removeChat(chatId);
      }
    });

    socket.on('chat_messages_cleared', ({ chatId, clearedBy }) => {
      if (clearedBy !== user._id) {
        toast('All messages have been cleared', { icon: '🧹' });
        clearChatMessages(chatId);
      }
    });

    // WebRTC Call Signaling
    socket.on('incoming_call', async ({ caller, callType, offer }) => {
      console.log('📞 Incoming call from:', caller.username);

      // Just set incoming call state - don't get media yet
      // User needs to accept first to avoid camera/mic conflicts
      const { setIncomingCall } = useCallStore.getState();
      setIncomingCall({ caller, callType, offer });
    });

    socket.on('call_accepted', async ({ answer }) => {
      try {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║           CALL ACCEPTED EVENT RECEIVED                    ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');

        // Get current state values - don't use closure values
        const { peerConnection, callConnected, localStream, remoteStream } = useCallStore.getState();

        console.log('📊 Current call store state:');
        console.log('  - peerConnection exists:', !!peerConnection);
        console.log('  - answer received:', !!answer);
        console.log('  - localStream exists:', !!localStream);
        console.log('  - remoteStream exists:', !!remoteStream);

        if (localStream) {
          console.log('  - localStream tracks:', localStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
        }

        if (peerConnection && answer) {
          console.log('🔄 Setting remote description with answer...');
          console.log('Answer type:', answer.type);
          await handleAnswer(peerConnection, answer);
          console.log('✅✅✅ ANSWER HANDLED SUCCESSFULLY ✅✅✅');

          console.log('🔄 Calling callConnected() to transition to in-call state...');
          callConnected();
          console.log('✅✅✅ STATE UPDATED - CALLER SHOULD NOW BE IN ACTIVECALL ✅✅✅');

          const newState = useCallStore.getState();
          console.log('📊 Updated state:');
          console.log('  - isInCall:', newState.isInCall);
          console.log('  - isCalling:', newState.isCalling);
          console.log('  - callType:', newState.callType);

          toast.success('Call connected!', { id: 'call-setup' });
        } else {
          console.error('❌❌❌ MISSING PEER CONNECTION OR ANSWER ❌❌❌');
          console.error('Details:', {
            hasPC: !!peerConnection,
            hasAnswer: !!answer
          });
          toast.error('Failed to establish call connection');
        }
      } catch (error) {
        console.error('❌❌❌ ERROR HANDLING CALL ACCEPTANCE ❌❌❌');
        console.error('Error:', error);
        console.error('Error stack:', error.stack);
        toast.error('Failed to connect call');
        const { endCall } = useCallStore.getState();
        endCall();
      }
    });

    socket.on('ice_candidate', async ({ candidate }) => {
      try {
        const { peerConnection } = useCallStore.getState();
        if (peerConnection && candidate) {
          console.log('🧊 Adding ICE candidate');
          await handleIceCandidate(peerConnection, candidate);
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    socket.on('call_rejected', () => {
      console.log('❌ Call was rejected');
      toast.error('Call was rejected');
      const { endCall } = useCallStore.getState();
      endCall();
    });

    socket.on('call_ended', () => {
      console.log('📵 Call ended by other user');
      toast('Call ended');
      const { endCall } = useCallStore.getState();
      endCall();
    });

    socket.on('user_busy', () => {
      toast.error('User is busy on another call');
      const { endCall } = useCallStore.getState();
      endCall();
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      if (error.type === 'chat_not_found') {
        toast.error('This chat no longer exists');
      } else if (error.message) {
        toast.error(error.message);
      }
    });

    // Cleanup
    return () => {
      socket.off('online_users');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('receive_message');
      socket.off('message_delivered');
      socket.off('message_read');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('reaction_added');
      socket.off('reaction_removed');
      socket.off('message_edited');
      socket.off('message_deleted');
      socket.off('chat_deleted');
      socket.off('chat_messages_cleared');
      socket.off('incoming_call');
      socket.off('call_accepted');
      socket.off('ice_candidate');
      socket.off('call_rejected');
      socket.off('call_ended');
      socket.off('user_busy');
      socket.off('error');
    };
  }, [selectedChat]); // Removed pc from deps to avoid race conditions
};
