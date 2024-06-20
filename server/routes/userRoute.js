const express = require("express");
const multer = require("multer");
const csv = require("csvtojson");
const fs = require("fs");
const Users = require("../model/userModel.js");
const router = express.Router();

const upload = multer();

router.post("/uploadAll", upload.none(), async (req, res) => {
  try {
    const { token, tokenId, userAddress, contractAddress, distributorAddress } =
      req.body;

    const parsedData = JSON.parse(req.body.parsedData);
    // console.log("ParseData :", parsedData);
    if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    // Validate parsedData format (addresses and claimAmounts)
    const isValid = parsedData.every(
      (entry) =>
        entry.hasOwnProperty("address") && entry.hasOwnProperty("tokenids")
    );
    if (!isValid) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const allAddresses = parsedData.map((entry) => entry.address);
    const allClaimAmounts = parsedData.map((entry) => entry.tokenids);

    const createdUser = await Users.create({
      addresses: allAddresses,
      claimAmounts: allClaimAmounts,
      contractAddress,
      userAddress,
      token,
      tokenId,
      distributorAddress,
    });
    const { _id } = createdUser;

    res.json({
      _id,
      addresses: allAddresses,
      claimAmounts: allClaimAmounts,
      contractAddress,
      userAddress,
      token,
      tokenId,
      distributorAddress,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetchData", async (req, res) => {
  try {
    const users = await Users.findOne(
      {},
      "addresses claimAmounts contractAddress tokenId"
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetchallData", async (req, res) => {
  try {
    const users = await Users.find(
      {},
      "addresses claimAmounts contractAddress token tokenId distributorAddress _id"
    );
    res.json(users);
  } catch (error) {
    console.log("error");
  }
});

router.post("/transactionRejected", async (req, res) => {
  try {
    const { lastInsertedId } = req.body;

    // Delete the most recent user data
    await Users.findByIdAndDelete(lastInsertedId);

    res.json({ message: "RDD" });
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/uploadCA", async (req, res) => {
  try {
    const { distributorAddress } = req.body;
    const user = await Users.findOne().sort({ _id: -1 });
    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }
    user.distributorAddress = distributorAddress;
    await user.save();
    res.json({
      message: "DistriutorAddress set for airdrop",
      distributorAddress,
    });
  } catch (error) {
    console.error("Error uploading contract address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
