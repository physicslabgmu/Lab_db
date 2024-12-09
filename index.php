<?php
session_start();

// If user is already logged in, redirect to mainpage
if (isset($_SESSION['user_id'])) {
    header("Location: mainpage.html");
    exit();
}

// Otherwise, redirect to login page
header("Location: login.php");
exit();
?>
