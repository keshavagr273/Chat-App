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
        const { localStream, peerConnection } = get();

        // Clean up streams
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        // Close peer connection
        if (peerConnection) {
            peerConnection.close();
        }

        set({
            isIncomingCall: false,
            isCalling: false,
            incomingCallData: null,
            localStream: null,
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
            localStream.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
            set({ isMuted: !isMuted });
        }
    },

    toggleVideo: () => {
        const { localStream, isVideoOff } = get();
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = isVideoOff;
            });
            set({ isVideoOff: !isVideoOff });
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
