var gulp = require('gulp');
var uglify = require('gulp-uglify');
gulp.task('compress', function() {
  gulp.src('*.js')
    .pipe(uglify())
    .pipe(gulp.dest('*-min.js'))
});
gulp.task('default', function() {
  // place code for your default task here
  gulp.src('src/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./'))
});

