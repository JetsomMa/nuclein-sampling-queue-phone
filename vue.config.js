const { defineConfig } = require('@vue/cli-service')
const packageJsonConfig = require('./package.json')

module.exports = defineConfig({
  publicPath: '/' + packageJsonConfig.name + '/',
  outputDir: 'dist/' + packageJsonConfig.name,
  transpileDependencies: true
})
