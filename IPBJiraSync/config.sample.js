module.exports = {
    jiraHost: "",
    jiraPort: "",
    jiraUser: "",
    jiraPass: "",
    jiraApiVersion: "2",
    ipbApiUrl: "/api/",
    ipbApiKey: "",
    ipbForumId: "1,2", // Forum(s) to look for tags in
    ipbAuthorId: 1, // member ID of the user to post as
    ipbUpdatedPost: '', // message to post on completion, %STATUS% replaced with status
    ipbChangeAuthor: false, // change original post author so they can no longer edit the topic
    updateIntervalMilliseconds: 600000
};