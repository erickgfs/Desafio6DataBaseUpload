import fs from 'fs';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const checkFile = fs.promises.stat(path);
    if (!checkFile) {
      throw new AppError('Fail file');
    }
    const file = fs.readFileSync(path, 'utf-8');

    const fileLinesWithTitles = file.split('\n');

    const fileLines = fileLinesWithTitles.splice(1, fileLinesWithTitles.length);

    const fileLinesFiltered = fileLines.filter(line => line !== '');

    const rawTransaction = fileLinesFiltered.map(line => {
      const values = line.split(', ');
      const transaction: RequestDTO = {
        title: values[0],
        type: values[1] === 'income' ? 'income' : 'outcome',
        value: Number(values[2]),
        category: values[3],
      };
      return transaction;
    });

    const transactions: Transaction[] = [];

    for (const transaction of rawTransaction) {
      const createdTransaction = await createTransaction.execute(transaction);
      transactions.push(createdTransaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
