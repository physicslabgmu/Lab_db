<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - GMU Physics Lab Setup</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="css/styles.css" rel="stylesheet">
</head>
<body class="d-flex flex-column min-vh-100">
    <!-- Header Banner -->
    <div class="header-banner">
        <div class="header-content">
            <h1>George Mason University</h1>
            <p>Physics Laboratory Management System</p>
        </div>
    </div>

    <!-- Main Content -->
    <div class="container my-5">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card shadow">
                    <div class="card-body p-4">
                        <div class="text-center mb-4">
                            <img src="logo.png" alt="GMU Logo" class="img-fluid mb-3" style="max-width: 150px;">
                            <h2 class="card-title">Registration</h2>
                        </div>
                        <?php
                        require_once 'db.php';

                        if ($_SERVER["REQUEST_METHOD"] == "POST") {
                            $username = trim($_POST['username']);
                            $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
                            $password = $_POST['password'];
                            $confirm_password = $_POST['confirm_password'];
                            $name = trim($_POST['name']);
                            $mobile = trim($_POST['mobile']);
                            $errors = [];

                            // Validation
                            if (empty($username)) {
                                $errors[] = "Username is required";
                            }

                            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                                $errors[] = "Please enter a valid email address";
                            }

                            if (strlen($password) < 8) {
                                $errors[] = "Password must be at least 8 characters long";
                            }

                            if ($password !== $confirm_password) {
                                $errors[] = "Passwords do not match";
                            }

                            if (empty($name)) {
                                $errors[] = "Name is required";
                            }

                            if (!preg_match("/^[0-9]{10}$/", $mobile)) {
                                $errors[] = "Please enter a valid 10-digit mobile number";
                            }

                            // Check if username or email already exists
                            $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
                            $stmt->bind_param("ss", $username, $email);
                            $stmt->execute();
                            $result = $stmt->get_result();
                            
                            if ($result->num_rows > 0) {
                                $errors[] = "Username or email already exists";
                            }
                            $stmt->close();

                            if (empty($errors)) {
                                try {
                                    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                                    $stmt = $conn->prepare("INSERT INTO users (username, email, password, name, mobile) VALUES (?, ?, ?, ?, ?)");
                                    $stmt->bind_param("sssss", $username, $email, $hashed_password, $name, $mobile);
                                    
                                    if ($stmt->execute()) {
                                        echo '<div class="alert alert-success">Registration successful! You can now <a href="login.php">login</a>.</div>';
                                    } else {
                                        echo '<div class="alert alert-danger">Registration failed. Please try again later.</div>';
                                    }
                                    $stmt->close();
                                } catch (Exception $e) {
                                    error_log("Registration error: " . $e->getMessage());
                                    echo '<div class="alert alert-danger">An error occurred. Please try again later.</div>';
                                }
                            } else {
                                echo '<div class="alert alert-danger"><ul class="mb-0">';
                                foreach ($errors as $error) {
                                    echo '<li>' . htmlspecialchars($error) . '</li>';
                                }
                                echo '</ul></div>';
                            }
                        }
                        ?>
                        <form method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
                            <div class="mb-3">
                                <label for="username" class="form-label">Username</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                                    <input type="text" class="form-control" id="username" name="username" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                    <input type="email" class="form-control" id="email" name="email" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="name" class="form-label">Full Name</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-id-card"></i></span>
                                    <input type="text" class="form-control" id="name" name="name" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="mobile" class="form-label">Mobile Number</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-phone"></i></span>
                                    <input type="tel" class="form-control" id="mobile" name="mobile" pattern="[0-9]{10}" required>
                                </div>
                                <small class="text-muted">Enter 10-digit number without spaces or dashes</small>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                    <input type="password" class="form-control" id="password" name="password" required>
                                </div>
                                <small class="text-muted">Minimum 8 characters</small>
                            </div>
                            <div class="mb-3">
                                <label for="confirm_password" class="form-label">Confirm Password</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                    <input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
                                </div>
                            </div>
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">Register</button>
                                <a href="login.php" class="btn btn-outline-secondary">Back to Login</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer mt-auto">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h4>George Mason University</h4>
                    <p>Department of Physics and Astronomy</p>
                    <p><i class="fas fa-map-marker-alt"></i> Fairfax, VA 22030</p>
                    <p><i class="fas fa-phone"></i> (703) 993-1000</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <img src="logo.png" alt="GMU Logo" class="img-fluid" style="max-width: 200px;">
                </div>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/main.js"></script>
</body>
</html>