/***********************
 *  CUSTOM TEMPLATES   *
 ***********************/

var myTemplateConfig = {
  colors: ["#F00", "#0F0", "#00F"], // branches colors, 1 per column
  branch: {
    lineWidth: 8,
    // Dash segments, see:
    lineDash: [5, 3],
    spacingX: 50
  },
  commit: {
    spacingY: -80,
    dot: {
      size: 12,
      lineDash: [4]
    },
    message: {
      displayAuthor: true,
      displayBranch: false,
      displayHash: false,
      font: "normal 12pt Arial"
    },
    shouldDisplayTooltipsInCompactMode: false, // default = true
    tooltipHTMLFormatter: function (commit) {
      return "<b>" + commit.sha1 + "</b>" + ": " + commit.message;
    }
  }
};
var myTemplate = new GitGraph.Template(myTemplateConfig);

/***********************
 *    INITIALIZATION   *
 ***********************/

var config = {
  template: "metro", // could be: "blackarrow" or "metro" or `myTemplate` (custom Template object)
  reverseArrow: false, // to make arrows point to ancestors, if displayed
  orientation: "vertical",
  // mode: "compact" // special compact mode: hide messages & compact graph
};
var gitGraph = new GitGraph(config);

/************************
 * BRANCHES AND COMMITS *
 ************************/

// Create branch named "master"
var master = gitGraph.branch("master");

var branchesArr = [];
branchesArr["master"] = master;

$.ajax({
    type: 'GET',
    url: 'api/activity.php',
    data: {},
    success: function(response){
        var obj = jQuery.parseJSON( response );
        for (var k = (obj.length - 1); k > -1; k--) {
          var value = obj[k];
          var title = '';
          var type = value.type;
          var id = value.id;

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
              branchesArr[branchFrom].merge(branchesArr[branchTo], {
                dotColor: color,
                message: subTitle,
                tooltipDisplay: false,
                author: username
              });
            }else{
              title = ', '+username+' '+value.payload.action+' pull request '+value.repo.name+' #'+value.payload.number+'';
            }
          }

          // Get the message if this is a CreateEvent
          if (type == "CreateEvent") {
            var username = data.actor.login;
            if (value.payload.ref_type == "repository") {
              title = ', '+username+' created repository '+value.repo.name+' ';
            }else if(value.payload.ref_type == "branch"){
              if (value.payload.ref == value.payload.master_branch) {
                title = ', '+username+' created branch '+value.payload.ref+' at '+value.repo.name+'';
              }else{
                title = ', '+username+' created branch '+value.payload.ref+' at '+value.repo.name+'';
                // Create a new branch from "master" with some custom configuration
                branchesArr[value.payload.ref] = master.branch({
                  name: value.payload.ref,
                  color: "#ff5c33",
                });
              }
            }else if(value.payload.ref_type == "tag"){
              title = ', '+username+' created tag '+value.payload.ref+' ';
            }
            var color = "#00cc00";
          }

          if (title) {
              // Commit method with style
              var commitConfig = {
                dotColor: color,
                message: title,
                tooltipDisplay: false,
                author: username
              };
              if (branch!='' && branch!='master') {
                  branchesArr[branch].commit(commitConfig);
              }else{
                master.commit(commitConfig);
              }
          }
        }
    },
    error: function(data) {
        return false;
    }
});