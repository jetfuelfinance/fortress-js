/**
 * @file Fortress
 * @desc This file defines the constructor of the `Fortress` class.
 * @hidden
 */

import { ethers } from 'ethers';
import * as eth from './eth';
import * as util from './util';
import * as comptroller from './comptroller';
import * as fToken from './fToken';
import * as priceFeed from './priceFeed';
import * as comp from './comp';
import * as gov from './gov';
import * as api from './api';
import { constants, decimals } from './constants';
import { Provider, CompoundOptions, CompoundInstance } from './types';

// Turn off Ethers.js warnings
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

/**
 * Creates an instance of the Fortress.js SDK.
 *
 * @param {Provider | string} [provider] Optional Ethereum network provider.
 *     Defaults to Ethers.js fallback mainnet provider.
 * @param {object} [options] Optional provider options.
 *
 * @example
 * ```
 * var fortress = new Fortress(window.ethereum); // web browser
 * 
 * var fortress = new Fortress('http://127.0.0.1:8545'); // HTTP provider
 * 
 * var fortress = new Fortress(); // Uses Ethers.js fallback mainnet (for testing only)
 * 
 * var fortress = new Fortress('testnet'); // Uses Ethers.js fallback (for testing only)
 * 
 * // Init with private key (server side)
 * var fortress = new Fortress('https://mainnet.infura.io/v3/_your_project_id_', {
 *   privateKey: '0x_your_private_key_', // preferably with environment variable
 * });
 * 
 * // Init with HD mnemonic (server side)
 * var fortress = new Fortress('mainnet' {
 *   mnemonic: 'clutch captain shoe...', // preferably with environment variable
 * });
 * ```
 *
 * @returns {object} Returns an instance of the Fortress.js SDK.
 */
const Fortress = function(
  provider: Provider | string = 'mainnet', options: CompoundOptions = {}
) : CompoundInstance {
  const originalProvider = provider;

  options.provider = provider || options.provider;
  provider = eth._createProvider(options);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance: any = {
    _originalProvider: originalProvider,
    _provider: provider,
    ...comptroller,
    ...fToken,
    ...priceFeed,
    ...gov,
    claimFortress: comp.claimFortress,
    delegate: comp.delegate,
    delegateBySig: comp.delegateBySig,
    createDelegateSignature: comp.createDelegateSignature,
    getMintableFAI: comp.getMintableFAI,
    getFAIMintRate: comp.getFAIMintRate,
    mintFAIGuardianPaused: comp.mintFAIGuardianPaused,
    repayFAIGuardianPaused: comp.repayFAIGuardianPaused,
    mintedFAIOf: comp.mintedFAIOf,
    mintedFAIs: comp.mintedFAIs,
    faiController: comp.faiController,
    faiMintRate: comp.faiMintRate,
    mintFAI: comp.mintFAI,
    repayFAI: comp.repayFAI,
  };

  // Instance needs to know which network the provider connects to, so it can
  //     use the correct contract addresses.
  instance._networkPromise = eth.getProviderNetwork(provider).then((network) => {    
    instance.decimals = decimals;
    if (network.id === 56 || network.name === "mainnet") {
      instance.decimals.USDC = 18;
      instance.decimals.USDT = 18;
    }
    delete instance._networkPromise;
    instance._network = network;
  });

  return instance;
};

Fortress.eth = eth;
Fortress.api = api;
Fortress.util = util;
Fortress._ethers = ethers;
Fortress.decimals = decimals;
Fortress.fortress = {
  getFortressBalance: comp.getFortressBalance,
  getFortressAccrued: comp.getFortressAccrued,
};
Object.assign(Fortress, constants);

export = Fortress;
