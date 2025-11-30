const { EntryPoint__factory } = require("@account-abstraction/contracts");
const hre = require("hardhat");

const FACTORY_ADDRESS = "0xb309164d19e6592d7F4bC2fDb7Ac70E28e8aD918";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xBFFF76aa2a41eC15017945164b9CE9C635CE5175";

async function main() {
	const [signer0] = await hre.ethers.getSigners();
	const address0 = await signer0.getAddress();

	const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");

	let initCode = FACTORY_ADDRESS +
	AccountFactory.interface
		.encodeFunctionData("createAccount", [address0])
		.slice(2);

	let sender;
	try {
		await entryPoint.getSenderAddress(initCode);
	} catch(e) {
		sender = "0x" + e.data.slice(-40);
	}

	const code = await ethers.provider.getCode(sender);

	if (code !== "0x") {
		initCode = "0x";
	}

	console.log({sender});

	const Account = await hre.ethers.getContractFactory("Account");

	const userOp = {
		sender,
		nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
		initCode,
		callData: Account.interface.encodeFunctionData("execute"),
		paymasterAndData: PM_ADDRESS,
		signature: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa55555555555555555555555555555555555555555555555555555555555555551b",
	};

	const {preVerificationGas, callGasLimit, verificationGasLimit} = await hre.ethers.provider.send("eth_estimateUserOperationGas", [userOp, EP_ADDRESS]);
	
	userOp.callGasLimit = callGasLimit;
	userOp.verificationGasLimit = verificationGasLimit;
	userOp.preVerificationGas = preVerificationGas;

	// const {maxFeePerGas} = await hre.ethers.provider.getFeeData();

	// console.log(maxFeePerGas)
	
	userOp.maxFeePerGas = hre.ethers.toBeHex(hre.ethers.parseUnits("0.2", "gwei"));

	const maxPriorityFeePerGas = await hre.ethers.provider.send("rundler_maxPriorityFeePerGas");
	userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

	const userOpHash = await entryPoint.getUserOpHash(userOp);
	userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash))

	const opHash = await hre.ethers.provider.send("eth_sendUserOperation", [userOp, EP_ADDRESS]);

	setTimeout(async () => {
		const response = await hre.ethers.provider.send("eth_getUserOperationByHash", [opHash]);

		console.log(response)
	}, 5000)
}

main().catch((error) => {
	console.error(error);
	process.exitCde = 1;
});
