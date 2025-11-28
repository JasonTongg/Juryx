const hre = require("hardhat");

const ACCCOUNT_ADDRESS = "0xb0279Db6a2F1E01fbC8483FCCef0Be2bC6299cC3";

async function main() {
	const account = await hre.ethers.getContractAt("Account", ACCCOUNT_ADDRESS);
	const count = await account.count();
	console.log(count);
}

main().catch((error) => {
	console.error(error);
	process.exitCde = 1;
});
