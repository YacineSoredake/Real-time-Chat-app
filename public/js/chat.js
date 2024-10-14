const socket = io();
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const urlParams = new URLSearchParams(window.location.search);
const contactID = urlParams.get('contactID');
const userID = urlParams.get('userID');
const contactImgHeader = document.getElementById('contactImgHeader');
const contactUsrHeader = document.getElementById('contactUsrHeader');
const fileInput = document.getElementById('fileInput');

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
        
        document.getElementById('incomigcallmsg').innerHTML=`Incoming call from ${username}`
        
        contactImgHeader.setAttribute("src",`${image}`);
        contactUsrHeader.innerHTML=username;

        const room = contactID.localeCompare(userID) < 0 
            ? `room-${contactID}-${userID}` 
            : `room-${userID}-${contactID}`;
        joinRoom(room);
    
        function joinRoom(room) {
            socket.emit('joinRoom', room);
            console.log(`Joined room: ${room}`);
        }
    
        // Load previously stored messages (on page load)
        socket.on('loadMessages', (messagesArray) => {
            messagesArray.forEach(msg => {
                const sender = msg.sender === userID ? 'You' : username;
                if (msg.imageUrl) {
                    // If the message contains an image
                    appendImage(sender, msg.imageUrl);
                } else {
                    // Regular text message
                    appendMessage(sender, msg.message);
                }

            });
        });
    
        // Ensure the receiveMessage event is only added once
        socket.on('receiveMessage', (data) => {
            const sender = data.sender === userID ? 'You' : username;
            
            if (data.imageUrl) {
                // If the message contains an image
                appendImage(sender, data.imageUrl);
            } else {
                // Regular text message
                appendMessage(sender, data.message);
            }
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
            socket.emit('chatMessage', { room, message: msg, sender: userID, receiver: contactID });
            messageInput.value = ''; // Clear input after sending
         }
        }

    
        // Error handling
        socket.on('errorMessage', (errorMessage) => {
            console.error(errorMessage);
            alert(errorMessage);
        });

        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('room', room);
                formData.append('sender', userID);
                formData.append('receiver', contactID);
        
                // Send the image to the server using Fetch API
                fetch('/upload-image', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        appendImage('You', data.imageUrl); // Append your sent image
                    } else {
                        alert('Error uploading image');
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                });
            }
        });

        function appendImage(sender, imageUrl) {
            const li = document.createElement('li');
            const imgElement = document.createElement('img');
            
            imgElement.src = imageUrl;
            imgElement.className = 'rounded-md max-w-xs';  // Style the image
            imgElement.alt = "Image";  // Add alt attribute for better accessibility
            
            li.appendChild(imgElement);
            
            // Apply different classes based on the sender
            if (sender === "You") {
                li.className = 'flex justify-end items-center m-3';  // Align to the right for "You"
            } else {
                li.className = 'flex justify-start items-center m-3';  // Align to the left for the other sender
            }
        
            document.getElementById('messages').appendChild(li);
            scrollToBottom();  // Ensure the chat scrolls down when a new image is appended
        }
        
    
        // Function to append messages to the UI without reloading
        function appendMessage(sender, message) {
            const li = document.createElement('li');
            li.className='shadow-lg'
        
            if (sender === "You") {
                li.textContent = message;
                li.classList.add('your-message'); // Add class for your messages
            } else {
                li.className='flex items-center shadow-md border border-indigo-600'
                const img = document.createElement('img');
                img.setAttribute("src",`${image}`); // Set the source of the sender's image
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

