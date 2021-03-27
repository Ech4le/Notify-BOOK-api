// index.js
// This is the main entry point of our application

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();
const jwt = require('jsonwebtoken');

//Importowanie modulow lokalnych
const db = require('./db');
const models = require('./models');
const resolvers = require('./resolvers');
const typeDefs = require('./schema')

const helmet = require('helmet')
const cors = require('cors');

const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');

//Uruchomienie serwera nasluchujacego na porcie wskazanym w pliku .env czyli na porcie 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();
//app.use(helmet());

var corsOptions = {
    origin: '*',
    credentials: true // <-- REQUIRED backend setting
  };

app.use(cors(corsOptions));

db.connect(DB_HOST);

//Pobranie z tokena JWT informacji o uzytkowniku
const getUser = token => {
    if(token) {
        try {
            //Zwrot z tokena informacji o uzytkowniku
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch(err) {
            //W przypadku problemu z tokenem nalezy wyswietlic komunikat bledu
            throw new Error('Nieprawidlowa sesja;')
        }
    }
};

//Konfiguracja serwera Apollo.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    context: ({ req }) => {
        //Pobranie z naglowkow tokena uzytkownika
        const token = req.headers.authorization;

        //Proba pobrania z tokena informacji o uzytkowniku
        const user = getUser(token);

        //Wyswietlenie w konsoli informacji o uzytkowniku
        //console.log(user);

        //Dodanie do kontekstu modeli bazy danych.
        return { models, user };
    }
});

//Zastosowanie oprogramowania pośredniczącego Apollo GraphQL i zdefiniowanie ścieżki dostępu do /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () => 
    console.log(
        `Serwer GraphQL dziala pod adresem http://localhost:${port}${server.graphqlPath}`
    )
);