import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegrafModule } from 'nestjs-telegraf';
import { envConfig } from 'src/configs/env-config';
import * as LocalSession from 'telegraf-session-local';

import { AppService } from './app.service';
import { AppUpdate } from './app.update';
import { GlobalsSchema, TransactionsSchema } from './database';

const sessions = new LocalSession({ database: 'sessions-db.json' });

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: envConfig.botKey,
    }),
    MongooseModule.forRoot(envConfig.mongoUrl),
    MongooseModule.forFeature([
      { name: 'Global', schema: GlobalsSchema },
      { name: 'Transaction', schema: TransactionsSchema },
    ]),
  ],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
