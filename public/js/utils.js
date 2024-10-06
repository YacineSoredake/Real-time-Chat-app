// jwtUtils.js

export function getUserPayload() {
    const token = localStorage.getItem("aceessToken");
    
    if (!token) {
        return null; // or throw an error if preferred
    }
    
    try {
        // Decode the token
        const decoded = jwt_decode(token);
        return decoded; // This will return the payload
    } catch (error) {
        console.error("Error decoding token:", error);
        return null; // Handle the error gracefully
    }
}
