const socket = io();
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const urlParams = new URLSearchParams(window.location.search);
const contactID = urlParams.get('contactID');
const userID = urlParams.get('userID');
const contactImgHeader = document.getElementById('contactImgHeader');
const contactUsrHeader = document.getElementById('contactUsrHeader');

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

function scrollToBottom() {
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
}

// Scroll to the bottom when the page has fully loaded
window.addEventListener('DOMContentLoaded', () => {
    scrollToBottom();
});

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
        const { username,image } = contactInformations;
        
        contactImgHeader.setAttribute("src",`../images/${image}`);
        contactUsrHeader.innerHTML=username;

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
            const sender = data.sender === userID ? 'You' : username;
            appendMessage(sender, data.message);
        });
    
        // Sending messages
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
            socket.emit('chatMessage', { room, message: msg, sender: userID, receiver: contactID });
            messageInput.value = ''; // Clear input after sending
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
        
            if (sender === "You") {
                li.textContent = message;
                li.classList.add('your-message'); // Add class for your messages
            } else {
                li.className='flex items-center'
                const img = document.createElement('img');
                img.setAttribute("src",`../images/${image}`); // Set the source of the sender's image
                img.classList.add('sender-image'); // Optional: Add a class for styling the image
        
                // Create a text node for the sender's name and message
                const senderMessage = document.createTextNode(`${message}`);
                
                // Append the image and text node to the li
                li.appendChild(img);
                li.appendChild(senderMessage);
                
                li.classList.add('sender-message'); // Add class for sender's messages
            }
        
            document.getElementById('messages').appendChild(li);
            scrollToBottom(); // Scroll to bottom after appending new message
        }
        
    })();
    
})();

