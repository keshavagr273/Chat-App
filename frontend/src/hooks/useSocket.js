import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useCallStore } from '../store/callStore';
import { initSocket, getSocket, disconnectSocket } from '../utils/socket';
import {
  getUserMedia,
  createPeerConnection,
  createOffer,
  createAnswer,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  addStreamToPeer,
  queueIceCandidate,
  flushIceCandidateQueue,
  clearIceCandidateQueue
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
    clearChatMessages,
    incrementUnreadCount,
    removeReaction,
    removeMessageLocally
  } = useChatStore();

  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // Initialize socket FIRST, then immediately attach listeners in the same tick
    const socket = initSocket(token);

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
      // Use getState() to always read the current selectedChat — not the stale closure value
      const currentChat = useChatStore.getState().selectedChat;
      if (currentChat?._id === message.chat._id) {
        addMessage(message);
      } else {
        incrementUnreadCount(message.chat._id);
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
      removeReaction(messageId, userId);
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

    socket.on('message_deleted_for_me', ({ messageId }) => {
      removeMessageLocally(messageId);
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
      // Just set incoming call state - don't get media yet
      // User needs to accept first to avoid camera/mic conflicts
      const { setIncomingCall } = useCallStore.getState();
      setIncomingCall({ caller, callType, offer });
    });

    socket.on('call_accepted', async ({ answer }) => {
      try {
        const { peerConnection, callConnected } = useCallStore.getState();

        if (peerConnection && answer) {
          await handleAnswer(peerConnection, answer);
          // Flush any ICE candidates that arrived before remoteDescription was set
          await flushIceCandidateQueue(peerConnection);
          callConnected();
          toast.success('Call connected!', { id: 'call-setup' });
        } else {
          toast.error('Failed to establish call connection');
        }
      } catch (error) {
        console.error('Error handling call acceptance:', error);
        toast.error('Failed to connect call');
        const { endCall } = useCallStore.getState();
        endCall();
      }
    });

    socket.on('ice_candidate', async ({ candidate }) => {
      try {
        const { peerConnection } = useCallStore.getState();
        if (!candidate) return;

        if (peerConnection && peerConnection.remoteDescription) {
          // Remote description is set — apply immediately
          await handleIceCandidate(peerConnection, candidate);
        } else {
          // Queue the candidate — will be flushed after setRemoteDescription
          queueIceCandidate(candidate);
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    socket.on('call_rejected', () => {
      toast.error('Call was rejected');
      clearIceCandidateQueue();
      const { endCall } = useCallStore.getState();
      endCall();
    });

    socket.on('call_ended', () => {
      toast('Call ended');
      clearIceCandidateQueue();
      const { endCall } = useCallStore.getState();
      endCall();
    });

    socket.on('user_busy', () => {
      toast.error('User is busy on another call');
      clearIceCandidateQueue();
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
      socket.off('message_deleted_for_me');
      socket.off('chat_deleted');
      socket.off('chat_messages_cleared');
      socket.off('incoming_call');
      socket.off('call_accepted');
      socket.off('ice_candidate');
      socket.off('call_rejected');
      socket.off('call_ended');
      socket.off('user_busy');
      socket.off('error');
      
      disconnectSocket();
    };
  }, [token]);
};
