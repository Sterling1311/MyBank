#!/bin/sh
php bin/console doctrine:migrations:migrate --no-interaction --env=prod --allow-no-migration || true
php bin/console dbal:run-sql "INSERT IGNORE INTO category (name, type, created_at) VALUES ('Food', 'expense', NOW()), ('Transport', 'expense', NOW()), ('Housing', 'expense', NOW()), ('Health', 'expense', NOW()), ('Entertainment', 'expense', NOW()), ('Shopping', 'expense', NOW()), ('Subscriptions', 'expense', NOW()), ('Other', 'expense', NOW()), ('Salary', 'income', NOW()), ('Benefits', 'income', NOW()), ('Other Income', 'income', NOW())" || true
exec php -S 0.0.0.0:8080 -t public