import React, { useEffect, useState } from "react";
import "./Nav.css";

const networks = {
  // Hardhat: {
  //   chainId: `0x${Number(31337).toString(16)}`,
  //   chainName: "Local Hardhat",
  //   nativeCurrency: {
  //     name: "Eth",
  //     symbol: "Eth Hardhat",
  //     decimals: 18,
  //   },
  //   rpcUrls: ["http://127.0.0.1:8545/"],
  //   // blockExplorerUrls: [""],
  // },

  zkSync: {
    chainId: `0x${Number(300).toString(16)}`,
    chainName: "zkSync Sepolia",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://zksync-era-sepolia.blockpi.network/v1/rpc/public"],
    blockExplorerUrls: ["https://sepolia.explorer.zksync.io"],
  },

  Celo: {
    chainId: `0x${Number(44787).toString(16)}`,
    chainName: "Celo Alfajores",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
    rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
    blockExplorerUrls: ["https://alfajores.celoscan.io"],
  },

  // Base: {
  //   chainId: `0x${Number(84532).toString(16)}`,
  //   chainName: "Base Sepolia Testnet",
  //   nativeCurrency: {
  //     name: "ETH",
  //     symbol: "Eth",
  //     decimals: 18,
  //   },
  //   rpcUrls: ["https://base-sepolia.blockpi.network/v1/rpc/public"],
  //   blockExplorerUrls: ["https://base-sepolia.blockscout.com"],
  // },

  bsc: {
    chainId: `0x${Number(97).toString(16)}`,
    chainName: "BNB Testnet",
    nativeCurrency: {
      name: "Test Binance Chain Native Token",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: ["https://public.stackup.sh/api/v1/node/bsc-testnet"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },

  polygon: {
    chainId: `0x${Number(80002).toString(16)}`,
    chainName: "Polygon Testnet",
    nativeCurrency: {
      name: "Polygon Amoy Testnet",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    // blockExplorerUrls: [""],
  },

  // Sepolia: {
  //   chainId: `0x${Number(11155111).toString(16)}`,
  //   chainName: "Sepolia Testnet",
  //   nativeCurrency: {
  //     name: "SepoliaETH",
  //     symbol: "SepoliaETH",
  //     decimals: 18,
  //   },
  //   rpcUrls: ["https://rpc2.sepolia.org"],
  //   blockExplorerUrls: ["https://sepolia.etherscan.io"],
  // },

  AVAX: {
    chainId: `0x${Number(43113).toString(16)}`,
    chainName: "Avalanche Fuji",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://cchain.explorer.avax-test.network"],
  },

  Arbitrum: {
    chainId: `0x${Number(421614).toString(16)}`,
    chainName: "ArbitrumSepolia",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arbitrum-sepolia.blockpi.network/v1/rpc/public"],
    blockExplorerUrls: ["https://sepolia-explorer.arbitrum.io"],
  },

  Optimism: {
    chainId: `0x${Number(11155420).toString(16)}`,
    chainName: "Optimism Sepolia",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://optimism-sepolia.drpc.org"],
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io/"],
  },
};

const changeNetwork = async ({ networkName }) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
};

const Nav = ({ onNetworkSwitch }) => {
  const [selectedNetwork, setSelectedNetwork] = useState("Select Network");
  const [isVisible, setIsVisible] = useState(false);
  const handleNetworkSwitch = async (networkName) => {
    await changeNetwork({ networkName });
    //Call and passed prop function to update the contract address
    onNetworkSwitch(networkName);
    setSelectedNetwork(networks[networkName].chainName);
    setIsVisible(false);
  };

  const networkChanged = (chainId) => {
    console.log({ chainId });
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", networkChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", networkChanged);
      }
    };
  }, []);
  return (
    <div className="borderRadius w-full h-[65px] fixed shadow-lg shadow-[#2A0E61]/50 bg-[#03001470] backdrop-blur-md z-50">
      <div className="w-full h-full flex flex-row items-center justify-between m-auto">
        <a href="/" className="h-auto w-auto flex ml-4 flex-row items-center">
          <img
            src="/LogoD.webp"
            alt="logo"
            width={40}
            height={50}
            className="cursor-pointer animate-pulse"
          />
        </a>
        <div className="leftnav">
          <div className="w-[300px] px-[10px] h-full flex flex-row items-center justify-between ml-5">
            <div className="flex items-center justify-between w-full h-auto border border-[#7042f861] bg-[#0300145e] mr-[15px] px-[20px] py-[10px] rounded-full text-gray-200">
              <a
                href="/userClaim"
                className="focus:ring focus:outline-none btn btn-primary cursor-pointer font-bold ml-[10px] hidden md:block text-gray-300 no-underline"
              >
                Claim
              </a>
              <a
                href="/userAirdropData"
                className="btn btn-primary focus:ring focus:outline-none cursor-pointer font-bold ml-[10px] hidden md:block text-gray-300 no-underline"
              >
                Create
              </a>
            </div>
          </div>
        </div>
        {/* <h6 className="selectchain">Select chain</h6> */}
        {/* <div className="beepanimation">
          <span className="relative flex h-3 w-3 mb-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
        </div> */}
        <div className="flex boxw mr-10 mb-4 flex-col gap-6 relative ">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="w-20px pb-2 pt-1 text-slate-50 mt-4 border-2 rounded-3xl hover:-translate-y-0 hover:scale-60 hover:bg-violet-800 duration-300"
          >
            {selectedNetwork}
          </button>
          {isVisible && (
            <div className="absolute top-10 right-0 mt-12 w-48 bg-[#b5aedba6] rounded-lg shadow-lg">
              <div
                className="px-4 py-2 text-gray-200 hover:bg-[#420e61] cursor-pointer flex"
                onClick={() => handleNetworkSwitch("polygon")}
              >
                Polygon
                <img
                  src="polygonlogo.png"
                  alt="logo"
                  width={30}
                  height={20}
                  className="cursor-pointer ml-auto"
                />
              </div>
              <div
                className="px-4 py-2 text-gray-200 hover:bg-[#420e61] cursor-pointer flex"
                onClick={() => handleNetworkSwitch("bsc")}
              >
                Bsc
                <img
                  src="bnblogo.png"
                  alt="logo"
                  width={30}
                  height={20}
                  className="cursor-pointer ml-auto"
                />
              </div>
              {/* <div
                className="px-4 py-2 text-gray-200 hover:bg-[#420e61] cursor-pointer flex"
                onClick={() => handleNetworkSwitch("Sepolia")}
              >
                Sepolia
                <img
                  src="arblogo.png"
                  alt="logo"
                  width={30}
                  height={20}
                  className="cursor-pointer ml-auto"
                />
              </div> */}
              <div
                className="px-4 py-2 text-gray-200 hover:bg-[#420e61] cursor-pointer flex"
                onClick={() => handleNetworkSwitch("Arbitrum")}
              >
                Arbitrum
                <img
                  src="arblogo.png"
                  alt="logo"
                  width={30}
                  height={20}
                  className="cursor-pointer ml-auto"
                />
              </div>
              <div
                className="px-4 py-2 text-gray-200 hover:bg-[#420e61] cursor-pointer flex"
                onClick={() => handleNetworkSwitch("AVAX")}
              >
                AVAX
                <img
                  src="avaxlogo.png"
                  alt="logo"
                  width={30}
                  height={20}
                  className="cursor-pointer ml-auto"
                />
              </div>
              <div
                className="px-4 py-2 text-gray-200 hover:bg-[#420e61] cursor-pointer flex"
                onClick={() => handleNetworkSwitch("Optimism")}
              >
                Optimism
                <img
                  src="optimism.png"
                  alt="logo"
                  width={30}
                  height={20}
                  className="cursor-pointer ml-auto"
                />
              </div>
              <div
                className="px-4 py-2 text-gray-200 hover:bg-[#420e61] cursor-pointer flex"
                onClick={() => handleNetworkSwitch("Celo")}
              >
                Celo
                <img
                  src="celo1.png"
                  alt="logo"
                  width={30}
                  height={20}
                  className="cursor-pointer ml-auto"
                />
              </div>
              <div
                className="px-4 py-2 text-gray-200 hover:bg-[#420e61] cursor-pointer flex"
                onClick={() => handleNetworkSwitch("zkSync")}
              >
                zkSync
                <img
                  src="zksync.png"
                  alt="logo"
                  width={30}
                  height={20}
                  className="cursor-pointer ml-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Nav;
