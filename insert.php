<?php
require_once "db.php"; // Ensure this includes your database connection file

if (isset($_POST['signup'])) {
    $ename = mysqli_real_escape_string($conn, $_POST['EquipmentName']);
    $erequest = mysqli_real_escape_string($conn, $_POST['requestedby']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $date = mysqli_real_escape_string($conn, $_POST['date']);
    $purpose = mysqli_real_escape_string($conn, $_POST['purpose']);
    $manufacturer = mysqli_real_escape_string($conn, $_POST['manufacturer']);
    $vendor = mysqli_real_escape_string($conn, $_POST['vendor']);
    $quantity = mysqli_real_escape_string($conn, $_POST['quantity']);
    $price = mysqli_real_escape_string($conn, $_POST['price']);
    $link = mysqli_real_escape_string($conn, $_POST['link']);

    // Use prepared statements to prevent SQL injection
    $stmt = mysqli_prepare($conn, "INSERT INTO equipment_request (ename, erequest, email, date, purpose, manufacturer, vendor, quantity, price, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "ssssssssss", $ename, $erequest, $email, $date, $purpose, $manufacturer, $vendor, $quantity, $price, $link);
        if (mysqli_stmt_execute($stmt)) {
            header("location: firstpage.php");
            exit();
        } else {
            echo "Error: " . mysqli_error($conn);
        }
        mysqli_stmt_close($stmt);
    } else {
        echo "Error in prepared statement: " . mysqli_error($conn);
    }

    mysqli_close($conn);
}
?>
