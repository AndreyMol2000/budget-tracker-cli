import inquirer from "inquirer";
import { AccountManager } from "./AccountManager";
import { Account } from "./Account";
import { Transaction } from "./Transaction";
import { TransactionType } from "../interfaces/TransactionType";

export class ApplicationController {
  public accountManager: AccountManager;

  constructor() {
    this.accountManager = new AccountManager(this.createSeedAccounts());
  }

  private createSeedAccounts(): Account[] {
    const account1 = new Account("Основной счет");
    account1.addTransaction(
      new Transaction(5000, TransactionType.INCOME, "2026-03-01", "Зарплата")
    );
    account1.addTransaction(
      new Transaction(1200, TransactionType.EXPENSE, "2026-03-02", "Продукты")
    );
    account1.addTransaction(
      new Transaction(700, TransactionType.EXPENSE, "2026-03-03", "Такси")
    );

    const account2 = new Account("Накопления");
    account2.addTransaction(
      new Transaction(10000, TransactionType.INCOME, "2026-03-01", "Пополнение")
    );
    account2.addTransaction(
      new Transaction(2500, TransactionType.EXPENSE, "2026-03-04", "Покупка техники")
    );

    return [account1, account2];
  }

  public async start(): Promise<void> {
    let isRunning = true;

    while (isRunning) {
      console.clear();

      const accounts = this.accountManager.getAllAccounts();

      const choices = accounts.map(account => ({
        name: `${account.name} | Баланс: ${account.getBalance()} | ID: ${account.id}`,
        value: account.id
      }));

      choices.push(
        { name: "Создать новый счет", value: "create" },
        { name: "Выйти", value: "exit" }
      );

      const answer = await inquirer.prompt<{ selectedAction: string }>([
        {
          type: "list",
          name: "selectedAction",
          message: "Выберите счет или действие:",
          choices
        }
      ]);

      if (answer.selectedAction === "create") {
        await this.createAccount();
      } else if (answer.selectedAction === "exit") {
        isRunning = false;
      } else {
        const account = this.accountManager.getAccountById(answer.selectedAction);
        if (account) {
          await this.watchAccount(account);
        }
      }
    }

    console.clear();
    console.log("Приложение завершено");
  }

  public async createAccount(): Promise<void> {
    console.clear();

    const answer = await inquirer.prompt<{ name: string }>([
      {
        type: "input",
        name: "name",
        message: "Введите название нового счета:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Название не может быть пустым";
          }
          return true;
        }
      }
    ]);

    const account = new Account(answer.name.trim());
    this.accountManager.addAccount(account);

    console.log(`Счет "${account.name}" создан. ID: ${account.id}`);
    await this.pause();
  }

  public async watchAccount(account: Account): Promise<void> {
    let isWatching = true;

    while (isWatching) {
      console.clear();

      console.log(account.getSummaryString());
      console.log("\nТранзакции:");

      if (account.transactions.length === 0) {
        console.log("Нет транзакций");
      } else {
        account.transactions.forEach((transaction, index) => {
          console.log(`${index + 1}. ${transaction.toString()}`);
        });
      }

      const answer = await inquirer.prompt<{ action: string }>([
        {
          type: "list",
          name: "action",
          message: "Выберите действие:",
          choices: [
            { name: "Добавить транзакцию", value: "add" },
            { name: "Удалить транзакцию", value: "removeTransaction" },
            { name: "Экспортировать в CSV", value: "export" },
            { name: "Удалить счет", value: "removeAccount" },
            { name: "Назад", value: "back" }
          ]
        }
      ]);

      switch (answer.action) {
        case "add":
          await this.addTransaction(account);
          break;
        case "removeTransaction":
          await this.removeTransaction(account);
          break;
        case "export":
          await this.exportTransactionsToCSV(account);
          break;
        case "removeAccount": {
          const deleted = await this.removeAccount(account);
          if (deleted) {
            isWatching = false;
          }
          break;
        }
        case "back":
          isWatching = false;
          break;
      }
    }
  }

  public async addTransaction(account: Account): Promise<void> {
    console.clear();

    const today = new Date().toISOString().split("T")[0];

    const answers = await inquirer.prompt<{
      amount: string;
      type: TransactionType;
      date: string;
      description: string;
    }>([
      {
        type: "input",
        name: "amount",
        message: "Введите сумму:",
        validate: (input: string) => {
          const value = Number(input);
          if (Number.isNaN(value) || value <= 0) {
            return "Введите число больше нуля";
          }
          return true;
        }
      },
      {
        type: "list",
        name: "type",
        message: "Выберите тип транзакции:",
        choices: [
          { name: "Доход", value: TransactionType.INCOME },
          { name: "Расход", value: TransactionType.EXPENSE }
        ]
      },
      {
        type: "input",
        name: "date",
        message: "Введите дату в формате YYYY-MM-DD:",
        default: today,
        validate: (input: string) => {
          const regex = /^\d{4}-\d{2}-\d{2}$/;
          if (!regex.test(input)) {
            return "Дата должна быть в формате YYYY-MM-DD";
          }
          return true;
        }
      },
      {
        type: "input",
        name: "description",
        message: "Введите описание:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Описание не может быть пустым";
          }
          return true;
        }
      }
    ]);

    const transaction = new Transaction(
      Number(answers.amount),
      answers.type,
      answers.date,
      answers.description.trim()
    );

    account.addTransaction(transaction);

    console.log("Транзакция добавлена");
    await this.pause();
  }

  public async removeTransaction(account: Account): Promise<void> {
    console.clear();

    if (account.transactions.length === 0) {
      console.log("У этого счета нет транзакций");
      await this.pause();
      return;
    }

    const answer = await inquirer.prompt<{ transactionId: string }>([
      {
        type: "list",
        name: "transactionId",
        message: "Выберите транзакцию для удаления:",
        choices: account.transactions.map(transaction => ({
          name: transaction.toString(),
          value: transaction.id
        }))
      }
    ]);

    const confirm = await inquirer.prompt<{ confirmed: boolean }>([
      {
        type: "confirm",
        name: "confirmed",
        message: "Подтвердить удаление?",
        default: false
      }
    ]);

    if (!confirm.confirmed) {
      console.log("Удаление отменено");
      await this.pause();
      return;
    }

    const removed = account.removeTransaction(answer.transactionId);

    console.log(removed ? "Транзакция удалена" : "Не удалось удалить транзакцию");
    await this.pause();
  }

  public async removeAccount(account: Account): Promise<boolean> {
    console.clear();

    const confirm = await inquirer.prompt<{ confirmed: boolean }>([
      {
        type: "confirm",
        name: "confirmed",
        message: `Удалить счет "${account.name}"?`,
        default: false
      }
    ]);

    if (!confirm.confirmed) {
      console.log("Удаление счета отменено");
      await this.pause();
      return false;
    }

    const removed = this.accountManager.removeAccount(account.id);

    console.log(removed ? "Счет удален" : "Не удалось удалить счет");
    await this.pause();

    return removed;
  }

  public async exportTransactionsToCSV(account: Account): Promise<void> {
    console.clear();

    const answer = await inquirer.prompt<{ filename: string }>([
      {
        type: "input",
        name: "filename",
        message: "Введите имя файла без расширения:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Имя файла не может быть пустым";
          }
          return true;
        }
      }
    ]);

    try {
      await account.exportToCSV(answer.filename.trim());
      console.log(`Файл ${answer.filename.trim()}.csv успешно создан`);
    } catch (error) {
      console.log("Ошибка при экспорте в CSV");
      console.log(error);
    }

    await this.pause();
  }

  private async pause(): Promise<void> {
    await inquirer.prompt([
      {
        type: "input",
        name: "pause",
        message: "Нажмите Enter, чтобы продолжить"
      }
    ]);
  }
}