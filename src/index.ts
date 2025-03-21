import 'dotenv/config'
import { Address, TonClient, beginCell, fromNano } from '@ton/ton';
import { loadStakeEvent } from './decode';

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
    const client = new TonClient({
        endpoint: process.env.END_POINT!,
        apiKey: process.env.API_KEY!,
    });
    const contractAddress = Address.parse(process.env.CONTRACT_ADDRESS!); // address that you want to fetch transactions from

    // let recordLt = BigInt(55037007000001);
    // let recordHash = "v72Oi3/U1qjZkiSK33hygJXSBmPK6+LCk90P2/Jl4oQ=";
    let recordLt = BigInt(0);
    let recordHash = "0x0";
    while (true) {
        // console.log("recordLt:", recordLt);
        // console.log("recordHash:", recordHash);
        try {
            const transactions = recordLt == BigInt(0) ? await client.getTransactions(contractAddress, {
                limit: 50,
            }) : await client.getTransactions(contractAddress, {
                limit: 50,
                lt: recordLt.toString(),
                hash: recordHash,
            });

            for (const tx of transactions.reverse()) {
                if (tx.lt < recordLt) {
                    continue;
                }
                let txHash = tx.hash().toString('base64');
                console.log(txHash);
                console.log(tx.lt.toString());
                recordLt = tx.lt;
                recordHash = tx.hash().toString('base64');

                let bodySlice = tx.outMessages.get(0)?.body!.asSlice()!;
                let body = bodySlice.clone();

                switch (body.loadUint(32)!) {
                    case 1119821542:
                        let loadEvent = loadStakeEvent(bodySlice);
                        console.log("loadEvent amount:", loadEvent.amount);
                        console.log("loadEvent staker:", loadEvent.staker.toString());

                        break;

                    default:
                        break;
                }
                //     // we only process internal messages here because they are used the most
                //     // for external messages some of the fields are empty, but the main structure is similar
                //     const sender = inMsg?.info.src;
                //     const value = inMsg?.info.value.coins;

                //     const originalBody = inMsg?.body.beginParse();
                //     let body = originalBody.clone();
                //     if (body.remainingBits < 32) {
                //         // if body doesn't have opcode: it's a simple message without comment
                //         console.log(`Simple transfer from ${sender} with value ${fromNano(value)} TON`);
                //     } else {
                //         const op = body.loadUint(32);
                //         if (op == 0) {
                //             // if opcode is 0: it's a simple message with comment
                //             const comment = body.loadStringTail();
                //             console.log(
                //                 `Simple transfer from ${sender} with value ${fromNano(value)} TON and comment: "${comment}"`
                //             );
                //         } else if (op == 0x7362d09c) {
                //             // if opcode is 0x7362d09c: it's a Jetton transfer notification

                //             body.skip(64); // skip query_id
                //             const jettonAmount = body.loadCoins();
                //             const jettonSender = body.loadAddressAny();
                //             const originalForwardPayload = body.loadBit() ? body.loadRef().beginParse() : body;
                //             let forwardPayload = originalForwardPayload.clone();

                //             // IMPORTANT: we have to verify the source of this message because it can be faked
                //             const runStack = (await client.runMethod(sender, 'get_wallet_data')).stack;
                //             runStack.skip(2);
                //             const jettonMaster = runStack.readAddress();
                //             const jettonWallet = (
                //                 await client.runMethod(jettonMaster, 'get_wallet_address', [
                //                     { type: 'slice', cell: beginCell().storeAddress(myAddress).endCell() },
                //                 ])
                //             ).stack.readAddress();
                //             if (!jettonWallet.equals(sender)) {
                //                 // if sender is not our real JettonWallet: this message was faked
                //                 console.log(`FAKE Jetton transfer`);
                //                 continue;
                //             }

                //             if (forwardPayload.remainingBits < 32) {
                //                 // if forward payload doesn't have opcode: it's a simple Jetton transfer
                //                 console.log(`Jetton transfer from ${jettonSender} with value ${fromNano(jettonAmount)} Jetton`);
                //             } else {
                //                 const forwardOp = forwardPayload.loadUint(32);
                //                 if (forwardOp == 0) {
                //                     // if forward payload opcode is 0: it's a simple Jetton transfer with comment
                //                     const comment = forwardPayload.loadStringTail();
                //                     console.log(
                //                         `Jetton transfer from ${jettonSender} with value ${fromNano(
                //                             jettonAmount
                //                         )} Jetton and comment: "${comment}"`
                //                     );
                //                 } else {
                //                     // if forward payload opcode is something else: it's some message with arbitrary structure
                //                     // you may parse it manually if you know other opcodes or just print it as hex
                //                     console.log(
                //                         `Jetton transfer with unknown payload structure from ${jettonSender} with value ${fromNano(
                //                             jettonAmount
                //                         )} Jetton and payload: ${originalForwardPayload}`
                //                     );
                //                 }

                //                 console.log(`Jetton Master: ${jettonMaster}`);
                //             }
                //         } else if (op == 0x05138d91) {
                //             // if opcode is 0x05138d91: it's a NFT transfer notification

                //             body.skip(64); // skip query_id
                //             const prevOwner = body.loadAddress();
                //             const originalForwardPayload = body.loadBit() ? body.loadRef().beginParse() : body;
                //             let forwardPayload = originalForwardPayload.clone();

                //             // IMPORTANT: we have to verify the source of this message because it can be faked
                //             const runStack = (await client.runMethod(sender, 'get_nft_data')).stack;
                //             runStack.skip(1);
                //             const index = runStack.readBigNumber();
                //             const collection = runStack.readAddress();
                //             const itemAddress = (
                //                 await client.runMethod(collection, 'get_nft_address_by_index', [{ type: 'int', value: index }])
                //             ).stack.readAddress();

                //             if (!itemAddress.equals(sender)) {
                //                 console.log(`FAKE NFT Transfer`);
                //                 continue;
                //             }

                //             if (forwardPayload.remainingBits < 32) {
                //                 // if forward payload doesn't have opcode: it's a simple NFT transfer
                //                 console.log(`NFT transfer from ${prevOwner}`);
                //             } else {
                //                 const forwardOp = forwardPayload.loadUint(32);
                //                 if (forwardOp == 0) {
                //                     // if forward payload opcode is 0: it's a simple NFT transfer with comment
                //                     const comment = forwardPayload.loadStringTail();
                //                     console.log(`NFT transfer from ${prevOwner} with comment: "${comment}"`);
                //                 } else {
                //                     // if forward payload opcode is something else: it's some message with arbitrary structure
                //                     // you may parse it manually if you know other opcodes or just print it as hex
                //                     console.log(
                //                         `NFT transfer with unknown payload structure from ${prevOwner} and payload: ${originalForwardPayload}`
                //                     );
                //                 }
                //             }

                //             console.log(`NFT Item: ${itemAddress}`);
                //             console.log(`NFT Collection: ${collection}`);
                //         } else {
                //             // if opcode is something else: it's some message with arbitrary structure
                //             // you may parse it manually if you know other opcodes or just print it as hex
                //             console.log(
                //                 `Message with unknown structure from ${sender} with value ${fromNano(
                //                     value
                //                 )} TON and body: ${originalBody}`
                //             );
                //         }
                //     }
                // }
                // console.log(`Transaction Hash: ${tx.hash().toString('hex')}`);
                // console.log(`Transaction LT: ${tx.lt}`);
                // console.log();
            }
            await sleep(6000);

        } catch (error) {
            console.log("ERROR: ", error);

        }
    }
}

main().finally(() => console.log('Exiting...'));