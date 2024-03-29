// Import necessary modules
const { default: axios } = require("axios");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const xrpl = require("xrpl");
const sign = require("./endpoints/sign")
const claim = require("./endpoints/claim")
const getNFTs = require("./endpoints/nfts")
const claimEZ = require("./endpoints/ezclaim")
const claimed = require("./endpoints/isClaimed") 

// Load environment variables
require("dotenv").config({
  path: ".env",
});

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// Create a new Express application
const app = express();


// Use necessary middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define routes and their handlers

// Generate a sign in payload and return the necessary information for signing using the XUMM app
app.get("/login", async (req, res) => {
  console.log(new Date().toString(), "login call");
  try {
    const payload = await axios.post(
      "https://xumm.app/api/v1/platform/payload",
      JSON.stringify({
        txjson: { TransactionType: "SignIn" },
      }),
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          "X-API-Secret": API_SECRET,
        },
      }
    );
    if (payload.status === 200)
      return res.json({
          uuid: payload.data.uuid,
          next: payload.data.next.always,
          qrUrl: payload.data.refs.qr_png,
          wsUrl: payload.data.refs.websocket_status,
          pushed: payload.data.pushed
      });
    return res.json({ status: false, data: null });
  } catch (e) {
    console.log(e)
    console.log(new Date().toString(), "login failed");
    return res.json({ status: false, data: null });
  }
});

// Get the payload associated with the given UUID and return its data
app.get("/payload/:payload_uuid", async (req, res) => {
  console.log(new Date().toString(), "payload call");
  try {
    const payload = await axios.get(
      `https://xumm.app/api/v1/platform/payload/${req.params.payload_uuid}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          "X-API-Secret": API_SECRET,
        },
      }
    );
    if (payload.status === 200)
      return res.json(payload.data);
    return res.json({ status: false, data: null });
  } catch (e) {
	console.log(e)
    console.log(new Date().toString(), "payload failed");
    return res.json({ status: false, data: null });
  }
});

// Sign a token offer using the provided user token and return the signed offer
app.post("/sign", async (req, res) => {
    const { account, offer, user_token } = req.body;
    const signQR = await sign(account, offer, user_token);
    return res.json(signQR) 
});

  // Claim a token using an easy method (i.e. by looking up the offers associated with issuer account
app.post("/claim/easy", async (req, res) => {
    const { uuid, issuer, tid } = req.body;
    const claimQR = await claimEZ(uuid, issuer, tid);
    return res.json(claimQR)
});

// Create an offer and Accept that offer using the TokenID and UUID
app.post("/claim/offer", async (req, res) => {
    const { uuid, tid } = req.body;
    const claimQR = await claim(uuid, tid);
    return res.json(claimQR)
});

// Get all NFTs associated with a given account and optionally a list of issuers
app.post("/nfts", async (req, res) => {
    const account = req.headers["account"];
    const issuers = req.body.issuers;
    const nfts = await getNFTs(account, issuers)
    return res.json(nfts);
});

app.get("/claimed", async(req, res) => {
    const account = req.headers["account"];
    const taxon = req.headers["taxon"];
    const issuer = req.headers["issuer"];
    const isClaimed = claimed(account, taxon, issuer, collection)
    return res.json(isClaimed)
    })

// Delete a sign in payload associated with the given UUID
app.delete("/logout/:payload_uuid", async (req, res) => {
  console.log(new Date().toString(), "logout call");
  try {
    const payload = await axios.delete(
      `https://xumm.app/api/v1/platform/payload/${req.params.payload_uuid}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          "X-API-Secret": API_SECRET,
        },
      }
    );
    if (payload.status === 200)
      return res.json({
        status: true,
        data: payload.data,
      });
    return res.json({ status: false, data: null });
  } catch (e) {
    console.log(new Date().toString(), "logout failed");
    return res.json({ status: false, data: null });
  }
});

// Start the server and listen on port 5000
const server = app.listen(5000, function () {
  console.log("Listening on port " + server.address().port);
});
