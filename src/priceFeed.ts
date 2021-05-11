/**
 * @file Price Feed
 * @desc These methods facilitate interactions with the Open Price Feed smart
 *     contracts.
 */

import * as eth from './eth';
import { netId } from './helpers';
import {
  constants, address, abi, cTokens, underlyings, decimals, opfAssets
} from './constants';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { CallOptions } from './types';

function validateAsset(
  asset: string,
  argument: string,
  errorPrefix: string
) : (boolean | string | number)[] {
  if (typeof asset !== 'string' || asset.length < 1) {
    throw Error(errorPrefix + 'Argument `' + argument + '` must be a non-empty string.');
  }

  const assetIsFToken = asset[0] === 'f';

  const fTokenName = assetIsFToken ? asset : 'f' + asset;
  const fTokenAddress = address[this._network.name][fTokenName];

  let underlyingName = assetIsFToken ? asset.slice(1, asset.length) : asset;
  const underlyingAddress = address[this._network.name][underlyingName];

  if (
    (!cTokens.includes(fTokenName) || !underlyings.includes(underlyingName)) &&
    !opfAssets.includes(underlyingName)
  ) {
    throw Error(errorPrefix + 'Argument `' + argument + '` is not supported.');
  }

  const underlyingDecimals = decimals[underlyingName];

  // The open price feed reveals BTC, not WBTC.
  underlyingName = underlyingName === 'WBTC' ? 'BTC' : underlyingName;

  return [assetIsFToken, fTokenName, fTokenAddress, underlyingName, underlyingAddress, underlyingDecimals];
}

async function fTokenExchangeRate(
  fTokenAddress: string,
  fTokenName: string,
  underlyingDecimals: number
) : Promise<number> {
  const address = fTokenAddress;
  const method = 'exchangeRateCurrent';
  const options = {
    _compoundProvider: this._provider,
    abi: fTokenName === constants.fBNB ? abi.fBNB : abi.fBep20,
  };
  const exchangeRateCurrent = await eth.read(address, method, [], options);
  const mantissa = 18 + underlyingDecimals - 8; // fToken always 8 decimals
  const oneFTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);

  return oneFTokenInUnderlying;
}

/**
 * Gets an asset's price from the Fortress Protocol open price feed. The price
 *    of the asset can be returned in any other supported asset value, including
 *    all fTokens and underlyings.
 *
 * @param {string} asset A string of a supported asset in which to find the
 *     current price.
 * @param {string} [inAsset] A string of a supported asset in which to express
 *     the `asset` parameter's price. This defaults to USD.
 *
 * @returns {string} Returns a string of the numeric value of the asset.
 *
 * @example
 * ```
 * const fortress = new Fortress(window.ethereum);
 * let price;
 * 
 * (async function () {
 * 
 *   price = await fortress.getPrice(Fortress.BNB);
 *   console.log('BNB in USD', price);
 * 
 *   price = await fortress.getPrice(Fortress.DAI, Fortress.USDC); // supports fTokens too
 *   console.log('DAI in USDC', price);
 * 
 * })().catch(console.error);
 * ```
 */
export async function getPrice(
  asset: string,
  inAsset: string = constants.USDC
) : Promise<number> {
  await netId(this);
  const errorPrefix = 'Fortress [getPrice] | ';

  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    assetIsFToken, fTokenName, fTokenAddress, underlyingName, underlyingAddress, underlyingDecimals
  ] = validateAsset.bind(this)(asset, 'asset', errorPrefix);

  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inAssetIsFToken, inAssetFTokenName, inAssetFTokenAddress, inAssetUnderlyingName, inAssetUnderlyingAddress, inAssetUnderlyingDecimals
  ] = validateAsset.bind(this)(inAsset, 'inAsset', errorPrefix);

  // const priceFeedAddress = address[this._network.name].PriceFeed;
  const comptrollerAddress = address[this._network.name].Comptroller;

  const oracleTrxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comptroller,
  };
  const priceOracleAddress = await eth.read(comptrollerAddress, 'oracle', [], oracleTrxOptions);

  // const trxOptions: CallOptions = {
  //   _compoundProvider: this._provider,
  //   abi: abi.PriceFeed,
  // };

  // const assetUnderlyingPrice = await eth.read(priceFeedAddress, 'price', [ underlyingName ], trxOptions);
  // const inAssetUnderlyingPrice =  await eth.read(priceFeedAddress, 'price', [ inAssetUnderlyingName ], trxOptions);

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.PriceOracle,
  };
  let assetUnderlyingPrice = await eth.read(priceOracleAddress, 'getUnderlyingPrice', [ fTokenAddress ], trxOptions);
  const inAssetUnderlyingPrice =  await eth.read(priceOracleAddress, 'getUnderlyingPrice', [ inAssetFTokenAddress ], trxOptions);

  const assetDecimal = decimals[asset];
  const inAssetDecimal = decimals[inAsset];
  if ((assetDecimal-inAssetDecimal) > 0) {
    assetUnderlyingPrice = assetUnderlyingPrice.mul(BigNumber.from("10").pow(assetDecimal-inAssetDecimal));
  } else {
    assetUnderlyingPrice = assetUnderlyingPrice.div(BigNumber.from("10").pow(inAssetDecimal-assetDecimal));
  }  

  let assetFTokensInUnderlying, inAssetFTokensInUnderlying;

  if (assetIsFToken) {
    assetFTokensInUnderlying = await fTokenExchangeRate.bind(this)(fTokenAddress, fTokenName, underlyingDecimals);
  }

  if (inAssetIsFToken) {
    inAssetFTokensInUnderlying = await fTokenExchangeRate.bind(this)(inAssetFTokenAddress, inAssetFTokenName, inAssetUnderlyingDecimals);
  }

  let result;
  if (!assetIsFToken && !inAssetIsFToken) {
    result = assetUnderlyingPrice / inAssetUnderlyingPrice;
  } else if (assetIsFToken && !inAssetIsFToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther * assetFTokensInUnderlying;
  } else if (!assetIsFToken && inAssetIsFToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther / inAssetFTokensInUnderlying;
  } else {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    const fTokensInUnderlying = assetInOther / assetFTokensInUnderlying;
    result = inAssetFTokensInUnderlying * fTokensInUnderlying;
  }

  return result;
}
