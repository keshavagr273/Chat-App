import { useEffect } from 'react';
import { useCallStore } from '../store/callStore';
import { FiPhone, FiVideo, FiPhoneOff } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import toast from 'react-hot-toast';
import Avatar from './Avatar';

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
        if (!isCalling) return;

        const timeout = setTimeout(() => {
            const currentSocket = getSocket();
            const currentReceiver = useCallStore.getState().receiver;
            toast.error('No answer. Call ended.');
            if (currentSocket && currentReceiver) {
                currentSocket.emit('call_ended', { to: currentReceiver._id });
            }
            useCallStore.getState().endCall();
        }, 60000);

        return () => clearTimeout(timeout);
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="w-full max-w-sm bento-card p-8 text-center border border-border-glass shadow-2xl relative overflow-hidden">
                {/* Aurora Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 emerald-glow-bg rounded-full blur-2xl pointer-events-none opacity-50"></div>

                {/* Receiver Avatar */}
                <div className="relative mb-6 mx-auto w-28 h-28">
                    <Avatar
                        src={receiver.avatar}
                        name={receiver.username}
                        className="w-28 h-28 border-4 border-primary/50 shadow-[0_0_35px_rgba(16,185,129,0.3)] animate-pulse"
                    />
                    <div className="absolute inset-0 rounded-full animate-ping border border-primary/30 pointer-events-none"></div>
                </div>

                {/* Receiver Info */}
                <h2 className="font-display text-2xl font-bold text-on-surface mb-1">{receiver.username}</h2>
                <p className="font-label text-xs uppercase tracking-wider text-text-muted mb-4">
                    Calling ({callType === 'video' ? 'Video' : 'Voice'})...
                </p>

                {/* Animated Calling Indicator */}
                <div className="flex justify-center gap-1.5 mb-8">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>

                {/* Cancel Button */}
                <div className="flex justify-center relative z-10">
                    <button
                        onClick={handleCancel}
                        className="w-14 h-14 bg-red-500/90 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center transition shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95"
                        title="End Call"
                    >
                        <FiPhoneOff className="text-2xl" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OutgoingCall;
