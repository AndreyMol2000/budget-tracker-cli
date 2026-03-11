import { Account } from "../classes/Account";

export interface IAccountManager {
  accounts: Account[];

  addAccount(account: Account): void;
  removeAccount(accountId: string): boolean;
  getAccountById(accountId: string): Account | undefined;
  getAllAccounts(): Account[];
}