CREATE DATABASE IF NOT EXISTS veleja_admin;
USE veleja_admin;

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL
);

-- Insere um usuário admin padrão com senha 'admin123'
-- Se o usuário já existir, a senha é redefinida para 'admin123'
INSERT INTO admins (email, senha_hash) 
VALUES ('admin@veleja.com', '$2y$10$IsXNxx56TEf0RqSq4rLK3ecQ3fU3M3E0q3rD8quHWUGZxzGgXeNxK')
ON DUPLICATE KEY UPDATE senha_hash = '$2y$10$IsXNxx56TEf0RqSq4rLK3ecQ3fU3M3E0q3rD8quHWUGZxzGgXeNxK';
