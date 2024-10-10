const currentAccessToken = localStorage.getItem("aceessToken");
const contact_container = document.getElementById("Contact-container");
const greetMsg = document.getElementById("greetings-msg");

import { getUserPayload } from './utils.js';

// Use the function to get the payload
const userPayload = getUserPayload();

if (userPayload) {
    console.log("Username:", userPayload.username);
    console.log("User ID:", userPayload.userID);
    console.log("Role:", userPayload.role);
} else {
    console.log("User not authenticated");
}

greetMsg.innerHTML=`Hi ${userPayload.username}, Wanna chat ?`;
// Correct the spelling from "aceessToken"

if (currentAccessToken) {
    fetch(`/contacts?id=${userPayload.userID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${currentAccessToken}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Contacts data received:", data.users);
        const users = data.users;
        users.forEach(user => {
            const contact_link = document.createElement('a');
            contact_link.className = 'flex items-center justify-around gap-5 rounded-lg p-4 bg-white w-80 shadow-md';
            contact_link.setAttribute("href", `./chat.html?contactID=${user.id}&userID=${userPayload.userID}`);
            contact_link.innerHTML = `
                <img class="h-20 w-20 rounded-full shadow-md border-2 border-indigo-600" src="../images/${user.image}" alt="">
                <p class="indigo-600 font-medium">${user.username}</p>
                <p class="child text-white bg-indigo-600 p-2 rounded-lg shadow-md" style="opacity: 0;">
                    Chat now!
                </p>
            `;
        
            contact_link.addEventListener('mouseenter', () => {
                gsap.to(contact_link.querySelector('.child'), { opacity: 1, duration: 0.2, x: -8 });
            });
        
            contact_link.addEventListener('mouseleave', () => {
                gsap.to(contact_link.querySelector('.child'), { opacity: 0, duration: 0.5, x: 0 });
            });
            contact_container.appendChild(contact_link);
        });
        
        // Do something with the received contacts data
    })
    .catch(error => {
        console.error("Error fetching contacts:", error);
        // Handle the error, e.g., redirect to login if unauthorized
    });
} else {
    console.error("No access token found. Redirecting to login.");
    // Redirect to login page if access token is missing
}
