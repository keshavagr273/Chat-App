import { useEffect } from 'react';
import { useCallStore } from '../store/callStore';
import { FiPhone, FiVideo } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const OutgoingCall = () => {
    const {
        isCalling,
        receiver,
        callType,
        endCall
    } = useCallStore();
    const socket = getSocket();

    // Auto-cancel call after 60 seconds if not answered
    useEffect(() => {
        if (isCalling) {
            console.log('⏱️ Starting 60-second call timeout');
            const timeout = setTimeout(() => {
                console.log('⏰ Call timeout - no answer after 60 seconds');
                toast.error('No answer. Call ended.');
                handleCancel();
            }, 60000); // 60 seconds

            return () => {
                clearTimeout(timeout);
                console.log('🧹 Call timeout cleared');
            };
        }
    }, [isCalling]);

    const handleCancel = () => {
        if (socket && receiver) {
            socket.emit('call_ended', {
                to: receiver._id
            });
        }
        endCall();
    };

    if (!isCalling || !receiver) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-dark-200 rounded-3xl p-8 w-96 text-center shadow-2xl border border-gray-700">
                {/* Receiver Avatar */}
                <div className="mb-6">
                    <img
                        src={receiver.avatar}
                        alt={receiver.username}
                        className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-primary animate-pulse"
                    />
                </div>

                {/* Receiver Info */}
                <h2 className="text-2xl font-bold text-white mb-2">{receiver.username}</h2>
                <p className="text-gray-400 mb-2">
                    Calling...
                </p>

                {/* Calling Animation */}
                <div className="flex justify-center gap-1 mb-8">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {/* Call Type Icon */}
                <div className="mb-6">
                    {callType === 'video' ? (
                        <FiVideo className="text-5xl text-primary mx-auto" />
                    ) : (
                        <FiPhone className="text-5xl text-primary mx-auto" />
                    )}
                </div>

                {/* Cancel Button */}
                <button
                    onClick={handleCancel}
                    className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg mx-auto"
                >
                    <FiPhone className="text-2xl text-white transform rotate-135" />
                </button>
            </div>
        </div>
    );
};

export default OutgoingCall;
