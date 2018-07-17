
var branchesArr = [];
branchesArr["master"] = {"name":"master","branchCount":0};
var page=1;
var x1 = 0;
var x2 = 0;
var y1 = 0;
var y2 = 0;

var ownerName = $("#ownerName").val();
var repoName = $("#repoName").val();
if (repoName && ownerName) {
  loadGraph(ownerName,repoName);
}
function loadGraph(ownerName,repoName,page=1) {
  $("#loadMore").css('visibility', 'hidden');
  $("#loadMore").prop('disabled', true);
  $("#loader").css('visibility', 'visible');
  $.ajax({
      type: 'GET',
      url: 'api/activity.php?owner='+ownerName+'&repo='+repoName+'&page='+page+'',
      data: {},
      success: function(response){
          $("#loader").css('visibility', 'hidden');
          $("#loadMore").css('visibility', 'visible');
          $("#loadMore").prop('disabled', false);
          var obj = jQuery.parseJSON( response );
          // check response length
          if (obj.length==0) {
            $("#loadMore").css('visibility', 'hidden');
            $(".msg").html('No more activity.');
            return false;
          }
          // check validation of response
          if (obj.message) {
            $("#loadMore").css('visibility', 'hidden');
            $("#loader").css('visibility', 'hidden');
            $(".msg").html(obj.message);
            return false;
          }

          if (page==1) {
            var square = '<div id="div_0" data-repo="master" class="square branch" style="width: 20px; height: 20px; top:0; left:0; background:#00cc00; position:absolute;"></div>';
            $("#treeView").append(square);
            var message = '<span class="message" style=" position:absolute; top:0;">[master], darshanswami created branch master at darshanswami/gitactivity</span>'
            $("#treeView").append(message);
          }

          for (var k = (obj.length - 1); k > -1; k--) {
            var value = obj[k];
            var title = '';
            var type = value.type;
            var id = value.id;
            var commitId = id.substring(0, 7);

            var data = value;
            var p = data.payload;

            var branch = '';
            if (p.ref) {
              if (p.ref.substring(0, 11) === 'refs/heads/') {
                branch = p.ref.substring(11);
              } else {
                branch = p.ref;
              }
            }

            // Get the comment if one exists, and trim it to 150 characters.
            if (p.comment && p.comment.body) {
              data.comment = p.comment.body;
              if (data.comment.length > 150) {
                data.comment = data.comment.substring(0, 150) + '...';
              }
              if (p.comment.html_url && p.comment.commit_id) {
                var title = data.repo.name + '@' + p.comment.commit_id.substring(0, 10);
              }
            }

            // Get the message if this is a PullRequestReviewCommentEvent
            if (p.comment && p.comment.pull_request_url) {
              var username = data.actor.login;
              title = ', '+username+' commented on pull request - '+data.repo.name + "#" + p.comment.pull_request_url.split('/').pop()+' - '+data.comment+'';
              var color = "#ff33cc";
            }

            // Get the message if this is a CommitCommentEvent
            if (type == "CommitCommentEvent") {
              var username = data.actor.login;
              // title = data.repo.name + "#" + p.comment.pull_request_url.split('/').pop();
              title = ', '+username+' commented on commit '+value.repo.name + ' - '+value.payload.comment.body + '';
              var color = "#ff9900";
            }

            // Get the message if this is a IssueCommentEvent
            if (type == "IssueCommentEvent") {
              var username = data.actor.login;
              // title = data.repo.name + "#" + p.comment.pull_request_url.split('/').pop();
              title = ', '+username+' commented on Issue - '+value.payload.issue.title + '';
              var color = "#ff9900";
            }

            // Get the message if this is a WatchEvent
            if (type == "WatchEvent") {
              var username = data.actor.login;
              title = ', '+username+' Watch on '+data.repo.name;
              var color = "#99ff66";
            }

            // Get the message if this is a ForkEvent
            if (type == "ForkEvent") {
              var username = data.actor.login;
              title = ', '+username+' forked '+data.repo.name+' to '+value.payload.forkee.full_name + ' ';
              var color = "#660033";
            }

            // Get the message if this is a PushEvent
            if (type == "PushEvent") {
              var username = data.actor.login;
              title = ', '+username+' pushed to '+branch+' ';
              var color = "#6600ff";
            }

            // Get the message if this is a PullRequestEvent (Retrieve the pull request)
            if (type == "PullRequestEvent") {
              var username = data.actor.login;
              var color = "#990099";
              // If this was a merge, set the merge message.
              if (p.pull_request.merged) {
                subTitle = ', '+username+' merged pull request '+value.repo.name+' #'+value.payload.number+'';
                var color = "#ff0066";
                branchTo = p.pull_request.base.ref;
                branchFrom = p.pull_request.head.ref;
              
                var branchCount = branchesArr[branchTo].branchCount;
                var squareCount = $(".square").length;
                var squareLeft = branchCount * 50;
                var squareTop = (squareCount) * 100;
                var square = '<div id="div_'+id+'" class="square PushEvent '+branchTo+'" style="width: 20px; height: 20px; top:'+squareTop+'; left:'+squareLeft+'; background:'+color+' ; position:absolute;"></div>';
                $("#treeView").append(square);

                var leftPositionPrev = ($( ".square:last" ).prevAll(".square").position())? $( ".square:last" ).prevAll(".square").position().left : 0;
                var topPositionPrev = ($( ".square:last" ).prevAll(".square").position())? $( ".square:last" ).prevAll(".square").position().top : 0;

                var leftPosition = ($( ".square:last" ).position())? $( ".square:last" ).position().left : 0;
                var topPosition = ($( ".square:last" ).position())? $( ".square:last" ).position().top : 0;

                x1 = leftPositionPrev;
                x2 = leftPosition;
                y1 = 0;
                y2 = 100;
                lineW = (leftPositionPrev>=200)? leftPositionPrev:100;
                var line = '<svg width="'+lineW+'" height="100" style="top:'+(squareTop-90)+'; left:8; position:absolute;"><line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="red"/></svg>';
                
                $("#treeView").append(line);

                if (x1>0) {
                  var leftPositionPrev = ($( ".square:last" ).prevAll("."+branchTo+":last").position())? $( ".square:last" ).prevAll("."+branchTo+":last").position().left : 0;
                  var topPositionPrev = ($( ".square:last" ).prevAll("."+branchTo+":last").position())? $( ".square:last" ).prevAll("."+branchTo+":last").position().top : 0;
                  x1 = leftPositionPrev;
                  x2 = leftPosition;
                  y1 = 0;
                  y2 = (squareTop-topPositionPrev);
                  lineW = (leftPositionPrev>=200)? leftPositionPrev:100;
                  var line = '<svg width="'+lineW+'" height="'+(squareTop-topPositionPrev)+'" style="top:'+(topPositionPrev+10)+'; left:8; position:absolute;"><line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="red"/></svg>';
                  $("#treeView").append(line);
                }

                var message = '<span class="message" style=" position:absolute; top:'+squareTop+';">['+branchTo+'] '+commitId+','+subTitle+'</span>'
                $("#treeView").append(message);

              }else{
                title = ', '+username+' '+value.payload.action+' pull request '+value.repo.name+' #'+value.payload.number+'';
              }
            }

            // Get the message if this is a CreateEvent
            if (type == "CreateEvent") {
              var username = data.actor.login;
              var color = "#00cc00";
              if (value.payload.ref_type == "repository") {
                title = ', '+username+' created repository '+value.repo.name+' ';
              }else if(value.payload.ref_type == "branch"){
                if (value.payload.ref == value.payload.master_branch) {
                  title = ', '+username+' created branch '+value.payload.ref+' at '+value.repo.name+'';
                }else{
                  subTitle = '['+value.payload.ref+'] '+commitId+', '+username+' created branch '+value.payload.ref+' at '+value.repo.name+'';

                  // Create a new branch from "master" with some custom configuration
                  var branchCount = $(".branch").length;
                  var squareCount = $(".square").length;
                  var squareLeft = (branchCount) * 50;
                  var squareTop = (squareCount) * 100;

                  var square = '<div id="div_'+id+'" data-repo="'+value.payload.ref+'" class="square CreateEvent branch" style="width: 20px; height: 20px; top:'+squareTop+'; left:'+squareLeft+'; background:'+color+'; position:absolute;"></div>';
                  $("#treeView").append(square);

                  var message = '<span class="message newBranch" style=" position:absolute; top:'+squareTop+';">'+subTitle+'</span>'
                  $("#treeView").append(message);

                  branchesArr[value.payload.ref] = {"name":value.payload.ref,"branchCount":branchCount};

                }
              }else if(value.payload.ref_type == "tag"){
                title = ', '+username+' created tag '+value.payload.ref+' ';
              }
            }

            if (title) {
                // Check is it master branch or not
                if (branch!='' && branch!='master') {
                    
                  var branchCount = branchesArr[branch].branchCount;
                  var squareCount = $(".square").length;
                  var squareLeft = branchCount * 50;
                  var squareTop = (squareCount) * 100;
                  var square = '<div id="div_'+id+'" class="square '+type+' '+branch+'" style="width: 20px; height: 20px; top:'+squareTop+'; left:'+squareLeft+'; background:'+color+' ; position:absolute;"></div>';
                  
                  // Makre square point
                  $("#treeView").append(square);

                  var leftPositionPrev = ($( ".square:last" ).prevAll(".square").position())? $( ".square:last" ).prevAll(".square").position().left : 0;
                  var topPositionPrev = ($( ".square:last" ).prevAll(".square").position())? $( ".square:last" ).prevAll(".square").position().top : 0;

                  var leftPosition = ($( ".square:last" ).position())? $( ".square:last" ).position().left : 0;
                  var topPosition = ($( ".square:last" ).position())? $( ".square:last" ).position().top : 0;

                  x1 = leftPositionPrev;
                  x2 = leftPosition;
                  y1 = 0;
                  y2 = 100;
                  lineW = (leftPositionPrev>=200)? leftPositionPrev:100;
                  var line = '<svg width="'+lineW+'" height="100" style="top:'+(squareTop-90)+'; left:8; position:absolute;"><line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="red"/></svg>';
                  
                  // Makre line between square
                  $("#treeView").append(line);

                  if (x1>0) {
                    var leftPositionPrev = ($( ".square:last" ).prevAll("."+branch+":last").position())? $( ".square:last" ).prevAll("."+branch+":last").position().left : 0;
                    var topPositionPrev = ($( ".square:last" ).prevAll("."+branch+":last").position())? $( ".square:last" ).prevAll("."+branch+":last").position().top : 0;
                    x1 = leftPositionPrev;
                    x2 = leftPosition;
                    y1 = 0;
                    y2 = (squareTop-topPositionPrev);
                    lineW = (leftPositionPrev>=200)? leftPositionPrev:100;
                    var line = '<svg width="'+lineW+'" height="'+(squareTop-topPositionPrev)+'" style="top:'+(topPositionPrev+10)+'; left:8; position:absolute;"><line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="red"/></svg>';
                    $("#treeView").append(line);
                  }

                  var message = '<span class="message otherBranch" style=" position:absolute; top:'+squareTop+';">['+value.payload.ref+'] '+commitId+''+title+'</span>'
                  // Display commite message
                  $("#treeView").append(message);

                }else{
                  
                  var branchCount = branchesArr["master"].branchCount;
                  var squareCount = $(".square").length;
                  var squareLeft = branchCount * 50;
                  var squareTop = (squareCount) * 100;
                  var square = '<div id="div_'+id+'" class="square '+type+' master" style="width: 20px; height: 20px; top:'+squareTop+'; left:'+squareLeft+'; background:'+color+' ; position:absolute;"></div>';
                  // makre square point
                  $("#treeView").append(square);

                  var leftPositionPrev = ($( ".square:last" ).prevAll(".square").position())? $( ".square:last" ).prevAll(".square").position().left : 0;
                  var topPositionPrev = ($( ".square:last" ).prevAll(".square").position())? $( ".square:last" ).prevAll(".square").position().top : 0;

                  var leftPosition = ($( ".square:last" ).position())? $( ".square:last" ).position().left : 0;
                  var topPosition = ($( ".square:last" ).position())? $( ".square:last" ).position().top : 0;

                  x1 = leftPositionPrev;
                  x2 = leftPosition;
                  y1 = 0;
                  y2 = 100;
                  lineW = (leftPositionPrev>=200)? leftPositionPrev:100;
                  var line = '<svg width="'+lineW+'" height="100" style="top:'+(squareTop-90)+'; left:8; position:absolute;"><line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="red"/></svg>';
                  $("#treeView").append(line);

                  if (x1>0) {
                    var leftPositionPrev = ($( ".square:last" ).prevAll(".master").position())? $( ".square:last" ).prevAll(".master").position().left : 0;
                    var topPositionPrev = ($( ".square:last" ).prevAll(".master").position())? $( ".square:last" ).prevAll(".master").position().top : 0;
                    x1 = leftPositionPrev;
                    x2 = leftPosition;
                    y1 = 0;
                    y2 = (squareTop-topPositionPrev);
                    lineW = (leftPositionPrev>=200)? leftPositionPrev:100;
                    var line = '<svg width="'+lineW+'" height="'+(squareTop-topPositionPrev)+'" style="top:'+(topPositionPrev+10)+'; left:8; position:absolute;"><line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="red"/></svg>';
                  // makre line between square
                    $("#treeView").append(line);
                  }

                  var message = '<span class="message masterBranch" style=" position:absolute; top:'+squareTop+';">[master] '+commitId+''+title+'</span>'
                  // display commite message
                  $("#treeView").append(message);

                }
            }
          }
          $("#treeView").height($(document).height());

      },
      error: function(data) {
          return false;
      }
  });
}

$( document ).ready(function() {
  $("#loadMore").on("click",function(argument) {
    var ownerName = $("#ownerName").val();
    var repoName = $("#repoName").val();
    if (repoName && ownerName) {
      page = page + 1;
      loadGraph(ownerName,repoName,page);
    }
      // page = page + 1;
      // loadGraph(page);
  })
  $("#submitRepo").click(function(argument) {
    var ownerName = $("#ownerName").val();
    var repoName = $("#repoName").val();
    if (repoName && ownerName) {
      loadGraph(ownerName,repoName,1);
    }
  })
});