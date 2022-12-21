class GqlSchema {
  get publicationIdByTx() {
    return `query GetPublication($postTxHash: TxHash){
    publication(request:{txHash: $postTxHash}){
      ... on Post{
        id
      }
    }
  }`;
  }

  get publicationMetadataStatus() {
    return `query newPublicationMetadataStatus($postTxHash: TxHash) {
    publicationMetadataStatus(request: { txHash: $postTxHash}) {
      status
      reason
    }
  }`;
  }
}
module.exports = new GqlSchema();
