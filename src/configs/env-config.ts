import { config } from 'dotenv';

config();

export const envConfig = {
  botKey: process.env.BOT_KEY,
  mongoUrl: process.env.MONGO_URL,
};
