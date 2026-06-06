# SubKeeper — Развёртывание на Amvera

## Срочный старт (делайте это прямо сейчас)

### 1. Коммитьте все изменения
```bash
git add -A
git commit -m "fix: complete Amvera deployment config"
git push origin main
```

### 2. В панели Amvera — выберите Dockerfile сборку
- Settings → Build section → Build Type: **Docker**
- Dockerfile path: **`./subcal2/Dockerfile`** или **`Dockerfile`** (зависит от структуры)

### 3. Установите переменные окружения
В панели найдите "Environment Variables" и добавьте:
```
HOME=/tmp
NPM_CONFIG_CACHE=/tmp/.npm
NODE_ENV=production
PORT=10000
AUTOBUILD=false
```

### 4. Установите порт
- Container Port: **10000**
- External Port: **10000**

### 5. Нажмите Rebuild и ждите

---

## Файлы уже подготовлены

- `amvera.yml` (в корне и в `subcal2/`) — правильная конфиг для Amvera
- `Dockerfile` — Node 22, HOME=/tmp, npm кеш, оптимизирован для облачных сборок
- `scripts/start.sh` — отказывает от долгих install/build по умолчанию
- `.npmrc` — npm кеш в /tmp, engine-strict=false
- `package.json` — требование Node >=22

---

## Что делать если ошибка повторится

1. Проверьте статус сборки в Deployments / Builds
2. Если 429 (rate limit) — подождите 10 минут
3. Если "Configuration error" — убедитесь что используется Dockerfile сборка, не buildpack
4. Пришлите скриншот ошибки из логов
