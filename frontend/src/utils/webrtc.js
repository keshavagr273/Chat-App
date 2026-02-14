// WebRTC configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
};

// Get user media (camera/microphone)
export const getUserMedia = async (callType) => {
    try {
        const constraints = {
            audio: true,
            video: callType === 'video' ? {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } : false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
    }
};

// Create peer connection
export const createPeerConnection = () => {
    return new RTCPeerConnection(configuration);
};

// Create and send offer
export const createOffer = async (peerConnection) => {
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        return offer;
    } catch (error) {
        console.error('Error creating offer:', error);
        throw error;
    }
};

// Create and send answer
export const createAnswer = async (peerConnection) => {
    try {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        return answer;
    } catch (error) {
        console.error('Error creating answer:', error);
        throw error;
    }
};

// Handle received offer
export const handleOffer = async (peerConnection, offer) => {
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    } catch (error) {
        console.error('Error handling offer:', error);
        throw error;
    }
};

// Handle received answer
export const handleAnswer = async (peerConnection, answer) => {
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
        console.error('Error handling answer:', error);
        throw error;
    }
};

// Handle ICE candidate
export const handleIceCandidate = async (peerConnection, candidate) => {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
        console.error('Error handling ICE candidate:', error);
        throw error;
    }
};

// Add local stream to peer connection
export const addStreamToPeer = (peerConnection, stream) => {
    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
    });
};

// Format call duration
export const formatCallDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
