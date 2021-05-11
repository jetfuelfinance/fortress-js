# Fortress.js

A JavaScript SDK for Binance Smart Chain and the Fortress Protocol. Wraps around [Ethers.js](https://github.com/ethers-io/ethers.js/). Works in the **web browser** and **Node.js**.

[Fortress.js Documentation](https://docs.fortress.loans/fortress-js)

This SDK is in **open beta**, and is constantly under development. **USE AT YOUR OWN RISK**.

## Binance Smart Chain Read & Write

JSON RPC based Binance Smart Chain **read** and **write**.

### Read

```js
const Fortress = require('fortress-js'); // in Node.js
const fUsdtAddress = Fortress.util.getAddress(Fortress.fUSDT);

(async function() {

  let supplyRatePerBlock = await Fortress.eth.read(
    fUsdtAddress,
    'function supplyRatePerBlock() returns (uint)',
    [], // [optional] parameters
    {}  // [optional] call options, provider, network, ethers.js "overrides"
  );

  console.log('USDT supplyRatePerBlock:', supplyRatePerBlock.toString());

})().catch(console.error);
```

### Write

```js
const toAddress = '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A';

(async function() {

  const trx = await Fortress.eth.trx(
    toAddress,
    'function send() external payable',
    [],
    {
      value: Fortress._ethers.utils.parseEther('1.0'), // 1 ETH
      provider: window.ethereum, // in a web browser
    }
  );

  const toAddressEthBalance = await Fortress.eth.getBalance(toAddress);

})().catch(console.error);
```

## Fortress Protocol

Simple methods for using the Fortress protocol.

```js
const fortress = new Fortress(window.ethereum); // in a web browser

// Ethers.js overrides are an optional 3rd parameter for `supply`
// const trxOptions = { gasLimit: 250000, mantissa: false };

(async function() {

  console.log('Supplying ETH to the Fortress protocol...');
  const trx = await fortress.supply(Fortress.ETH, 1);
  console.log('Ethers.js transaction object', trx);

})().catch(console.error);
```

## Install / Import

Web Browser

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/fortress-js@latest/dist/browser/fortress.min.js"></script>

<script type="text/javascript">
  window.Fortress; // or `Fortress`
</script>
```

Node.js

```
npm install fortress-js
```

```js
const Fortress = require('fortress-js');

// or, when using ES6

import Fortress from 'fortress-js';
```

## More Code Examples

- [Node.js](https://github.com/jetfuelfinance/fortress-js/tree/master/examples)
- [Web Browser](https://github.com/jetfuelfinance/fortress-js/examples/web/)

[To run, boot Ganache fork of mainnet locally](https://github.com/jetfuelfinance/fortress-js/tree/master/examples)

## Instance Creation

The following are valid Binance Smart Chain providers for initialization of the SDK.

```js
var fortress = new Fortress(window.ethereum); // web browser

var fortress = new Fortress('http://127.0.0.1:8545'); // HTTP provider

var fortress = new Fortress(); // Uses Ethers.js fallback mainnet (for testing only)

var fortress = new Fortress('testnet'); // Uses Ethers.js fallback (for testing only)

// Init with private key (server side)
var fortress = new Fortress('http://127.0.0.1:8545', {
  privateKey: '0x_your_private_key_', // preferably with environment variable
});

// Init with HD mnemonic (server side)
var fortress = new Fortress('mainnet' {
  mnemonic: 'clutch captain shoe...', // preferably with environment variable
});
```

## Constants and Contract Addresses

Names of contracts, their addresses, ABIs, token decimals, and more can be found in `/src/constants.ts`. Addresses, for all networks, can be easily fetched using the `getAddress` function, combined with contract name constants.

```js
console.log(Fortress.BUSD, Fortress.BNB, Fortress.fDAI);
// BUSD, BNB, fDAI

const fUsdtAddress = Fortress.util.getAddress(Fortress.fUSDT);
// Mainnet fUSDT address. Second parameter can be a network like 'testnet'.
```

## Mantissas

Parameters of number values can be plain numbers or their scaled up mantissa values. There is a transaction option boolean to tell the SDK what the developer is passing.

```js
// 1 BUSD
await fortress.borrow(Fortress.BUSD, '1000000000000000000', { mantissa: true });

// `mantissa` defaults to false if it is not specified or if an options object is not passed
await fortress.borrow(Fortress.BUSD, 1, { mantissa: false });
```

## Transaction Options

Each method that interacts with the blockchain accepts a final optional parameter for overrides, much like [Ethers.js overrides](https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides).
```js
// The options object itself and all options are optional
const trxOptions = {
  mantissa,   // Boolean, parameters array arg of 1 ETH would be '1000000000000000000' (true) vs 1 (false)
  abi,        // Definition string or an ABI array from a solc build
  provider,   // JSON RPC string, Web3 object, or Ethers.js fallback network (string)
  network,    // Ethers.js fallback network provider, "provider" has precedence over "network"
  from,       // Address that the Binance Smart Chain transaction is send from
  gasPrice,   // Ethers.js override `Fortress._ethers.utils.parseUnits('10.0', 'gwei')`
  gasLimit,   // Ethers.js override - see https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
  value,      // Number or string
  data,       // Number or string
  chainId,    // Number
  nonce,      // Number
  privateKey, // String, meant to be used with `Fortress.eth.trx` (server side)
  mnemonic,   // String, meant to be used with `Fortress.eth.trx` (server side)
};
```

## API

The [Fortress API](https://docs.fortress.loans/api) is accessible from Fortress.js. The corresponding services are defined in the `api` namespace on the class.

- `Fortress.api.account`
- `Fortress.api.fToken`
- `Fortress.api.marketHistory`
- `Fortress.api.governance`

The governance method requires a second parameter (string) for the corresponding endpoint shown in the [documentation](https://docs.fortress.loans/docs/api#GovernanceService).

- `proposals`
- `voteReceipts`
- `accounts`

Here is an example for using the `account` endpoint. The `network` parameter in the request body is optional and defaults to `mainnet`.

```js
const main = async () => {
  const account = await Fortress.api.account({
    "addresses": "0xB61C5971d9c0472befceFfbE662555B78284c307",
    "network": "testnet"
  });

  let daiBorrowBalance = 0;
  if (Object.isExtensible(account) && account.accounts) {
    account.accounts.forEach((acc) => {
      acc.tokens.forEach((tok) => {
        if (tok.symbol === Fortress.fDAI) {
          daiBorrowBalance = +tok.borrow_balance_underlying.value;
        }
      });
    });
  }

  console.log('daiBorrowBalance', daiBorrowBalance);
}

main().catch(console.error);
```

## Build for Node.js & Web Browser

```
git clone git@github.com:jetfuelfinance/fortress-js.git
cd fortress-js/
npm install
npm run build
```

### Web Browser Build
```html
<!-- Local build (do `npm install` first) -->
<script type="text/javascript" src="./dist/browser/fortress.min.js"></script>

<!-- Public NPM -> jsdeliver build -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/fortress-js@latest/dist/browser/fortress.min.js"></script>
```

### Node.js Build
```js
// Local build (do `npm install` first)
const Fortress = require('./dist/nodejs/index.js');

// Public NPM build
const Fortress = require('fortress-js');
```
