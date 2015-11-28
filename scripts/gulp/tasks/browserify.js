import gulp from 'gulp';
import gutil from 'gulp-util';
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

gulp.task('browserify', (next) => {

  gutil.log('NODE_ENV:', gutil.colors.yellow(process.env.NODE_ENV));
  gutil.log('IS_PRODUCTION:', gutil.colors.yellow(IS_PRODUCTION));

  async.each(BROWSERIFY.bundleConfigs, (bundleConfig, cb) => {
    cb = once(cb);
    let bundler = browserify({
      entries: bundleConfig.entries,
      insertGlobals: true,
      detectGlobals: false,
      debug: BROWSERIFY.debug
      //standalone: "Jpegasm"
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
        .pipe(replace(/&&\s*!ENVIRONMENT_IS_WEB\s*&&\s*!ENVIRONMENT_IS_WORKER/, ''))
        .pipe(gulpIf(IS_PRODUCTION, uglify())) // { mangle: false }
        .pipe(gulp.dest(bundleConfig.dest))
        .on('end', handleEnd);
    };

    bundle();

  }, next);
});
