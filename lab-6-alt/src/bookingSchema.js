import * as v from 'valibot'

const pad = (n) => String(n).padStart(2, '0')

function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Сьогоднішня дата, максимальна дата бронювання (+1 рік) і поточний час
// у місцевому часовому поясі, у форматах <input type="date"> («2026-11-14»)
// і <input type="time"> («18:30»). Такі рядки можна порівнювати як рядки.
export function today() {
  return formatDate(new Date())
}

export function maxBookingDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return formatDate(d)
}

export function nowTime() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const bookingSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(2, "Вкажіть ім'я: щонайменше дві літери"),
    ),
    phone: v.pipe(
      v.string(),
      v.trim(),
      v.regex(/^\+380\d{9}$/, 'Вкажіть телефон у форматі +380XXXXXXXXX'),
    ),
    date: v.pipe(
      v.string(),
      v.minLength(1, 'Оберіть дату'),
      v.regex(/^\d{4}-\d{2}-\d{2}$/, 'Вкажіть дату у форматі РРРР-ММ-ДД'),
      v.check((date) => {
        const parsed = new Date(`${date}T00:00`)
        return !Number.isNaN(parsed.getTime()) && formatDate(parsed) === date
      }, 'Вкажіть коректну календарну дату'),
      v.check((date) => date >= today(), 'Ця дата вже минула'),
      v.check(
        (date) => date <= maxBookingDate(),
        'Столик можна забронювати щонайбільше на рік уперед',
      ),
    ),
    time: v.pipe(
      v.string(),
      v.minLength(1, 'Оберіть час'),
      v.check(
        (time) => time >= '08:00' && time <= '20:00',
        'Столик можна забронювати з 8:00 до 20:00',
      ),
    ),
    guests: v.pipe(
      v.unknown(),
      v.transform(Number),
      v.number(),
      v.integer(),
      v.minValue(1, 'Щонайменше 1 гість'),
      v.maxValue(8, 'Не більше 8 гостей'),
    ),
    comment: v.pipe(
      v.string(),
      v.trim(),
      v.maxLength(200, 'Коментар — до 200 символів'),
    ),
  }),
  v.forward(
    v.check(
      (data) => !data.time || data.date !== today() || data.time > nowTime(),
      'Цей час сьогодні вже минув',
    ),
    ['time'],
  ),
)
