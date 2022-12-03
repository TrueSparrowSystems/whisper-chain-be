const ApolloClient = require('apollo-client').ApolloClient,
  createHttpLink = require("apollo-link-http").createHttpLink,
  InMemoryCache = require("apollo-cache-inmemory").InMemoryCache,
  IntrospectionFragmentMatcher = require("apollo-cache-inmemory").IntrospectionFragmentMatcher,
  IntrospectionQueryResultData = require("./fragmentType.json"),
  gql = require("graphql-tag"),
  fetch = require("node-fetch");

class CollectsAndRepliers {

  async fetch() {
    const oThis = this;

    let result = {
      totalCollects: 0,
      walletAddresses: []
    };

    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: IntrospectionQueryResultData
    });

    const httpLink = createHttpLink({
      uri: 'https://api-mumbai.lens.dev',
      fetch: fetch
    });

    const client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(fragmentMatcher)
    });

    const publicationQuery = oThis._getPublicationQuery();

    const publicationData = await client.query({
      query: gql(publicationQuery),
      variables: {
      },
    });

    if (publicationData.data.publications.items.length < 3) {
      return result;
    }

    console.log('publicationData.data.publications.items', publicationData.data.publications.items);

    const publication = publicationData.data.publications.items[5];
    console.log('publication ++++++++++++',publication);

    const publicationId = publication.id;
    let totalCollects = publication.stats.totalAmountOfCollects;

    console.log('publicationId ++++++++++ ',publicationId);
    const commentQuery = oThis._getCommentsQuery(publicationId);

    console.log('commentQuery ++++++++++ ',commentQuery);
    const commentData = await client.query({
      query: gql(commentQuery),
      variables: {
      },
    });

    const commentItems = commentData.data.publications.items;
    console.log('commentItems ++++++++++ ',commentItems);

    let walletAddresses = new Set();

    console.log('commentItem LENGTH ++++++++++ ',commentItems.length);
    for(const commentItem of commentItems) {
      walletAddresses.add(commentItem.profile.ownedBy);
      totalCollects += commentItem.stats.totalAmountOfCollects;
    }

    console.log('totalCollects ++++++++++++ ',totalCollects);
    console.log('walletAddresses ++++++++++++ ',walletAddresses);
    const walletAddressArray = Array.from(walletAddresses);

    result = {
      totalCollects: totalCollects,
      walletAddresses: walletAddressArray
    };

    return result
  }

  // TODO - For testing remove/add metadata filter
  // metadata: { mainContentFocus: IMAGE, tags: { oneOf: ["whisper.lens"] }}
  _getPublicationQuery() {
    return `
      query Publications {
        publications(
          request: {
            profileId: "0x5285"
            publicationTypes: [POST]
            limit: 10
          }
        ) {
          items {
            __typename
            ... on Post {
              ...PostFields
            }
        }
      }
    }
    
    fragment PublicationStatsFields on PublicationStats {
      totalAmountOfMirrors
      totalAmountOfCollects
      totalAmountOfComments
      totalUpvotes
      totalDownvotes
    }
    
    fragment PostFields on Post {
      id
      stats {
        ...PublicationStatsFields
      }
      createdAt
      appId
    }
  `;
  }

  // TODO - For testing remove/add metadata filter
  // metadata: { mainContentFocus: IMAGE, tags: { oneOf: ["whisper.lens"] } }
  _getCommentsQuery(publicationId) {
    return `
      query CommentFeed{
        publications(request: {commentsOf: "${publicationId}"}){
          items {
            __typename 
            ... on Post {
              ...PostFields,
            }
            ... on Comment {
              ...CommentFields
            }
          }
          pageInfo {
            prev
            next
            totalCount
          }
        }
      }
      
      fragment ProfileFields on Profile {
        id
        name
        bio
        attributes {
          displayType
          traitType
          key
          value
        }
        handle
        ownedBy
      }
      
      fragment PublicationStatsFields on PublicationStats { 
        totalAmountOfMirrors
        totalAmountOfCollects
        totalAmountOfComments
        totalUpvotes
        totalDownvotes
      }
      
      fragment PostFields on Post {
        id
        profile {
          ...ProfileFields
        }
        stats {
          ...PublicationStatsFields
        }
        createdAt
        appId
      }
      
      fragment CommentBaseFields on Comment {
        id
        profile {
          ...ProfileFields
        }
        stats {
          ...PublicationStatsFields
        }
        createdAt
        appId
      }
      
      fragment CommentFields on Comment {
        ...CommentBaseFields
        mainPost {
          ... on Post {
            ...PostFields
          }
        }
      }    
    `;
  }
}

module.exports = CollectsAndRepliers;
