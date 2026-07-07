#!/bin/sh

# Appliquer les migrations
php bin/console doctrine:migrations:migrate --no-interaction --env=prod --allow-no-migration || true

# Insérer les catégories par défaut si elles n'existent pas
php bin/console dbal:run-sql "INSERT IGNORE INTO category (name, type, created_at) VALUES ('Alimentation', 'expense', NOW()), ('Transport', 'expense', NOW()), ('Logement', 'expense', NOW()), ('Sante', 'expense', NOW()), ('Loisirs', 'expense', NOW()), ('Shopping', 'expense', NOW()), ('Abonnements', 'expense', NOW()), ('Divers', 'expense', NOW()), ('Travail', 'income', NOW()), ('Aides', 'income', NOW()), ('Autres', 'income', NOW())" || true

# Démarrer le serveur
exec php -S 0.0.0.0:8080 -t public