# SubKeeper — калькулятор подписок

Next.js 14 (App Router) + TypeScript, Tailwind, shadcn/ui-style, Prisma + SQLite, Zustand, react-hook-form + zod, i18n (ru/en), Chart.js, Vitest.

## Быстрый старт

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
# http://localhost:3000
# главная — лендинг SubKeeper, калькулятор — /calculator
```

### Docker
```bash
docker-compose up --build
```

## Структура
- `app/` — страницы (Landing, Dashboard, Subscriptions, Analytics, Assistant, Settings)
- `app/api/` — API маршруты (subscriptions, assistant/stream)
- `prisma/schema.prisma` — модели: User, Subscription, ExchangeRate, AuditLog
- `prisma/seed.ts` — демо-данные
- `store/` — Zustand
- `lib/` — утилиты (валюты, i18n)
- `components/` — формы и компоненты
- Тесты: `vitest`, `@testing-library/*`

## Примечания
- Ассистент пока работает в режиме мока через SSE.
- Импорт/экспорт CSV/JSON, поиск/фильтры, массовые операции и proration — будут добавлены на следующем шаге.
- Графики подключены через `react-chartjs-2` (пример на странице Аналитики).
- По умолчанию локаль `ru`; переключение будет добавлено в Settings.
- Проект запускается **без ключей**.


## Что исправлено в этой сборке

- Удалены обрывы строк и символы `...`, из-за которых TSX-файлы не компилировались.
- Пересобраны файлы `app/layout.tsx`, `app/page.tsx`, `app/dashboard/page.tsx`, `app/globals.css` в рабочем виде.
- Добавлен минимальный `tailwind.config.js` (если его не было).
- Сохранены ваши конфиги (`package.json`, `next.config.js`, `postcss.config.js`, .eslintrc, .prettierrc).

### Быстрый старт

```bash
npm install
npm run dev
# откройте http://localhost:3000
```
