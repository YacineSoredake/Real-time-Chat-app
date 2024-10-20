const User = require('../models/users');

// Get user profile
exports.getContacts = async (request, response) => {
    try {
      const excludedUserId = request.query.id;
      const users = await User.find().exec(); 
      const userArray = users.filter(user => user._id.toString() !== excludedUserId);
      return response.json({ msg: "List of contacts", users: userArray });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ msg: "Error fetching contacts" });
    }
}

// Update user profile
exports.getContact = async (request, response) => {
    const contactID = request.query.id;
    try {
      const findContact = await User.findById(contactID).exec();
      if (findContact) {
        return response.status(200).json({ success: true, contactInfo: findContact });
      } else {
        return response.status(404).json({ success: false, msg: "Contact non trouvé" });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).json({ success: false, msg: "Erreur lors de la récupération du contact" });
    }
  };
