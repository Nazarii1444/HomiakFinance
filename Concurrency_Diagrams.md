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
