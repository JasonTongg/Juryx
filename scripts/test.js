const hre = require("hardhat");

const ACCCOUNT_ADDRESS = "0xef1b43bfc772489e29e9937cb722bdbed34d9e93";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xBFFF76aa2a41eC15017945164b9CE9C635CE5175";

async function main() {
	const account = await hre.ethers.getContractAt("Account", ACCCOUNT_ADDRESS);
	const count = await account.count();
	console.log(count);

	console.log("Account balance", await hre.ethers.provider.getBalance(ACCCOUNT_ADDRESS));

	const ep = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
	console.log("Entry point balance",await ep.balanceOf(ACCCOUNT_ADDRESS));
	console.log("Paymaster balance",await ep.balanceOf(PM_ADDRESS));
}

main().catch((error) => {
	console.error(error);
	process.exitCde = 1;
});
