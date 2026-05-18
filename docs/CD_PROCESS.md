# CD Process — HomiakFinance

## Огляд

HomiakFinance використовує **Blue-Green Deployment** стратегію через GitHub Actions + Docker Compose.

```
GitHub Push/Tag
      │
      ▼
┌─────────────────────────────────────────────┐
│  GitHub Actions CI/CD Pipeline              │
│  1. 🐳 Build Docker image                   │
│  2. 🔍 Lint (ruff)                          │
│  3. 🧪 Tests & Coverage                     │
│  4a. 🧪 Staging Deploy   ← тільки develop   │
│  4b. 🚀 Blue-Green Deploy ← main або v*.*.* │
│  5. 🏷️ Release (якщо тег)                   │
│  6. 📋 Summary                              │
└─────────────────────────────────────────────┘
```

---

## Blue-Green Deployment

### Схема

```
           ┌──────────────┐
           │    Nginx     │  :8000  ← єдина точка входу
           └──────┬───────┘
                  │ proxy_pass
        ┌─────────┴─────────┐
        │                   │
   ┌────▼─────┐        ┌────▼─────┐
   │  BLUE    │        │  GREEN   │
   │ :8001    │        │ :8002    │
   │ backend  │        │ backend  │
   └────┬─────┘        └────┬─────┘
        │                   │
   ┌────▼─────┐        ┌────▼─────┐
   │ postgres │        │ postgres │
   │  blue    │        │  green   │
   └──────────┘        └──────────┘
```

### Процес деплою (`scripts/deploy.sh`)

1. Визначити **активний слот** (blue/green) з файлу `.active_slot`
2. Збудувати новий Docker образ з тегом `APP_VERSION`
3. Запустити **неактивний слот** (`docker compose up`)
4. Виконати **health check** нового слоту (до 10 спроб × 6с)
5. Перемкнути **Nginx** на новий слот (`nginx -s reload`)
6. Перевірити трафік через Nginx
7. Зупинити **старий слот**
8. Записати новий активний слот у `.active_slot`

### Rollback (`scripts/rollback.sh`)

Автоматичний rollback спрацьовує якщо:
- Health check нового слоту провалився
- Nginx traffic verification провалився
- CI deploy job завершився з помилкою

Ручний rollback:
```bash
./scripts/rollback.sh "manual: опис причини"
```

---

## Структура файлів

```
HomiakFinance/
├── docker-compose.blue.yml         # Blue slot (порт 8001)
├── docker-compose.green.yml        # Green slot (порт 8002)
├── docker-compose.nginx.yml        # Nginx proxy (порт 8000)
├── docker-compose.staging.yml      # Staging середовище (порт 8080)
├── docker-compose.monitoring.yml   # Prometheus + Grafana
├── docker-compose.backend.yml      # Dev/CI оточення
├── nginx/
│   ├── nginx.blue.conf             # Nginx → blue
│   ├── nginx.green.conf            # Nginx → green
│   └── nginx.conf                  # Активний конфіг (генерується deploy.sh)
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml          # Конфіг scrape jobs
│   │   └── alerts.yml              # Правила алертів
│   └── grafana/
│       └── provisioning/           # Auto-provisioning datasources/dashboards
├── scripts/
│   ├── deploy.sh                   # Blue-Green deploy (production)
│   ├── deploy-staging.sh           # Single-slot deploy (staging)
│   └── rollback.sh                 # Rollback до попереднього слоту
├── .active_slot                    # Поточний активний слот (blue/green)
└── .github/workflows/ci.yml        # CI/CD pipeline
```

---

## Середовища

| Середовище | Тригер | URL | Стратегія |
|------------|--------|-----|-----------|
| **Staging** | push до `develop` | `http://localhost:8080` | Single-slot (простий restart) |
| **Production** | push до `main` або тег `v*.*.*` | `http://localhost:8000` | Blue-Green |
| **CI/Test** | кожен push/PR | — | docker-compose.backend.yml |

### Staging vs Production

- **Staging** — перевірка нових фіч перед виходом у production; single-slot, без Nginx.
- **Production** — blue-green: нульовий downtime, миттєвий rollback.

Рекомендований flow: `feature-branch` → PR → `develop` (staging deploy) → merge → `main` (production deploy)

---

## Змінні середовища та GitHub Secrets

### `.env` файл (backend/.env — production)
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=homiakdb
SECRET_KEY=<strong-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### `.env.staging` файл (backend/.env.staging)
```env
DB_NAME=homiakdb_staging
SECRET_KEY=<staging-secret>   # задається через STAGING_SECRET_KEY secret
# ... інші змінні аналогічні .env
```

### GitHub Secrets (для self-hosted runner або SSH деплою)
| Secret | Опис |
|--------|------|
| `DEPLOY_HOST` | IP/hostname сервера (якщо SSH деплой) |
| `DEPLOY_KEY` | SSH private key |
| `DEPLOY_USER` | SSH user |
| `STAGING_SECRET_KEY` | SECRET_KEY для staging середовища |
| `GRAFANA_PASSWORD` | Пароль Grafana admin (default: admin) |

---

## Self-Hosted Runner

Для реального деплою на сервер потрібен self-hosted runner:

```bash
# На сервері:
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-linux-x64-2.317.0.tar.gz
tar xzf ./actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/Nazarii1444/HomiakFinance --token <TOKEN>
./run.sh
```

Токен отримати: GitHub repo → Settings → Actions → Runners → New self-hosted runner.

---

## Versioning (Semantic Versioning)

| Тип зміни | Приклад | Команда |
|-----------|---------|---------|
| Bug fix | `1.0.0 → 1.0.1` | `git tag v1.0.1 && git push origin v1.0.1` |
| New feature | `1.0.0 → 1.1.0` | `git tag v1.1.0 && git push origin v1.1.0` |
| Breaking change | `1.0.0 → 2.0.0` | `git tag v2.0.0 && git push origin v2.0.0` |
| Release candidate | `v1.1.0-rc.1` | `git tag v1.1.0-rc.1 && git push origin v1.1.0-rc.1` |

При пуші тегу автоматично:
1. Запускається повний CI pipeline
2. Виконується Blue-Green deploy
3. Створюється GitHub Release з changelog

---

## Моніторинг

### Health endpoint
```
GET /health/
```
Відповідь:
```json
{
  "status": "ok",
  "db": "ok",
  "version": "v1.2.3"
}
```

| Поле | Значення | Опис |
|------|----------|------|
| `status` | `ok` / `degraded` | Загальний статус |
| `db` | `ok` / `error` | З'єднання з PostgreSQL |
| `version` | `v1.2.3` | Поточна версія |

### Моніторинг після деплою (в deploy.sh)
- 10 спроб health check × 6 секунд = до 60 секунд очікування
- При провалі — автоматичний rollback

### Prometheus + Grafana (повноцінний моніторинг)

Запуск monitoring stack:
```bash
docker compose -f docker-compose.monitoring.yml up -d
```

| Сервіс | URL | Credentials |
|--------|-----|-------------|
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3001 | admin / admin |

**Що моніториться:**
- `homiak-backend-blue` (порт 8001) — production blue slot
- `homiak-backend-green` (порт 8002) — production green slot
- `homiak-backend-staging` (порт 8080) — staging

**Алерти** (`monitoring/prometheus/alerts.yml`):

| Алерт | Умова | Severity |
|-------|-------|----------|
| `BackendDown` | backend недоступний > 1 хв | critical |
| `BackendDegraded` | жоден production слот не healthy | warning |
| `StagingDown` | staging недоступний > 5 хв | warning |

**Конфіги:**
- `monitoring/prometheus/prometheus.yml` — scrape jobs
- `monitoring/prometheus/alerts.yml` — правила алертів
- `monitoring/grafana/provisioning/` — auto-provisioning datasources

---

## Відновлення після збою (Runbook)

### Scenario 1: Deploy завершився помилкою в CI
→ GitHub Actions автоматично виконує `rollback.sh`

### Scenario 2: Деградація після деплою
```bash
# Перевірити поточний стан
cat .active_slot
curl http://localhost:8000/health/

# Ручний rollback
./scripts/rollback.sh "production issue: <опис>"
```

### Scenario 3: Обидва слоти недоступні
```bash
# Перезапустити blue (базовий)
docker network create homiak-net || true
docker compose -f docker-compose.blue.yml up -d
docker compose -f docker-compose.nginx.yml up -d
echo "blue" > .active_slot
```

### Scenario 4: Staging deploy failed
```bash
# Перевірити логи
docker compose -f docker-compose.staging.yml logs --tail=50

# Зупинити staging
docker compose -f docker-compose.staging.yml down
```

---

## Міграція на Azure (майбутнє)

Поточний pipeline (GitHub Actions + self-hosted runner + Docker Compose) можна адаптувати до Azure без переписування логіки:

| Компонент | Зараз | Azure еквівалент |
|-----------|-------|-----------------|
| Self-hosted runner | Власний сервер | Azure VM з GitHub runner |
| Docker Compose blue/green | docker-compose.\*.yml | Azure Container Apps (slots) |
| Nginx proxy | docker-compose.nginx.yml | Azure Application Gateway |
| Prometheus | docker-compose.monitoring.yml | Azure Monitor |
| Grafana | docker-compose.monitoring.yml | Azure Managed Grafana |
| `.env` файли | локально | Azure Key Vault + Secrets |

**Кроки для переходу на Azure:**
1. Замінити `runs-on: self-hosted` → Azure VM runner або Azure Container Jobs
2. Додати Azure login step: `azure/login@v1`
3. Замінити `docker compose up` → `az containerapp update`
4. Секрети перенести з GitHub Secrets → Azure Key Vault
5. Моніторинг → Azure Monitor / Application Insights
