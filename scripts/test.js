const hre = require("hardhat");

const ACCCOUNT_ADDRESS = "0x5150F939Fb44D9f152122c34A168e0B8f96aDD93";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0x0A61DEfe814e78eB8eB95aFb4d18Ab24Ae85E443";

async function main() {
	const account = await hre.ethers.getContractAt("Account", ACCCOUNT_ADDRESS);
	// const count = await account.executeCount();
	// console.log(count);

	// console.log("Account balance", await hre.ethers.provider.getBalance(ACCCOUNT_ADDRESS));

	// const ep = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
	// console.log("Entry point balance",await ep.balanceOf(ACCCOUNT_ADDRESS));
	// console.log("Paymaster balance", await ep.balanceOf(PM_ADDRESS));

	const isOwner = await account.isOwner("0xeFF3521fb13228C767Ad6Dc3b934F9eFAC9c56aD");
	const isOwner2 = await account.isOwner("0x4E5f460b26157A9E28707dc66096447476FD4af3");
	const isOwner3 = await account.isOwner("0xD38F2E53114CB54670daB5205C012B0B511240a0");
	const isOwner4 = await account.isOwner("0x54Cf97b753740d24B187d8Df61160Cb4C548478e");
	const threshold = await account.threshold();

	console.log("isOwner", isOwner);
	console.log("isOwner2", isOwner2);
	console.log("isOwner3", isOwner3);
	console.log("isOwner4", isOwner4);
	console.log("threshold", threshold);
}

main().catch((error) => {
	console.error(error);
	process.exitCde = 1;
});
