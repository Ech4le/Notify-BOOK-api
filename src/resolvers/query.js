module.exports = {
    notes: async (parent, args, { models }) => {
        return await models.Note.find().limit(100);
    },

    note: async (parent, args, { models }) => {
        return await models.Note.findById(args.id);
    },

    user: async (parent, { username }, { models }) => {
        return await models.User.findOne({ username });
    },

    users: async (parent, args, { models }) => {
        return await models.User.find({});
    },

    me: async (parent, args, { models, user }) => {
        return await models.User.findById(user.id);
    },

    noteFeed: async (parent, { cursor }, { models }) => {
        //Na stałe zdefiniowane ograniczenie do 10 elementów
        const limit = 10;

        //Zdefiniowanie artości domyslnej false dla hasNextPage
        let hasNextPage = false;

        //Jezeli kursor nie zostal przekazany, domyslne zapytanie bedzie puste.
        //Spowoduje to pobranie najnowszych notatek z bazy danych
        let cursorQuery = {};

        //Jezeli kursor zostal przekazany, zapytanie bedzie szukalo notatek
        //ktorych wartosc ObjectId jest mniejsza niz wartosc kursora
        if (cursor) {
            cursorQuery = { _id: { $lt: cursor } };
        }

        //Wyszukiwanie w bazie danych limit + 1 notatek posortowanych od najnowszej
        // do najstarszej
        let notes = await models.Note.find(cursorQuery).sort({ _id: -1 }).limit(limit + 1);

        //Jezeli liczba znalezionych notatek przekracza wartosc graniczna,
        // wowczas wartoscia hasNextPage bedzie true i nadprogramowe notatki zostana odrzucone
        if (notes.length > limit) {
            hasNextPage = true;
            notes = notes.slice(0, -1);
        }

        //Nowy kursor bedzie mial wartosc indentyfikatora obiektu MongoDB ostatniego elementu
        // w tablicy kanalu notatek
        const newCursor = notes[notes.length - 1]._id;

        return {
            notes,
            cursor: newCursor,
            hasNextPage
        };
    }
};