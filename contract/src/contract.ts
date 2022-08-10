import {
  NearBindgen,
  NearContract,
  near,
  call,
  view,
  LookupMap,
} from "near-sdk-js";

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
  transactions: LookupMap;

  constructor() {
    //execute the NEAR Contract's constructor
    super();
    this.transactions = new LookupMap("a");
  }

  default() {
    return new Catwalk();
  }

  // transactionId: string; //transactions unique identifiyer
  // balance: BigInt; //total amount that remains for transaction
  // frequency: number; //specify how often(block height?)
  // payoutAmount: BigInt; //amount per each interval
  // payoutAddress: string; //where the funds are going
  // nextPayoutDate: number; //block of next payout
  // isActive: boolean; //is the transaction active, pausable
  // ownerAccount: string; //owner of the funds for the transaction object

  @call
  deposit({ frequency, payoutAmount, payoutAddress }): void {
    let ownerAccount = near.predecessorAccountId();
    let balance: bigint = near.attachedDeposit() as bigint;
    let isActive = true;

    //TODO: create unique id
    let transactionId = `${new Date()}`;
    let nextPayoutDate = `${addSeconds(30)}`;

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

    near.log(
      `addTransaction() called, name: ${transactionId}, specs: ${JSON.stringify(
        deposit
      )}`
    );

    this.transactions.set(transactionId, deposit);
    near.log(`Saving Transaction ${deposit}`);
  }

  //
  //   @call
  //   transfer({ to, amount }: { to: string, amount: BigInt }) {
  //     let promise = near.promiseBatchCreate(to)
  //     near.promiseBatchActionTransfer(promise, amount)
  //   }

  // @view indicates a 'view method' or a function that returns
  // the current values stored on the blockchain. View calls are free
  // and do not cost gas.

  // @view
  // getTransactions(): LookupMap {
  //   near.log(`The current greeting is ${this.transactions}`);
  //   return this.transactions;
  // }

  // @call indicates that this is a 'change method' or a function
  // that changes state on the blockchain. Change methods cost gas.
  // For more info -> https://docs.near.org/docs/concepts/gas
}
