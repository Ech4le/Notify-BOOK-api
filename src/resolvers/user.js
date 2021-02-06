module.exports = {
    //Pobranie z listy notatek uzytkownika
    notes: async (user, args, { models }) => {
        return await models.Note.find({ author: user._id }).sort({ _id: -1 });
    },

    //Pobranie listy ulubionych notatek uzytkownika
    favorites: async (user, args, { models }) => {
        return await models.Note.find({ favoritedBy: user._id }).sort({ _id: -1 });
    },
};