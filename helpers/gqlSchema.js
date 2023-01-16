const rootPrefix = '..',
  coreConstants = require(rootPrefix + '/config/coreConstants');

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

  get publicationIdForCommentByTx() {
    return `query GetPublication($postTxHash: TxHash){
    publication(request:{txHash: $postTxHash}){
      ... on Comment{
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

  get postViaDispatcher() {
    return `mutation CreatePostViaDispatcher($postDataCID: Url!) {
      createPostViaDispatcher(
        request: {
          profileId: "${coreConstants.WHISPER_CHAIN_LENS_PROFILE_ID}"
          contentURI: $postDataCID
          collectModule: { freeCollectModule: { followerOnly: true } }
          referenceModule: { followerOnlyReferenceModule: false }
        }
      ) {
        ... on RelayerResult {
          txHash
          txId
        }
        ... on RelayError {
          reason
        }
      }
    }`;
  }

  get challenge() {
    return `query($request: ChallengeRequest!) {
      challenge(request: $request) {
            text
        }
      }
    `;
  }

  get authentication() {
    return `mutation($request: SignedAuthChallenge!) {
      authenticate(request: $request) {
        accessToken
        refreshToken
      }
    }
    `;
  }
}
module.exports = new GqlSchema();
