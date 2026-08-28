import { useCallStore } from '../store/callStore';
import { FiPhone, FiPhoneOff, FiVideo } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import { getUserMedia, createPeerConnection, addStreamToPeer, handleOffer, createAnswer, flushIceCandidateQueue, clearIceCandidateQueue } from '../utils/webrtc';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Avatar from './Avatar';

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

    const handleAccept = async () => {
        if (!incomingCallData) return;

        const { caller, offer, callType: incomingCallType } = incomingCallData;

        try {
            toast.loading('Connecting call...', { id: 'accept-call' });

            // Get user media first
            const stream = await getUserMedia(incomingCallType);
            setLocalStream(stream);

            // Fetch fresh TURN credentials from backend
            let iceServers = null;
            try {
                const { data } = await api.get('/turn');
                iceServers = data.iceServers;
            } catch (e) {
                console.warn('Could not fetch TURN credentials, falling back to STUN only:', e.message);
            }

            // Create peer connection with TURN credentials
            const peerConnection = createPeerConnection(iceServers);

            // Set peer connection BEFORE setting up handlers
            setPeerConnection(peerConnection);

            // Handle remote stream
            peerConnection.ontrack = (event) => {
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
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

            // Handle offer and create answer
            if (offer) {
                await handleOffer(peerConnection, offer);
                await flushIceCandidateQueue(peerConnection);
                const answer = await createAnswer(peerConnection);

                if (socket) {
                    socket.emit('call_accepted', {
                        to: caller._id,
                        answer
                    });
                }
            }

            acceptCall();
            toast.success('Call connected!', { id: 'accept-call' });

        } catch (error) {
            console.error('Error accepting call:', error);
            toast.error(error.message || 'Failed to accept call', { id: 'accept-call' });
            clearIceCandidateQueue();

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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="w-full max-w-sm bento-card p-8 text-center border border-border-glass shadow-2xl relative overflow-hidden">
                {/* Aurora Radial Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 emerald-glow-bg rounded-full blur-2xl pointer-events-none opacity-60"></div>

                {/* Caller Avatar */}
                <div className="relative mb-6 mx-auto w-28 h-28">
                    <Avatar
                        src={caller.avatar}
                        name={caller.username}
                        className="w-28 h-28 border-4 border-primary/50 shadow-[0_0_35px_rgba(16,185,129,0.4)]"
                    />
                    <div className="absolute inset-0 rounded-full animate-ping border-2 border-primary/40 pointer-events-none"></div>
                </div>

                {/* Caller Info */}
                <h2 className="font-display text-2xl font-bold text-on-surface mb-1">{caller.username}</h2>
                <p className="font-label text-xs uppercase tracking-wider text-text-muted mb-4">
                    Incoming {callType === 'video' ? 'HD Video' : 'Secure Voice'} Call
                </p>

                {/* Pulsing Dots */}
                <div className="flex justify-center gap-1.5 mb-8">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-6 relative z-10">
                    {/* Reject Button */}
                    <button
                        onClick={handleReject}
                        className="w-14 h-14 bg-red-500/90 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center transition shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95"
                        title="Decline"
                    >
                        <FiPhoneOff className="text-2xl" />
                    </button>

                    {/* Accept Button */}
                    <button
                        onClick={handleAccept}
                        className="w-14 h-14 primary-gradient-btn text-on-primary rounded-2xl flex items-center justify-center transition shadow-lg shadow-emerald-glow hover:scale-105 active:scale-95"
                        title="Accept"
                    >
                        {callType === 'video' ? (
                            <FiVideo className="text-2xl" />
                        ) : (
                            <FiPhone className="text-2xl" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCall;
