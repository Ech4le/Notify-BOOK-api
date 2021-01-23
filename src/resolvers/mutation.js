const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    AuthenticationError,
    ForbiddenError
} = require('apollo-server-express');
require('dotenv').config();

const gravatar = require('../util/gravatar')

module.exports = {
    newNote: async (parent, args, { models }) => {
        return await models.Note.create({
            content: args.content,
            author: 'Adam Scott'
        });
    },
    deleteNote: async (parent, { id }, { models }) => {
        try {
            await models.Note.findOneAndRemove({ _id: id});
            return true;
        } catch (err) {
            return false;
        }
    },
    updateNote: async (parent, { content, id }, { models }) => {
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
    }
};