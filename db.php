<?php
    // Database configuration
    $config = [
        'servername' => 'localhost',
        'username'   => 'root',     // Change this to a dedicated database user in production
        'password'   => 'root123',  // New root password
        'dbname'     => 'my_db'
    ];

    try {
        // Create connection with error reporting
        $conn = mysqli_connect(
            $config['servername'],
            $config['username'],
            $config['password']
        );

        if (!$conn) {
            throw new Exception('Database connection failed: ' . mysqli_connect_error());
        }

        // Create database if it doesn't exist
        if (!mysqli_query($conn, "CREATE DATABASE IF NOT EXISTS {$config['dbname']}")) {
            throw new Exception('Error creating database: ' . mysqli_error($conn));
        }

        // Select the database
        if (!mysqli_select_db($conn, $config['dbname'])) {
            throw new Exception('Error selecting database: ' . mysqli_error($conn));
        }

        // Set charset to prevent injection
        if (!mysqli_set_charset($conn, 'utf8mb4')) {
            throw new Exception('Error setting charset: ' . mysqli_error($conn));
        }

        // Set strict mode
        if (!mysqli_query($conn, "SET SESSION sql_mode = 'STRICT_ALL_TABLES'")) {
            throw new Exception('Error setting SQL mode: ' . mysqli_error($conn));
        }

    } catch (Exception $e) {
        // Log error securely
        error_log('Database connection error: ' . $e->getMessage());
        
        // Show generic error to user
        die('A database error occurred. Please try again later.');
    }
?>