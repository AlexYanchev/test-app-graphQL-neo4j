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
