import React, { useState } from "react";
import Hero from "./Hero";
import StarsCanvas from "./sub/StarBackground";
import Encryption from "./Encryption";
// import Nav from "./sub/Nav";
// const polygonAddress = "0x84f129acA0643B5346f63A0aFF876b95ACBFfF0C";
//
// const bscAddress = "0xb79DcA11027C494770d5Fce55D515521bFD81378";
//
// const sepoliaAddress = "0x93a886A8e6363C420Ce9fFC0aF07e58E585B16ff";
//
// const ArbitrumSepolia = "0x70B3750E8aA6feED368e8465fB00f8Ccd9137f76";
//
// const AVAX = "0xD1dfdBA882F6ff7d469754556701A79D6daFC448";
//
// const Optimism = "0x94f75bB301cb2E1b62016F003332a9809CdD4768";
//
// const Fantom = "0xd0bc60c9b74b787Ae8de5fC4E6941c0E053c3085"
const HomePage = () => {
  // const [contractAddress, setContractAddress] = useState("");

  // const handleNetworkSwitch = (network) => {
  //   if (network === "polygon") {
  //     setContractAddress(polygonAddress);
  //   } else if (network === "bsc") {
  //     setContractAddress(bscAddress);
  //   } else if (network === "Sepolia") {
  //     setContractAddress(sepoliaAddress);
  //   } else if (network === "Arbitrum") {
  //     setContractAddress(ArbitrumSepolia);
  //   } else if (network === "AVAX") {
  //     setContractAddress(AVAX);
  //   } else if (network === "Optimism") {
  //     setContractAddress(Optimism);
  //   }
  // };

  return (
    <main className="h-full w-full bg-[#030014] bg-no-repeat bg-cover">
      <div className="flex-flex-col gap-20">
        <StarsCanvas />
        <div className=" w-full h-[60px] fixed shadow-lg shadow-[#2A0E61]/50 bg-[#03001470] backdrop-blur-md z-50">
          <div className="w-full h-full flex flex-row items-center justify-between m-auto">
            <a
              href="/"
              className="h-auto w-auto flex ml-4 flex-row items-center"
            >
              <img
                src="/LogoD.webp"
                alt="logo"
                width={40}
                height={50}
                className="cursor-pointer animate-pulse"
              />
            </a>
            <a
              href="/userClaim"
              className="w-20px pb-2 pt-1 pr-4 pl-4 text-slate-50 mr-10 border-2 rounded-3xl hover:-translate-y-0 hover:scale-60 hover:bg-violet-800 duration-300 no-underline"
            >
              Claim Airdrop
            </a>
          </div>
        </div>
        {/* <Nav onNetworkSwitch={handleNetworkSwitch} /> */}
        <Hero />
        <Encryption />
      </div>
    </main>
  );
};

export default HomePage;
