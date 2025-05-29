const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add the fallback for material-design-icons
  if (!config.resolve) config.resolve = {};
  if (!config.resolve.alias) config.resolve.alias = {};
  
  config.resolve.alias['@react-native-vector-icons/material-design-icons'] = 'react-native-vector-icons/MaterialCommunityIcons';
  
  // Ensure module and rules arrays exist
  if (!config.module) config.module = {};
  if (!config.module.rules) config.module.rules = [];

  // Add rule for .css files
  config.module.rules.push({
    test: /\.css$/i,
    use: ['style-loader', 'css-loader'],
  });

  return config;
};
