//Wymagana jest biblioteka Mongoose
const mongoose = require('mongoose');

module.exports = {
    connect: DB_HOST => {

        //Uzycie uaktualnionego analizatora skladni ciagu tekstowego URL
        mongoose.set('useNewUrlParser', true);

        //Uzycie metody findOneAndUpdate() zmiast findAndModify()
        mongoose.set('useFindAndModify', false);

        //Uzycie metody createIndex() zamiast ensureIndex()
        mongoose.set('useCreateIndex', true);

        //Uzycie nowego silnika wykrywania i monitorowania serwera
        mongoose.set('useUnifiedTopology', true);

        //Nawiazanie polaczenia z baza danych
        mongoose.connect(DB_HOST);

        //Zarejestrowanie bledu jesli nie udalo sie nawiazac polaczenia
        mongoose.connection.on('error', err => {
            console.error(err);
            console.log(
                'Blad polaczenia z MongoDB. Upewnij sie, ze serwer MongoDB zostal uruchomiony.'
            );
            process.exit();
        });
        console.log('Baza danych MongoDB zostala uruchomiona!')
    },
    close: () => {
        mongoose.connection.close();
    }
};