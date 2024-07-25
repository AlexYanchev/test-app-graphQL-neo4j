import { ApolloServer } from 'apollo-server-lambda';
import { resolvers } from './graphql/resolvers.js';
import typeDefs from './graphql/schemaTypes.js';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import getDriverNeo from './api/aura-connect.js';

dotenv.config();

// const driver = neo4j.driver(
//   'bolt://localhost:7687',
//   neo4j.auth.basic('neo4j', '12345678')
// );
const driver = await getDriverNeo();

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  resolvers,
  driver,
  debug: true,
  features: {
    authorization: {
      key: {
        url: 'https://7accf451-0fe6-4a52-bf51-a5109cab406a.hanko.io/.well-known/jwks.json',
      },
    },
    // authorization: {
    //   key: process.env.JWT_SECRET || '',
    // },
  },
});

const initServer = async () => {
  return await neoSchema
    .getSchema()
    .then((schema) => {
      const server = new ApolloServer({
        schema,
        // context: ({ req }) => ({ req }),
        context: ({ event }) => ({
          req: event,
          // token: req.headers.authorization,
        }),
      });
      const serverHandler = server.createHandler();
      return serverHandler;
    })
    .catch((err: any) => {
      console.log('Ошибка ', err);
    });
};

exports.handler = async (event: any, context: any, callback: any) => {
  const serverHandler = await initServer();

  if (serverHandler) {
    return serverHandler(
      { ...event, requestContext: event.requestContext || {} },
      context,
      callback
    );
  }
};

// neoSchema
//   .getSchema()
//   .then((schema) => {
//     const server = new ApolloServer({
//       schema,
//       // context: ({ req }) => ({ req }),
//       context: ({ req }) => ({
//         token: req.headers.authorization,
//       }),
//     });
//     server.listen().then(({ url }) => {
//       console.log('Server run at ', url);
//     });

//     if (!process.env.JWT_SECRET) {
//       throw new Error('Не задан ключ для токенов авторизации.');
//     }
//   })
//   .catch((err: any) => {
//     console.log('Ошибка ', err);
//   });

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: { db },
// });

// server.listen().then(({ url }) => {
//   console.log('Server run at ', url);
// });
