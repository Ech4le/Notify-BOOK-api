// index.js
// This is the main entry point of our application

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

//Importowanie modulow lokalnych
const db = require('./db');
const models = require('./models');
const resolvers = require('./resolvers');
const typeDefs = require('./schema')

//Uruchomienie serwera nasluchujacego na porcie wskazanym w pliku .env czyli na porcie 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();

db.connect(DB_HOST);

//Konfiguracja serwera Apollo.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
        //Dodanie do kontekstu modeli bazy danych.
        return { models };
    }
});

//Zastosowanie oprogramowania pośredniczącego Apollo GraphQL i zdefiniowanie ścieżki dostępu do /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () => 
    console.log(
        `Serwer GraphQL dziala pod adresem http://localhost:${port}${server.graphqlPath}`
    )
);