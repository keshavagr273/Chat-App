import { create } from 'zustand';

const useCallStore = create((set, get) => ({
    // Call state
    isInCall: false,
    isCalling: false, // Outgoing call waiting for answer
    callType: null, // 'voice' or 'video'
    isIncomingCall: false,
    incomingCallData: null,
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    isMuted: false,
    isVideoOff: false,
    callStartTime: null,
    callDuration: 0,
    caller: null,
    receiver: null,

    // Actions
    setIncomingCall: (callData) => {
        set({
            isIncomingCall: true,
            incomingCallData: callData,
            callType: callData.callType,
            caller: callData.caller
        });
    },

    acceptCall: () => {
        set({
            isIncomingCall: false,
            isInCall: true,
            isCalling: false,
            callStartTime: Date.now()
        });
    },

    rejectCall: () => {
        const { localStream, remoteStream, peerConnection } = get();

        // Clean up local stream
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
                console.log('🛑 Stopped local track:', track.kind);
            });
        }

        // Clean up remote stream
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => {
                track.stop();
                console.log('🛑 Stopped remote track:', track.kind);
            });
        }

        // Close peer connection
        if (peerConnection) {
            peerConnection.close();
            console.log('🔌 Peer connection closed');
        }

        set({
            isIncomingCall: false,
            isCalling: false,
            incomingCallData: null,
            localStream: null,
            remoteStream: null,
            peerConnection: null,
            caller: null
        });
    },

    startCall: (callType, receiver) => {
        set({
            isCalling: true,
            isInCall: false,
            callType,
            receiver
        });
    },

    callConnected: () => {
        set({
            isCalling: false,
            isInCall: true,
            callStartTime: Date.now()
        });
    },

    endCall: () => {
        const { localStream, remoteStream, peerConnection } = get();

        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }

        // Close peer connection
        if (peerConnection) {
            peerConnection.close();
        }

        set({
            isInCall: false,
            isCalling: false,
            callType: null,
            isIncomingCall: false,
            incomingCallData: null,
            localStream: null,
            remoteStream: null,
            peerConnection: null,
            isMuted: false,
            isVideoOff: false,
            callStartTime: null,
            callDuration: 0,
            caller: null,
            receiver: null
        });
    },

    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    setPeerConnection: (pc) => set({ peerConnection: pc }),

    toggleMute: () => {
        const { localStream, isMuted } = get();
        if (localStream) {
            const newMutedState = !isMuted;
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !newMutedState; // Disable track when muting, enable when unmuting
            });
            set({ isMuted: newMutedState });
            console.log(`🎤 Audio ${newMutedState ? 'MUTED' : 'UNMUTED'}`);
        }
    },

    toggleVideo: () => {
        const { localStream, isVideoOff } = get();
        if (localStream) {
            const newVideoOffState = !isVideoOff;
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !newVideoOffState; // Disable track when turning off, enable when turning on
            });
            set({ isVideoOff: newVideoOffState });
            console.log(`📹 Video ${newVideoOffState ? 'OFF' : 'ON'}`);
        }
    },

    updateCallDuration: () => {
        const { callStartTime } = get();
        if (callStartTime) {
            const duration = Math.floor((Date.now() - callStartTime) / 1000);
            set({ callDuration: duration });
        }
    }
}));

export { useCallStore };
