---
### 1. Реєстрація користувача:

    sequenceDiagram
    participant User
    participant API
    participant DB
    participant EmailService
    participant Queue

    User->>API: POST /register (email, password)
    API->>DB: Insert new user (status=pending)
    API->>Queue: Publish "UserRegistered" event
    Queue-->>EmailService: Consume event
    EmailService->>User: Send confirmation email
    User->>API: GET /confirm?token=abc123
    API->>DB: Update user (status=active)

<img width="975" height="421" alt="image" src="https://github.com/Nazarii1444/HomiakFinance/blob/main/photo_2025-10-29_11-54-47.jpg" />

Pattern: Event-driven + Asynchronous Queue
Надсилання email не блокує основний потік — обробляється фоновим сервісом через чергу.

### 2. Оновлення курсів валют:

    sequenceDiagram
    participant Scheduler
    participant FXService
    participant NBU_API
    participant DB

    Scheduler->>FXService: Trigger hourly update
    FXService->>NBU_API: GET /exchange?json
    NBU_API-->>FXService: Return currency rates
    par Concurrent update
        FXService->>DB: Update USD rates
        FXService->>DB: Update EUR rates
        FXService->>DB: Update GBP rates
    end
    FXService->>Logger: Write update summary

<img width="953" height="521" alt="image" src="https://github.com/Nazarii1444/HomiakFinance/blob/main/photo_2025-10-29_01-32-46.jpg" />

Pattern: Scheduled Worker + Parallel update
Сервіс запускається по таймеру і оновлює курси одночасно для кількох валют.

### 3. Додавання транзакції з перерахунком валют:

    sequenceDiagram
    participant User
    participant API
    participant DB
    participant FXService

    User->>API: POST /transactions (sum=100, curr=USD)
    par
        API->>FXService: GET /convert?from=USD&to=UAH
        API->>DB: Insert transaction (pending)
    end
    FXService-->>API: Return rate 41.23
    API->>DB: Update transaction (final sum in UAH)
    API-->>User: Return "Transaction saved"

<img width="959" height="429" alt="image" src="https://github.com/Nazarii1444/HomiakFinance/blob/main/photo_2025-10-29_01-33-15.jpg" />

Pattern: Parallel external calls
Запит на курс і запис транзакції виконуються одночасно для зменшення затримки.

### 4. Сповіщення про дедлайн:

    sequenceDiagram
    participant GoalService
    participant NotificationTopic
    participant EmailWorker
    participant SMSWorker
    participant User

    GoalService->>NotificationTopic: Publish "GoalDeadlineApproaching"
    par
        NotificationTopic-->>EmailWorker: Deliver event
        NotificationTopic-->>SMSWorker: Deliver event
    end
    EmailWorker->>User: Send email
    SMSWorker->>User: Send SMS

<img width="967" height="401" alt="image" src="https://github.com/Nazarii1444/HomiakFinance/blob/main/photo_2025-10-29_01-33-35.jpg" />

Pattern: Publish/Subscribe
Подія дедлайну розсилається одночасно кільком сервісам-споживачам (email, SMS).

### 5. Побудова аналітики:

    sequenceDiagram
    participant User
    participant AnalyticsAPI
    participant ReadDB
    participant Cache

    User->>AnalyticsAPI: GET /analytics/monthly
    alt Cached result
        AnalyticsAPI->>Cache: Get analytics data
    else Not cached
        AnalyticsAPI->>ReadDB: Query aggregated stats
        AnalyticsAPI->>Cache: Store result
    end
    AnalyticsAPI-->>User: Return JSON report

<img width="948" height="593" alt="image" src="https://github.com/Nazarii1444/HomiakFinance/blob/main/photo_2025-10-29_01-34-05.jpg" />

Pattern: CQRS + Cache-aside
Читання аналітики відділене від транзакційної бази для масштабування і швидкодії.

---
