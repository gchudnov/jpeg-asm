import gulp from 'gulp';
import log from 'fancy-log';
import colors from 'ansi-colors';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import async from 'async';
import once from 'once';
import gulpIf from 'gulp-if';
import uglify from 'gulp-uglify';
import replace from 'gulp-replace';
import bundleLogger from '../lib/bundle-logger';
import handleErrors from '../lib/handle-errors';
import { IS_PRODUCTION, BROWSERIFY } from '../config';

function browserifyTask(next) {
  log('NODE_ENV:', colors.yellow(process.env.NODE_ENV));
  log('IS_PRODUCTION:', colors.yellow(IS_PRODUCTION));

  async.each(BROWSERIFY.bundleConfigs, (bundleConfig, cb) => {
    cb = once(cb);
    let bundler = browserify({
      entries: bundleConfig.entries,
      insertGlobals: true,
      detectGlobals: true,
      debug: BROWSERIFY.debug,
      standalone: "jpegasm"
    });

    let handleEnd = () => {
      bundleLogger.end(bundleConfig.outputName);
      cb();
    };

    let bundle = () => {
      bundleLogger.start(bundleConfig.outputName);
      return bundler
        .bundle()
        .on('error', handleErrors)
        .pipe(source(bundleConfig.outputName))
        .pipe(buffer())
        .pipe(replace(/&&\s*!ENVIRONMENT_IS_WEB\s*&&\s*!ENVIRONMENT_IS_WORKER/, '')) // PATCH: cannot detect NODE in a browser.
        .pipe(replace(/!!process\.platform\.match\(\/\^win\/\)/, 'false'))           // PATCH: process.platform is undefined
        .pipe(replace(/process\[['"]stderr['"]\]\.write/, 'console.error'))          // PATCH: process.stderr is undefined
        .pipe(replace(/process\[['"]stdout['"]\]\.write/, 'console.log'))            // PATCH: process.stdout is undefined
        .pipe(gulpIf(IS_PRODUCTION, uglify())) // { mangle: false }
        .pipe(gulp.dest(bundleConfig.dest))
        .on('end', handleEnd);
    };

    bundle();

  }, next);
}

export { browserifyTask };
