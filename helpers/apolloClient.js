const rootPrefix = '..',
  ApolloClient = require('apollo-client').ApolloClient,
  createHttpLink = require('apollo-link-http').createHttpLink,
  InMemoryCache = require('apollo-cache-inmemory').InMemoryCache,
  IntrospectionFragmentMatcher = require('apollo-cache-inmemory').IntrospectionFragmentMatcher,
  IntrospectionQueryResultData = require(rootPrefix + '/helpers/fragmentTypes.json');

class ApolloClientHelper {
  async getApolloClient() {
    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: IntrospectionQueryResultData
    });

    const httpLink = createHttpLink({
      uri: 'https://api-mumbai.lens.dev'
    });

    return new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache({ fragmentMatcher })
    });
  }
}

module.exports = new ApolloClientHelper();
