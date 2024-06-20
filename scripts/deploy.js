const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { BigNumber, utils } = require("ethers");
const fs = require("fs").promises;
// const Users = require("../server/model/userModel.js");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  addresses: [String],
  claimAmounts: [String],
  // tokenId :[String]
});

// Create and register Users model with Mongoose
const Users = mongoose.model("Users", userSchema);

const URL =
  "mongodb+srv://harshil:harshil8888@cluster0.nguunro.mongodb.net/AirdropApp?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(URL)
  .then(async () => {
    console.log("db connected");
  })
  .catch((error) => console.log(error));

///////////////////////////////////////////////////

const customAddresses = [
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
  "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
  "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
  "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
];

const ids = ["1", "2", "3", "4", "5"];

async function main() {
  const signers = await ethers.getSigners();

  //Fetched data from mongoAltas and for making merkelroot and proof
  const users = await Users.find({}, "addresses claimAmounts");
  // console.log("Users Merkledrop data :", users);
  const addresses = users.map((user) => user.addresses);
  const claimAmounts = users.map((user) => user.claimAmounts);

  const flatAddresses = customAddresses.flat();
  const flatClaimAmounts = ids.flat();
  console.log("Address", flatAddresses);
  console.log("Amounts", flatClaimAmounts);

  const leaves = flatAddresses.map((address, index) => {
    const claimAmount = flatClaimAmounts[index];
    const addressBytes = ethers.utils.arrayify(address);
    const leafData = Buffer.from(
      utils
        .solidityKeccak256(["address", "uint256"], [addressBytes, claimAmount])
        .substr(2),
      "hex"
    );
    return leafData;
  });

  // Create the Merkle tree
  const tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });

  // const AirdropAmounts = "12000000000000000000";

  // Deploy PuffCoin contract
  // const PuffCoin = await ethers.getContractFactory("PuffCoin", signers[0]);
  // const token = await PuffCoin.deploy();

  // Deploy MerkleDistributor contract with the calculated Merkle root
  // const MerkleDistributor = await ethers.getContractFactory(
  //   "MerkleDistributor",
  //   signers[0]
  // );
  // const distributor = await MerkleDistributor.deploy(
  //   token.address,
  //   tree.getHexRoot(),
  //   AirdropAmounts
  // );

  // await token
  //   .connect(signers[0])
  //   .mint(distributor.address, BigNumber.from("9000000000000000000000"));

  // console.log("Signer addresses:", flatAddresses);
  // console.log("Signer claimAmonts:", flatClaimAmounts);
  console.log("Merkle Proofs:");
  console.log("32-byte Merkle root:", tree.getHexRoot());
  const merkleProofs = [];

  leaves.forEach((leaf, index) => {
    const proof = tree.getHexProof(leaf);
    merkleProofs.push(proof);
  });

  merkleProofs.forEach((proof, index) => {
    // Format each proof individually
    const formattedProof = proof.map((step) => step);
    console.log("Proof for address", index + 1, ":", formattedProof);
  });
  console.log("PuffCoin:", token.address);
  console.log("MerkleDistributor:", distributor.address);
  console.log("32-byte Merkle root:", tree.getHexRoot());
  const indexedAddresses = {};
  flatAddresses.forEach((address, idx) => {
    indexedAddresses[idx] = {
      address: address,
      claimAmount: flatClaimAmounts[idx],
    };
  });
  const serializedAddresses = JSON.stringify(indexedAddresses);
  await fs.writeFile("client/src/walletAddresses.json", serializedAddresses);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
