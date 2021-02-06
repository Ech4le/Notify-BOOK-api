const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {
    AuthenticationError,
    ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../util/gravatar')

module.exports = {
    newNote: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError('Tylko zalogowani uzytkownicy moga tworzyc notatki.')
        }
        return await models.Note.create({
            content: args.content,
            author: mongoose.Types.ObjectId(user.id)
        });
    },
    deleteNote: async (parent, { id }, { models, user }) => {
        if (!user) {
            throw new AuthenticationError('Tylko zalogowani uzytkownicy moga usuwac notatki.')
        }

        //Odszukanie notatki
        const note = await models.Note.findById(id);
        //Jezeli wlasciciel notatki nie jest biezacym uzytkownikiem, nalezy zglosic blad
        if (note && String(note.author) !== user.id) {
            throw new ForbiddenError('Nie masz uprawnien do usuniecia notatki.');
        }
        try {
            await note.remove();
            return true;
        } catch (err) {
            return false;
        }
    },
    updateNote: async (parent, { content, id }, { models, user }) => {
        if (!user) {
            throw new AuthenticationError('Tylko zalogowani uzytkownicy moga usuwac notatki.')
        }

        //Odszukanie notatki
        const note = await models.Note.findById(id);
        //Jezeli wlasciciel notatki nie jest biezacym uzytkownikiem, nalezy zglosic blad
        if (note && String(note.author) !== user.id) {
            throw new ForbiddenError('Nie masz uprawnien do usuniecia notatki.');
        }
        return await models.Note.findOneAndUpdate(
            {
                _id: id,
            },
            {
                $set: {
                    content
                }
            },
            {
                new: true
            }
        );
    },
    signUp: async (parent, { username, email, password }, { models }) => {
        //Normalizacja adresu Email
        email = email.trim().toLowerCase();

        //Utworzenie wartosci hash na podstawie hasla
        const hashed = await bcrypt.hash(password, 10);

        //Utworzenie adresu URL gravatar
        const avatar = gravatar(email);
        try {
            const user = await models.User.create({
                username,
                email,
                avatar,
                password: hashed
            });
            //Utworzenie i zwrot tokena JSON web
            return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        } catch(err) {
            console.log(err);
            // W przypadku wystapienia problemu podczas tworzenia konta nalezy zglosic blad
            throw new Error('Blad podczas tworzenia konta.');
        }
    },
    signIn: async (parent, { username, email, password }, { models }) => {
        if (email) {
            //Normalizacja adresu email
            email = email.trim().toLowerCase();
        }

        const user = await models.User.findOne({
            $or: [{ email }, { username }]
        });

        //Jezeli uzytkownik nie zostanie znaleziony, nalezy zglosic blad uwierzytelniania
        if (!user) {
            throw new AuthenticationError('Blad podczas uwierzytelniania.');
        }

        //Jezeli hasla sa rozne, nalezy zglosic blad uwierzytelniania
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new AuthenticationError('Blad podczas uwierzytelniania.');
        }

        //Utworzenie i zwrot tokena JSON web
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    },
    toogleFavorite: async (parent, { id }, { models, user }) => {
        if (!user) {
            throw new AuthenticationError();
        }

        //Sprawdzenie czy uzytkownik oznaczyl juz dana notatke jako ulubiona
        let noteCheck = await models.Note.findById(id);
        const hasUser = noteCheck.favoritedBy.indexOf(user.id);

        //Jezeli nazwa uzytkownika znajduje sie na liscie, nalezy ja 
        // z niej usunac i zmniejszyc o 1 wartosc wlasciwosci favoriteCount
        if (hasUser >= 0) {
            return await models.Note.findByIdAndUpdate(
                id,
                {
                    $pull: {
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc: {
                        favoriteCount: -1
                    }
                },
                {
                    new: true
                }
            );
        } else {
            //Jezeli nazwa uzytkownika nie znajduje sie na liscie, nalezy ja
            //dodac do listy i zwiekszyc o 1 wartosc wlasciwosci favoriteCount
            return await models.Note.findByIdAndUpdate(
                id,
                {
                    $push: {
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc: {
                        favoriteCount: 1
                    }
                },
                {
                    new: true
                }
            );
        }
    },
};