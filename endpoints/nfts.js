const { default: axios } = require("axios");
const xrpl = require("xrpl")



async function nfts(account, issuers = null) {
    const result = await axios.get(
        `https://api.xrpldata.com/api/v1/xls20-nfts/owner/${account}`
    );
    var account_nfts = result.data.data.nfts;
    var nfts = [];
    console.log(account)
    for (let i = 0; i < account_nfts.length; i++) {
        if (!account_nfts[i].URI) continue
        if (!issuers || issuers.includes(account_nfts[i].Issuer)) {
            var metadataLink = xrpl.convertHexToString(account_nfts[i].URI);
            var metadataResponse = await axios.get(metadataLink.replace("ipfs://", "https://ipfs.io/ipfs/"));
            if (metadataResponse.headers["content-type"].startsWith("application/json")) {
                var nft = metadataResponse.data;
                nfts.push(nft);
            }
        }
    }
    console.log(nfts)
    return nfts;
};

module.exports = nfts;