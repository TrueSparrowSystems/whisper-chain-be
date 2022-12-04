# whisper-chain

## Flow-wise Implementation Details
### Wallet connect flow (Lens, Rainbowkit)
- From any page, the user can connect her wallet using the *connect component* in the page header.
- Using *Rainbowkit UI*, the user can select which wallet to connect (Metamask, coinbase, etc.)
- After the wallet is selected, the corresponding *wallet address* is obtained.
- For *authenticating with Lens*, a challenge text is signed and sent to Lens using the selected wallet. Lens provides an access token, which helps in further API calls.
- Using the *access token*, we fetch the Lens profile, if exists, OR take the user to the Lens profile creation flow.
- Optionally, if time permits for the hackathon, the user will be able to set a dispatcher for help in not requiring the signing of every interaction.

### Home page flow (Lens)
- The frontend browser fetches a list of publications using *Lens GraphQL APIs*.
- The last 3 comments for each publication are also fetched using GraphQL APIs.

### Generate whisper flow (Stability AI, Lens, IPFS, NFTPort)
- To describe the last image of the chain to the best of her ability, the user fills in the *prompt* and selects the *art type*.
- On clicking generate, an API call is made to the Whisper Chain backend for fetching 2 image suggestions. In the backend, an API call to fetch 2 image suggestions for the prompt is made to *stability AI*. The image content is uploaded in *AWS S3*. The S3 URLs are returned back to the frontend.
- The generated image suggestions are displayed in the frontend.
- The user either selects one of the generated suggestions or changes the prompt & art type and clicks to generate more suggestions.
- On selecting one of the suggestions and clicking on add to the chain, another API call is made to the backend. In the backend, the selected image is downloaded from AWS S3 and uploaded to *IPFS* using *web3.storage*. Image metadata is uploaded to IPFS using *Infura storage*. The CIDs of both image and metadata are returned to the frontend in response to the API call.
- Upload of metadata to IPFS is implemented using *NFTPort*.
- The lens API call to *comment via dispatcher* is made from the frontend. If the comment is being made within 24 hours of the initial post generation, then a time fee collect module is attached at the time of comment generation. If this collect module is attached, other users will have the opportunity to collect the comment by paying WMATIC. The collected WMATIC amount comes to the Whisper Chain’s wallet.

### Distribution of collect proceeds to commenters (Lens, Polygon, Push Protocol)
- This flow is executed in a background cron on the backend server.
- Lens graphql APIs are used to get posts in the last some hours and also their comments data is fetched. The number of users who have collected publications is computed for the whole thread. Also, wallet addresses of the number of unique users who commented are fetched.
- Total WMATIC proceeds from all publication collects are then distributed to all the commenters equally using a smart contract deployed on the Mumbai Polygon chain. [Link to the smart contract](https://mumbai.polygonscan.com/address/0x6F2cAAF4bF579847C7A1947c99BA5b8eFe7f3e6e).
- A notification is sent to these users using Push Protocol, after sending them WMATIC.

## Sponsor-wise Implementation Details
### Lens Protocol
- Lens protocol is being used in all the 4 flows described under "Flow-wise Implementation Details" section.
- We have fetched post and comment data using Lens GraphQL APIs from both web frontend and backend.
- Wallet connect flow
    - For *authenticating with Lens*, a challenge text is signed and sent to Lens using the selected wallet. Lens provides an access token, which helps in further API calls.
    - Using the *access token*, we fetch the Lens profile, if exists, OR take the user to the Lens profile creation flow.
- Generate whisper flow
    - *Comment via dispatcher* is implemented from the frontend using Lens GraphQL API.
    - We have attached a time fee (WMATIC) collect module at the time of comment generation.

### IPFS (General Storage Track)
- Whisper image selected by user is uploaded to *IPFS* using *web3.storage*. 
- Image metadata is uploaded to IPFS using *Infura storage*.
- Upload of metadata to IPFS is implemented using *NFTPort*.

### Polygon (For Best Public Goods)
- Total WMATIC proceeds from all publication collects are distributed to all the commenters equally using a smart contract deployed on the Mumbai Polygon chain. [Link to the smart contract](https://mumbai.polygonscan.com/address/0x6F2cAAF4bF579847C7A1947c99BA5b8eFe7f3e6e).

### Push Protocol (Push Notification Implementation)
- A notification is sent to these users using Push Protocol, after sending them WMATIC.

### NFTPort
- Upload of metadata to IPFS is implemented using *NFTPort*.

## Future Scopes
- Looking to build further on the hackathon and moulding it to a usable product.

## Setting Up
### Environment variables
```
STABILITY_API_KEY: <Stability API key
S3_ACCESS_KEY_ID: S3 access key ID
S3_SECRET_ACCESS_KEY: S3 secret access key
S3_BUCKET: S3 bucket
S3_REGION: S3 region
IPFS_TOKEN: IPFS token
TX_SIGNER: Transaction signer
```
