import { useEffect, useRef, useState } from 'react';
import { useCallStore } from '../store/callStore';
import { FiPhone, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { formatCallDuration } from '../utils/webrtc';
import { getSocket } from '../utils/socket';

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
    }, [isInCall, updateCallDuration]);

    // Set local video stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Set remote video stream
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

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
        <div className={`fixed inset-0 bg-dark-300 z-50 flex flex-col ${isFullscreen ? 'p-0' : 'p-4'}`}>
            {/* Remote Video/Avatar */}
            <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
                {callType === 'video' && remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <img
                            src={otherUser?.avatar}
                            alt={otherUser?.username}
                            className="w-40 h-40 rounded-full object-cover ring-4 ring-primary mb-4"
                        />
                        <h2 className="text-white text-3xl font-bold">{otherUser?.username}</h2>
                        <p className="text-gray-400 mt-2">{formatCallDuration(callDuration)}</p>
                    </div>
                )}

                {/* Local Video (Picture in Picture) */}
                {callType === 'video' && localStream && (
                    <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 bg-dark-300 flex items-center justify-center">
                                <FiVideoOff className="text-4xl text-gray-400" />
                            </div>
                        )}
                    </div>
                )}

                {/* Call Duration Overlay (for video calls) */}
                {callType === 'video' && (
                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-full">
                        <p className="text-white font-mono">{formatCallDuration(callDuration)}</p>
                    </div>
                )}

                {/* Fullscreen Toggle */}
                <button
                    onClick={toggleFullscreen}
                    className="absolute bottom-4 right-4 bg-black bg-opacity-50 p-3 rounded-full text-white hover:bg-opacity-70 transition"
                >
                    {isFullscreen ? <FiMinimize2 className="text-xl" /> : <FiMaximize2 className="text-xl" />}
                </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 py-6">
                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? (
                        <FiMicOff className="text-2xl text-white" />
                    ) : (
                        <FiMic className="text-2xl text-white" />
                    )}
                </button>

                {/* End Call Button */}
                <button
                    onClick={handleEndCall}
                    className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-xl"
                    title="End Call"
                >
                    <FiPhone className="text-2xl text-white transform rotate-135" />
                </button>

                {/* Video Toggle Button (only for video calls) */}
                {callType === 'video' && (
                    <button
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                    >
                        {isVideoOff ? (
                            <FiVideoOff className="text-2xl text-white" />
                        ) : (
                            <FiVideo className="text-2xl text-white" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ActiveCall;
