const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Performance optimizations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      drop_console: false, // Keep console in dev
      reduce_vars: true,
      reduce_funcs: true,
    },
    mangle: {
      toplevel: true,
    },
  },
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true, // Faster startup by inlining requires
    },
  }),
};

// Resolver optimizations
config.resolver = {
  ...config.resolver,
  // Cache resolution results
  hasteImplModulePath: undefined,
  // Exclude test files from bundling
  blockList: [
    /node_modules\/.*\/node_modules/,
    /\.test\.(js|ts|tsx)$/,
    /\.spec\.(js|ts|tsx)$/,
    /__tests__\//,
    /server\/tests\//,
  ],
};

// Watcher optimizations - exclude unnecessary directories
config.watchFolders = [__dirname];

// Serializer optimizations
config.serializer = {
  ...config.serializer,
  // Process modules in parallel
  processModuleFilter: (module) => {
    // Skip processing node_modules that don't need transformation
    if (module.path.includes("node_modules")) {
      return !module.path.includes("@babel/runtime");
    }
    return true;
  },
};

// Increase max workers for faster builds
config.maxWorkers = 4;

module.exports = config;
