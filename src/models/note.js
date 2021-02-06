//Wymagana jest biblioteka Mongoose.
const mongoose = require('mongoose');

//Zdefiniowanie schematu bazy danych notatek
const noteSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        favoriteCount: {
            type: Number,
            default: 0
        },
        favoritedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        //Przypisanie wlasciwosci createdAt i updatedAt typu Date
        timestamps: true
    }
);

//Zdefiniowanie modelu Note ze schematem
const Note = mongoose.model('Note', noteSchema);

//Eksport modelu
module.exports = Note;

