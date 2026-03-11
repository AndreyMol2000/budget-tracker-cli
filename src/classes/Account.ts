import { promises as fs } from "fs";
import { IAccount } from "../interfaces/IAccount";
import { ITransaction } from "../interfaces/ITransaction";
import { ISummary } from "../interfaces/ISummary";
import { TransactionType } from "../interfaces/TransactionType";
import { escapeCsvValue } from "../utils/escapeCsvValue";

export class Account implements IAccount {
  public readonly id: string;
  public name: string;
  public transactions: ITransaction[];

  constructor(name: string, id?: string, transactions: ITransaction[] = []) {
    this.id = id ?? Account.generateId();
    this.name = name;
    this.transactions = transactions;
  }

  private static generateId(): string {
    return Math.random().toString(36).slice(2, 8);
  }

  public addTransaction(transaction: ITransaction): void {
    this.transactions.push(transaction);
  }

  public removeTransaction(transactionId: string): boolean {
    const initialLength = this.transactions.length;
    this.transactions = this.transactions.filter(
      transaction => transaction.id !== transactionId
    );
    return this.transactions.length !== initialLength;
  }

  public getBalance(): number {
    return this.transactions.reduce((sum, transaction) => {
      return transaction.type === TransactionType.INCOME
        ? sum + transaction.amount
        : sum - transaction.amount;
    }, 0);
  }

  public getSummary(): ISummary {
    const income = this.transactions
      .filter(transaction => transaction.type === TransactionType.INCOME)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expense = this.transactions
      .filter(transaction => transaction.type === TransactionType.EXPENSE)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      balance: income - expense,
      income,
      expense,
      transactionsCount: this.transactions.length
    };
  }

  public getSummaryString(): string {
    const summary = this.getSummary();

    return [
      `Счет: ${this.name}`,
      `ID: ${this.id}`,
      `Баланс: ${summary.balance}`,
      `Доходы: ${summary.income}`,
      `Расходы: ${summary.expense}`,
      `Транзакций: ${summary.transactionsCount}`
    ].join("\n");
  }

  public async exportToCSV(filename: string): Promise<void> {
    const headers = ["id", "amount", "type", "date", "description"];

    const rows = this.transactions.map(transaction => {
      return [
        escapeCsvValue(transaction.id),
        escapeCsvValue(transaction.amount),
        escapeCsvValue(transaction.type),
        escapeCsvValue(transaction.date),
        escapeCsvValue(transaction.description)
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    await fs.writeFile(`${filename}.csv`, csvContent, "utf-8");
  }

  public toString(): string {
    return `${this.name} | Баланс: ${this.getBalance()} | ID: ${this.id}`;
  }
}