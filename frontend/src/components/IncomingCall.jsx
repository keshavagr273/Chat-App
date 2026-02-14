import { useEffect } from 'react';
import { useCallStore } from '../store/callStore';
import { FiPhone, FiPhoneOff, FiVideo } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import { handleOffer, createAnswer } from '../utils/webrtc';

const IncomingCall = () => {
    const {
        isIncomingCall,
        incomingCallData,
        acceptCall,
        rejectCall,
        callType
    } = useCallStore();
    const socket = getSocket();

    useEffect(() => {
        // Play ringtone (optional)
        let audio;
        if (isIncomingCall) {
            audio = new Audio('/ringtone.mp3');
            audio.loop = true;
            audio.play().catch(err => console.log('Audio play failed:', err));
        }

        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, [isIncomingCall]);

    const handleAccept = () => {
        console.log('✅ Accepting call');
        acceptCall();
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
