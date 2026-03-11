import { ITransaction } from "../interfaces/ITransaction";
import { TransactionType } from "../interfaces/TransactionType";

export class Transaction implements ITransaction {
  public readonly id: string;
  public amount: number;
  public type: TransactionType;
  public date: string;
  public description: string;

  constructor(
    amount: number,
    type: TransactionType,
    date: string,
    description: string,
    id?: string
  ) {
    this.id = id ?? Transaction.generateId();
    this.amount = amount;
    this.type = type;
    this.date = date;
    this.description = description;
  }

  private static generateId(): string {
    return Math.random().toString(36).slice(2, 8);
  }

  public toString(): string {
    const sign = this.type === TransactionType.INCOME ? "+" : "-";
    return `${sign}${this.amount} | ${this.date} | ${this.description} | id: ${this.id}`;
  }
}