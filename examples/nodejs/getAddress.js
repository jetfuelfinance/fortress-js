// Example of fetching a Fortress protocol contract address with Fortress.js
const Fortress = require('../../dist/nodejs/index.js');

const daiAddress = Fortress.util.getAddress(Fortress.DAI);
const fdaiAddress = Fortress.util.getAddress(Fortress.fDAI);
const fBNBAddressTestnet = Fortress.util.getAddress(Fortress.fBNB, 'testnet');

console.log('DAI (mainnet)', daiAddress);
console.log('fDAI (mainnet)', fdaiAddress);

console.log('fBNB (testnet)', fBNBAddressTestnet);
