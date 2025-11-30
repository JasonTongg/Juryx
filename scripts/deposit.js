const { EntryPoint__factory } = require("@account-abstraction/contracts");
const hre = require("hardhat");

const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xBFFF76aa2a41eC15017945164b9CE9C635CE5175";

async function main() {
	const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

    await entryPoint.depositTo(PM_ADDRESS, {
		value: hre.ethers.parseEther("0.1"),
	});

    console.log(`Deposit to ${PM_ADDRESS} successfull`);
}

main().catch((error) => {
	console.error(error);
	process.exitCde = 1;
});
