import { Markup } from 'telegraf';

export function defaultBtns() {
  return Markup.keyboard([['Переглянути', 'Зняти'], ['Добавити']]).oneTime();
}

export function balanceBtns() {
  return Markup.keyboard([
    ['Поточний баланс', 'За період'],
    ['Назад'],
  ]).oneTime();
}

export function minusBtns() {
  return Markup.keyboard([
    ['Продукти', 'Відпочинок'],
    ['Квартплата', 'Інше'],
    ['Транспорт', 'Вивід'],
    ['Назад'],
  ]).oneTime();
}

export function periodBtns() {
  return Markup.keyboard([
    ['Загальні витрати', 'Щоденні витрати'],
    ['Назад'],
  ]).oneTime();
}
