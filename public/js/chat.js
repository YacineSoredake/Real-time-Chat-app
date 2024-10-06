const socket = io();
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const urlParams = new URLSearchParams(window.location.search);
const contactID = urlParams.get('contactID');
const userID = urlParams.get('userID');

// Function to get contact information
const getContactInfo = async (arg) => {
    try {
        const response = await fetch(`/contact?id=${arg}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const result = await response.json();
            return result.contactInfo;
        } else {
            throw new Error('Failed to fetch contact info');
        }
    } catch (error) {
        console.error(error);
        alert('Error fetching contact information');
    }
};

// Fetch contact info and initiate chat logic
(async () => {
    const socket = io();
    const messages = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const urlParams = new URLSearchParams(window.location.search);
    const contactID = urlParams.get('contactID');
    const userID = urlParams.get('userID');
    
    // Fetch contact info and initiate chat logic
    (async () => {
        const contactInformations = await getContactInfo(contactID);
        const { username } = contactInformations;
    
        const room = `room-${Math.min(contactID, userID)}-${Math.max(contactID, userID)}`;
        joinRoom(room);
    
        function joinRoom(room) {
            socket.emit('joinRoom', room);
            console.log(`Joined room: ${room}`);
        }
    
        // Load previously stored messages (on page load)
        socket.on('loadMessages', (messagesArray) => {
            messagesArray.forEach(msg => {
                const sender = msg.sender === userID ? 'You' : username;
                appendMessage(sender, msg.message);
            });
        });
    
        // Ensure the receiveMessage event is only added once
        socket.on('receiveMessage', (data) => {
            console.log('Received message:', data); // Debugging log
            const sender = data.sender === userID ? 'You' : username;
            appendMessage(sender, data.message);
        });
    
        // Sending messages
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    
        function sendMessage() {
            const msg = messageInput.value;
            if (msg) {
                console.log('Sending message:', msg); // Debug log for sent message
                socket.emit('chatMessage', { room, message: msg, sender: userID, receiver: contactID });
                messageInput.value = ''; // Clear input after sending
                appendMessage('You', msg); // Display own message immediately
            }
        }
    
        // Error handling
        socket.on('errorMessage', (errorMessage) => {
            console.error(errorMessage);
            alert(errorMessage);
        });
    
        // Function to append messages to the UI without reloading
        function appendMessage(sender, message) {
            const li = document.createElement('li');
            li.textContent = `${sender}: ${message}`;
            messages.appendChild(li);
            messages.scrollTop = messages.scrollHeight; // Auto scroll to the latest message
        }
    })();
    
})();
