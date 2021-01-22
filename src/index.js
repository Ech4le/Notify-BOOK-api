// index.js
// This is the main entry point of our application

const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
require('dotenv').config();

const db = require('./db');

const models = require('./models');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

db.connect(DB_HOST);

// app.get('/', (req, res) => res.send('Hello world!!!!'));
// app.listen(port, () => 
//     console.log(`Serwer dziala pod adresem http://localhost:${port}`)
// );

let notes = [
    { id: '1', content: 'To jest notatka', author: 'KN'},
    { id: '2', content: 'Oto nastepna notatka', author: 'Bob Marley'},
    { id: '3', content: 'O! Kolejna notatka!', author: 'KEVIN SPAJSI'}
];

//Utworzenie schematu za pomocą jezyka schematu GraphQL
const typeDefs = gql `
    type Note {
        id: ID!
        content: String!
        author: String!
    }

    type Query {
        hello: String!
        notes: [Note!]!
        note(id: ID!): Note!
    }

    type Mutation {
        newNote(content: String!): Note!
    }
`;

//Dostarczenie funkcji resolvera dla wlasciwosci schematu
const resolvers = {
    Query: {
        hello: () => 'Witaj, swiecie!',
        notes: async () => {
            return await models.Note.find();
        },
        note: async (parent, args) => {
            return await models.Note.findById(args.id);
        }
    },
    Mutation: {
        newNote: async (parent, args) => {
           return await models.Note.create({
               content: args.content,
               author: 'Adam Scott'
           });
        }
    }
};

const app = express();

//Konfiguracja serwera Apollo.
const server = new ApolloServer({ typeDefs, resolvers });

//Zastosowanie oprogramowania pośredniczącego Apollo GraphQL i zdefiniowanie ścieżki dostępu do /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () => 
    console.log(
        `Serwer GraphQL dziala pod adresem http://localhost:${port}${server.graphqlPath}`
    )
);