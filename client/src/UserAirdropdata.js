import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Stars from "./assets/cards-video.webm";
import "./App.css";
import MerkleTree from "merkletreejs";
import { ethers } from "ethers";
// import "./UserAirdrop.css";
import MerkleDistributorFactoryArtifact from "./artifacts/contracts/NftMerkleDistributorFactory.sol/NftMerkleDistributorFactory.json";

// import StarsCanvas from "./components/sub/StarBackground";
import Nav from "./components/sub/Nav";
import Loader from "./components/sub/Loder/Loader";
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
// const Fantom = "0xd0bc60c9b74b787Ae8de5fC4E6941c0E053c3085"
//
const Celo = "0x87174A46C5883baa6c8B36b2b47FE45378976546";

const csvFileURL = "http://localhost:3000/AirdropUsers.csv";
const UserAirdropdata = () => {
  let lastInsertedId = "";
  // let claimAmountsofusers = [];
  const [contractAddress, setContractAddress] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [token, setToken] = useState("");
  // const [tokenId, setTokenId] = useState("");
  const [err, setErr] = useState("");
  const [totalClaimAmount, setTotalClaimAmount] = useState([]);
  const [userAirdrops, setUserAirdrops] = useState([]);
  const [distributorAddress, setDistributorAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [selectorChain, setSelectorChain] = useState("SelectChain");
  const [merkleRoot, setMerkleRoot] = useState("");
  const [remove, setRemove] = useState(false);
  // const [contractAddress, setcontractAddress] = useState();
  // const [lastInsertedId, setLastInsertedId] = useState("");
  // const testing = async () => {
  //   try {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const merkleDistributorFactoryContract = new ethers.ContractFactory(
  //       MerkleDistributorFactoryArtifact.abi,
  //       MerkleDistributorFactoryArtifact.bytecode,
  //       signer
  //     );
  //     const factory = await merkleDistributorFactoryContract.deploy();
  //     const factoryAddress = factory.address;
  //     console.log("Factory Contract Address:", factoryAddress);
  //     setcontractAddress(factoryAddress);
  //   } catch (error) {
  //     console.error("Error deploying factory contract:", error);
  //   }
  // };
  useEffect(() => {
    getUserAddressFirst();
  }, []);

  /////////////////////////////////////////
  const getUserAddressFirst = async () => {
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
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log("Signer Address:", address);
      setUserAddress(address);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleNetworkSwitch = (network) => {
    setSelectorChain(false);
    if (network === "polygon") {
      setContractAddress(polygonAddress);
    } else if (network === "bsc") {
      setContractAddress(bscAddress);
    } else if (network === "Sepolia") {
      setContractAddress(sepoliaAddress);
    } else if (network === "Arbitrum") {
      setContractAddress(ArbitrumSepolia);
    } else if (network === "AVAX") {
      setContractAddress(AVAX);
    } else if (network === "Optimism") {
      setContractAddress(Optimism);
    } else if (network === "Celo") {
      setContractAddress(Celo);
    }
  };

  const handleTransactionRejected = async () => {
    try {
      await axios.post("http://localhost:3001/api/transactionRejected", {
        lastInsertedId,
      });
      console.log("HANDEL ID ID", lastInsertedId);
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting user data:", error);
    }
  };

  const handelFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = [
        "application/vnd.ms-excel",
        "application/vnd.openxlmformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      if (fileType.includes(selectedFile.type)) {
        setExcelFile(selectedFile);
        readExcel(selectedFile);
      } else {
        setExcelFile(null);
        setErr("Please select CSV File");
      }
    } else {
      console.log("Select Your file");
    }
  };
  const readExcel = (file) => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        // Validate CSV format
        const requiredHeaders = ["address", "tokenids"];
        const actualHeaders = Object.keys(rows[0]);
        const isValidFormat = requiredHeaders.every((header) =>
          actualHeaders.includes(header)
        );

        if (!isValidFormat) {
          setErr("Invalid CSV format.");
          toast.error("Download csvFormate from below.");
          setExcelFile(null);
          return;
        }
        const isValidData = rows.every((row, index) => {
          if (!row.address || !row.tokenids) {
            console.error(`Row ${index + 2}: Missing address or tokenids`);
            toast.error(`Row ${index + 2}: Missing address or tokenids`);
            return false;
          }
          if (!/^0x[a-fA-F0-9]{40}$/.test(row.address)) {
            console.error(`Row ${index + 2}: Invalid address format`);
            toast.error(`Row ${index + 2}: Invalid address format`);
            return false;
          }
          if (!/^\d+(,\d+)*$/.test(row.tokenids)) {
            console.error(`Row ${index + 2}: Invalid tokenids format`);
            toast.error(`Row ${index + 2}: Invalid tokenids format`);
            return false;
          }
          return true;
        });

        if (!isValidData) {
          setErr("Invalid data in CSV file formate.");
          toast.error("Please check the CSV data and try again.");
          setExcelFile(null);
          return;
        }

        const formattedData = rows.map((row) => ({
          address: formatAddress(row.address),
          tokenids: row.tokenids,
          //.slice(0, -18),after row.claimAmount
        }));
        setParsedData(formattedData);
        console.log("updated DATA Of CSV", formattedData);
        recalculateMerkleRoot(formattedData);
      };
      setRemove("Remove");
      reader.readAsArrayBuffer(file);
      console.log("Rows");
    } catch (error) {
      console.error("Error reading or parsing the CSV file:", error);
      setErr("Error reading or parsing the CSV file.");
      toast.error("Error reading or parsing the CSV file.");
      setExcelFile(null);
    }
  };

  // Function to format the address correctly
  const formatAddress = (address) => {
    if (!address) return "InvalidData";
    if (address.startsWith("0x")) return address;
    const hexAddress = Number(address).toString(16);
    // Pad the hex address with zeroes to ensure it has 40 characters
    return "0x" + "0".repeat(40 - hexAddress.length) + hexAddress;
  };

  const handleDeleteRow = (index) => {
    const newData = [...parsedData];
    newData.splice(index, 1);
    setParsedData(newData);
    recalculateMerkleRoot(newData);
    // console.log(claimAmountsofusers);
    // console.log("AllClaimamountsData :", allclaimAmounts);
  };

  const recalculateMerkleRoot = (data) => {
    const leaves = data.map((row) => {
      const addressBytes = ethers.utils.arrayify(row.address);
      const claimAmount = ethers.BigNumber.from(row.tokenids);
      // for (let i = 0; i < row.tokenids.length; i++) {
      //   claimAmountsofusers = row.tokenids.toString();
      // }
      // setAllclaimAmounts(claimAmount.toString());
      const leafData = ethers.utils.solidityKeccak256(
        ["address", "uint256"],
        [addressBytes, claimAmount]
      );
      return leafData;
    });

    const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
      sortPairs: true,
    });

    const newMerkleRoot = tree.getHexRoot();
    setMerkleRoot(newMerkleRoot);
    console.log("New Merkle Root:", newMerkleRoot);
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    let distAddress;

    if (!token || token.trim() === "" || !token.startsWith("0x")) {
      setErr("Field is empty or your address is invalid");
      return;
    }
    try {
      console.log("ParseData :", JSON.stringify(parsedData));
      //////////////////////////////////////////////////////////////
      const activeRows = parsedData.filter((row) => !row.deleted);
      const claimAmounts = activeRows.map((row) => row.tokenids);
      console.log("Claim Amounts:=>", claimAmounts);
      const allclaimAmounts = claimAmounts.length.toString();
      setTotalClaimAmount(allclaimAmounts);

      // Approval of user for tokens
      toast.success("Processing started please wait for metamask transection");
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          token,
          ["function setApprovalForAll(address operator, bool approved)"],
          signer
        );
        const approvalTx = await tokenContract.setApprovalForAll(
          contractAddress,
          true
        );
        setIsLoading(true);
        await approvalTx.wait();
        console.log("Approval transaction successful!");
        toast.success("Token Approval Success");
        setIsLoading(true);
      } catch (error) {
        console.error("Error approving transaction:", error);
        toast.error("Transection rejected");
        handleTransactionRejected();
        // setIsLoading(true);
        return;
      }

      //////////////////////////////////////////////////////////////////////////////

      try {
        // Deploy the Merkle distributor contract
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const merkleDistributorFactoryContract = new ethers.Contract(
          contractAddress,
          MerkleDistributorFactoryArtifact.abi,
          signer
        );

        const transaction =
          await merkleDistributorFactoryContract.createMerkleDistributor(
            token,
            claimAmounts,
            merkleRoot
          );

        const receipt = await transaction.wait();
        toast("Airdrop Created Success");
        // Listen for the MerkleDistributorDeployed event

        const event = receipt.events.find(
          (event) => event.event === "NftMerkleDistributorDeployed"
        );
        if (event) {
          distAddress = event.args.distributor;
          console.log("CreatedDistributor ", distAddress);
          setDistributorAddress(distAddress);
        } else {
          console.error(
            "MerkleDistributorDeployed event not found in transaction receipt"
          );
        }
      } catch (error) {
        console.error("Error creating contract:", error);
        if (error.message.includes("Insufficient balance")) {
          toast.error("Incorrect TokenID");
        }
        handleTransactionRejected();
        setIsLoading(false);
        return;
      }
      ////////////////////////////////////////////////////////////////////////////////////
      const formData = new FormData();
      formData.append("userAddress", userAddress);
      formData.append("token", token);
      // formData.append("tokenId", tokenId);
      formData.append("distributorAddress", distributorAddress);
      formData.append("contractAddress", contractAddress);
      formData.append("parsedData", JSON.stringify(parsedData));
      const response = await axios.post(
        "http://localhost:3001/api/uploadAll",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      lastInsertedId = response.data._id;
      console.log("ID", lastInsertedId);
      console.log("Response Data:", response.data);
      const addresses = response.data.addresses;
      // const claimAmounts = response.data.claimAmounts;
      console.log("Addresses:", addresses);

      // console.log("Merkle Root:", tree.getHexRoot());
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsLoading(false);
    }
    console.log("FilesubmitDistAddress", distAddress);
    if (distAddress) {
      setTimeout(() => handleContractAddressSubmit(distAddress), 1000);
    }
    setIsLoading(false);
  };

  /////////////////////////////////////////////////////////////////////////////////

  const fetchAllAirdrops = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const merkleDistributorFactoryContract = new ethers.Contract(
        contractAddress,
        MerkleDistributorFactoryArtifact.abi,
        signer
      );
      const allAirdrops =
        await merkleDistributorFactoryContract.getAllDeployedContracts();
      console.log("All Airdrops:", allAirdrops);
      setUserAirdrops(allAirdrops);
    } catch (error) {
      console.error("Error fetching all airdrops:", error);
    }
  };

  ///////////////////////////////////////////////////////////////////

  const handleContractAddressSubmit = async (distAddress) => {
    try {
      const response = await axios.post("http://localhost:3001/api/uploadCA", {
        distributorAddress: distAddress,
      });
      console.log("Distributor address uploaded:", response.data);
    } catch (error) {
      console.error("Error uploading contract address:", error);
    }
  };

  ///////////////////////////////////////////////////////////////

  const downloadfileUrl = (url) => {
    const fileName = url.split("/").pop();
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.setAttribute("download", fileName);
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
  };

  //////////////////////////////////////////////////////////

  //For token field
  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };

  // const handelTokenIdChange = (e) => {
  //   setTokenId(e.target.value);
  // };

  // const enableButton = () => {
  //   setHandelbutton(false);
  //   toast.success("Processing started please wait for metamask transection");
  // };

  return (
    <div>
      <Nav onNetworkSwitch={handleNetworkSwitch} />
      <video autoPlay muted loop className="bg-vid">
        <source src={Stars} type="video/webm"></source>
      </video>
      <div className="loder">{isLoading && <Loader />}</div>
      {/* <Navbar /> */}

      {/* <StarsCanvas /> */}
      <p className="text-cyan-50 contAddress">
        Contract Address:
        <p className="animate-pulse text-red-600 font-semibold">
          {selectorChain}
        </p>
      </p>
      <p className="text-cyan-50 caw absolute">{contractAddress}</p>
      <div>
        <button
          className=" absolute ml-1 mt-28 inline-flex z-50 w-40px pb-2 p-1 text-slate-50 border-2 rounded-3xl hover:-translate-y-0 hover:scale-60 hover:bg-violet-800 duration-300"
          onClick={() => {
            downloadfileUrl(csvFileURL);
          }}
        >
          <svg
            className="fill-current w-4 h-4 mr-2 mt-1 ml-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
          </svg>
          <span className="mr-1">DownloadCsvFormate</span>
        </button>
      </div>
      <div className="fil">
        <div className="backgroundblure"></div>
        <center>
          <div>
            <ToastContainer position="top-left" autoClose={2000} />
          </div>
        </center>

        <center>
          <h6 className=" text-cyan-50">Upload your csv file below</h6>
          {/* <h4 className="her">Token Airdrop</h4> */}
          {/* <div className="space4">
            <button onClick={testing} type="button" className="btn btn-primary">
              Deploy factory
            </button>
          </div> */}
          <form className="form" onSubmit={handleFileSubmit}>
            <div className="space">
              <input
                className="btn block text-cyan-50  w-full  text-sm border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                type="file"
                required
                onChange={handelFile}
              />
            </div>
            <input
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              type="text"
              placeholder="Enter Token Address"
              value={token}
              onChange={handleTokenChange}
            />
            {/*   <div className="mr-16 ml-16 mt-2 ">
              <input
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-6 p-2.5"
                type="number"
                placeholder="TokenId"
                min={0}
                value={tokenId}
                onChange={handelTokenIdChange}
              />
            </div> */}
            <p className="text-white">{err}</p>
            <div className="space1">
              <button
                type="submit"
                className="btn btn-primary focus:ring focus:outline-none w-60"
              >
                Create Airdop
              </button>
              {/* <div className="space2">
                <button
                  type="button"
                  className="btn btn-primary focus:ring focus:outline-none"
                  onClick={handleContractAddressSubmit}
                >
                  SubmitDistributoraddress
                </button>
              </div> */}
            </div>
          </form>
        </center>
        <center>
          <div>
            <p className="space3 text-white font-medium mt-3">
              Total Airdrop Tokens : {totalClaimAmount}{" "}
            </p>
          </div>
          <div>
            <button
              onClick={fetchAllAirdrops}
              type="button"
              className="btn btn-primary"
            >
              See Created Airdrops
            </button>
            <div className="space5">
              <ul className="distributoradd">
                {userAirdrops.map((airdrop, index) => (
                  <li key={index}>{airdrop},</li>
                ))}
              </ul>
            </div>
          </div>
        </center>
        <center>
          <h5 className="space5 text-cyan-50">Airdrop data</h5>
          <div className=" tablecolour mt-3 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-violet-800 duration-300">
            <table className="border-3 rounded-2xl w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className=" text-gray-900 text-1.5xl uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {parsedData.length > 0 &&
                    Object.keys(parsedData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  <th className="ml-8 absolute">{remove}</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-transparent border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    {Object.values(row).map((val) => (
                      <td
                        className="px-6 py-3 font-primary font-normal text-2xl text-white whitespace-nowrap dark:text-white"
                        key={val}
                      >
                        {val.toString()}
                      </td>
                    ))}
                    <td className="px-6 py-3 rounded-full border-s-2 font-primary font-medium text-2xl text-white whitespace-nowrap dark:text-white">
                      <button onClick={() => handleDeleteRow(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {/* {parsedData.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-transparent border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    {Object.values(row).map((val, columnIndex) => (
                      <td
                        className="px-6 py-3 font-primary font-medium text-2xl text-white whitespace-nowrap dark:text-white"
                        key={columnIndex}
                      >
                        {val.toString()}
                      </td>
                    ))}
                    <td className="px-6 py-3 font-primary font-medium text-2xl text-white whitespace-nowrap dark:text-white">
                      <button onClick={() => handleDeleteRow(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))} */}
              </tbody>
            </table>
          </div>
        </center>
      </div>
    </div>
  );
};

export default UserAirdropdata;
