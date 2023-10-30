import { Document, Model } from 'mongoose';

import { TransactionsSchema } from './database';

export interface Transaction {
  _id: string;
  year: number;
  month: number;
  day: number;
  amount: number;
  type: string;
}

export type TransactionModel = Model<typeof TransactionsSchema & Document>;
