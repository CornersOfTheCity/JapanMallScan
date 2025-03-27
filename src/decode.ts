import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export function loadStakeEvent(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1119821542) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _staker = sc_0.loadAddress();
    return { $$type: 'StakeEvent' as const, amount: _amount, staker: _staker };
}

//************************* CreateHuntEmit *******************************/

export function loadHunt(slice: Slice) {
    const sc_0 = slice;
    const _huntId = sc_0.loadIntBig(257);
    const _type = sc_0.loadUintBig(8);
    const _price = sc_0.loadCoins();
    const _startTime = sc_0.loadIntBig(257);
    const _endTime = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _amount = sc_1.loadIntBig(257);
    const _selld = sc_1.loadIntBig(257);
    const _userBuy = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _ownerships = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_1);
    return { $$type: 'Hunt' as const, huntId: _huntId, type: _type, price: _price, startTime: _startTime, endTime: _endTime, amount: _amount, selld: _selld, userBuy: _userBuy, ownerships: _ownerships };
}

export function loadCreateHuntEmit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2514899494) { throw Error('Invalid prefix'); }
    const _huntId = sc_0.loadIntBig(257);
    const _type = sc_0.loadUintBig(8);
    const _price = sc_0.loadCoins();
    const _startTime = sc_0.loadIntBig(257);
    const _endTime = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _amount = sc_1.loadIntBig(257);
    const _selld = sc_1.loadIntBig(257);
    return { $$type: 'CreateHuntEmit' as const, huntId: _huntId, type: _type, price: _price, startTime: _startTime, endTime: _endTime, amount: _amount, selld: _selld };
}
//************************* BuyEmit *******************************/
export function loadBuyEmit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1315424692) { throw Error('Invalid prefix'); }
    const _huntId = sc_0.loadIntBig(257);
    const _userAddr = sc_0.loadAddress();
    const _amount = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _timeasmp = sc_1.loadIntBig(257);
    return { $$type: 'BuyEmit' as const, huntId: _huntId, userAddr: _userAddr, amount: _amount, timeasmp: _timeasmp };
}

//************************* LotteryDrawEmit *******************************/
export function loadLotteryDrawEmit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1274955844) { throw Error('Invalid prefix'); }
    const _huntId = sc_0.loadIntBig(257);
    const _drawer = sc_0.loadAddress();
    const _winner = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _winAmount = sc_1.loadIntBig(257);
    const _timeStamp = sc_1.loadIntBig(257);
    return { $$type: 'LotteryDrawEmit' as const, huntId: _huntId, drawer: _drawer, winner: _winner, winAmount: _winAmount, timeStamp: _timeStamp };
}

//************************* userClaimBack *******************************/
export function loadUserClaimBackEmit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1780621300) { throw Error('Invalid prefix'); }
    const _huntId = sc_0.loadIntBig(257);
    const _claimer = sc_0.loadAddress();
    const _claimAmount = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _timeStamp = sc_1.loadIntBig(257);
    return { $$type: 'UserClaimBackEmit' as const, huntId: _huntId, claimer: _claimer, claimAmount: _claimAmount, timeStamp: _timeStamp };
}

//************************* winnerClaim *******************************/
export function loadWinnerClaimEmit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 462498381) { throw Error('Invalid prefix'); }
    const _huntId = sc_0.loadIntBig(257);
    const _claimer = sc_0.loadAddress();
    const _claimAmount = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _timeStamp = sc_1.loadIntBig(257);
    return { $$type: 'WinnerClaimEmit' as const, huntId: _huntId, claimer: _claimer, claimAmount: _claimAmount, timeStamp: _timeStamp };
}

//************************* loadWinnerAbondonEmit *******************************/
export function loadWinnerAbondonEmit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4023690496) { throw Error('Invalid prefix'); }
    const _huntId = sc_0.loadIntBig(257);
    const _winner = sc_0.loadAddress();
    const _abondon = sc_0.loadBit();
    const _timeStamp = sc_0.loadIntBig(257);
    return { $$type: 'WinnerAbondonEmit' as const, huntId: _huntId, winner: _winner, abondon: _abondon, timeStamp: _timeStamp };
}






