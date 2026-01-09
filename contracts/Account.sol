// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract Account is IAccount {
    uint256 public executeCount;
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;

    address public immutable entryPoint;

    constructor(address[] memory _owners, uint256 _threshold, address _entryPoint) {
        require(_owners.length > 0, "Owners array is empty");
        require(_threshold > 0 && _threshold <= _owners.length, "Invalid threshold");

        threshold = _threshold;
        entryPoint = _entryPoint;

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner address");
            require(!isOwner[owner], "Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
        }
    }

    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256)
        external
        view
        returns (uint256 validationData)
    {
        _validateSignatures(userOpHash, userOp.signature);
        return 0;
    }

    function _validateSignatures(bytes32 userOpHash, bytes calldata signatureData) internal view {
        require(msg.sender == entryPoint, "only entrypoint");
        bytes[] memory sigs = abi.decode(signatureData, (bytes[]));

        uint256 valid;
        address lastSigner;
        bytes32 hash = ECDSA.toEthSignedMessageHash(userOpHash);

        for (uint256 i = 0; i < sigs.length; i++) {
            address signer = ECDSA.recover(hash, sigs[i]);

            require(isOwner[signer], "not owner");
            require(signer > lastSigner, "duplicate or unordered");

            lastSigner = signer;
            valid++;
        }

        require(valid >= threshold, "not enough approvals");
    }

    function execute(address to, uint256 value, bytes calldata data) external {
        require(msg.sender == entryPoint, "not entry point");
        executeCount++;

        (bool success,) = to.call{value: value}(data);
        require(success, "execute failed");
    }

    receive() external payable {}

    fallback() external payable {}
}

contract AccountFactory {
    event AccountCreated(address account, address[] owners, uint256 threshold);

    function createAccount(address[] memory _owners, uint256 _threshold, address _entryPoint)
        external
        returns (address)
    {
        bytes32 salt = keccak256(abi.encode(_owners, _threshold));
        bytes memory bytecode =
            abi.encodePacked(type(Account).creationCode, abi.encode(_owners, _threshold, _entryPoint));

        address addr = Create2.computeAddress(salt, keccak256(bytecode));

        emit AccountCreated(addr, _owners, _threshold);

        if (addr.code.length > 0) {
            return addr;
        }

        return address(new Account{salt: salt}(_owners, _threshold, _entryPoint));
        // return deploy(salt, bytecode);
    }

    function deploy(bytes32 salt, bytes memory bytecode) internal returns (address addr) {
        require(bytecode.length != 0, "Create2: bytecode length is zero");
        /// @solidity memory-safe-assembly
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(addr != address(0), "Create2: Failed on deploy");
    }
}
