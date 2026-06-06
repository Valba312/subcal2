Инструкция по локальным шрифтам Inter

Чтобы сборка не зависела от сети, положите файлы шрифтов в `public/fonts/`.

Требуемые имена и рекомендуемые файлы (woff2):
- `Inter-Regular.woff2` (400)
- `Inter-Medium.woff2` (500)
- `Inter-Bold.woff2` (700)

Источники: скачайте шрифты вручную с https://fonts.google.com/specimen/Inter или с официального репозитория Inter.

После размещения файлов выполните:
```bash
npm ci
npm run build
```

Файл `app/layout.tsx` уже настроен на использование `next/font/local` и будет подхватывать эти файлы.
