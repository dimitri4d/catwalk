import {
  NearBindgen,
  NearContract,
  near,
  call,
  view,
  UnorderedMap,
  assert,
} from "near-sdk-js";

const STORAGE_COST: bigint = BigInt("1000000000000000000000");

interface Transactions {
  transactionId: string; //transactions unique identifiyer
  balance: string; //total amount that remains for transaction
  frequency: number; //specify how often(block height?)
  payoutAmount: string; //amount per each interval
  payoutAddress: string; //where the funds are going
  nextPayoutDate: number; //block of next payout
  isActive: boolean; //is the transaction active, pausable
  ownerAccount: string; //owner of the funds for the transaction object
}
class Transaction {
  transactionId: string; //transactions unique identifiyer
  balance: string; //total amount that remains for transaction
  frequency: number; //specify how often(block height?)
  payoutAmount: string; //amount per each interval
  payoutAddress: string; //where the funds are going
  nextPayoutDate: string; //block of next payout
  isActive: boolean; //is the transaction active, pausable
  ownerAccount: string; //owner of the funds for the transaction object

  constructor({
    transactionId,
    balance,
    frequency,
    payoutAmount,
    payoutAddress,
    nextPayoutDate,
    isActive,
    ownerAccount,
  }: Transaction) {
    this.transactionId = transactionId;
    this.balance = balance;
    this.frequency = frequency;
    this.payoutAmount = payoutAmount;
    this.payoutAddress = payoutAddress;
    this.nextPayoutDate = nextPayoutDate;
    this.isActive = isActive;
    ownerAccount = ownerAccount;
  }
}

function addSeconds(numOfSeconds, date = new Date()) {
  date.setSeconds(date.getSeconds() + numOfSeconds);
  return date;
}

// The @NearBindgen decorator allows this code to compile to Base64.
@NearBindgen
class Catwalk extends NearContract {
  transactions: UnorderedMap;

  constructor() {
    //execute the NEAR Contract's constructor
    super();
    this.transactions = new UnorderedMap("map-uid-1");
  }

  default() {
    return new Catwalk();
  }

  @call
  deposit({
    frequency,
    payoutAmount,
    payoutAddress,
  }: {
    frequency: number;
    payoutAmount: number;
    payoutAddress: string;
  }) {
    let ownerAccount = near.predecessorAccountId();
    let balance: bigint = near.attachedDeposit() as bigint;
    let isActive = true;

    //TODO: create unique id
    let transactionId = `${new Date()}`;
    let nextPayoutDate = `${addSeconds(30)}`;

    let toTransfer = balance;

    // register balance lets register it, which increases storage

    assert(balance > STORAGE_COST, `Attach at least ${STORAGE_COST} yoctoNEAR`);

    // Subtract the storage cost to the amount to transfer
    toTransfer -= STORAGE_COST;

    let deposit = new Transaction({
      transactionId,
      balance: balance.toString(),
      frequency,
      payoutAmount: payoutAmount.toString(),
      payoutAddress,
      nextPayoutDate,
      isActive,
      ownerAccount,
    });

    near.log(`addTransaction() called, name: ${transactionId}`);

    this.transactions.set(transactionId, deposit);
    near.log(`Saving Transaction ${JSON.stringify(deposit)}`);

    return deposit;
  }

  @view
  getTransactionById({ transactionId }: { transactionId: string }) {
    return this.transactions.get(transactionId);
  }

  //
  @call
  transfer({ transactionId }: { transactionId: string }) {
    const transaction = this.transactions.get(transactionId) as Transaction;
    near.log(`Transaction ${JSON.stringify(transaction)}`);

    let to = transaction.payoutAddress;
    let amount = transaction.payoutAmount;

    // : string = this.donations.keys.get(i) as string

    let promise = near.promiseBatchCreate(to);
    near.promiseBatchActionTransfer(promise, BigInt(amount));
  }

  @view
  totalTransactions() {
    return this.transactions.len();
  }

  @view
  getTransactions(): UnorderedMap {
    near.log(`transactions list ${this.transactions}`);
    return this.transactions;
  }
}
