Краткие инструкции по локальному запуску, диагностике 503 и деплою

Локальный запуск (production образ):
```bash
# Собрать образ
docker build -t subkeeper:local ./subcal2

# Запустить контейнер (порт 10000)
docker run --rm -p 10000:10000 --name subkeeper_local subkeeper:local
```

Локальный запуск (без Docker):
```bash
cd subcal2
PORT=10000 HOME=/tmp npm start --loglevel=verbose
```

Диагностика ошибок и логов:
- Просмотреть логи контейнера:
```bash
docker ps -a
docker logs <container-id>
```
- Проверить, что `ensure-sqlite-schema.mjs` выполняется:
```bash
node scripts/ensure-sqlite-schema.mjs
```
- Проверить наличие и права на npm кеш:
```bash
docker exec -it <container-id> sh -c 'ls -la $HOME/.npm || ls -la /.npm || true'
```

Amvera / облачный хостинг:
- Установите переменную `HOME=/tmp` в настройках сервиса (или используйте `ENV HOME=/tmp` в Dockerfile). Уже добавлено в `subcal2/Dockerfile`.
- Временно поднимите тариф, чтобы исключить проблему с ресурсами (OOM). Если после увеличения ресурсов проект стартует — причина в тарифе.

CI: в `.github/workflows/docker-build-push.yml` добавлен workflow для сборки и пуша образа на Docker Hub.
