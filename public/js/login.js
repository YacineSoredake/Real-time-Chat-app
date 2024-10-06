document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function (event) {
        console.log("!og in clicked");
        event.preventDefault(); // Prevent form from submitting normally

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        
        if (!username || !password) {
            alert('Please fill in both fields'); // Basic validation
            return;
        }

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }) // Send data to the server
            });

            const result = await response.json();

            if (response.status === 200) {
                const accessToken= result.accessToken;
                localStorage.setItem("aceessToken",accessToken)
                const refreshToken= result.refreshToken;
                localStorage.setItem("refreshToken",refreshToken)
                setTimeout(() => {
                    window.location.href="/public/views/contact.html"
                }, 2000);
            } else {
                // Handle login errors
                alert(result.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});