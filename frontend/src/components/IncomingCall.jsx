import { useEffect } from 'react';
import { useCallStore } from '../store/callStore';
import { FiPhone, FiPhoneOff, FiVideo } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import { getUserMedia, createPeerConnection, addStreamToPeer, handleOffer, createAnswer } from '../utils/webrtc';
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
        console.log('✅ Accepting call');

        if (!incomingCallData) return;

        const { caller, offer, callType: incomingCallType } = incomingCallData;

        try {
            toast.loading('Setting up call...', { id: 'accept-call' });

            // Get user media first
            console.log(`🎬 Requesting ${incomingCallType} media...`);
            const stream = await getUserMedia(incomingCallType);
            console.log('🎞️ Got local stream with tracks:', stream.getTracks().map(t => `${t.kind}: enabled=${t.enabled}, readyState=${t.readyState}`));
            setLocalStream(stream);

            // Create peer connection
            const peerConnection = createPeerConnection();
            
            // Set peer connection BEFORE setting up handlers
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

            peerConnection.oniceconnectionstatechange = () => {
                console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
                if (peerConnection.iceConnectionState === 'failed') {
                    console.error('❌ ICE connection failed');
                    toast.error('Unable to establish connection. Please check your network.');
                    const { endCall } = useCallStore.getState();
                    endCall();
                } else if (peerConnection.iceConnectionState === 'disconnected') {
                    console.warn('⚠️ ICE connection disconnected');
                    toast.error('Connection lost');
                }
            };

            // Add local stream to peer connection
            addStreamToPeer(peerConnection, stream);

            // Handle remote stream - THIS IS CRITICAL
            peerConnection.ontrack = (event) => {
                console.log('╔═══════════════════════════════════════════════════════════╗');
                console.log('║        RECEIVER: REMOTE TRACK RECEIVED                    ║');
                console.log('╚═══════════════════════════════════════════════════════════╝');
                console.log('📺 Track kind:', event.track.kind);
                console.log('📺 Track readyState:', event.track.readyState);
                console.log('📺 Track enabled:', event.track.enabled);
                console.log('📺 Track muted:', event.track.muted);
                console.log('📺 Track label:', event.track.label);
                
                if (event.streams && event.streams[0]) {
                    console.log('✅✅✅ RECEIVER RECEIVED REMOTE STREAM ✅✅✅');
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
                if (event.candidate && socket) {
                    console.log('🧊 Sending ICE candidate to caller');
                    socket.emit('ice_candidate', {
                        to: caller._id,
                        candidate: event.candidate
                    });
                } else if (!event.candidate) {
                    console.log('✅ ICE gathering complete');
                }
            };

            // Handle offer and create answer
            if (offer) {
                console.log('📥 Setting remote description (offer)...');
                await handleOffer(peerConnection, offer);
                console.log('📤 Creating answer...');
                const answer = await createAnswer(peerConnection);
                console.log('✅ Answer created');

                if (socket) {
                    console.log('📤 Sending answer to caller:', caller._id);
                    socket.emit('call_accepted', {
                        to: caller._id,
                        answer
                    });
                }
            }

            // Update state to in-call
            console.log('✅ Transitioning to in-call state');
            acceptCall();
            toast.success('Call connected!', { id: 'accept-call' });

        } catch (error) {
            console.error('❌ Error accepting call:', error);
            toast.error(error.message || 'Failed to accept call', { id: 'accept-call' });

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
