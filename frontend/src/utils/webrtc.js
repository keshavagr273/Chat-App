// Static fallback ICE config — STUN only.
// Actual TURN credentials are fetched fresh from the backend before each call.
const DEFAULT_STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
];

// Get user media (camera/microphone)
export const getUserMedia = async (callType) => {
    try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Your browser does not support camera/microphone access');
        }

        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
            video: callType === 'video' ? true : false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
    } catch (error) {
        console.error('Error accessing media devices:', error);

        // Provide specific error messages
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            throw new Error('Camera/microphone permission denied. Please allow access in browser settings.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            throw new Error('No camera/microphone found. Please connect a device.');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            throw new Error('Camera/microphone is already in use. If testing locally with two browsers, use different devices or try voice-only calls.');
        } else {
            throw new Error(error.message || 'Failed to access camera/microphone');
        }
    }
};

// Create peer connection
// Pass iceServers fetched from /api/turn for production-grade TURN support.
// Falls back to STUN-only if not provided (works for same-network calls).
export const createPeerConnection = (iceServers = null) => {
    const config = {
        iceServers: iceServers || DEFAULT_STUN_SERVERS,
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all'
    };
    return new RTCPeerConnection(config);
};

// ==================== ICE Candidate Queue ====================
// ICE candidates can arrive before remoteDescription is set.
// Queue them and flush once the remote description is ready.
const iceCandidateQueue = [];

export const queueIceCandidate = (candidate) => {
    iceCandidateQueue.push(candidate);
};

export const flushIceCandidateQueue = async (peerConnection) => {
    while (iceCandidateQueue.length > 0) {
        const candidate = iceCandidateQueue.shift();
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error('Error flushing queued ICE candidate:', err);
        }
    }
};

export const clearIceCandidateQueue = () => {
    iceCandidateQueue.length = 0;
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
    try {
        if (!peerConnection || peerConnection.connectionState === 'closed') {
            throw new Error('Peer connection is not available or already closed');
        }

        stream.getTracks().forEach(track => {
            // Ensure track is enabled before adding
            track.enabled = true;
            peerConnection.addTrack(track, stream);
        });
    } catch (error) {
        console.error('❌ Error adding tracks to peer connection:', error);
        throw error;
    }
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
