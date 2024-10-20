const User = require('../models/users');

// Get user profile
exports.getProfile = async (request,response) => {
    const ids = request.query.id;
    try {
      const findProfile = await User.findById(ids).exec();
      if (findProfile) {
        return response.status(200).json({ success: true, info: findProfile });
      } else {
        return response.status(404).json({ success: false, msg: "Contact non trouvé" });
      }
    } catch (error) {
      return response.status(500).json({ success: false, msg: "Erreur lors de la récupération du contact" });
    }
  };

// Update user profile
exports.updateProfile = async (request, response) => {
    const id = request.query.id;
    const { username } = request.body; 
    const imageUp = request.file ? `/uploads/${request.file.filename}` : null; 
    try {
      const updateFields = {};
      if (username) {
        updateFields.username = username; 
      }
      if (imageUp) {
        updateFields.image = imageUp; 
      }
      const updatedProfile = await User.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
      if (!updatedProfile) {
        return response.status(404).json({ success: false, msg: 'Profil non trouvé' });
      }
      return response.status(200).json({ success: true, msg:"profile updated", profile: updatedProfile });
    } catch (error) {
      return response.status(500).json({ success: false, msg: 'Erreur lors de la mise à jour du profil' });
    }
  };
