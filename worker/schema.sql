CREATE TABLE IF NOT EXISTS birthdays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL, -- Format: YYYY-MM-DD or MM-DD (We'll use MM-DD for recurring)
    image_url TEXT,
    custom_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
