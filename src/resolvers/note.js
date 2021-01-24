module.exports = {
    //Pobranie informacji o autorze podczas pobierania notatki
    author: async (note, args, { models }) => {
        return await models.User.findById(note.author);
    },
    
    //Pobranie wartosci favoritedBy podczas pobierania notatki
    favoritedBy: async (note, args, { models }) => {
        return await models.User.find({ _id: { $in: note.favoritedBy } });
    }
};