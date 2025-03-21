import { Slice } from '@ton/core';

export function loadStakeEvent(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1119821542) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _staker = sc_0.loadAddress();
    return { $$type: 'StakeEvent' as const, amount: _amount, staker: _staker };
}