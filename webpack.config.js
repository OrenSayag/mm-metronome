const publicPath = "/metronome";

module.exports = {
  output: {
    publicPath,
  },
  devServer: {
    publicPath,
    historyApiFallback: {
      index: publicPath,
    },
  },
};
