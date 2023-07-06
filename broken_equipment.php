<?php
require_once "db.php";
if (isset($_POST['signup'])) {
$ename = mysqli_real_escape_string($conn, $_POST['EquipmentName']);
$edate = mysqli_real_escape_string($conn, $_POST['date']);
$eroom = mysqli_real_escape_string($conn, $_POST['EquipmentRoom']);

if(mysqli_query($conn, "INSERT INTO broken_equipment(ename, eroom, date) VALUES('" . $ename . "', '" . $eroom . "', '" . $edate . "')")) {
header("location: firstpage.php");
exit();
} 
mysqli_close($conn);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Broken Equipment</title>
<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
</head>
<body>
<div class="w3-container w3-teal">
  <h1>Broken Equipment Form</h1>
</div>
<div class="container">
<div class="row">
<div class="col-lg-8 col-offset-2">
<div class="page-header">
</div>
<p>Please fill all fields in the form</p>
<form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
<div class="form-group">
<label>Equipment Name</label>
<input type="text" name="EquipmentName" class="form-control" value="" maxlength="50" required="">
</div>
<div class="form-group">
<label>Equipment Room</label>
<input type="text" name="EquipmentRoom" class="form-control" value="" maxlength="12" required="">
<span class="text-danger"></span>
</div>
<div class="form-group ">
<label>Date</label>
<input type="date" name="date" class="form-control" value="" maxlength="30" required="">
<span class="text-danger"></span>
</div>
<input type="submit" class="btn btn-primary" name="signup" value="submit">
</form>
</div>
</div>    
</div>
</body>
</html>