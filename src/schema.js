const { ApolloServer, gql } = require('apollo-server-express');

//Utworzenie schematu za pomocą jezyka schematu GraphQL
module.exports = gql `
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

