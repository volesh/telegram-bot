import { Context as ContecstTg } from 'telegraf';

export interface Context extends ContecstTg {
  session: {
    type: string;
  };
}
