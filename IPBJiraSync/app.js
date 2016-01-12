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
                for (var j = 0; j < topic.tags.length; ++j)
                {
                    if (data.prefix !== "done")
                    {
                        jira.findIssue(topic.tags[i].toUpperCase(), function jiraCB(error, issue)
                        {
                            if (error)
                            {
                                console.log(error);
                                return;
                            }
                            var status = issue.fields.status.name.toLowerCase();
                            if (topic.prefix !== status)
                            {
                                var postData = {
                                    prefix: status
                                }
                                if (status === 'done')
                                {
                                    IPB.post('forums/posts', {
                                        topic: topic.id,
                                        author: config.ipbAuthorId,
                                        post: config.ipbCompletedMessage,
                                        author_name: "JIRA"
                                    }, function postCB(err, data)
                                    {
                                        if (err)
                                        {
                                            console.log(err);
                                            return;
                                        }
                                        console.log("Topic " + topic.id + " done");
                                    });
                                }
                                
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