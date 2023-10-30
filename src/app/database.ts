import * as mongoose from 'mongoose';

export const GlobalsSchema = new mongoose.Schema({
  balance: Number,
});

export const TransactionsSchema = new mongoose.Schema({
  year: Number,
  month: Number,
  day: Number,
  amount: Number,
  type: String,
});
