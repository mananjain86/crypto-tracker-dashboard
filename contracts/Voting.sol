// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CryptoVoting
 * @dev Basic voting contract to record sentiments (bullish/bearish) for crypto assets.
 */
contract CryptoVoting {
    // Mapping: coinId => (wallet => hasVoted)
    mapping(string => mapping(address => bool)) public hasVoted;

    // Event emitted when a vote is cast
    event Voted(string coinId, address voter, string sentiment);

    /**
     * @dev Cast a vote for a specific coin.
     * @param coinId The identifier of the coin (e.g., 'bitcoin').
     * @param sentiment The sentiment, either 'bullish' or 'bearish'.
     */
    function vote(string memory coinId, string memory sentiment) public {
        require(!hasVoted[coinId][msg.sender], "Already voted for this coin");
        require(
            keccak256(bytes(sentiment)) == keccak256(bytes("bullish")) || 
            keccak256(bytes(sentiment)) == keccak256(bytes("bearish")),
            "Invalid sentiment"
        );
        
        hasVoted[coinId][msg.sender] = true;
        emit Voted(coinId, msg.sender, sentiment);
    }
}
