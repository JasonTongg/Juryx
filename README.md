<img width="1050" height="718" alt="image" src="https://github.com/user-attachments/assets/4c1ed875-8e01-4de1-a6f7-5960a769ae48" />

# Juryx

This repository contains the core smart contract logic for Juryx, a decentralized multi-signature wallet platform. Built with Hardhat, these contracts facilitate the creation, management, and execution of multi-signer transactions on-chain.

- **Frontend using Nextjs:** [JUSD Frontend](https://github.com/JasonTongg/Juryx_Frontend)
- **Framework:** Hardhat
- **Network:** Sepolia Testnet (Primary)

## Core Contract Architecture

The system utilizes a factory-based pattern to deploy secure, individual multi-signature wallets for users.

| Contract | Purpose |
| :--- | :--- |
| `Account.sol` | The Smart Contract Wallet. Implements IAccount to validate UserOperations against a defined threshold of owner signatures. Deploys new Account instances using CREATE2 for deterministic addressing. |
| `Paymaster.sol` | Implements IPaymaster to potentially sponsor gas fees for users, enabling gasless transactions. |
| `EntryPoint.sol` | The singleton contract that acts as the central hub for executing UserOperations. |

## Features & Functionality

The completed system allows users to:

* **Custom Thresholds:** Flexible $M$-of-$N$ signature requirements defined at the time of creation.
* **On-Chain Security:** All signatures and approvals are validated on-chain to ensure the integrity of the multi-sig process.
* **Factory Pattern:** Scalable architecture allowing any user to deploy their own secure wallet instance.

## Author  

**Jason Tong**  

- **GitHub:** [JasonTongg](https://github.com/JasonTongg).
- **Linkedin:** [Jason Tong](https://www.linkedin.com/in/jason-tong-42600319a/).
