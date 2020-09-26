import log from 'fancy-log';
import prettyHrtime from 'pretty-hrtime';
import colors from 'ansi-colors';

let startTime;

/**
 * Provides gulp style logs to the bundle method in browserify
 */
export default {
  start(filepath) {
    startTime = process.hrtime();
    log('Bundling', colors.green(filepath) + '...');
  },

  end(filepath) {
    let taskTime = process.hrtime(startTime);
    let prettyTime = prettyHrtime(taskTime);
    log('Bundled', colors.green(filepath), 'in', colors.magenta(prettyTime));
  }
};
