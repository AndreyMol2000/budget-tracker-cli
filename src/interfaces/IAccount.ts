import { ITransaction } from "./ITransaction";
import { ISummary } from "./ISummary";

export interface IAccount {
  readonly id: string;
  name: string;
  transactions: ITransaction[];

  addTransaction(transaction: ITransaction): void;
  removeTransaction(transactionId: string): boolean;
  getBalance(): number;
  getSummary(): ISummary;
  getSummaryString(): string;
  exportToCSV(filename: string): Promise<void>;
}