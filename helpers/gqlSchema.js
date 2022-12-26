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

  get postViaDispatcher() {
    return `mutation CreatePostViaDispatcher($postDataCID: Url!) {
      createPostViaDispatcher(
        request: {
          profileId: "0x5691"
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
