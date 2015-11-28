'use strict';

require('babel-core/register');

var requireDir = require('require-dir');

requireDir('./scripts/gulp/tasks', { recurse: true });
