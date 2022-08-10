import { Worker, NEAR, NearAccount } from "near-workspaces";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;

  const contract = await root.createSubAccount("test-account");

  //test accounts

  const alice = await root.createSubAccount("alice", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });
  const bob = await root.createSubAccount("bob", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });
  const charlie = await root.createSubAccount("charlie", {
    initialBalance: NEAR.parse("30 N").toJSON(),
  });

  // Get wasm file path from package.json test script in folder above
  await contract.deploy(process.argv[2]);
  // JavaScript contracts require calling 'init' function upon deployment
  await contract.call(contract, "init", {});

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract, alice, bob, charlie };
});

test.afterEach(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error);
  });
});

test("returns the default transactions map", async (t) => {
  const { contract } = t.context.accounts;
  const transactions = await contract.view("totalTransactions", {});
  t.is(transactions, 0);
});

test("deposit a transaction", async (t) => {
  const { root, contract, alice } = t.context.accounts;

  const transaction = await root.call(
    contract,
    "deposit",
    {
      frequency: 1,
      payoutAmount: 1000000000000,
      payoutAddress: alice,
    },
    { attachedDeposit: NEAR.parse("1 N").toString() }
  );

  console.log("transaction: ", transaction);

  const transactions = await contract.view("totalTransactions", {});
  t.is(transactions, 1);
});

test("Payout", async (t) => {
  const { root, contract, alice, bob } = t.context.accounts;

  const balance = await alice.balance();
  const available = parseFloat(balance.available.toHuman());

  console.log("root.availableBalance: before ", available);

  const transaction = await root.call(
    contract,
    "deposit",
    {
      frequency: 1,
      payoutAmount: 100000000000,
      payoutAddress: alice,
    },
    { attachedDeposit: NEAR.parse("1 N").toString() }
  );

  console.log("transaction: ", transaction);

  const transfer = await root.call(contract, "transfer", {
    transactionId: "Thu Jan 01 1970 00:00:00 GMT+0000",
  });

  console.log("transfer: ", transfer);

  const balance2 = await alice.balance();
  const available2 = parseFloat(balance.available.toHuman());
  console.log("root.availableBalance: after", available2);
  // const transactions = await contract.view("totalTransactions", {});
  // t.is(transactions, 1);
});
