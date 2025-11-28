const { EntryPoint__factory } = require("@account-abstraction/contracts");
const hre = require("hardhat");

const FACTORY_NONCE = 2;
const FACTORY_ADDRESS = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9";
const EP_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
	const [signer0] = await hre.ethers.getSigners();
	const address0 = await signer0.getAddress();

	const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const sender = await hre.ethers.getCreateAddress({
		from: FACTORY_ADDRESS,
		nonce: FACTORY_NONCE,
	});

	const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
	const initCode = "0x";
	// const initCode = FACTORY_ADDRESS +
	// AccountFactory.interface
	// 	.encodeFunctionData("createAccount", [address0])
	// 	.slice(2);

	console.log(sender);

	// await entryPoint.depositTo(sender, {
	// 	value: hre.ethers.parseEther("100"),
	// });

	const Account = await hre.ethers.getContractFactory("Account");

	const userOp = {
		sender,
		nonce: await entryPoint.getNonce(sender, 0),
		initCode,
		callData: Account.interface.encodeFunctionData("execute"),
		callGasLimit: 200_000,
		verificationGasLimit: 200_000,
		preVerificationGas: 50_000,
		maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
		maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
		paymasterAndData: "0x",
		signature: "0x",
	};

	const tx = await entryPoint.handleOps([userOp], address0);
	const receipt = await tx.wait();
	console.log(receipt);
}

main().catch((error) => {
	console.error(error);
	process.exitCde = 1;
});
