# Homiak Finance — Реєстр дефектів


| ID | Тест № | Severity | Назва | Опис | Кроки відтворення | Очікуваний результат | Фактичний результат | Файл / Рядок | Статус |
|----|--------|----------|-------|------|-------------------|---------------------|---------------------|---------------|--------|
| DEF-001 | 71 | Critical | Транзакція з невідомою валютою повертає 500 замість 4xx | При створенні транзакції з валютою, відсутньою в таблиці `currencies`, сервер повертає 500 Internal Server Error замість інформативної помилки 400/422. `ValueError` з `currency_converter.py` не перехоплюється в `transaction_router.py` і пробивається до глобального error handler FastAPI | 1. Авторизуватися<br>2. POST `/api/transactions`<br>3. Тіло: `{"name":"Test","amount":100,"kind":1,"category_name":"food","currency":"XYZ"}` | 400 або 422 з повідомленням `"Unsupported currency 'XYZ'"` | 500 Internal Server Error. В `logs.log`: `ValueError: Rate for source currency 'XYZ' not found`. Capital не змінено (транзакція не збережена через rollback), але користувач отримує неінформативну помилку | `src/transactions/transaction_router.py:75` → `currency_converter.py:29` | 🔴 Open |
| DEF-002 | 32 | Major | PATCH транзакції не перераховує capital | При оновленні `amount` або `kind` існуючої транзакції через `PATCH /api/transactions/{id}`, `User.capital` залишається без змін. Ендпоінт `update_transaction` виконує лише `setattr` + `commit` без виклику `convert_to_user_currency` для коригування capital. Це призводить до розсинхронізації capital з реальними даними транзакцій | 1. Створити income tx `amount=500`, `capital` стає `500.0`<br>2. PATCH `/api/transactions/{id}` з `{"amount":1000}`<br>3. GET `/api/users/me` → перевірити `capital` | `capital`=`1000.0` (різниця між старим і новим amount додана) | `capital` залишається `500.0`. Транзакція оновлена до `amount=1000`, але capital не перераховано. Аналогічна проблема при зміні `kind` з INCOME на EXPENSE | `src/transactions/transaction_router.py:95-123` | 🔴 Open |
| DEF-003 | 1, 8 | Major | Signup не нормалізує email до lowercase | Ендпоінт `/api/auth/login` виконує `email.strip().lower()` перед пошуком, але `/api/auth/signup` передає email як є з `UserCreate` схеми. Якщо користувач зареєструється як `Test@Example.COM`, email зберігається в БД у mixedcase. Перевірка дублікатів через `get_user_by_email` може бути case-sensitive, що теоретично дозволяє створити два акаунти з одним email в різному регістрі | 1. POST `/api/auth/signup` з `"email":"Test@Example.COM"`<br>2. POST `/api/auth/signup` з `"email":"test@example.com"` | Друга реєстрація → 400 `"Email already registered"` | Залежно від колації БД: PostgreSQL з default колацією може пропустити дублікат. Email в профілі відображається як `Test@Example.COM` замість нормалізованого `test@example.com` | `src/auth/auth_router.py:36-37` | 🟡 Open |
| DEF-004 | 26, 27 | Medium | `category_name` не валідується проти `ALLOWED_EXPENSES_CATEGORIES` | Список `ALLOWED_EXPENSES_CATEGORIES` визначено в `transaction_router.py` (24 категорії), але жоден ендпоінт не перевіряє `category_name` проти цього списку. Будь-який рядок (1-64 символи) приймається як категорія. Це робить список мертвим кодом і дозволяє сміттєві дані: `category_name="asdfgh"`, `category_name="💩"` тощо | 1. POST `/api/transactions`<br>2. Тіло: `{"name":"Test","amount":10,"kind":0,"category_name":"nonexistent_category","currency":"USD"}` | 400/422 з повідомленням що категорія не підтримується | 201 Created. Транзакція створена з `category_name="nonexistent_category"`. Фронтенд може не мати відповідної іконки/кольору для невідомої категорії | `src/transactions/transaction_router.py:14-39, 57-92` | 🟡 Open |
| DEF-005 | 71 | Medium | Транзакція з `currency=null` викликає 500 | Поле `currency` у `TransactionCreate` має тип `Optional[str]` з `default=None`. Якщо створити транзакцію без вказання `currency`, значення `None` передається в `convert_to_user_currency`, де виконується `transaction_currency.strip().upper()` — виклик `.strip()` на `None` призводить до `AttributeError` | 1. POST `/api/transactions`<br>2. Тіло: `{"name":"Test","amount":50,"kind":1,"category_name":"food"}` (без поля `currency`) | 201 з конвертацією по дефолтній валюті користувача, або 422 з вимогою вказати валюту | 500 Internal Server Error. Traceback: `AttributeError: 'NoneType' object has no attribute 'strip'` у `currency_converter.py:25` | `src/transactions/schemas.py:16` → `currency_converter.py:25` | 🔴 Open |
| DEF-006 | 41 | Low | Пошук цілей `?q=` використовує exact match замість partial match | Параметр пошуку `q` в `GET /api/goals` фільтрує через `Goal.name == q` (точний збіг). Користувач, який шукає `?q=Car`, знайде лише ціль з `name` рівно `"Car"`, але НЕ знайде `"New Car"`, `"Car Insurance"` чи `"car"`. Очікувана поведінка — часткове, регістронезалежне порівняння (ILIKE) | 1. Створити ціль `name="New Car"`<br>2. GET `/api/goals?q=Car`<br>3. GET `/api/goals?q=New Car` | `?q=Car` → повертає ціль `"New Car"`; `?q=car` → також повертає | `?q=Car` → `[]` (порожній масив); лише `?q=New Car` → знаходить ціль. Case-sensitive exact match непридатний для реального UX пошуку | `src/goals/goal_router.py:58-59` | 🟡 Open |
| DEF-007 | 29 | Low | Дубльоване поле `amount` у схемі `TransactionOut` | У `TransactionOut` поле `amount` оголошено двічі: `amount: Money` та `amount: Decimal`. Pydantic v2 використовує останнє оголошення (`Decimal`), ігноруючи перше (`Money` з `ge=0`, `max_digits=14`). Це означає, що у відповіді API поле `amount` не має валідаційних обмежень з `Money` типу. Функціонально не впливає на поточну логіку (значення вже збережене в БД), але може викликати плутанину при генерації OpenAPI-схеми та у Swagger UI відображається некоректний тип | 1. Відкрити `/docs`<br>2. Перевірити схему `TransactionOut`<br>3. Порівняти з вихідним кодом `schemas.py` | Одне поле `amount` з типом `Decimal(14,2)` та обмеженням `ge=0` | Два поля `amount` в коді; Swagger показує тип останнього оголошення. Python warning: `UserWarning: Field "amount" has conflict` може з'являтися в логах при старті | `src/transactions/schemas.py:30-33` | 🟢 Open |

---

## Статистика

| Severity | Кількість | Open | Fixed |
|----------|-----------|------|-------|
| Critical | 2 | 2 | 0 |
| Major | 2 | 2 | 0 |
| Medium | 2 | 2 | 0 |
| Low | 1 | 1 | 0 |
| **Разом** | **7** | **7** | **0** |

---

## Легенда

| Позначка | Severity | Опис |
|----------|----------|------|
| 🔴 | Critical | Серйозний збій: 500-помилка, втрата даних, неможливість використання фічі |
| 🟠 | Major | Некоректна бізнес-логіка, розсинхронізація даних |
| 🟡 | Medium | Функціональний недолік, workaround існує |
| 🟢 | Low | Косметичний дефект, мертвий код, попередження |
