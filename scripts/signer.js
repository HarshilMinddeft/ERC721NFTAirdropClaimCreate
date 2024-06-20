const { ethers } = require("ethers");

async function main() {
  // Replace with your account private key
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  // Create a wallet instance from the private key
  const wallet = new ethers.Wallet(privateKey);

  // Message to sign
  const message = "Hello, world!";

  // Sign the message
  try {
    const signature = await wallet.signMessage(message);
    console.log("Signature:", signature);
  } catch (error) {
    console.error("Error signing message:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
