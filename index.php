<?php 
// get and set requested data in input text
$owner = (isset($_GET['owner']) && !empty($_GET['owner']))? $_GET['owner']:"";
$repo = (isset($_GET['repo']) && !empty($_GET['repo']))? $_GET['repo']:"";
?>
<!DOCTYPE HTML>
<html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <title>GitThub Activity</title>
    <link rel="shortcut icon" type="image/x-icon" href="src/fav.png">
    <link rel="stylesheet" type="text/css" href="src/gitgraph.css" />
    <link rel="stylesheet" type="text/css" href="src/style.css" />
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  
  <body>
    <div>
      <form>
        Owner: <input type="text" id="ownerName" name="owner" value="<?php echo $owner; ?>">
        Repo: <input type="text" id="repoName" name="repo" value="<?php echo $repo; ?>">
        <input type="Submit" value="Submit">
        <a href="index.php" class="btn" role="button">Reset</a>
      </form>
    </div>
    <canvas id="gitGraph"></canvas>
    <div>
      <span class="message"></span>
      <a href="javascript:;" id="loadMore">Load More..</a>
      <img src="src/loading.gif" id="loader">
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.0/jquery.min.js"></script>
    <script src="src/gitgraph.js"></script>
    <script src="index.js"></script>
  </body>

</html>
