var JiraApi = require('jira').JiraApi;
var IPB = require('node-ipb');
var config = require('./config.js');

var jira = new JiraApi('https', config.jiraHost, config.jiraPort, config.jiraUser, config.jiraPass, config.jiraApiVersion);
IPB.init(config.ipbApiUrl, config.ipbApiKey);

function updateForumTags(page)
{
    if (!page)
        page = 1;
    IPB.get('forums/topics?forums=' + config.ipbForumId + "&page=" + page, function topicsCB(err, data)
    {
        if (err)
            console.log(err);
        else
        {
            for (var i = 0; i < data.results.length; ++i)
            {
                var topic = data.results[i];
                if (topic.prefix.toLowerCase() !== "done")
                {
                    console.log(topic.prefix);
                    for (var j = 0; j < topic.tags.length; ++j)
                    {
                        jira.findIssue(topic.tags[j].toUpperCase(), function jiraCB(error, issue)
                        {
                            if (error)
                            {
                                console.log(error);
                                return;
                            }
                            
                            if (config.ipbChangeAuthor && topic.firstPost.author.id !== config.ipbAuthorId)
                            {
                                IPB.post('forums/posts' + topic.firstPost.id, {
                                    author: config.ipbAuthorId,
                                }, function (err, data)
                                {
                                    if (err)
                                    {
                                        console.log(err);
                                        return;
                                    }
                                    console.log("Updated post " + topic.firstPost.id);
                                });
                            }
                            
                            var status = issue.fields.status.name;
                            if (topic.prefix.toLowerCase() !== status.toLowerCase())
                            {
                                var postData = {
                                    prefix: status
                                }
                                
                                console.log(status);
                                
                                IPB.post('forums/posts', {
                                    topic: topic.id,
                                    author: config.ipbAuthorId,
                                    post: config.ipbUpdatedPost.replace('%STATUS%', status),
                                }, function postCB(err, data)
                                {
                                    if (err)
                                    {
                                        console.log(err);
                                        return;
                                    }
                                    console.log("Topic " + topic.id + " posted to");
                                });
                                
                                IPB.post('forums/topics/' + topic.id, postData, function updateCB(err, data)
                                {
                                    if (err)
                                    {
                                        console.log(err);
                                        return;
                                    }
                                    console.log("Topic " + topic.id + " updated");
                                });
                            }
                        });
                    }
                }
            }
            if (page < data.totalPages)
                updateForumTags(page + 1);
        }
    });
}

setInterval(updateForumTags, config.updateIntervalMilliseconds);
updateForumTags();