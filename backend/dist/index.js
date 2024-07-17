import { ApolloServer } from 'apollo-server';
import { resolvers } from './graphql/resolvers.js';
import typeDefs from './graphql/schemaTypes.js';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';
// dotenv.config();
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
const neoSchema = new Neo4jGraphQL({
    typeDefs,
    resolvers,
    driver,
    debug: true,
});
neoSchema
    .getSchema()
    .then((schema) => {
    const server = new ApolloServer({ schema });
    server.listen().then(({ url }) => {
        console.log('Server run at ', url);
    });
})
    .catch((err) => {
    console.log('Ошибка ', err);
});
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: { db },
// });
// server.listen().then(({ url }) => {
//   console.log('Server run at ', url);
// });
