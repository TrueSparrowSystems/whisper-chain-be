const rootPrefix = '..',
  gqlSchema = require(rootPrefix + '/helpers/gqlSchema'),
  clientHelper = require(rootPrefix + '/helpers/apolloClient'),
  gql = require('graphql-tag');

class LensHelper {
  async getPublication(postTxHash) {
    const client = await clientHelper.getApolloClient();

    const res = await client.query({
      query: gql(gqlSchema.publicationIdByTx),
      variables: {
        postTxHash
      }
    });

    return res;
  }

  async getPublicationMetadataStatus(postTxHash) {
    const client = await clientHelper.getApolloClient();

    const res = client.query({
      query: gql(gqlSchema.publicationMetadataStatus),
      variables: {
        postTxHash
      }
    });

    return res;
  }
}

module.exports = new LensHelper();
