import { ethers } from 'ethers';
try {
  const data = ethers.hexlify(ethers.toUtf8Bytes("VOTE:bitcoin:bullish"));
  console.log(data);
} catch (e) {
  console.error("Error:", e.message);
}
