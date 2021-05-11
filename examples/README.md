# Code Examples

Be sure to **build the SDK** from the root directory before running the Node.js examples: `npm run build`.

- [Node.js](https://github.com/jetfuelfinance/fortress-js/tree/master/examples/nodejs) Source code files.
- [Web Browser](https://github.com/jetfuelfinance/fortress-js/examples/web/) Easiest to surf in the GitHub Pages webpage.

## Use Ganache
Run [ganache-cli](https://www.npmjs.com/package/ganache-cli) or [Ganache](https://www.trufflesuite.com/ganache) in another command line window before running the `eth_sendTransaction` type examples. Be sure to fork mainnet.

```
npm install -g ganache-cli

ganache-cli \
  -f https://cloudflare-eth.com/ \
  -m "clutch captain shoe salt awake harvest setup primary inmate ugly among become" \
  -i 1
```