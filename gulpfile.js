/**
 * Module Dependencies
 */

const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const nodemon = require("gulp-nodemon");

gulp.task("browser-sync", ["nodemon"], function() {
  browserSync.init({
    proxy: {
      target: "localhost:3000", // local node app address
      ws: true
    },
    port: 5000, // use *different* port than above
    notify: true
  });
});

gulp.task("nodemon", function(cb) {
  var called = false;
  return nodemon({
      script: "index.js",
      ignore: ["gulpfile.js", "node_modules/", "public/"]
    })
    .on("start", function() {
      if (!called) {
        called = true;
        cb();
      }
    })
    .on("restart", function() {
      setTimeout(
        function() {
          reload({ stream: false });
        },
        1000
      );
    });
});

gulp.task("default", ["browser-sync"], function() {
  gulp.watch(["public/**/*.*"]).on("change", reload);
});
