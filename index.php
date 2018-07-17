<?php 
// get and set requested data in input text
$owner = (isset($_GET['owner']) && !empty($_GET['owner']))? $_GET['owner']:"";
$repo = (isset($_GET['repo']) && !empty($_GET['repo']))? $_GET['repo']:"";
?>
<html>
<head>
    <meta charset="UTF-8">
    <title>GitThub Activity</title>
    <link rel="shortcut icon" type="image/x-icon" href="src/fav.png">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="src/style.css" />
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
    <div id="treeView"></div>
    <br>
    <div>
      <span class="msg"></span>
      <a href="javascript:;" id="loadMore">Load More..</a>
      <img src="src/loading.gif" id="loader">
    </div>
    <script src="activity.js"></script>
</body>
</html>