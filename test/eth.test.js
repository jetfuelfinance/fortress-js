// TODO: Needs babel config in parent dir, that currently messes with the build
// process so I deleted it.
// TODO: Get mock working for ethers so we don't make real calls during tests.

import Fortress from '../src/index';

test('Fortress constructor', async () => {
  const fortress = new Fortress('http://3.10.133.254:8575');

  console.log(fortress.keys);
  expect(fortress).toBe(true);
});
