import "regenerator-runtime/runtime";
import React from "react";

import "./assets/global.css";

import { setTransaction } from "./near-api";
import { SignInPrompt, SignOutButton } from "./ui-components";

const BOATLOAD_OF_GAS = 300000000000000;
const BLOCK_FREQUENCY = 1;

export default function App() {
  const [formValues, setFormValues] = React.useState({
    amount: 0,
    payout: 0,
    frequency: BLOCK_FREQUENCY,
    address: "",
  });

  const isValidForm = React.useMemo(() => {
    if (
      formValues.amount === 0 ||
      formValues.payout > formValues.amount ||
      formValues.frequency === 0 ||
      formValues.address === ""
    )
      return false;
    return true;
  }, [formValues]);

  const isSignedIn = window.walletConnection.isSignedIn();

  function handleSubmit(e) {
    e.preventDefault();
    if (isValidForm) {
      setTransaction(
        formValues.amount,
        BOATLOAD_OF_GAS,
        formValues.payout,
        formValues.frequency,
        formValues.address
      );
    }
  }

  return (
    <>
      {isSignedIn && <SignOutButton accountId={window.accountId} />}
      <main>
        <h1>Catwalk</h1>
        <form onSubmit={handleSubmit} className="change">
          <label htmlFor="amountInput">Deposit Amount:</label>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="number"
              id="amountInput"
              value={formValues.amount}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  amount: e.target.value ? parseInt(e.target.value) : 0,
                })
              }
            />
          </div>
          <label htmlFor="payoutInput">Payout Amount:</label>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="number"
              id="payoutInput"
              value={formValues.payout}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  payout: e.target.value ? parseInt(e.target.value) : 0,
                })
              }
            />
          </div>
          <label htmlFor="frequencyInput">Payout Frequency:</label>
          <div style={{ marginBottom: "10px" }}>
            <select
              style={{
                width: "100%",
                backgroundColor: "#444",
                color: "#fff",
                padding: "5px",
                fontSize: "18px",
                border: "none",
              }}
              type="number"
              id="frequencyInput"
              value={formValues.frequency}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  frequency: e.target.value ? parseInt(e.target.value) : 0,
                })
              }
            >
              <option value={BLOCK_FREQUENCY}>Daily</option>
              <option value={BLOCK_FREQUENCY}>Weekly</option>
              <option value={BLOCK_FREQUENCY}>Monthly</option>
              <option value={BLOCK_FREQUENCY}>Annually</option>
            </select>
          </div>
          <label htmlFor="addressInput">Deposit Address:</label>
          <div style={{ marginBottom: "10px" }}>
            <input
              autoComplete="off"
              id="addressInput"
              value={formValues.address}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  address: e.target.value ? e.target.value : "",
                })
              }
            />
          </div>
          {isSignedIn ? (
            <button>
              <span>Submit</span>
              <div className="loader"></div>
            </button>
          ) : (
            <SignInPrompt />
          )}
        </form>
      </main>
    </>
  );
}
