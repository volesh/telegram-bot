import {
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { names, reverseNames } from 'src/configs/names';
import { Telegraf } from 'telegraf';

import { balanceBtns, defaultBtns, minusBtns, periodBtns } from './app.buttons';
import { AppService } from './app.service';
import { Context } from './context.interface';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly servie: AppService,
  ) {}

  private kkk = 100;
  @Start()
  async start(ctx: Context) {
    await ctx.reply('Вибери дію', defaultBtns());
  }
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @Hears('Переглянути')
  async checkAction(ctx: Context) {
    await ctx.reply('Оберіть дію', balanceBtns());
  }

  @Hears('Поточний баланс')
  async getBalance(ctx: Context) {
    const balance = await this.servie.getBalance();
    await ctx.reply(`🟢 <b>Баланс - <u>${balance}</u></b>`, {
      parse_mode: 'HTML',
    });
    await ctx.reply('Оберіть дію', defaultBtns());
  }

  @Hears('За період')
  async period(ctx: Context) {
    await ctx.reply('Оберіть дію', periodBtns());
  }

  @Hears('Назад')
  async back1(ctx: Context) {
    await ctx.reply('Оберіть дію', defaultBtns());
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @Hears('Зняти')
  async Minus(ctx: Context) {
    await ctx.reply('Куди витратили,', minusBtns());
  }
  @Hears('Продукти')
  @Hears('Відпочинок')
  @Hears('Квартплата')
  @Hears('Інше')
  @Hears('Транспорт')
  @Hears('Вивід')
  @Hears('Добавити')
  @Hears('Загальні витрати')
  @Hears('Щоденні витрати')
  async func(ctx: any) {
    ctx.session.type = ctx.match[0];

    if (
      ctx.match[0] === 'Загальні витрати' ||
      ctx.match[0] === 'Щоденні витрати'
    ) {
      await ctx.reply(
        'Введи рік та місяць у форматі 04.2023, або період часу 04.2023-06.2023',
      );
    } else {
      await ctx.reply('Введи суму');
    }
  }

  @On('text')
  async text(@Message('text') text: string, @Ctx() ctx: any) {
    if (ctx.session.type === 'Добавити') {
      if (typeof Number(text) === 'number') {
        const balance = await this.servie.updateBalance(Number(text));
        await ctx.reply(`Кошти додано`);
        await ctx.reply(`🟢 <b>Баланс - <u>${balance}</u></b>`, {
          parse_mode: 'HTML',
        });
      } else {
        await ctx.reply(`Введи число`);
      }
      await ctx.reply('Оберіть дію', defaultBtns());
    } else if (
      ctx.session.type === 'Загальні витрати' ||
      ctx.session.type === 'Щоденні витрати'
    ) {
      if (ctx.session.type === 'Загальні витрати') {
        await this.getGeneralData(ctx.session.type, text, ctx);
      } else if (ctx.session.type === 'Щоденні витрати') {
        await this.getEveryData(ctx.session.type, text, ctx);
      }
      await ctx.reply('Оберіть дію', defaultBtns());
    } else {
      await this.spend(text, names[ctx.session.type], ctx);
      await ctx.reply('Оберіть дію', defaultBtns());
    }
  }

  async getGeneralData(type: string, text: string, ctx: Context) {
    const data = await this.servie.getGeneral(text);
    if (data.length) {
      const messageArray = data.map((item) => {
        const { totalAmount, type } = item;
        const typeDescription = reverseNames[type];

        return `🟢${typeDescription}: ${totalAmount}`;
      });

      const message = messageArray.join('\n');
      await ctx.reply(message);
    } else {
      await ctx.reply('Даних немає');
    }
  }

  async getEveryData(type: string, text: string, ctx: Context) {
    const data = await this.servie.getEvery(text);
    if (Object.keys(data).length > 0) {
      let message = '';
      for (const dateKey in data) {
        if (data.hasOwnProperty(dateKey)) {
          const items = data[dateKey];
          const messageArray = items.map((item) => {
            const typeDescription = reverseNames[item.type];
            return `🔻 ${typeDescription} - ${item.amount}`;
          });

          message += `🟢 ${dateKey}:\n${messageArray.join('\n')}\n`;
        }
      }
      await ctx.reply(message);
    } else {
      await ctx.reply('Даних немає');
    }
  }

  async spend(text: string, type: string, ctx: Context) {
    if (typeof Number(text) !== 'number') {
      await ctx.reply(`Введи число`);
    } else {
      const date = new Date();
      const balance = await this.servie.createSpend({
        date,
        type,
        value: Number(text),
      });
      await ctx.reply(`🟢 <b>Баланс - <u>${balance}</u></b>`, {
        parse_mode: 'HTML',
      });
    }
  }
}
