// Example of fetching prices from the Fortress protocol's open price feed using
// Fortress.js
const Fortress = require('../../dist/nodejs/index.js');
const fortress = new Fortress();

let price;
(async function() {

  price = await fortress.getPrice(Fortress.DAI);
  console.log('DAI in USDC', price);

  price = await fortress.getPrice(Fortress.fDAI);
  console.log('fDAI in USDC', price);

  price = await fortress.getPrice(Fortress.DAI, Fortress.fUSDC);
  console.log('DAI in fUSDC', price);

  price = await fortress.getPrice(Fortress.DAI, Fortress.BNB);
  console.log('DAI in BNB', price);

})().catch(console.error);
