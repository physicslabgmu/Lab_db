<?php
session_start();
require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    if (empty($username) || empty($password)) {
        echo '<div class="alert alert-danger">Please fill in all fields.</div>';
    } else {
        try {
            $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 1) {
                $user = $result->fetch_assoc();
                if (password_verify($password, $user['password'])) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    header("Location: mainpage.html");
                    exit();
                } else {
                    echo '<div class="alert alert-danger">Invalid username or password.</div>';
                }
            } else {
                echo '<div class="alert alert-danger">Invalid username or password.</div>';
            }
            $stmt->close();
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            echo '<div class="alert alert-danger">An error occurred. Please try again later.</div>';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - GMU Physics Lab Setup</title>
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
            <div class="col-md-6 col-lg-4">
                <div class="card shadow">
                    <div class="card-body p-4">
                        <div class="text-center mb-4">
                            <img src="logo.png" alt="GMU Logo" class="img-fluid mb-3" style="max-width: 150px;">
                            <h2 class="card-title">Login</h2>
                        </div>
                        <form method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
                            <div class="mb-3">
                                <label for="username" class="form-label">Username</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                                    <input type="text" class="form-control" id="username" name="username" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                    <input type="password" class="form-control" id="password" name="password" required>
                                </div>
                            </div>
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">Login</button>
                                <a href="registration.php" class="btn btn-outline-secondary">Register</a>
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