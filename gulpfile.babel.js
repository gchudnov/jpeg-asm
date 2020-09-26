require("@babel/register")({})

const { browserifyTask } = require('./scripts/gulp/tasks/browserify-task');

exports.default = browserifyTask;
