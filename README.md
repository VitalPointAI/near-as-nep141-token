near-as-nep141-token (WIP, community project)
==================

This project contains an example implementation of the NEAR Fungible Token Standard, consisting of:

- NEP-141 Core: [NEP141]
- NEP-145 Storage Management: [NEP145]
- NEP-148 Metadata: [NEP148]

Quick Start
---------------

To deploy this contract to testnet:

1. Prerequisites:
   - Make sure you've installed [Node.js] ≥ 12
   - You have a testnet wallet to use
2. Install dependencies: `yarn install`
3. Set your testnet wallet, where you want to deploy your contract, in `/src/config.js` or via `process.env.CONTRACT_ID`
4. Run `yarn build:deploy`
5. Call `init_token(metadata: FungibleTokenMetadata, max_supply: string)` on your contract to initialize your token

Example call via near-cli:

```cmd
Windows
near call <wallet>.testnet init_token "{ \"metadata\": { \"spec\": \"ft-1.0.0\", \"name\": \"Test-Token\", \"symbol\": \"TST\" , \"icon\": \"\" , \"reference\": \"\" , \"reference_hash\": \"\" , \"decimals\": 10   }, \"max_supply\": \"150000000000000000000000\"}" --accountId <wallet>.testnet --gas 100000000000000
```

Now you'll have deployed the contract to your wallet on NEAR TestNet!

Exploring The Code
---------------

- The "backend" code lives in the `/contract` folder.
- `/contract/index.ts` is used to export the public accessible endpoints.
- Actual implementation code is splitted into the `/contract/nep/<standard-number>.ts` files
- `/contract/misc/utils.ts` contains some helper methods.

Open Tasks
---------------

- [ ] Implementing spec and testrunner tests
- [ ] Fix ft_transfer_call


Further Documents
---------------

- Explaining the near accountsystem and subaccounts: [Near accounts]
- Near-cli documentation: [near-cli]
- Testnet Wallet: [Near Testnet Wallet]
- Github issues of this repo: [Github Issues]

  [NEAR accounts]: https://docs.near.org/docs/concepts/account
  [NEAR Testnet Wallet]: https://wallet.testnet.near.org/
  [near-cli]: https://github.com/near/near-cli
  [NEP141]: https://github.com/near/NEPs/blob/master/specs/Standards/FungibleToken/Core.md
  [NEP145]: https://github.com/near/NEPs/blob/master/specs/Standards/StorageManagement.md
  [NEP148]: https://github.com/near/NEPs/blob/master/specs/Standards/FungibleToken/Metadata.md
  [Github Issues]: https://github.com/pixeldapps/near-as-nep141-token/issues
