// Example of calling JSON RPC's eth_call with Fortress.js
const Fortress = require('../../dist/nodejs/index.js');

const fDaiAddress = Fortress.util.getAddress(Fortress.fDAI);

(async function() {

  const srpb = await Fortress.eth.read(
    fDaiAddress,
    'function supplyRatePerBlock() returns (uint256)',
    // [], // [optional] parameters
    // {}  // [optional] call options, provider, network, plus ethers "overrides"
  );

  console.log('fDAI market supply rate per block:', srpb.toString());

})().catch(console.error);
