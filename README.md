# Junction-Xumm

Junction-Xumm is a repository that provides a node server with several endpoints that allow developers to integrate Xumm authentication and NFT claims into their websites. The available endpoints include:

- Login: This endpoint allows users to log in to the server using their Xumm credentials.

- Payload: This endpoint returns a unique payload for the user, which can be used to authenticate their account and perform various operations.

- NFTs: This endpoint retrieves a list of the user's NFTs.

= Claim: This endpoint allows users to claim a specific NFT, provided they own the corresponding token ID.

= Sign: This endpoint signs a transaction using the user's Xumm credentials and returns the signed transaction.

- Logout: This endpoint logs the user out of the server.

By using the Junction-Xumm repository, developers can easily add Xumm authentication and NFT claiming functionality to their websites, allowing for a seamless and secure user experience.

## Table of Contents

- Installation
- Usage
- API Reference
- Contributing
- License

## Installation

To install the Junction-Xumm server, simply run npm install to install all the necessary dependencies.

## Usage

1. Before running the server, you'll need to add your Xumm credentials to the .env file.
2. Once your credentials are added, start the server by running npm start.
3. The server will start listening on port 5000 by default. To connect to the server, send requests to the appropriate endpoints.

## Endpoints

The following endpoints are available on the Junction-Xumm server:

- /login(GET): This endpoint allows users to log in to the server using their Xumm credentials. It does not require any parameters.
- /payload(GET): This endpoint returns a unique payload for the user, which can be used to authenticate their account and perform various operations. It requires a uuid parameter in the query string.
	`GET /payload?uuid=[UUID]`
- /nfts(POST): This endpoint retrieves a list of the user's NFTs. It requires the account parameter in the headers, and an optional list of issuers in the body.

	Headers: `account: [ACCOUNT]`
	
	Body(optional): `{ issuers: [ISSUERS] }`
- /claim/easy(POST): This endpoint allows users to claim a specific NFT, provided the offer for the tokenID is already created and they own the corresponding token ID. It requires a uuid parameter in the body, as well as issuer and tokenID parameters to specify the NFT to claim.

	Body: `{ uuid: [UUID], issuer: [ISSUER], tokenID: [TOKENID] }`
- /claim/offer(POST): This endpoint allows users to claim a specific NFT, provided they own the corresponding token ID. This endpoint allows the offer for the claim to be created when it is called. It requires a uuid parameter in the body, as well as a tokenID parameter to specify the NFT to claim.

	Body: `{ uuid: [UUID], tokenID: [TOKENID] }`
- /sign(POST): This endpoint signs a transaction using the user's Xumm credentials and returns the signed transaction. It requires the account, tokenoffer, and user_token parameters in the headers.

	Body: `{account: [ACCOUNT], tokenoffer: [TOKENOFFER], user_token: [USER_TOKEN]}`
- /logout(DELETE): This endpoint logs the user out of the server. It requires a uuid parameter in the query string.

