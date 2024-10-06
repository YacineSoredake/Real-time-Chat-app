const users = [
    { id: 1, username: "yacine", password: "123", role:"visitor",image:"♡.jpeg" },
    { id: 2, username: "shinei", password: "123", role:"visitor",image:"Shinei Nouzen.png" },
    { id: 3, username: "kanat", password: "123", role:"visitor",image:"téléchargement.jpeg" }
];

// Function to add a new user (used for registration)
function addUser(username, password) {
    const newId = users.length + 1;
    users.push({ id: newId, username, password });
}

module.exports = { users, addUser };