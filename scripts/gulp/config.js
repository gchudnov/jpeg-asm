if(!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

export const IS_PRODUCTION = (process.env.NODE_ENV === 'production');

export const SRC_DIR = './src';
export const DST_DIR = './dist';

const BUNDLE_CONFIG = {
  entries: [ `${SRC_DIR}/bridge/index.js` ],
  dest: DST_DIR,
  outputName: 'jpegasm.js'
};

export const BROWSERIFY = {
  debug: !IS_PRODUCTION,
  bundleConfigs: [ BUNDLE_CONFIG ]
};
