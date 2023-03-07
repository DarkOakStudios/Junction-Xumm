const { default: axios } = require("axios");
const xrpl = require("xrpl");
const sign = require("./sign")
require("dotenv").config({
    path: "./.env",
});
const issuer_key = process.env.ISSUER_SECRET 
const issuer_account = process.env.ISSUER_ACCOUNT



function CreateOffer(account, tokenID) { 
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
	const { data: { data: { response: { account }, application: { issued_user_token } } } } = await axios.get(`http://localhost:5000/payload/${uuid}`);
	const user_token = issued_user_token
    const { data: { data: { nfts } } } = await axios.get(
        `https://api.xrpldata.com/api/v1/xls20-nfts/owner/${account}`);
    const result = nfts.find(item => item.NFTokenID === tokenID);
    if (!result) { 
        return "You don't own this token"
    }
    const isClaimed = ""//database check if token id is claimed or not
    if (isClaimed) {
        const claimTokenID = ""//token id of nft to be claimed;
        const client = new xrpl.Client("wss://xrplcluster.com/");
        await client.connect();
        let nftSellOffers;
        try { 
            nftSellOffers = await client.request({
                method: "nft_sell_offers",
                nft_id: claimTokenID
            });
        } catch (err) { 
            nftSellOffers = false;
            const issuer_wallet = xrpl.Wallet.fromSeed(issuer_key);
            let offerPayload = CreateOffer(account, claimTokenID)
            const prepared_offer = await client.autofill(offerPayload)
            const signed_offer = issuer_wallet.sign(prepared_offer)
            const result_offer = await client.submit(signed_offer.tx_blob)
            if (!result_offer.result.engine_result == "tesSUCCESS") { 
                console.log("Didn't work")
                return
            }
            let claimSellOffer;
            try { 
                claimSellOffer = await client.request({
                    method: "nft_sell_offers",
                    nft_id: claimTokenID
                });
            } catch (err) { 
                return "Problem with rippled server"
            }
            client.disconnect();
            const offerID = claimSellOffer.result.offers[0].nft_offer_index;
            const signQR = await sign(account, offerID, user_token);
            return signQR 
        }
        if (nftSellOffers.result.offers[0].destination === account) {
            const signQR = await sign(account, nftSellOffers.result.offers[0].nft_offer_index, user_token);
            return signQR
        }
        return "Unknown error occurred"
    }
    return "Claimed"
};

module.exports = claim;
