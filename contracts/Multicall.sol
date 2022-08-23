// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.12;

contract MultiCall {
    function multiCall(address[] calldata targets, bytes[] calldata data)
        external
        view
        returns (bytes[] memory)
    {
        require(targets.length == data.length, "target length != data length");

        bytes[] memory results = new bytes[](data.length);
        uint len = targets.length;
        for (uint i; i < len;) {
            (bool success, bytes memory result) = targets[i].staticcall(data[i]);
            require(success, "call failed");
            results[i] = result;
            unchecked { ++i; }
        }

        return results;
    }
}