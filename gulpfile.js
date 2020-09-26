'use strict';

require("@babel/register")({})

const requireDir = require('require-dir');

requireDir('./scripts/gulp/tasks', { recurse: true });
