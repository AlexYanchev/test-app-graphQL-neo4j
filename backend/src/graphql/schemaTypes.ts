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
    averageStars: Float!
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

  type User {
    userId: ID!
    name: String!
    reviews: [Review!]! @relationship(type: "WROTE", direction: OUT)
  }

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
  }
`;

export default typeDefs;
//   enum BusinessOrdering {
//     name_asc
//     name_desc
//   }

//   enum ReviewOrdering {
//     stars_asc
//     stars_desc
//   }

//   type Business {
//     businessId: ID!
//     name: String
//     address: String
//     avgStars: Float
//     photos(first: Int = 3, offset: Int = 0): [Photo!]!
//     reviews(
//       first: Int = 3
//       offset: Int = 0
//       orderBy: ReviewOrdering = stars_desc
//     ): [Review!]!
//     categories: [Category]
//   }

//   type User {
//     userId: ID!
//     name: String
//     photos(first: Int = 3, offset: Int = 0): [Photo!]!
//     reviews(first: Int = 3, offset: Int = 0): [Review!]!
//   }

//   type Photo {
//     photoId: ID!
//     business: Business!
//     user: User!
//     url: String
//   }

//   type Review {
//     reviewId: ID!
//     stars: Float
//     text: String
//     user: User!
//     business: Business!
//   }

//   type Category {
//     categoryId: ID!
//     name: String!
//     businesses: [Business]
//   }

//   type Query {
//     allBusinesses(first: Int = 10, offset: Int = 0): [Business!]!
//     businessBySearchTerm(
//       search: String!
//       first: Int = 10
//       offset: Int = 0
//       orderBy: BusinessOrdering = name_asc
//     ): [Business!]!
//     userById(id: ID!): User
//     categories: [Category]
//   }
// `;

// export default typeDefs;

// query businessSearch(
//   $searchTerm: String!
//   $businessLimit: Int
//   $businessSkip: Int
//   $businessOrder: BusinessOrdering
//   $reviewLimit: Int
// ) {
//   businessBySearchTerm(
//     search: $searchTerm
//     first: $businessLimit
//     offset: $businessSkip
//     orderBy: $businessOrder
//   ) {
//     name
//     avgStars
//     reviews(first: $reviewLimit) {
//       stars
//       text
//       user {
//         name
//       }
//     }
//   }
// }
