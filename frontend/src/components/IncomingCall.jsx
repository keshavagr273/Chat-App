import { useEffect } from 'react';
import { useCallStore } from '../store/callStore';
import { FiPhone, FiPhoneOff, FiVideo } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import { getUserMedia, createPeerConnection, addStreamToPeer, handleOffer, createAnswer, flushIceCandidateQueue, clearIceCandidateQueue } from '../utils/webrtc';
import api from '../utils/api';
import toast from 'react-hot-toast';

const IncomingCall = () => {
    const {
        isIncomingCall,
        incomingCallData,
        acceptCall,
        rejectCall,
        callType,
        setLocalStream,
        setRemoteStream,
        setPeerConnection
    } = useCallStore();
    const socket = getSocket();

    useEffect(() => {
        // Ringtone removed - audio file not available
    }, [isIncomingCall]);

    const handleAccept = async () => {
        if (!incomingCallData) return;

        const { caller, offer, callType: incomingCallType } = incomingCallData;

        try {
            console.log(`[WebRTC Debug] Accepting ${incomingCallType} call from user:`, caller._id);
            toast.loading('Setting up call...', { id: 'accept-call' });

            // Get user media first
            const stream = await getUserMedia(incomingCallType);
            console.log('[WebRTC Debug] getUserMedia success. Stream ID:', stream.id, 'Tracks:', stream.getTracks().map(t => `${t.kind}:${t.readyState}`));
            setLocalStream(stream);

            // Fetch fresh TURN credentials from backend (uses Metered.ca if configured)
            let iceServers = null;
            try {
                const { data } = await api.get('/turn');
                iceServers = data.iceServers;
                console.log('[WebRTC Debug] Fetched TURN credentials successfully. IceServers count:', iceServers?.length);
            } catch (e) {
                console.error('[WebRTC Debug] Could not fetch TURN credentials, falling back to STUN only:', e.message);
            }

            // Create peer connection with TURN credentials
            const peerConnection = createPeerConnection(iceServers);

            // Set peer connection BEFORE setting up handlers
            setPeerConnection(peerConnection);

            // ⚠️ CRITICAL: Register ALL event handlers BEFORE adding tracks or processing offer.
            // ontrack fires during setRemoteDescription/setLocalDescription.
            // If registered after, the remote stream event is missed → black video.

            // Handle remote stream - THIS IS CRITICAL
            peerConnection.ontrack = (event) => {
                console.log('[WebRTC Debug] 📡 peerConnection.ontrack fired! Event:', event);
                if (event.streams && event.streams[0]) {
                    console.log('[WebRTC Debug] 📡 remote stream received:', event.streams[0].id, 'Tracks:', event.streams[0].getTracks().map(t => `${t.kind}:${t.readyState}`));
                    setRemoteStream(event.streams[0]);
                } else {
                    console.warn('[WebRTC Debug] 📡 ontrack fired but no streams array found in event!');
                }
            };

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    socket.emit('ice_candidate', {
                        to: caller._id,
                        candidate: event.candidate
                    });
                }
            };

            // Add connection state handlers
            peerConnection.onconnectionstatechange = () => {
                console.log('[WebRTC Debug] 🔌 Connection state changed to:', peerConnection.connectionState);
                if (peerConnection.connectionState === 'failed') {
                    toast.error('Connection failed. Please try again.');
                    const { endCall } = useCallStore.getState();
                    endCall();
                }
            };

            peerConnection.oniceconnectionstatechange = () => {
                console.log('[WebRTC Debug] ❄️ ICE Connection state changed to:', peerConnection.iceConnectionState);
                if (peerConnection.iceConnectionState === 'failed') {
                    toast.error('Unable to establish connection. Please check your network.');

                    // Try to restart ICE
                    peerConnection.restartIce();

                    // Don't end call immediately, give it a chance to recover
                    setTimeout(() => {
                        if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
                            const { endCall } = useCallStore.getState();
                            endCall();
                        }
                    }, 5000); // Wait 5 seconds before ending
                } else if (peerConnection.iceConnectionState === 'disconnected') {
                    toast.error('Connection lost, attempting to reconnect...');
                }
            };

            // Add local stream to peer connection AFTER all handlers are registered
            addStreamToPeer(peerConnection, stream);

            // Handle offer and create answer
            if (offer) {
                await handleOffer(peerConnection, offer);
                // Flush any ICE candidates that arrived before handleOffer set the remoteDescription
                await flushIceCandidateQueue(peerConnection);
                const answer = await createAnswer(peerConnection);

                if (socket) {
                    socket.emit('call_accepted', {
                        to: caller._id,
                        answer
                    });
                }
            }

            // Update state to in-call
            acceptCall();
            toast.success('Call connected!', { id: 'accept-call' });

        } catch (error) {
            console.error('❌ Error accepting call:', error);
            toast.error(error.message || 'Failed to accept call', { id: 'accept-call' });
            clearIceCandidateQueue();

            // Reject the call on error
            if (socket) {
                socket.emit('call_rejected', {
                    to: caller._id
                });
            }
            rejectCall();
        }
    };

    const handleReject = () => {
        rejectCall();

        if (socket && incomingCallData) {
            socket.emit('call_rejected', {
                to: incomingCallData.caller._id
            });
        }
    };

    if (!isIncomingCall || !incomingCallData) return null;

    const caller = incomingCallData.caller;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-dark-200 rounded-3xl p-8 w-96 text-center shadow-2xl border border-gray-700">
                {/* Caller Avatar */}
                <div className="mb-6">
                    <img
                        src={caller.avatar}
                        alt={caller.username}
                        className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-primary"
                    />
                </div>

                {/* Caller Info */}
                <h2 className="text-2xl font-bold text-white mb-2">{caller.username}</h2>
                <p className="text-gray-400 mb-2">
                    Incoming {callType === 'video' ? 'video' : 'voice'} call...
                </p>

                {/* Calling Animation */}
                <div className="flex justify-center gap-1 mb-8">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-8">
                    {/* Reject Button */}
                    <button
                        onClick={handleReject}
                        className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                    >
                        <FiPhoneOff className="text-2xl text-white" />
                    </button>

                    {/* Accept Button */}
                    <button
                        onClick={handleAccept}
                        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition shadow-lg animate-pulse"
                    >
                        {callType === 'video' ? (
                            <FiVideo className="text-2xl text-white" />
                        ) : (
                            <FiPhone className="text-2xl text-white" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCall;
