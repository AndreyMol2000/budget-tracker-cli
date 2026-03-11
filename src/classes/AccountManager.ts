import { IAccountManager } from "../interfaces/IAccountManager";
import { Account } from "./Account";

export class AccountManager implements IAccountManager {
  public accounts: Account[];

  constructor(accounts: Account[] = []) {
    this.accounts = accounts;
  }

  public addAccount(account: Account): void {
    this.accounts.push(account);
  }

  public removeAccount(accountId: string): boolean {
    const initialLength = this.accounts.length;
    this.accounts = this.accounts.filter(account => account.id !== accountId);
    return this.accounts.length !== initialLength;
  }

  public getAccountById(accountId: string): Account | undefined {
    return this.accounts.find(account => account.id === accountId);
  }

  public getAllAccounts(): Account[] {
    return this.accounts;
  }
}