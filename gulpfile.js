var fs = require('fs'),
    gulp = require('gulp'),
    unzip = require('gulp-unzip'),
    sass = require('gulp-sass'),
    imports = require('gulp-imports'),
    rename = require('gulp-rename'),
    webserver = require('gulp-webserver'),
    replace = require('gulp-replace'),
    download = require('gulp-download');

//
// Replace this with the API token that you want to use when authenticating
// with Reflect services.
//
var REFLECT_API_TOKEN = '',
    REFLECT_PROJECT_NAME = '';

//
// This might need to be updated incrementally.
//
var REFLECT_LATEST_URL = "https://s3.amazonaws.com/reflect-io/reflect-ui-0.1.0.zip";

gulp.task('compile', ['html', 'js', 'sass']);
gulp.task('default', ['compile', 'serve', 'watch']);

gulp.task('update-vendor', function() {
  download(REFLECT_LATEST_URL)
    .pipe(unzip())
    .pipe(gulp.dest("vendor/reflect/"));
});

gulp.task('update-reflect', function() {
  var options = {
    server: 'https://:'+REFLECT_API_TOKEN+'@api-staging.reflect.io/v1/projects/'+REFLECT_PROJECT_NAME+'/data-model',
    data: {
      fileName: function(file) {
        return path.relative(__dirname, file.path)
      }
    }
  };

  gulp.src('./manifest.json')
    .upload(options)
});

gulp.task('html', function() {
  var manifest = fs.readFileSync('./manifest.json', 'utf-8');

  gulp.src('src/index.html')
    .pipe(replace('{{manifest}}', manifest))
    .pipe(replace('{{api_token}}', REFLECT_API_TOKEN))
    .pipe(gulp.dest('build'));
});

gulp.task('js', function() {
  gulp.src('src/js/index.js')
    .pipe(imports())
    .pipe(gulp.dest('build/js'));
});

gulp.task('sass', function() {
  gulp.src('src/styles/styles.scss')
    .pipe(sass({errLogToConsole: true, includePaths: ['./vendor']}))
    .pipe(gulp.dest('build/styles'));
});

gulp.task('serve', function() {
  gulp.src('build')
    .pipe(webserver());
});

gulp.task('watch', function() {
  gulp.watch(['./src/*.html'], ['html']);
  gulp.watch(['./src/js/*.js'], ['js']);
  gulp.watch(['./src/styles/*.scss'], ['sass']);
})
