# ЛР-6 (альтернативна версія): TanStack Form + Valibot

Альтернативна реалізація форми бронювання столика з `lab-6/` (§4.8), де `react-hook-form` і `@hookform/resolvers` замінено на `@tanstack/react-form`, а схему `BookingForm` і `api.js` переписано з `zod` на `valibot`. Форма підписки `SubscribeForm` (§4.7) залишена без змін.

## Команди

`npm install` виконуйте в корені репозиторію `react-labs`, решту — у теці `lab-6-alt/`:

- `npm run dev`: dev-сервер на http://localhost:5173
- `npm run lint`: ESLint
- `npm run format:check`: перевірка форматування Prettier
- `npm run build`: production-збірка в `dist/`

## Порівняння з React Hook Form і Zod

### Бібліотеки та їхні версії

- **Основна версія (`lab-6`)**: `react-hook-form` `7.92.0`, `zod` `4.6.7`, `@hookform/resolvers` `7.0.6`.
- **Альтернативна версія (`lab-6-alt`)**: `@tanstack/react-form` `1.33.5`, `valibot` `1.5.0` (пакет `zod` `4.6.7` залишено в залежностях лише для `SubscribeForm` із §4.7).

### Таблиця відповідників

| React Hook Form + Zod (`lab-6`)            | TanStack Form + Valibot (`lab-6-alt`)                                               | Примітка                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `register('name')`                         | `<form.Field name="name">` + `value`, `onBlur`, `onChange` + `useRef` (`fieldRefs`) | Поля стали контрольованими; фокус передається через `fieldRefs`                                       |
| `<Controller name="guests" ... />`         | `<form.Field name="guests">`                                                        | Пропси `field.state.value` та `field.handleChange` передаються в `GuestsStepper`                      |
| `useWatch({ control, name: 'comment' })`   | `<form.Subscribe selector={(state) => state.values.comment}>`                       | Оновлює лише лічильник символів без рендеру всього `BookingForm`                                      |
| `handleSubmit(onValid)`                    | `form.handleSubmit()` + `onSubmit` / `onSubmitInvalid`                              | Дані додатково проганяються через `safeParse(bookingSchema, value)` для `trim()` і перетворення типів |
| `zodResolver(bookingSchema)`               | `validators: { onDynamic: bookingSchema }`                                          | Адаптер не потрібен: `@tanstack/react-form` і `valibot` підтримують Standard Schema напряму           |
| `reset()` (+ `setFocus('name')` перед ним) | `form.reset()` (+ `fieldRefs.current.name?.focus()`)                                | Скидає значення, метадані полів та `submissionAttempts`                                               |

### Розмір JS-файлу збірки (`npm run build`)

- `lab-6` (`react-hook-form` + `@hookform/resolvers` + `zod`): `dist/assets/index-Bg9HDuec.js` — **354.24 kB** (**109.70 kB** gzip)
- `lab-6-alt` (`@tanstack/react-form` + `valibot` + `zod` у `SubscribeForm`): `dist/assets/index-yGZ43ezr.js` — **352.95 kB** (**105.30 kB** gzip)

Навіть з урахуванням того, що `zod` досі входить у збірку через `SubscribeForm`, альтернативний бандл вийшов меншим завдяки модульній структурі `valibot` (tree-shaking) та відсутності окремого резолвера.

### Компоненти, що рендеряться під час введення в полі «Ім'я»

Перевірено логікою підписок обох бібліотек (`Highlight updates when components render` у React DevTools):

- **`lab-6` (React Hook Form)**: поля, зареєстровані через `register`, є неконтрольованими — значення живуть у DOM-елементах. Під час введення тексту в полі «Ім'я» **не перерендериться жоден React-компонент** (рендер відбувається лише при зміні стану помилки на `blur` або під час виправлення).
- **`lab-6-alt` (TanStack Form)**: поля є контрольованими через `<form.Field>`, а стан форми ізольовано в `@tanstack/react-store`. Під час введення в полі «Ім'я» рендериться **лише відповідний компонент `APIField` (`Field` для `name`)** — сам `BookingForm`, сусідні поля (`phone`, `date`, `time`, `guests`, `comment`), лічильник `Subscribe` та `SubscribeForm` не рендеряться.

### Дати останніх релізів (npmjs.com)

- `react-hook-form` (`7.92.0`): **11 листопада 2026 р.**
- `zod` (`4.6.7`): **12 жовтня 2026 р.**
- `@hookform/resolvers` (`7.0.6`): **11 листопада 2026 р.**
- `@tanstack/react-form` (`1.33.5`, `latest`): **11 серпня 2026 р.** (пререліз `2.0.0-alpha.3` — 23 жовтня 2026 р.)
- `valibot` (`1.5.0`): **9 вересня 2026 р.**

### Яку пару бібліотек обрати для наступного проєкту

Для наступного проєкту з типовими формами я обрав би **React Hook Form + Zod** (або React Hook Form + Valibot, якщо критичний мінімальний розмір клієнтського JS-бандла). У зв'язці з React Hook Form неконтрольовані поля через `register`, вбудований режим `mode: 'onTouched'` і автоматичний фокус на першій помилці працюють «з коробки» та потребують помітно менше коду. У TanStack Form для тієї самої поведінки довелося вручну підключати `fieldRefs` для фокусу та описувати власну `validationLogic`, а у Valibot — обгортати крос-польові перевірки у `v.forward` і стежити за різницею `result.output` замість `result.data`. Водночас TanStack Form + Valibot варто розглядати для великих форм зі складною контрольованою логікою та жорсткими вимогами до типізації без зайвих прокладок завдяки Standard Schema.
