import { signInWithNearWallet, signOutNearWallet } from "./near-api";
import React from "react";

export function SignInPrompt() {
  return (
    <button style={{ width: "100%" }} onClick={signInWithNearWallet}>
      Connect Wallet
    </button>
  );
}

export function SignOutButton({ accountId }) {
  return (
    <button style={{ float: "right" }} onClick={signOutNearWallet}>
      Sign out {accountId}
    </button>
  );
}
