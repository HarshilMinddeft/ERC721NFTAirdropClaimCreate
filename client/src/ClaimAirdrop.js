import React, { useEffect, useState } from "react";
import KECCAK256 from "keccak256";
import { ethers } from "ethers";
import axios from "axios";
import MerkleTree from "merkletreejs";
import { Buffer } from "buffer/";
import artifact from "./artifacts/contracts/NftMerkleDistributorFactory.sol/NftMerkleDistributorFactory.json";
import Planet from "./assets/cards-video.webm";
import StarsCanvas from "./components/sub/StarBackground";
import "./App.css";
import Nav from "./components/sub/Nav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const { utils } = require("ethers");
//
const polygonAddress = "0x84f129acA0643B5346f63A0aFF876b95ACBFfF0C";
//
const bscAddress = "0xb79DcA11027C494770d5Fce55D515521bFD81378";
//
const sepoliaAddress = "0x93a886A8e6363C420Ce9fFC0aF07e58E585B16ff";
//
const ArbitrumSepolia = "0x70B3750E8aA6feED368e8465fB00f8Ccd9137f76";
//
const AVAX = "0xD1dfdBA882F6ff7d469754556701A79D6daFC448";
//
const Optimism = "0xEcc7D4c92bDf51fAd60CFade0853725EfaEB69Be";
//
const Celo = "0x87174A46C5883baa6c8B36b2b47FE45378976546";
//
window.Buffer = window.Buffer || Buffer;

function UserClaim() {
  const [contractAddress, setContractAddress] = useState("");
  const [dynamicAddress, setDynamicAddress] = useState("");
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [contract, setContract] = useState("");
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [trees, setTrees] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [claimStatus, setClaimStatus] = useState("");
  const [tokenAddress, setTokenAddress] = useState([]);
  const [claimAmounts, setClaimAmounts] = useState([]);
  const [distributorAddresses, setdistributorAddresses] = useState([]);
  const [userClaimAmounts, setUserClaimAmounts] = useState("");
  const [tokenID, setTokenID] = useState("");

  const handleNetworkSwitch = (network) => {
    if (network === "polygon") {
      setDynamicAddress(polygonAddress);
    } else if (network === "bsc") {
      setDynamicAddress(bscAddress);
    } else if (network === "Sepolia") {
      setDynamicAddress(sepoliaAddress);
    } else if (network === "Arbitrum") {
      setDynamicAddress(ArbitrumSepolia);
    } else if (network === "AVAX") {
      setDynamicAddress(AVAX);
    } else if (network === "Optimism") {
      setDynamicAddress(Optimism);
    } else if (network === "Celo") {
      setContractAddress(Celo);
    }
  };

  useEffect(() => {
    const fetchContractAddress = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/fetchData");
        const contractAddressdb = response.data.contractAddress.toString();
        // console.log("Address of contract:", contractAddressdb);

        setContractAddress(contractAddressdb);
      } catch (error) {
        console.error("Error fetching contract address:", error);
      }
    };
    fetchContractAddress();
  }, []);

  useEffect(() => {
    if (dynamicAddress) {
      onLoad(dynamicAddress);
    }
  }, [dynamicAddress]);

  const onLoad = async () => {
    try {
      if (window.ethereum == null) {
        throw new Error("Metamask not installed");
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let selectedAccount = accounts[0];
      if (!selectedAccount) {
        throw new Error("No ethereum account awailable");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      console.log("ContractAddreaa=>-", dynamicAddress);
      const contractInstances = new ethers.Contract(
        dynamicAddress,
        artifact.abi,
        provider
      );
      setContract(contractInstances);
      fetchData(dynamicAddress);
      // fetchTokenAddresses();
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  // const fetchTokenAddresses = async () => {
  //   try {
  //     const addresses = await contract.getAllDeployedContracts();
  //     setTokenAddress(addresses);
  //   } catch (error) {
  //     console.error("Error fetching token addresses:", error);
  //   }
  // };

  const fetchData = async (currentContractAddress) => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/fetchallData"
      );
      const data = response.data;
      // console.log("Raw fetched data:", data);
      const filteredData = data.filter(
        (collection) =>
          collection.distributorAddress[0] &&
          collection.distributorAddress[0].length > 0 &&
          collection.contractAddress[0] === currentContractAddress,
        (collection) => collection.address[0] === signer
      );
      console.log("FiteredData=>", filteredData);
      const contractData = filteredData.map((collection, index) => {
        const addresses = collection.addresses;
        const claimAmounts = collection.claimAmounts;
        // const distributorAddress = collection.distributorAddress;
        // console.log("DistributorAddress=>",distributorAddress)
        const tokenn = filteredData.map((collection) => collection.token);
        setTokenAddress(tokenn);
        console.log("tokensss", tokenn);
        const tokenId = filteredData.map((collection) => collection.tokenId);
        setTokenID(tokenId);
        console.log("TOKEN ID", tokenId);
        const indexedAddresses = addresses.reduce((acc, address, index) => {
          acc[address] = claimAmounts[index];
          return acc;
        }, {});

        // console.log(`Data from collection ${index + 1}:`, indexedAddresses);
        const tree = getTree(indexedAddresses);
        const proof = getProof(tree, indexedAddresses);

        return {
          tree: tree,
          proof: proof,
          indexedAddresses: indexedAddresses,
        };
      });

      const combinedProofs = contractData.map((data) => data.proof);
      setProofs(combinedProofs);

      const combinedIndexedAddresses = contractData.map(
        (data) => data.indexedAddresses
      );
      setClaimAmounts(combinedIndexedAddresses);

      const combinedTrees = contractData.map((data) => data.tree);
      setTrees(combinedTrees);

      const distributorAddresses = filteredData.map(
        (collection) => collection.distributorAddress
      );
      setdistributorAddresses(distributorAddresses);
      console.log("DistributorsAddresses", distributorAddresses);

      console.log("Proofs combined", combinedProofs);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getTree = (indexedAddresses) => {
    const leaves = Object.keys(indexedAddresses).map((address) => {
      const addressBytes = ethers.utils.arrayify(address);
      const claimAmountBigNumber = ethers.BigNumber.from(
        indexedAddresses[address]
      );
      const leafData = ethers.utils.concat([
        addressBytes,
        ethers.utils.hexZeroPad(claimAmountBigNumber.toHexString(), 32),
      ]);
      const leafHash = utils.solidityKeccak256(["bytes"], [leafData]);
      return leafHash;
    });
    const tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });
    console.log("Generated Merkle Root:", tree.getHexRoot());
    return tree;
  };

  const getProof = (tree, indexedAddresses) => {
    const proofs = [];
    Object.keys(indexedAddresses).forEach((address) => {
      const addressBytes = ethers.utils.arrayify(address);
      const claimAmountBigNumber = ethers.BigNumber.from(
        indexedAddresses[address]
      );
      const leafData = ethers.utils.concat([
        addressBytes,
        ethers.utils.hexZeroPad(claimAmountBigNumber.toHexString(), 32),
      ]);
      const leafDataHash = ethers.utils.keccak256(leafData);
      const proof = tree.getHexProof(leafDataHash);
      // console.log(proof);
      proofs.push(proof);
    });
    return proofs;
  };

  const isConnected = () => signer !== undefined;
  const connect = () => {
    getSigner(provider)
      .then((signer) => {
        setSigner(signer);
      })
      .catch((error) => {
        console.error("Error connecting to signer:", error);
        toast.warning("No Airdrop live at this chain");
      });
  };
  const getSigner = async (provider) => {
    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setSignerAddress(address);
      console.log("Signer Address:", address);
      let ClaimAmountofSigner = [];
      let proofs = [];

      // for finding signerclaim amounts in each collection and generate proofs
      for (let i = 0; i < claimAmounts.length; i++) {
        const indexedAddresses = claimAmounts[i];
        // console.log(
        //   `Indexed Addresses for Collection ${i + 1}:`,
        //   indexedAddresses
        // );

        // for checking signer's address exists in this collection or not
        if (indexedAddresses[address] !== undefined) {
          const claimAmountForSigner = indexedAddresses[address];
          // console.log(
          //   `Claim Amount for Collection ${i + 1}:`,
          //   claimAmountForSigner
          // );
          ClaimAmountofSigner.push(claimAmountForSigner.toString());

          // Merkle tree for this collection
          const signerTree = trees[i];

          // Generate proof for the signer's claim amount
          const proof = generateProofForAddress(
            signerTree,
            address,
            claimAmountForSigner
          );
          const formattedProof = proof.map((p) => p.toString("hex"));
          proofs.push(formattedProof);
          // console.log("Proof generated getsigner:", formattedProof);
        }
      }

      if (ClaimAmountofSigner.length === 0) {
        throw new Error("Signer claim amount is undefined");
      }

      console.log("ClaimAmountofSigner in getsigner", ClaimAmountofSigner);
      setUserClaimAmounts(ClaimAmountofSigner);
      // console.log("Proofs getSigner:", proofs);

      setProofs(proofs);
      return signer;
    } catch (error) {
      console.error("Error getting signer:", error);
      throw error;
    }
  };

  const generateProofForAddress = (tree, address, claimAmount) => {
    const addressBytes = ethers.utils.arrayify(address);
    const claimAmountBigNumber = ethers.BigNumber.from(claimAmount);
    const leafData = ethers.utils.concat([
      addressBytes,
      ethers.utils.hexZeroPad(claimAmountBigNumber.toHexString(), 32),
    ]);
    const leafDataHash = ethers.utils.keccak256(leafData);
    const proof = tree.getHexProof(leafDataHash);
    return proof;
  };

  const claimAirdrop = async () => {
    try {
      if (!signerAddress) {
        throw new Error("Signer address is undefined");
      }
      const formattedSignerAddress = signerAddress;
      // array to store user claim amounts from each collection
      let claimAmountsToClaim = [];
      let allDistributorAddresses = [];
      // loop for finding signer claimAmount from each collection
      for (let i = 0; i < claimAmounts.length; i++) {
        const indexedAddresses = claimAmounts[i];
        // console.log(
        //   `Indexed Addresses for Collection ${i + 1}:`,
        //   indexedAddresses
        // );

        // Check if signer's address exists in this collection
        if (indexedAddresses[formattedSignerAddress] !== undefined) {
          const claimAmountForSigner = indexedAddresses[formattedSignerAddress];
          // console.log(
          //   `Claim Amount for Collection ${i + 1}:`,
          //   claimAmountForSigner
          // );
          claimAmountsToClaim.push(claimAmountForSigner.toString());
          allDistributorAddresses.push(...distributorAddresses[i]);
          console.log("DistAddress", allDistributorAddresses);
        }
      }
      if (claimAmountsToClaim.length === 0) {
        throw new Error("Signer claim amount is undefined");
      }
      console.log("Claim amounts to claim:", claimAmountsToClaim);
      // formatting proofs
      const signerProofs = proofs.map((proof) =>
        proof.map((p) => p.toString("hex"))
      );
      console.log("Formatted signer proof:", signerProofs);
      console.log("Sending claim transaction...");

      // await Promise.all(
      //   contract.map(async (c, index) => {
      //     // Claim for each collection
      //     if (claimAmountsToClaim[index]) {
      //       const tx = await c
      //         .connect(signer)
      //         .claim(
      //           allDistributorAddresses,
      //           signerAddress,
      //           claimAmountsToClaim,
      //           signerProofs
      //         );
      //       await tx.wait();
      //     }
      //   })
      // );
      await contract
        .connect(signer)
        .claim(
          allDistributorAddresses,
          signerAddress,
          claimAmountsToClaim,
          signerProofs
        );

      setClaimStatus("Airdrop claimed successfully");
    } catch (error) {
      console.error("Error claiming airdrop:", error);
      if (error.message.includes("Token already claimed")) {
        setClaimStatus("Airdrop has already been claimed");
      } else if (error.message.includes("User denied transaction")) {
        setClaimStatus("Transaction Denied");
        console.log("Transaction was rejected by the user");
      } else if (error.message.includes("Invalid proof")) {
        setClaimStatus("Sorry you are not eligible");
      } else {
        setClaimStatus("Error claiming airdrop");
      }
    }
  };

  return (
    <>
      <div className="App">
        <header className="App-header">
          <video autoPlay muted loop className="bg-vid">
            <source src={Planet} type="video/webm"></source>
          </video>
          {/* <Navbar /> */}
          <Nav onNetworkSwitch={handleNetworkSwitch} />
          <div>
            <ToastContainer position="top-center" autoClose={2000} />
          </div>

          {isConnected() ? (
            <div className="Content">
              <div className="Signer">
                <p className="same"> Hii {signerAddress?.substring()}</p>
                <p className="text-cyan-50">
                  Contract Address: {dynamicAddress}
                </p>
              </div>
              {/* <h2>TokenAddress-: {tokenAddress}</h2> */}
              <div className="borders">
                <div className="disp">
                  {/* <h3 className="tokenidClaim">ID</h3> */}
                  <h3 className="fst">NftAddresses</h3>
                  <h3 className="rig">TokenID</h3>
                  {/* <h3 className="">ID</h3> */}
                </div>
                <div className="tokens">
                  {/* <ul className="tokenids">
                    {tokenAddress.map((address, index) => (
                      <li key={index}>
                        {tokenID[index]}
                     
                      </li>
                    ))}
                  </ul>  */}
                  <ul className="addresses">
                    {tokenAddress.map((address, index) => (
                      <li key={index}>
                        {address}
                        {"  "}
                      </li>
                    ))}
                  </ul>

                  <ul className="amounts">
                    {tokenAddress.map((address, index) => (
                      <li key={index}>
                        {userClaimAmounts[index]}
                        {/* .slice(0, -18) after userClaimAmounts[index] */}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="list">
                <div className="listd">
                  <div className="claimbtn">
                    <button
                      className="btn btn-primary focus:ring focus:outline-none"
                      onClick={() => claimAirdrop()}
                    >
                      Claim Your Airdrop
                    </button>
                  </div>
                </div>

                {claimStatus && (
                  <div className="listg">
                    <p className="claim">{claimStatus}</p>
                  </div>
                )}
              </div>
            </div>
          ) : signer === undefined ? (
            <div className="MainContent">
              <p className="text-cyan-50">Contract Address: {dynamicAddress}</p>
              <p className="Connect cursor-default">You are not connected</p>
              <div className="connectbtn">
                <button
                  onClick={connect}
                  className="btn btn-primary focus:ring focus:outline-none"
                >
                  Connect Metamask
                </button>
              </div>
            </div>
          ) : (
            <div className="MainContent">
              <p className="Connect">Error connecting to signer</p>
            </div>
          )}
        </header>
      </div>
    </>
  );
}

export default UserClaim;
