import { ApolloServer } from 'apollo-server-lambda';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';

export async function getDriverNeo() {
  // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
  const URI = process.env.REACT_APP_NEO4J_URI || '';
  const USER = process.env.REACT_APP_NEO4J_USERNAME || '';
  const PASSWORD = process.env.REACT_APP_NEO4J_PASSWORD || '';
  let driver;

  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    const serverInfo = await driver.getServerInfo();
    console.log('Connection established');
    console.log(serverInfo);

    return driver;
  } catch (err: any) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`);
  }
}

export const resolvers = {
  Business: {
    waitTime: (obj: any, args: any, context: any, info: any) => {
      const options = [0, 5, 10, 15, 30, 45];
      return options[Math.floor(Math.random() * options.length)];
    },
  },
};

// import { gql } from 'graphql-tag';

const gql = String.raw;

const typeDefs = gql`
  type Business {
    businessId: ID!
    name: String!
    city: String!
    state: String!
    address: String!
    location: Point!
    reviews: [Review!]! @relationship(type: "REVIEWS", direction: IN)
    categories: [Category!]! @relationship(type: "IN_CATEGORY", direction: OUT)
    waitTime: Int! @customResolver
    averageStars: Float
      @authentication
      @cypher(
        statement: "MATCH (this)<-[:REVIEWS]-(r:Review) RETURN avg(r.stars) AS averageStars"
        columnName: "averageStars"
      )
    recommended(first: Int = 1): [Business!]!
      @cypher(
        columnName: "recommended"
        statement: """
        MATCH (b:Business)<-[:REVIEWS]-(r:Review)<-[:WROTE]-(u:User)
        WHERE b.name = 'Market on Front'
        MATCH (u)-[:WROTE]->(:Review)-[:REVIEWS]->(rec:Business)
        WITH rec, COUNT(*) AS score
        RETURN rec AS recommended ORDER BY score DESC LIMIT $first
        """
      )
  }

  type JWT @jwt {
    roles: [String!]!
  }

  type User {
    userId: ID!
    name: String!
    reviews: [Review!]! @relationship(type: "WROTE", direction: OUT)
  }

  extend type User
    @authorization(
      validate: [
        {
          operations: [CREATE, UPDATE]
          when: [AFTER]
          where: { node: { userId: "$jwt.sub" } }
        }
        {
          operations: [CREATE, UPDATE, DELETE]
          where: { jwt: { roles_INCLUDES: "admin" } }
        }
      ]
      filter: [{ operations: [READ], where: { node: { userId: "$jwt.sub" } } }]
    )

  type Review {
    reviewId: ID!
    stars: Float
    date: Date!
    text: String
    user: User! @relationship(type: "WROTE", direction: IN)
    business: Business! @relationship(type: "REVIEWS", direction: OUT)
  }

  type Category {
    name: String!
    businesses: [Business!]! @relationship(type: "IN_CATEGORY", direction: IN)
    countCompanyInCategory: Int!
      @cypher(
        columnName: "countCompanyInCategory"
        statement: """
        MATCH (this)<-[:IN_CATEGORY]-(b:Business)
        RETURN COUNT(b) AS countCompanyInCategory
        """
      )
  }

  type Query {
    fuzzyBusinessByName(searchString: String!): [Business]
      @cypher(
        columnName: "fuzzyBusinessByName"
        statement: """
        CALL db.index.fulltext.queryNodes('businessNameIndex', $searchString+'~')
        YIELD node RETURN node AS fuzzyBusinessByName
        """
      )

    qualityBusinesses: [Business!]!
      @cypher(
        columnName: "qualityBusinesses"
        statement: """
        MATCH (b:Business)<-[:REVIEWS]-(r:Review)
        WHERE r.stars = 3
        RETURN b as qualityBusinesses
        """
      )
  }
`;

export default typeDefs;

const initServer = async () => {
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

export const handler = async (event: any, context: any, callback: any) => {
  const serverHandler = await initServer();

  if (serverHandler) {
    return serverHandler(
      { ...event, requestContext: event.requestContext || {} },
      context,
      callback
    );
  }
};
