import { u128, context, PersistentMap, logging, ContractPromise, env, storage } from "near-sdk-as";
import { AccountId, ERR_INSUFFICIENT_BALANCE, ERR_INVALID_AMOUNT, XCC_GAS, XCC_RESOLVE_GAS } from "../misc/utils";


export const tokenRegistry = new PersistentMap<AccountId, u128>('t');

export function ft_transfer_internal_impl(sender_id: string, receiver_id: string, amount: string, memo: string | null): void {
    oneYocto();
    assert(env.isValidAccountID(receiver_id), "receiver_id not valid");

    const convertedAmount = u128.from(amount); //TODO Check if amount is a valid number

    assert(sender_id != receiver_id, "Sender and receiver should be different");
    assert(convertedAmount > u128.Zero, ERR_INVALID_AMOUNT);

    const balanceOfSender = tokenRegistry.getSome(sender_id);
    assert(balanceOfSender >= convertedAmount, ERR_INSUFFICIENT_BALANCE)
    const balanceOfReceiver = tokenRegistry.get(receiver_id, u128.Zero)!;

    const new_balanceOfSender = u128.sub(balanceOfSender, convertedAmount)
    const new_balanceOfReceiver = u128.add(balanceOfReceiver, convertedAmount)

    tokenRegistry.set(sender_id, new_balanceOfSender);
    tokenRegistry.set(receiver_id, new_balanceOfReceiver);

    logging.log("Transfer " + amount + " from " + sender_id + " to " + receiver_id);

    if (memo) {
        logging.log("Memo: " + memo);
    }
}


@nearBindgen
export class FTT_CALL {
    sender_id: string;
    amount: string;
    msg: string;
}

@nearBindgen
export class FTT_CALLBACK {
    sender_id: string;
    receiver_id: string;
    amount: string;
}

export function ft_transfer_call_impl(receiver_id: string, amount: string, msg: string, memo: string | null): void {
    oneYocto();

    const sender_id = context.predecessor;

    ft_transfer_internal_impl(sender_id, receiver_id, amount, memo);

    ContractPromise.create<FTT_CALL>(
        receiver_id,
        "ft_on_transfer",
        { sender_id, amount, msg },
        XCC_GAS
    ).then<FTT_CALLBACK>(
        context.contractName,
        "ft_resolve_transfer",
        {
            sender_id, receiver_id, amount
        },
        XCC_RESOLVE_GAS
    ).returnAsResult();
}

// This function is implemented on the receving contract.
// As mentioned, the `msg` argument contains information necessary for the receiving contract to know how to process the request. This may include method names and/or arguments. 
// Returns a value, or a promise which resolves with a value. The value is the
// number of unused tokens in string form. For instance, if `amount` is 10 but only 9 are
// needed, it will return "1".
export function ft_on_transfer_impl(sender_id: string, amount: string, msg: string): string {
    throw "not implemented";
}

export function ft_resolve_transfer_impl(sender_id: string, receiver_id: string, amount: string): string {

    const results = ContractPromise.getResults();
    assert(results.length == 1, "This is a callback");
    assert(context.predecessor == context.contractName, "callback");

    if (results[0].failed) {
        logging.log("failed transaction, refund all");
        ft_transfer_internal_impl(receiver_id, sender_id, amount, null);
        return u128.Zero.toString();
    }
    const amountConverted = u128.from(amount);
    let unusedAmount = u128.from(results[0].decode<string>());
   
//rework: not handled when balance of user is too low to refund. Rust does that
    if (unusedAmount > u128.Zero) {
        if (unusedAmount > amountConverted) { //if the foreign contract tries to refund too much, limit it
            unusedAmount = amountConverted;
        }
        const usedAmount = u128.sub(amountConverted, unusedAmount).toString();

        logging.log("attached too much tokens, partial refund");
        ft_transfer_internal_impl(receiver_id, sender_id, unusedAmount.toString(), null);
        return usedAmount;
    }
    return amount;
}


export function ft_total_supply_impl(): string {
    return storage.getSome<string>("max_supply");
}

export function ft_balance_of_impl(account_id: string): string {
    const balance = tokenRegistry.get(account_id, u128.Zero)!;
    return balance.toString();
}

