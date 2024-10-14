const mongoose = require('mongoose');

// Schéma utilisateur
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },  // Nom d'utilisateur unique
    password: { type: String, required: true },                // Mot de passe
    role: { type: String, default: 'visitor' }, 
    image: { type: String },                                   // URL de l'image de profil
    createdAt: { type: Date, default: Date.now }               // Date de création du compte
});

// Modèle basé sur le schéma défini
const User = mongoose.model('User', userSchema);

module.exports = User;
