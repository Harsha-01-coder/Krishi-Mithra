CREATE DATABASE IF NOT EXISTS agri_assistant;

USE agri_assistant;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(50),
    query_type VARCHAR(20),
    query_text TEXT,
    weather_temp FLOAT,
    weather_condition VARCHAR(50),
    soil_moisture FLOAT,
    soil_ph FLOAT,
    recommended_crops TEXT
);