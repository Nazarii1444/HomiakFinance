# Homiak Finance — Smoke Tests

> Усього smoke-тестів: **15**

## Сервер та інфраструктура

| № | Title | Steps | Expected Result | Priority |
|---|-------|-------|-----------------|----------|
| S-01 | Health check — сервер запущено | GET `/health/` | 200; `{"status":"OK"}` | Critical |
| S-02 | X-Process-Time присутній у відповіді | GET `/health/`; перевірити заголовки | Заголовок `X-Process-Time` є в response; значення — float-рядок | Critical |
| S-03 | Swagger UI доступний | GET `/docs` | 200; HTML сторінка Swagger UI без помилок у браузері | High |

## Автентифікація

| № | Title | Steps | Expected Result | Priority |
|---|-------|-------|-----------------|----------|
| S-04 | Реєстрація нового користувача | POST `/api/auth/signup` з `{"username":"smokeuser","email":"smoke@test.com","password":"Smoke1!Pass"}` | 200; тіло містить `access_token` та `refresh_token` | Critical |
| S-05 | Логін зареєстрованого користувача | POST `/api/auth/login` з `{"email":"smoke@test.com","password":"Smoke1!Pass"}` | 200; тіло містить `access_token` та `refresh_token` | Critical |
| S-06 | Захищений ендпоінт без токена | GET `/api/users/me` без заголовка `Authorization` | 401 Unauthorized | Critical |
| S-07 | Захищений ендпоінт з валідним токеном | GET `/api/users/me` з `Authorization: Bearer <token>` з тесту S-05 | 200; тіло містить поле `email` = `"smoke@test.com"` | Critical |

## Користувачі

| № | Title | Steps | Expected Result | Priority |
|---|-------|-------|-----------------|----------|
| S-08 | GET /api/users/me повертає профіль | Авторизуватись (S-05); GET `/api/users/me` | 200; JSON з полями `id_`, `username`, `email`, `capital`, `default_currency` | High |
| S-09 | PATCH /api/users/me оновлює поле | PATCH `/api/users/me` з `{"timezone":"Europe/Kyiv"}` | 200; `timezone` = `"Europe/Kyiv"` у відповіді | High |

## Транзакції

| № | Title | Steps | Expected Result | Priority |
|---|-------|-------|-----------------|----------|
| S-10 | Створення income транзакції | POST `/api/transactions` з `{"name":"Smoke TX","amount":100,"kind":1,"category_name":"food","currency":"USD"}` | 201; тіло містить `id_`, `amount`=`100`, `new_capital` > 0 | Critical |
| S-11 | Список транзакцій повертає масив | GET `/api/transactions` | 200; тіло — JSON-масив (може бути порожнім) | High |
| S-12 | DELETE транзакції повертає capital | DELETE `/api/transactions/{id}` з id з тесту S-10 | 200; тіло містить `message`=`"Transaction has been deleted"` та `new_capital` | High |

## Цілі (Goals)

| № | Title | Steps | Expected Result | Priority |
|---|-------|-------|-----------------|----------|
| S-13 | Створення цілі | POST `/api/goals` з `{"name":"Smoke Goal","summ":1000.0,"saved":0.0}` | 201; тіло містить `id_`, `name`=`"Smoke Goal"`, `summ`=`1000.0` | High |
| S-14 | Список цілей повертає масив | GET `/api/goals` | 200; тіло — JSON-масив | High |

## Валюти

| № | Title | Steps | Expected Result | Priority |
|---|-------|-------|-----------------|----------|
| S-15 | GET курс USD завжди повертає 1.0 | GET `/api/currencies/USD` | 200; тіло = `1.0` | High |

---

## Порядок виконання

```
S-01 → S-02 → S-03          # інфраструктура
  ↓
S-04 → S-05 → S-06 → S-07   # auth flow (кожен залежить від попереднього)
  ↓
S-08 → S-09                  # профіль
  ↓
S-10 → S-11 → S-12           # транзакції
  ↓
S-13 → S-14                  # цілі
  ↓
S-15                          # валюти
```

> S-04 — S-15 виконуються з токеном, отриманим у **S-05**.  
> Якщо S-01 або S-04/S-05 падають — подальше виконання зупиняється.

---

## Критерії проходження

| Умова | Рішення |
|-------|---------|
| Всі 15 тестів пройдено | ✅ Система готова до роботи |
| Падає S-01 (health) | 🔴 Стоп — сервер недоступний, решту не запускати |
| Падає S-04 або S-05 (auth) | 🔴 Стоп — авторизація зламана, решта безглузда |
| Падає будь-який Critical | 🔴 Деплой заблоковано, потрібен хотфікс |
| Падає High (не Critical) | 🟡 Деплой під питанням, потрібен аналіз |

---

## Відповідність до автоматизованих тестів

| Smoke | Автотест | Файл |
|-------|----------|------|
| S-01 | `test_get_rate_usd_always_returns_1` (перевірка сервера) | `test_currencies.py` |
| S-04 | `test_signup_success` (#1) | `test_auth.py` |
| S-05 | `test_login_success` (#7) | `test_auth.py` |
| S-06 | `test_protected_without_token` (#11) | `test_auth.py` |
| S-07 | `test_protected_with_valid_token` (#13) | `test_auth.py` |
| S-08 | `test_get_me_returns_correct_user` (#13) | `test_users.py` |
| S-09 | `test_update_username` (#16) | `test_users.py` |
| S-10 | `test_create_income_returns_201` (#14) | `test_transactions.py` |
| S-11 | `test_list_returns_200` (#19) | `test_transactions.py` |
| S-12 | `test_delete_success` (#27) | `test_transactions.py` |
| S-13 | `test_create_goal_returns_201` (#36) | `test_goals.py` |
| S-14 | `test_list_goals` (#39) | `test_goals.py` |
| S-15 | `test_get_rate_usd_always_returns_1` (#49) | `test_currencies.py` |

