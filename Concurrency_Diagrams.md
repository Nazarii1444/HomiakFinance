###1. Реєстрація користувача:

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

###2. Оновлення курсів валют:

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

    <img width="953" height="521" alt="image" src="https://github.com/user-attachments/assets/d5055901-5b48-458a-9029-e4bb6c123e62" />

###3. Додавання транзакції з перерахунком валют:

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

    <img width="959" height="429" alt="image" src="https://github.com/user-attachments/assets/32316a9e-5dca-4c53-b5c3-cf27bf29bd87" />

###4. Сповіщення про дедлайн:

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

    <img width="967" height="401" alt="image" src="https://github.com/user-attachments/assets/2c72eb79-6f8a-4cd3-bd19-df28ac31d887" />

###5. Побудова аналітики:

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

    <img width="948" height="593" alt="image" src="https://github.com/user-attachments/assets/576b529f-35d5-425c-b2d7-5c14a7640018" />



