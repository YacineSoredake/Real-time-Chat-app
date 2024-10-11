(async () => {
socket.emit('entered', userID);
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const remotePipBtn = document.getElementById('remotePipBtn');
const incomingCallDiv = document.getElementById('incomingCallDiv');
let localStream;
let peerConnection;
let currentCaller = null;

const iceServers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

remotePipBtn.addEventListener('click', async () => {
    if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
    } else {
        await remoteVideo.requestPictureInPicture();
    }
});

async function getMedia() {
    try {
        // Await the result of getUserMedia to get the MediaStream
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        // Set the srcObject of localVideo to the retrieved MediaStream
        localVideo.srcObject = localStream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
    }
}

// Function to create a peer connection
async function createPeerConnection() {
     // Ensure media is fetched before creating peer connection
    await getMedia(); 
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

// Function to get media stream (camera and mic)

// Call button event listener
document.getElementById('callBtn').addEventListener('click', async () => {
    document.getElementById('call-container').style.display='flex';
    document.getElementById('chat-container').style.display='none';

    if (!localStream) {
        await getMedia();
    }

    const selectedUser = contactID;
    if (!selectedUser) {
        alert('Please select a user to call.');
        return;
    }else{
        console.log(selectedUser); 
    }

    peerConnection = await createPeerConnection();
    if (!peerConnection) {
        alert("Error creating peer connection. Please check your media devices.");
        return;
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('call-user', {
        offer: offer,
        to: selectedUser
    });

    currentCaller = selectedUser;
});

// Socket handler for incoming calls
socket.on('call-made', (data) => {
    incomingCallDiv.style.display = 'flex';
    
    // Then, animate with GSAP
    gsap.fromTo(
        incomingCallDiv, 
        { opacity: 0, scale: 0.8 }, // Starting state
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" } // Ending state with animation
    );
    currentCaller = data.from;

    document.getElementById('answerBtn').onclick = async () => {
        incomingCallDiv.style.display = 'none';
        document.getElementById('call-container').style.display='flex';
        document.getElementById('chat-container').style.display='none';

        if (!localStream) {
            await getMedia();
        }

        peerConnection = await createPeerConnection();
        if (!peerConnection) {
            alert("Error creating peer connection. Please check your media devices.");
            return;
        }

        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('call-answered', {
            answer: answer,
            to: currentCaller
        });
    };

    document.getElementById('declineBtn').onclick = () => {
        incomingCallDiv.style.display = 'none';
        socket.emit('call-declined', { from: data.from });
    };
});

socket.on('call-answered', async (data) => {
    remoteVideo.style.display='block'
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else {
        console.error('Peer connection is missing during call answer');
    }
});

socket.on('call-declined', () => {
    alert('Call was declined.');
    cleanupCall();
});

socket.on('ice-candidate', async (data) => {
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }
});

// Hang up the call
document.getElementById('hangupBtn').addEventListener('click', () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        socket.emit('hangup-call', { to: currentCaller });
        cleanupCall();
    }
});

// Mute/unmute audio
document.getElementById('muteBtn').addEventListener('click', () => {
    localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
});

// Show/hide camera
document.getElementById('hideCameraBtn').addEventListener('click', () => {
    localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
});

// Cleanup function when call is finished or declined
function stopLocalVideo() {
    if (localStream) {
        localStream.getTracks().forEach(track => {
            track.stop();  // Stop each track
        });
        localStream = null;  // Clear the localStream reference
    }
    localVideo.srcObject = null;  // Stop rendering the video
}
function cleanupCall() {
    document.getElementById('call-container').style.display='none';
    document.getElementById('chat-container').style.display='flex';
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        stopLocalVideo();
    }
    currentCaller = null;
    incomingCallDiv.style.display = 'none';
}
})();