-- Создание таблицы для справочника ОКВЭД
CREATE TABLE IF NOT EXISTS okved (
    code VARCHAR(10) PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для быстрого поиска по названию
CREATE INDEX IF NOT EXISTS idx_okved_name ON okved(name);