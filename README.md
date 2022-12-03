# whisper-chain-be

## Tech stack and integrations
### Lens Protocol
- Creating publications from WEB
- In backend, using GraphQL queries, we fetched publication data for post and it's comments.

### Polygon
- We deployed smart contract for distributing proceeds from publication collect on Polygon Mumbai Testnet.
[Link to the contract](https://mumbai.polygonscan.com/address/0x6F2cAAF4bF579847C7A1947c99BA5b8eFe7f3e6e).

### Push
- Channel created on Eth Goerli. Channel delegate - 0x90314a78c2EEDB00a46Fd79B738270c5de9a7883
- Implemented push notification using JS SDK
- Repliers are sent notification after we distribute the proceeds from the collects on the day's thread.



