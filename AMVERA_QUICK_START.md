# SubKeeper — Быстрый старт на Amvera

## Что сделать прямо сейчас (3 простых шага)

### Шаг 1: Убедитесь, что в Git'е свежие файлы
```bash
git add -A
git commit -m "fix: Node 22, npm cache, Dockerfile build"
git push origin main
```

### Шаг 2: В панели Amvera обновите конфигурацию

Откройте панель → ваш проект → Настройки сборки / Build settings.

**Выберите:**
- **Build Type**: `Docker` (или "Build from Dockerfile")
- **Dockerfile path**: `./Dockerfile` или `subcal2/Dockerfile`
- **Context**: `./subcal2` или корень репо (в зависимости от структуры)

**Добавьте (или обновите) переменные окружения runtime:**
```
HOME=/tmp
NPM_CONFIG_CACHE=/tmp/.npm
NODE_ENV=production
PORT=10000
```

**Ресурсы:**
- Memory: `1G` (временно, для отладки)
- CPU: `0.5`

### Шаг 3: Перезапустите деплой

Нажмите "Rebuild" / "Redeploy" и дождитесь логов. Если всё ОК, в логах должны появиться строки:
```
Found .next/BUILD_ID — assuming production build is present.
✓ Ready in ...
```

Если видите ошибки — пришлите последние 200 строк логов.

---

## Что было сделано в проекте

1. **Dockerfile** — Node 22, HOME=/tmp, npm кеш в /tmp, запуск start.sh
2. **amvera.yml** — явная сборка из Dockerfile, 1G памяти, правильные env vars
3. **.npmrc** — npm кеш в /tmp, engine-strict=false (чтобы не отказывался при Node 20)
4. **scripts/start.sh** — по умолчанию отказывается от долгих install/build (они в Dockerfile)
5. **package.json** — требование Node >=22
6. **.nvmrc** — указание Node 22 для инструментов, которые его читают

---

## Если ошибка все ещё есть

1. Проверьте, собирается ли образ из Dockerfile (должны быть строки "FROM node:22-alpine")
2. Убедитесь, что используется Node 22 (в логах должно быть "node: v22.x.x")
3. Проверьте ресурсы — памяти должно быть минимум 1G
4. Пришлите логи сборки (последние 300 строк) — проанализирую

---

## Команды для локальной проверки

```bash
# Собрать и запустить локально
DOCKER_BUILDKIT=0 docker build --progress=plain -t subkeeper:local ./subcal2
docker run --rm -p 10000:10000 subkeeper:local

# После запуска откройте http://localhost:10000
```
