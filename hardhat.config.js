require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	defaultNetwork: "sepolia",
	networks: {
		sepolia: {
			url: process.env.RPC_URL,
			accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY2]
		}
	},
	solidity: {
		version: "0.8.19",
		settings: {
			optimizer: {
				enabled: true,
				runs: 1000,
			},
		},
	},
};
