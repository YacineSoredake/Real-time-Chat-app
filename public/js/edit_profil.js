       // Get elements
       const editBtn = document.getElementById('edit-btn');
       const saveBtn = document.getElementById('save-btn');
       const profileUsername = document.getElementById('profile-username');
       const image = document.getElementById('image');
       const imageUpload = document.getElementById('image-upload');
       const btnParent = document.getElementById('btnParent');

       const urlParams = new URLSearchParams(window.location.search);
       const id = urlParams.get('id');
       

       editBtn.addEventListener("click",() => {
        const currentUsername = profileUsername.innerText;
        profileUsername.innerHTML = `<input id="username-input" type="text" class="text-center font-semibold border-b-2 border-indigo-500" value="${currentUsername}">`;

        editBtn.style.display="none";
        saveBtn.style.display="block";
        const changeImageBtn = document.createElement('button');
        changeImageBtn.innerText = 'Change Image';
        changeImageBtn.classList.add('block', 'mx-auto', 'mt-4', 'rounded-full', 'text-indigo-500', 'border', 'border-indigo-500', 'bg-gray-100', 'hover:shadow-lg', 'font-semibold', 'hover:text-white', 'hover:bg-indigo-500', 'px-6', 'py-2');

        btnParent.appendChild(changeImageBtn);

        changeImageBtn.addEventListener('click', () => {
            imageUpload.click(); 
        });
       imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                image.src = e.target.result; // Update profile image with selected file
                };
                reader.readAsDataURL(file);
                }
            });
        
            saveBtn.addEventListener("click", async () => {
                // Get the file from the image upload input
                const img = imageUpload.files[0]; 
            
                // Get the updated username value
                const updatedUsername = document.getElementById('username-input').value;
            
                // Create a new FormData object
                const data = new FormData();
                data.append('username', updatedUsername);  // Add username to form data
                if (img) {
                    data.append('image', img);  // Add image file to form data (if it exists)
                }
            
                try {
                    const response = await fetch(`/profile?id=${id}`, {
                        method: 'PUT',
                        body: data
                    });
            
                    const result = await response.json();
                    if (response.ok) {
                        document.getElementById('notif-msg').innerHTML = result.msg;
                        const notifContainer = document.getElementById('notif-cnt');
                    
                        // Animate the notification (fade in)
                        gsap.fromTo(notifContainer, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 });
                        notifContainer.style.display = "flex";
                    
                        setTimeout(() => {
                            // Animate the notification (fade out)
                        gsap.to(notifContainer, { opacity: 0, scale: 0.8, duration: 0.5, onComplete: () => location.reload() });
                        }, 2000); // Adjust the delay as needed
                    }
                     else {
                        console.log(result.msg); 
                    }
            
                } catch (error) {
                    console.log(error);
                }
            });


       })
