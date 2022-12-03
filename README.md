# whisper-chain

## Flow-wise Implementation Details
### Wallet connect flow (Lens, Rainbowkit)
- From any page, user can connect her wallet using the component in the page header.
- Using r\Rainbowkit UI, user can select select which wallet to connect (Metamask, coinbase, etc.)
- After the wallet is selected, the corresponding wallet address is obtained.
- For authenticating with Lens, a challenge text is signed and sent to Lens using the selected wallet. Lens provides an access token, which helps in further API calls.
- Using the access token, we fetch the Lens profile, if exists OR take the user to the Lens profile creation flow.
- Optionally, if time permits for hackathon, user will be able to set dispatcher for helping in not requiring signing of each and every interaction.

### Home page flow (Lens)
- From the frontend browser, list of publications is fetched using GraphQL APIs (exposed by Lens protocol).
- Last 3 comments for each publication are also fetched using GraphQL APIs.

### Generate whisper flow (Stability AI, Lens, IPFS, NFTPort)
- User fills in prompt and selects art type to describe the last image of the chain to her best.
- On clicking generate, an API call is made to the Whisper Chain backend for fetching 2 image suggestions. In the backend, API call to fetch 2 image suggestions for the prompt is made to stability AI. The image content is uploaded in AWS S3. The S3 URLs are returned back to the frontend.
- The image suggestions are displayed in the frontend.
- User either selects one of the suggestion or changes prompt & art type amd clicks to generate more suggestions.
- On selecting one of the suggestion and clicking on add to chain, another API call is made to the backend.
  In the backend, the selected image is downloaded from AWS S3 and uploaded to IPFS using web3 storage API.
  Image meta data is uploaded to IPFS using Infura storage API. The CIDs of both image and metadata is returned to frontend in the response of the API call.
- Upload of metadata to IPFS was also implemented using NFTPort as another alternative.
- Lens API call to comment via dispatcher is made from frontend. If the comment is being made in 24 hours of the initial post generation, then a time fee module is attached at the time of comment generation. If this collect module is attached, then other users will have opportunity to collect the comment by paying WMATIC amount. The collected WMATIC anount comes to the Whisper Chain's wallet.

### Distribution of collect proceeds to commenters (Lens, Polygon, Push)
- This flow is executed in a background cron on backend server.
- Lens graphql APIs are used to get posts in last some hours and also their comments data is fetched. Number of users who have collected publications is computed for the whole thread. Also unique commenter user wallet addresses is fetched.
- Total collected WMATIC proceeds are then distributed to all the commenters equally using a smart contract deployed on Mumbai Polygon chain. [Link to the smart contract](https://mumbai.polygonscan.com/address/0x6F2cAAF4bF579847C7A1947c99BA5b8eFe7f3e6e).
- Notification is sent to the users using Push, after sending them WMATIC.
