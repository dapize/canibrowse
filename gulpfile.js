const {task, src, dest, parallel, watch} = require('gulp')
const pug = require('gulp-pug');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const views = () => {
  return src('./src/views/index.pug')
  .pipe(pug({
    pretty: true
  }))
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

task('watcher', () => {
  watch('./src/views/**/*', views);
  watch('./src/scss/**/*', styles);
  watch('./src/js/**/*', scripts);
  watch('./src/images/**/*', images);
});

exports.default = parallel('views', 'styles', 'scripts', 'images');
