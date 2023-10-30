import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GlobalsSchema, TransactionsSchema } from './database';
import { Transaction } from './interfaces';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Global')
    private readonly globalsModel: Model<typeof GlobalsSchema>,
    @InjectModel('Transaction')
    private readonly transactionModel: Model<typeof TransactionsSchema>,
  ) {}

  async getBalance(): Promise<number> {
    const data: { balance: number } = await this.globalsModel.findById(
      '654008b8f185a03d8a7904fd',
    );
    return data.balance;
  }

  async updateBalance(balance: number): Promise<number> {
    const prev = await this.getBalance();
    const data: { balance: number } = await this.globalsModel.findByIdAndUpdate(
      '654008b8f185a03d8a7904fd',
      { balance: prev + balance },
      { new: true },
    );
    return data.balance;
  }

  async createSpend(data: { date: Date; value: number; type: string }) {
    const balance = await this.updateBalance(data.value * -1);
    const year = data.date.getFullYear();
    const month = data.date.getMonth() + 1;
    const day = data.date.getDate();
    await this.transactionModel.create({
      year,
      month,
      day,
      type: data.type,
      amount: data.value,
    });

    return balance;
  }

  async getGeneral(
    filter: string,
  ): Promise<{ totalAmount: number; type: string }[]> {
    const data = filter.split('-');
    let response: { totalAmount: number; type: string }[] = [];
    if (data.length === 1) {
      const year = Number(data[0].split('.')[1]);
      const month = Number(data[0].split('.')[0]);
      response = await this.transactionModel
        .aggregate([
          {
            $match: {
              year,
              month,
            },
          },
          {
            $group: {
              _id: '$type',
              totalAmount: { $sum: '$amount' },
            },
          },
          {
            $project: {
              _id: 0,
              type: '$_id',
              totalAmount: 1,
            },
          },
        ])
        .exec();
    } else if (data.length === 2) {
      const [startMonth, startYear] = data[0].split('.');
      const [endMonth, endYear] = data[1].split('.');

      const startMonthNumber = Number(startMonth);
      const startYearNumber = Number(startYear);
      const endMonthNumber = Number(endMonth);
      const endYearNumber = Number(endYear);

      const monthRange = Array.from(
        { length: endMonthNumber - startMonthNumber + 1 },
        (_, i) => startMonthNumber + i,
      );
      response = await this.transactionModel
        .aggregate([
          {
            $match: {
              year: {
                $in: [startYearNumber, endYearNumber],
              },
              month: {
                $in: monthRange,
              },
            },
          },
          {
            $group: {
              _id: '$type',
              totalAmount: { $sum: '$amount' },
            },
          },
          {
            $project: {
              _id: 0,
              type: '$_id',
              totalAmount: 1,
            },
          },
        ])
        .exec();
    }
    return response;
  }

  async getEvery(filter: string): Promise<{ [key: string]: Transaction[] }> {
    const data = filter.split('-');
    const response = {};
    let results: Transaction[] = [];

    if (data.length === 1) {
      const year = Number(data[0].split('.')[1]);
      const month = Number(data[0].split('.')[0]);
      results = await this.transactionModel.find({ year, month }).lean();
    } else if (data.length === 2) {
      const [startMonth, startYear] = data[0].split('.');
      const [endMonth, endYear] = data[1].split('');

      const startMonthNumber = Number(startMonth);
      const startYearNumber = Number(startYear);
      const endMonthNumber = Number(endMonth);
      const endYearNumber = Number(endYear);

      const monthRange = Array.from(
        { length: endMonthNumber - startMonthNumber + 1 },
        (_, i) => startMonthNumber + i,
      );
      results = await this.transactionModel
        .find({
          year: { $in: [startYearNumber, endYearNumber] },
          month: { $in: monthRange },
        })
        .lean();
    }

    for (const result of results) {
      const dateKey = `${result.day}.${result.month}.${result.year}`;
      if (!response[dateKey]) {
        response[dateKey] = [];
      }
      response[dateKey].push(result);
    }

    return response;
  }
}
