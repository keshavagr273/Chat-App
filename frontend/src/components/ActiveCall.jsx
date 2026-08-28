import { useEffect, useRef, useState } from 'react';
import { useCallStore } from '../store/callStore';
import { FiPhone, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMaximize2, FiMinimize2, FiPhoneOff } from 'react-icons/fi';
import { formatCallDuration } from '../utils/webrtc';
import { getSocket } from '../utils/socket';
import Avatar from './Avatar';

const ActiveCall = () => {
    const {
        isInCall,
        callType,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        callDuration,
        endCall,
        toggleMute,
        toggleVideo,
        updateCallDuration,
        receiver,
        caller
    } = useCallStore();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const socket = getSocket();

    // Update call duration every second
    useEffect(() => {
        if (isInCall) {
            const interval = setInterval(() => {
                updateCallDuration();
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isInCall]);

    // Set local video stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(err => console.error('Local video play error:', err));
        }
        return () => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
        };
    }, [localStream, isInCall]);

    // Set remote video stream
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(err => console.error('Remote video play error:', err));
        }
        return () => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        };
    }, [remoteStream, isInCall]);

    const handleEndCall = () => {
        if (socket) {
            const otherUser = receiver || caller;
            socket.emit('call_ended', {
                to: otherUser?._id
            });
        }
        endCall();
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!isInCall) return null;

    const otherUser = receiver || caller;

    return (
        <div className={`fixed inset-0 bg-background z-50 flex flex-col ${isFullscreen ? 'p-0' : 'p-3 sm:p-6'} animate-fade-in-up`}>
            {/* Main Call Canvas */}
            <div className="flex-1 relative bg-surface-container-lowest rounded-3xl overflow-hidden border border-border-glass shadow-2xl flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 emerald-glow-bg rounded-full blur-3xl pointer-events-none opacity-40"></div>

                {/* Remote Video feed */}
                {callType === 'video' && (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        controls={false}
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Avatar Fallback for Voice Call or when video is connecting */}
                {(!remoteStream || callType !== 'video') && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="relative mb-6">
                            <Avatar
                                src={otherUser?.avatar}
                                name={otherUser?.username}
                                className="w-32 h-32 md:w-40 md:h-40 border-4 border-primary/50 shadow-[0_0_50px_rgba(16,185,129,0.35)]"
                            />
                            <div className="absolute inset-0 rounded-full animate-ping border border-primary/40 pointer-events-none"></div>
                        </div>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface mb-2">{otherUser?.username}</h2>
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-highest/80 border border-border-glass">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="font-mono text-xs text-primary font-medium">{formatCallDuration(callDuration)}</span>
                        </div>
                    </div>
                )}

                {/* Picture-in-Picture Local Video */}
                {callType === 'video' && (
                    <div className="absolute top-4 right-4 w-36 h-28 sm:w-48 sm:h-36 bg-surface-container-highest rounded-2xl overflow-hidden shadow-2xl border-2 border-border-glass z-20">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            controls={false}
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
                                <FiVideoOff className="text-2xl text-text-muted" />
                            </div>
                        )}
                    </div>
                )}

                {/* Call Timer Overlay for Video */}
                {callType === 'video' && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-surface-container-lowest/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border-glass">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="font-mono text-xs text-on-surface font-medium">{formatCallDuration(callDuration)}</span>
                        <span className="text-[10px] font-label uppercase tracking-wider text-text-muted border-l border-border-glass pl-2">HD Encrypted</span>
                    </div>
                )}

                {/* Fullscreen Toggle */}
                <button
                    onClick={toggleFullscreen}
                    className="absolute bottom-4 right-4 z-20 bg-surface-container-lowest/80 backdrop-blur-md p-2.5 rounded-xl text-on-surface hover:bg-surface-container-highest border border-border-glass transition"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? <FiMinimize2 className="text-lg" /> : <FiMaximize2 className="text-lg" />}
                </button>
            </div>

            {/* Floating Glass Control Dock */}
            <div className="py-4 flex items-center justify-center">
                <div className="bento-card px-6 py-3 border border-border-glass flex items-center gap-5 shadow-2xl">
                    {/* Mute Button */}
                    <button
                        onClick={toggleMute}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            isMuted 
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                                : 'bg-surface-container-highest text-on-surface hover:bg-surface-bright border border-border-glass'
                        }`}
                        title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                        {isMuted ? <FiMicOff className="text-xl" /> : <FiMic className="text-xl" />}
                    </button>

                    {/* Camera Button (Video Call only) */}
                    {callType === 'video' && (
                        <button
                            onClick={toggleVideo}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                isVideoOff 
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                                    : 'bg-surface-container-highest text-on-surface hover:bg-surface-bright border border-border-glass'
                            }`}
                            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                        >
                            {isVideoOff ? <FiVideoOff className="text-xl" /> : <FiVideo className="text-xl" />}
                        </button>
                    )}

                    {/* End Call Button */}
                    <button
                        onClick={handleEndCall}
                        className="w-14 h-12 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-red-500/40 hover:scale-105 active:scale-95"
                        title="Disconnect Call"
                    >
                        <FiPhoneOff className="text-xl" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveCall;
