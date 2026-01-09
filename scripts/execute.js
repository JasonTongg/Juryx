const { EntryPoint__factory } = require("@account-abstraction/contracts");
const hre = require("hardhat");

const FACTORY_ADDRESS = "0xd1f66392bE7f192D26e72760B677F391E680E5Bc";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0x0A61DEfe814e78eB8eB95aFb4d18Ab24Ae85E443";

async function main() {
	const [signer0, signer1] = await hre.ethers.getSigners();
	const address0 = await signer0.getAddress();
	const address1 = await signer1.getAddress();
	// const address2 = await signer2.getAddress();
	// const address3 = await signer3.getAddress();

	const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");

	const owners = [address0, address1].map(addr => addr.toLowerCase()).sort((a, b) => a.localeCompare(b));

	const threshold = 2;

	let initCode = FACTORY_ADDRESS +
		AccountFactory.interface
			.encodeFunctionData("createAccount", [owners, threshold, EP_ADDRESS])
			.slice(2);

	let sender;
	try {
		await entryPoint.getSenderAddress(initCode);
	} catch (e) {
		sender = "0x" + e.data.slice(-40);
	}

	console.log("Account balance", await hre.ethers.provider.getBalance(sender));

	const code = await hre.ethers.provider.getCode(sender);

	if (code !== "0x") {
		initCode = "0x";
	}

	console.log(initCode);

	console.log({ sender });

	const Account = await hre.ethers.getContractFactory("Account");

	const target = "0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b";
	const value = "0x2386f26fc10000";
	const data = "0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006946adb600000000000000000000000000000000000000000000000000000000000000040b000604000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bfff9976782d46cc05630d1f6ebab18b2324d6b140001f41c7d4b196cb0c7b01d743fbc6116a902379c723800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000001c7d4b196cb0c7b01d743fbc6116a902379c7238000000000000000000000000e49acc3b16c097ec88dc9352ce4cd57ab7e35b95000000000000000000000000000000000000000000000000000000000000001900000000000000000000000000000000000000000000000000000000000000600000000000000000000000001c7d4b196cb0c7b01d743fbc6116a902379c7238000000000000000000000000eff3521fb13228c767ad6dc3b934f9efac9c56ad000000000000000000000000000000000000000000000000000000000213212e756e697800000000000c";

	const userOp = {
		sender,
		nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
		initCode,
		callData: Account.interface.encodeFunctionData("execute", [target, value, data]),
		paymasterAndData: PM_ADDRESS,
		signature: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa55555555555555555555555555555555555555555555555555555555555555551b",
	};

	// const {preVerificationGas, callGasLimit, verificationGasLimit} = await hre.ethers.provider.send("eth_estimateUserOperationGas", [userOp, EP_ADDRESS]);

	userOp.verificationGasLimit = ethers.toBeHex(1_500_000); // Deployment + multi-sig validation
	userOp.preVerificationGas = ethers.toBeHex(500_000);
	userOp.callGasLimit = ethers.toBeHex(200_000);

	// const {maxFeePerGas} = await hre.ethers.provider.getFeeData();

	// console.log(maxFeePerGas)

	userOp.maxFeePerGas = hre.ethers.toBeHex(hre.ethers.parseUnits("0.2", "gwei"));

	const maxPriorityFeePerGas = await hre.ethers.provider.send("rundler_maxPriorityFeePerGas");
	userOp.maxPriorityFeePerGas = hre.ethers.toBeHex(hre.ethers.parseUnits("0.2", "gwei"));

	const userOpHash = await entryPoint.getUserOpHash(userOp);

	const signers = [signer0, signer1].sort((a, b) =>
		a.address.toLowerCase().localeCompare(b.address.toLowerCase())
	);

	const signatures = [];
	for (const s of signers) {
		signatures.push(await s.signMessage(ethers.getBytes(userOpHash)));
	}

	// Do NOT sort the signatures array here; it's already in the right order
	userOp.signature = ethers.AbiCoder.defaultAbiCoder().encode(
		["bytes[]"],
		[signatures]
	);

	console.log(userOp);

	const tx = await entryPoint.handleOps([userOp], address0);
	const receipt = await tx.wait();
	console.log(receipt);
}

main().catch((error) => {
	console.error(error);
	process.exitCde = 1;
});
