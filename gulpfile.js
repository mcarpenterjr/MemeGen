var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var del = require('del');


var paths = {
  //IMPORTANT: Use to block tasks from parsing this massive directory!
  restricted: ['!node_modules/**/*', '!bower_components/**/*'],
  content: ['_src/*.html'],
  styles: ['_src/assets/css/*.css'],
  scripts: ['_src/assets/js/**/*.js'],
  images: ['_src/assets/img/**/*'],
};

/* Font Generator
* modify src and destination per use.
*/
gulp.task('fontgen', function() {
  return gulp.src("_src/assets/fonts/keepCalm/*.{ ttf, otf }")
  .pipe(fontgen({
    dest: "_src/assets/fonts/keepCalm/"
  }));
});

//  Developement Preview
gulp.task('serve', function() {
  browserSync.init({
    server: './_src'
  });
  // Watches for changes
  gulp.watch(['content', 'styles', 'scripts'], reload);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['serve']);
