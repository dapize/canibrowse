const { task, src, dest, parallel, watch } = require('gulp')
const pug = require('gulp-pug');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const data = require('gulp-data');
const fs = require('fs');

const views = () => {
  return src('./src/views/index.pug')
  .pipe(data(function() {
    return JSON.parse(fs.readFileSync('./results.json'))
  }))
  .pipe(pug({ pretty: true }))
  .pipe(dest('./dist'))
};
task('views', views);

const styles = () => {
  return src('./src/scss/styles.scss')
  .pipe(sass({
    outputStyle: 'compressed'
  }).on('error', sass.logError))
  .pipe(rename('app.css'))
  .pipe(dest('./dist'));
};
task('styles', styles);

const scripts = () => {
  return src(['./src/js/vendors/layouter.js', './src/js/app.js'])
  .pipe(concat('app.js'))
  .pipe(uglify().on('error', function(e){console.log(e)}))
  .pipe(dest('./dist'));
};
task('scripts', scripts);

const images = () => {
  return src('./src/images/**/*')
  .pipe(dest('./dist/images'))
};
task('images', images);

const favicon = () => {
  return src('./src/favicon.ico')
  .pipe(dest('./dist'))
};

task('favicon', favicon);

task('watcher', () => {
  watch('./src/views/**/*', views);
  watch('./src/scss/**/*', styles);
  watch('./src/js/**/*', scripts);
  watch('./src/images/**/*', images);
});

exports.default = parallel('views', 'styles', 'scripts', 'images', 'favicon');
