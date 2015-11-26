var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    clean = require('gulp-clean'),
    jsdoc = require('gulp-jsdoc'),
    stylish = require('gulp-jscs-stylish');
jscs = require('gulp-jscs');


//gulp.task('lint', function () {
//    gulp.src(['index.js', 'newrelic.js', 'controller/**/*.js', 'routes/**/*.js', 'config/**/*.js'])
//        .pipe(jshint())
//        .pipe(jshint.reporter('default'));
//});

gulp.task('lint', function () {
    gulp.src(['index.js', 'newrelic.js', 'controller/**/*.js', 'routes/**/*.js', 'config/**/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));

    gulp.src(['index.js', 'newrelic.js', 'controller/**/*.js', 'routes/**/*.js', 'config/**/*.js'])
        .pipe(jscs({configPath: '.jscsrc'}))        // enforce style guide
        .on('warning', function () {
            process.exit(1);                        // Stop on error
        })
        .pipe(stylish());            // log style errors
});

gulp.task('clean-doc', function () {
    return gulp.src('docs', { read: false })
      .pipe(clean());
});

gulp.task('doc', ['clean-doc'], function () {
    return gulp.src(['index.js', 'newrelic.js', 'controller/**/*.js', 'routes/**/*.js', 'config/**/*.js'])
      .pipe(jsdoc('docs'));
});

gulp.task('docs', ['doc']);
