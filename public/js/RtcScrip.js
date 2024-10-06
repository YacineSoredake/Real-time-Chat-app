(async () => {
    const socket = io();
    const incomingCallDiv = document.getElementById('incoming-call');
    const callerIdSpan = document.getElementById('caller-id');
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const joinCallBtn = document.getElementById('joinCallBtn');
    const hangupCallBtn = document.getElementById('hangupCallBtn');
    const callButton = document.getElementById('callButton');

    let localStream;
    let peerConnection;
    const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    let currentCaller = null;

    // Get the contact socket ID from the server when the user connects
    socket.on('getContactSocketsId', (connectedSockets) => {
        const contactSocketId = Object.keys(connectedSockets).find(socketId => socketId !== socket.id);
        console.log(`Contact's socket ID: ${contactSocketId}`);
        
        // Assign the socket ID to the variable for making calls
        callButton.addEventListener('click', async () => {
            await getMedia(); // Get local media
            socket.emit('call-user', { to: contactSocketId }); // Use contact's socket ID to make the call
        });
    });

    // Incoming call
    socket.on('call-made', (data) => {
        incomingCallDiv.style.display = 'block';
        callerIdSpan.textContent = data.from; // Display caller's socket ID
        currentCaller = data.from;
    });

    // Join Call (when user accepts)
    joinCallBtn.addEventListener('click', async () => {
        incomingCallDiv.style.display = 'none'; // Hide the call notification
        peerConnection = createPeerConnection();
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('call-answered', {
            answer: peerConnection.localDescription,
            to: currentCaller
        });
    });

    // Hang Up
    hangupCallBtn.addEventListener('click', () => {
        incomingCallDiv.style.display = 'none'; // Hide the call notification
        socket.emit('call-declined', { from: currentCaller });
        currentCaller = null;
    });

    socket.on('call-answered', async (data) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on('call-declined', () => {
        alert('The call was declined.');
    });

    // ICE Candidate handling
    socket.on('ice-candidate', async (data) => {
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    });

    // Get media (camera + mic)
    async function getMedia() {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    }

    // Create WebRTC PeerConnection
    function createPeerConnection() {
        const pc = new RTCPeerConnection(iceServers);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: currentCaller
                });
            }
        };

        pc.ontrack = (event) => {
            remoteVideo.srcObject = event.streams[0];
        };

        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        return pc;
    }
})();
