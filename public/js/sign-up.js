
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById('SignForm');

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const image = document.getElementById('image').files[0]; // Access the uploaded image

    // Validate fields
    if (!username || !password) {
      alert('Please fill in both fields');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('image', image); // Attach the file to FormData

    try {
      const response = await fetch('/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result.msg);
        window.location.href = "../views/login.html"; // Redirect to login
        localStorage.removeItem("pdp"); // Clear some stored item
      } else {
        console.log('Registration failed', result);
      }

    } catch (error) {
      console.error('Error during registration:', error.message);
    }
  });
});
