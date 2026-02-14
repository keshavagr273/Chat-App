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
    const localAudioRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const socket = getSocket();

    // Debug logging moved to useEffect to prevent excessive console spam
    useEffect(() => {
        if (isInCall) {
            console.log('🎬 ActiveCall - In call with:', callType);
            console.log('  Local stream:', !!localStream, 'Remote stream:', !!remoteStream);
        }
    }, [isInCall, callType, localStream, remoteStream]);

    // Update call duration every second
    useEffect(() => {
        if (isInCall) {
            const interval = setInterval(() => {
                updateCallDuration();
            }, 1000);

            return () => {
                clearInterval(interval);
                console.log('🧹 Call duration timer cleaned up');
            };
        }
    }, [isInCall]); // Removed updateCallDuration from deps

    // Set local video stream
    useEffect(() => {
        if (localVideoRef.current && localStream && isInCall) {
            console.log('🎥 Setting local video stream');
            localVideoRef.current.srcObject = localStream;

            localVideoRef.current.play()
                .then(() => console.log('✅ Local video playing'))
                .catch(err => console.error('❌ Local video play error:', err));
        }

        return () => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
        };
    }, [localStream, isInCall]);

    // Set remote video stream
    useEffect(() => {
        console.log('🔍 Remote video effect check:');
        console.log('  - remoteVideoRef.current:', !!remoteVideoRef.current);
        console.log('  - remoteStream:', !!remoteStream);
        console.log('  - isInCall:', isInCall);

        if (remoteVideoRef.current && remoteStream && isInCall) {
            console.log('📺📺📺 SETTING REMOTE VIDEO STREAM 📺📺📺');
            console.log('Remote stream details:');
            console.log('  - Stream ID:', remoteStream.id);
            console.log('  - Active:', remoteStream.active);
            console.log('  - Tracks:', remoteStream.getTracks().map(t => ({
                kind: t.kind,
                enabled: t.enabled,
                readyState: t.readyState,
                muted: t.muted
            })));

            // Monitor track unmute events
            const unmuteHandlers = [];
            remoteStream.getTracks().forEach(track => {
                if (track.muted) {
                    console.warn(`⚠️⚠️ Remote ${track.kind} track is MUTED - waiting for data...`);
                    
                    const onUnmute = () => {
                        console.log(`✅✅✅ Remote ${track.kind} track UNMUTED - data flowing!`);
                    };
                    
                    track.addEventListener('unmute', onUnmute);
                    unmuteHandlers.push({ track, handler: onUnmute });
                } else {
                    console.log(`✅ Remote ${track.kind} track already producing data`);
                }
                
                console.log(`Track ${track.kind}:`, {
                    enabled: track.enabled,
                    muted: track.muted,
                    readyState: track.readyState
                });
            });
            
            remoteVideoRef.current.srcObject = remoteStream;
            console.log('✅ Remote stream assigned to video element');
            
            // Try to play immediately
            remoteVideoRef.current.play()
                .then(() => {
                    console.log('✅✅✅ REMOTE VIDEO PLAYING ✅✅✅');
                    
                    // Check if tracks are still muted after 2 seconds
                    setTimeout(() => {
                        const mutedTracks = remoteStream.getTracks().filter(t => t.muted);
                        if (mutedTracks.length > 0) {
                            console.error('❌❌❌ WARNING: Tracks still muted after 2 seconds!');
                            console.error('Muted tracks:', mutedTracks.map(t => t.kind));
                            console.error('This indicates ICE connection issues - check network/firewall');
                        }
                    }, 2000);
                })
                .catch(err => {
                    console.error('❌❌❌ REMOTE VIDEO PLAY ERROR ❌❌❌');
                    console.error('Error:', err.name, err.message);
                });
            
            return () => {
                // Clean up unmute handlers
                unmuteHandlers.forEach(({ track, handler }) => {
                    track.removeEventListener('unmute', handler);
                });
                socket.emit('call_ended', {
                    to: otherUser._id
                });
                console.log('📵 Sent call_ended to:', otherUser._id);
            } else {
                console.warn('⚠️ Cannot send call_ended - no other user found');
            }
        }
        endCall();
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Set audio streams for voice calls
    useEffect(() => {
        if (callType === 'voice' && localAudioRef.current && localStream) {
            console.log('🔊 Setting local audio stream for voice call');
            localAudioRef.current.srcObject = localStream;
            localAudioRef.current.muted = true; // Always mute own audio
        }
        if (callType === 'voice' && remoteAudioRef.current && remoteStream) {
            console.log('🔊 Setting remote audio stream for voice call');
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play()
                .then(() => console.log('✅ Remote audio playing'))
                .catch(err => console.error('❌ Remote audio play error:', err));
        }
    }, [callType, localStream, remoteStream]);

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
                        controls={false}
                        muted={false}
                        onPlay={() => console.log('▶️ Remote video playing')}
                        onError={(e) => console.error('❌ Remote video error:', e.target.error)}
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
                {callType === 'video' && localStream ? (
                    <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            controls={false}
                            onLoadedMetadata={(e) => {
                                console.log('�🎬🎬 LOCAL VIDEO METADATA LOADED 🎬🎬🎬');
                                console.log('  Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
                                console.log('  Duration:', e.target.duration);
                                console.log('  Ready state:', e.target.readyState);
                            }}
                            onLoadedData={() => console.log('📦 Local video data loaded')}
                            onCanPlay={() => console.log('✅ Local video CAN PLAY')}
                            onCanPlayThrough={() => console.log('✅✅ Local video CAN PLAY THROUGH')}
                            onPlay={() => console.log('▶️▶️▶️ LOCAL VIDEO STARTED PLAYING ▶️▶️▶️')}
                            onPlaying={() => console.log('🎥 Local video is PLAYING')}
                            onPause={() => console.warn('⏸️ Local video PAUSED')}
                            onError={(e) => console.error('❌❌❌ LOCAL VIDEO ERROR:', e.target.error)}
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 bg-dark-300 flex items-center justify-center">
                                <FiVideoOff className="text-4xl text-gray-400" />
                            </div>
                        )}
                    </div>
                ) : null}

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

            {/* Hidden audio elements for voice calls */}
            {callType === 'voice' && (
                <>
                    <audio ref={localAudioRef} muted autoPlay />
                    <audio ref={remoteAudioRef} autoPlay />
                </>
            )}
        </div>
    );
};

export default ActiveCall;
