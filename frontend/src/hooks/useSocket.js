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

  const {
    setIncomingCall,
    setLocalStream,
    setRemoteStream,
    setPeerConnection,
    callConnected,
    endCall,
    peerConnection: pc
  } = useCallStore();

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
      try {
        console.log('📞 Incoming call from:', caller.username);

        // Set incoming call state
        setIncomingCall({ caller, callType, offer });

        // Get user media
        const stream = await getUserMedia(callType);
        setLocalStream(stream);

        // Create peer connection
        const peerConnection = createPeerConnection();
        setPeerConnection(peerConnection);

        // Add local stream to peer connection
        addStreamToPeer(peerConnection, stream);

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          console.log('📺 Received remote stream');
          setRemoteStream(event.streams[0]);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice_candidate', {
              to: caller._id,
              candidate: event.candidate
            });
          }
        };

        // Handle offer
        if (offer) {
          await handleOffer(peerConnection, offer);
          const answer = await createAnswer(peerConnection);

          socket.emit('call_accepted', {
            to: caller._id,
            answer
          });
        }
      } catch (error) {
        console.error('Error handling incoming call:', error);
        toast.error('Failed to setup call. Please check camera/microphone permissions.');
      }
    });

    socket.on('call_accepted', async ({ answer }) => {
      try {
        console.log('✅ Call accepted, received answer');

        if (pc && answer) {
          await handleAnswer(pc, answer);
          callConnected();
          toast.success('Call connected!');
        }
      } catch (error) {
        console.error('Error handling call acceptance:', error);
        toast.error('Failed to connect call');
      }
    });

    socket.on('ice_candidate', async ({ candidate }) => {
      try {
        if (pc && candidate) {
          await handleIceCandidate(pc, candidate);
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    socket.on('call_rejected', () => {
      toast.error('Call was rejected');
      endCall();
    });

    socket.on('call_ended', () => {
      toast('Call ended');
      endCall();
    });

    socket.on('user_busy', () => {
      toast.error('User is busy on another call');
      endCall();
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
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
  }, [selectedChat, pc]);
};
