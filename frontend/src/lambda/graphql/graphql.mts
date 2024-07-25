import { ApolloServer, gql } from 'apollo-server-lambda';

const typeDefs = gql`
  type Query {
    greetings(name: String = "GRAND"): String
  }
`;

const resolvers = {
  Query: {
    greetings: (parent: any, args: any, context: any) => {
      return `Hello, ${args.name}!`;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const serverHandler = server.createHandler();

exports.handler = (event: any, context: any, callback: any) => {
  return serverHandler(
    { ...event, requestContext: event.requestContext || {} },
    context,
    callback
  );
};
