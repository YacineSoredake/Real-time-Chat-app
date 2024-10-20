import { getUserPayload } from './utils.js';

const userPayload = getUserPayload();
const currentAccessToken = localStorage.getItem("aceessToken");

const id = userPayload.userID;
const response = await fetch(`/profile?id=${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${currentAccessToken}`,
      'Content-Type': 'application/json',
  }
  });
const result = await response.json();

  if (response.ok) {
    const data = result.info;
    document.getElementById('profile-username').innerHTML= data.username;
    const date = new Date(data.createdAt);

    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('profile-temps').innerHTML = formattedDate;
    document.getElementById('image').setAttribute('src',data.image);
  }
  else{
    console.log(result.msg);
  }