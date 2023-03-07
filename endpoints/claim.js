const { default: axios } = require("axios");
const xrpl = require("xrpl");
require("dotenv").config({
    path: "./.env",
});
const issuer_key = process.env.ISSUER_SECRET //issuer wallet keys and account, stored in a .env file
const issuer_account = process.env.ISSUER_ACCOUNT



function CreateOffer(account, tokenID) { //NFTokenCreateOffer payload for xrpl
    return {
        TransactionType: "NFTokenCreateOffer",
        Account: issuer_account,
        NFTokenID: tokenID,
        Amount: "1",
        Flags: 1,
        Destination: account,
    };
}


async function claim(tokenID, uuid) {
	const { data: { data: { response: { account }, application: { issued_user_token } } } } = await axios.get( //call xumm payload api to get account and user token,
        {
            headers: {
                "uuid": uuid,
            },
        });
	const user_token = issued_user_token
    const { data: { data: { nfts } } } = await axios.get(
        `https://api.xrpldata.com/api/v1/xls20-nfts/owner/${account}`);//this is the best api to get data, if you need more bandwith you can get an api key for more requests
    const result = nfts.find(item => item.NFTokenID === tokenID);
    if (!result) { //check to see if account owns the token that allows them to claim
        return "You don't own this token"
    }
    const isClaimed = ""//database check if token id is claimed or not
    if (isClaimed) {
        const claimTokenID = ""//token id of nft to be claimed;
        const client = new xrpl.Client("wss://xrplcluster.com/");//best websocket to use, but you can use whatever
        await client.connect();
        let nftSellOffers;
        try { //check to see if offer exists
            nftSellOffers = await client.request({
                method: "nft_sell_offers",
                nft_id: claimTokenID
            });
        } catch (err) { //if offer doesnt exists create the offer
            nftSellOffers = false;
            const issuer_wallet = xrpl.Wallet.fromSeed(issuer_key);
            let offerPayload = CreateOffer(account, claimTokenID)
            const prepared_offer = await client.autofill(offerPayload)
            const signed_offer = issuer_wallet.sign(prepared_offer)
            const result_offer = await client.submit(signed_offer.tx_blob)
            if (!result_offer.result.engine_result == "tesSUCCESS") { // if the transaction was malformed or fee was too high you'll get this response, change this how you'd like'
                console.log("Didn't work")
                return
            }
            let claimSellOffer;
            try { //find the new offer you just created
                claimSellOffer = await client.request({
                    method: "nft_sell_offers",
                    nft_id: claimTokenID
                });
            } catch (err) { //error if it wasnt created
                return "Problem with rippled server"
            }
            client.disconnect();
            const offerID = claimSellOffer.result.offers[0].nft_offer_index;
            const { data: { data: resData } } = await axios.get(//endpoint for sending sign requests. i have my own, if you need help setting one up lmk,
                {
                    headers: {
                        "account": account,
                        "offer": offerID,
                        "user-token": user_token,
                    },
                });
            return resData //return qr code in case they dont get push from xumm
        }
        if (nftSellOffers.result.offers[0].destination === account) { //if there is already an offer created, find the offer that names the account as the destination
            const { data: { data: resData } } = await axios.get(//endpoint for sending sign requests. i have my own, if you need help setting one up lmk,
                {
                    headers: {
                        "account": account,
                        "offer": nftSellOffers.result.offers[0].nft_offer_index,
                        "user-token": user_token,
                    },
                });
            return resData //return a qr code in case they dont get a push from xumm
        }
        return "Unknown error occurred"
    }
    return "Claimed" //theres other things you can put here to check for claims and stuff, this is just very basic
};

module.exports = claim;
