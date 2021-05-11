import { CompoundInstance } from './types';

/**
 * This function acts like a decorator for all methods that interact with the
 *     blockchain. In order to use the correct Fortress Protocol addresses, the
 *     Fortress.js SDK must know which network its provider points to. This
 *     function holds up a transaction until the main constructor has determined
 *     the network ID.
 *
 * @hidden
 *
 * @param {Fortress} _compound The instance of the Fortress.js SDK.
 *
 */
export async function netId(_compound: CompoundInstance): Promise<void> {
  if (_compound._networkPromise) {
    await _compound._networkPromise;
  }
}
