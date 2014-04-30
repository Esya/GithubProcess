// GITHUB    : https://github.com/d-weber/GithubProcess
// COPYRIGHT : Tristan Foureur, Damien Weber

//--- CONFIGURATION, EDIT THIS  ---//

// Your targetprocess url
BASE_URL = 'https://myaccount.tpondemand.com/';

// The prefix for your ids (For example, ID: will match ID:1733 and get story 1733)
ID_PREFIX = 'ID:';

//--- DO NOT EDIT BELOW THIS LINE ---//

/**
 * Strip the HTML tags
 * @param  {string} input   The input text
 * @param  {mixed}  allowed The allowed tags
 * @return {string}         The tag-stripped text
 */
function strip_tags (input, allowed) {
    if(input === null || input === "") return "";
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}

/**
 * Count the number of testcases
 * @param  {array} Testcases The testcases, given by TP's api
 * @return {int}             The number of successful testcases
 */
function countOk(Testcases) {
    Ok = 0;
    for (var i = Testcases.length - 1; i >= 0; i--) {
        if(Testcases[i].LastStatus === true) {
            Ok++;
        }
    }

    return Ok;
}

/**
 * Displays the info for a Bug/Story
 * @param  {int}    id      Id of that bug/story
 * @param  {object} infos   Contains the informations such as description, title, etc
 * @param  {string} type    Either 'Bugs' or 'UserStories'
 * @return {void}
 */
function showInfos(id,infos,type) {

    link = BASE_URL + 'entity/' + id;

    switch(infos.EntityState.Name) {
        case 'Refused':
            style_status = 'font-weight: bold; color: red';
            break;

        case 'Accepted':
            style_status = 'font-weight: bold; color: green;';
            break;

        default:
            style_status = 'font-weight: bold;';
            break;
    }

    if(infos.Timespent === 0) style_spent = 'font-weight: bold; color: red;';
    else style_spent = '';

    if(infos.TimeRemain !== 0) style_remain = 'font-weight: bold; color: red;';
    else style_remain = '';

    base = '<img style="display: none;" src="http://www.gencodegenes.org/gencode/gfx/toggle.png" class="toggle-desc-'+id+'" data-id="'+id+'"/>'+
        "<img src=\""+imgSrc+"\" />&nbsp;<a href=\""+link+"\" target=\"_blank\">ID:"+id+"</a><br />" +
        '<span class="target-desc-'+id+'" style="display: none">'+strip_tags(infos.Description,"")+'<br /></span>'+
        "Title : "+infos.Name+" <br />" +
        'Status : <span style="'+style_status+'">'+infos.EntityState.Name+"</span><br />" +
        '<span style="'+style_spent+'">Spent time : '+infos.TimeSpent+'h </span>/<span style="'+style_remain+'"> Remaining : '+infos.TimeRemain+"h </span><br />";

    if (type == 'UserStories') {
        ok = countOk(infos.TestCases.Items);
        total = infos.TestCases.Items.length;

        if (ok == total) style_tests = 'font-weight: bold; color: green;';
        else style_tests = 'font-weight: bold;';

        if(total > 0) {
            base +='<span style="'+style_tests+'">Successful testcases : '+ok+"/"+total+"</span><br />";
        } else {
            base +='<span style="'+style_tests+'">No testcase!</span><br />';
        }
    }


    before = $('.timeline-comment-wrapper:first-child .comment-body').html();
    after = before.replace('ID:'+id,base);
    $('.timeline-comment-wrapper:first-child .comment-body').html(after);
    $('.timeline-comment-wrapper:first-child .comment-body').find('.toggle-desc-'+id).click(function() {
        $('target-desc-'+id).toggle();
    });
}

/**
 * Tries to fetch the object on TP's api
 * @param  {int}    id      Id of the object to fetch
 * @param  {string} type    'Bugs' or 'UserStories'
 * @return {void}
 * @todo Do a single request for Bugs
 */
function getId(id,type) {
    if(type == "Bugs") {
        url = BASE_URL+"/api/v1/"+type+"/"+id+"?format=json&resultInclude=[Id,Description,EntityState,Name,TimeSpent,TimeRemain]";
    } else if(type == "Requests") {
        url = BASE_URL+"/api/v1/"+type+"/"+id+"?format=json&resultInclude=[Id,Description,EntityState,Name,TimeSpent,TimeRemain]";
    } else {
        url = BASE_URL+"/api/v1/"+type+"/"+id+"?format=json&resultInclude=[Id,Description,EntityState,Name,TimeSpent,TimeRemain,Testcases-count,Testcases[Name,LastStatus]]";
    }
    //Go for a story first.
    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        onload: function(response) {
            if(response.status == '404' && type != 'Bugs') {
                getId(id,"Bugs");
            } else if(response.status == '404' && type =='Bugs') {
                getId(id,'Requests');
            } else {
                json = JSON.parse(response.responseText);
                showInfos(id,json,type);
            }
        }
    });
}

ids = $('.timeline-comment-wrapper:first-child .comment-body').html().match(/ID:([0-9]*)/g);

for (var i = ids.length - 1; i >= 0; i--) {
    getId(ids[i].substr(3),"UserStories");
}
