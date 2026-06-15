/**
 * Wallet address validation utilities
 */

/**
 * Validates an Ethereum address format
 * @param {string} address
 * @returns {boolean}
 */
function isValidEthereumAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Supported testnet network chain IDs
 */
const SUPPORTED_TESTNETS = {
  '0xaa36a7': { name: 'Sepolia', chainId: 11155111 },
  '0x13882': { name: 'Polygon Amoy', chainId: 80002 },
  '0x61': { name: 'BSC Testnet', chainId: 97 },
};

/**
 * Get the name of a testnet by chain ID (hex string)
 * @param {string} chainIdHex
 * @returns {string|null}
 */
function getTestnetName(chainIdHex) {
  const net = SUPPORTED_TESTNETS[chainIdHex?.toLowerCase()];
  return net ? net.name : null;
}

/**
 * Check if a chain ID (hex) is a supported testnet
 * @param {string} chainIdHex
 * @returns {boolean}
 */
function isSupportedTestnet(chainIdHex) {
  return !!SUPPORTED_TESTNETS[chainIdHex?.toLowerCase()];
}

module.exports = {
  isValidEthereumAddress,
  SUPPORTED_TESTNETS,
  getTestnetName,
  isSupportedTestnet,
};
