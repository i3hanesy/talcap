'use strict'
var gulp = require('gulp');
var server = require("browser-sync").create();
var pug = require('gulp-pug');
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require('gulp-sass');
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var del = require("del");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");

var concat = require('gulp-concat');

gulp.task('scripts', function () {
  return gulp.src('src/js/*.js')
    .pipe(concat('index.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp.src("src/img/**/*.{png,jpg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))

    .pipe(gulp.dest("src/img"));

});

gulp.task("webp", function () {
  return gulp.src("src/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("src/img"));
});

gulp.task("sprite", function () {
  return gulp.src("src/img/svg-icons/*.svg")
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename("sprite_auto.svg"))
    .pipe(gulp.dest("build/img/sprite"));
});


gulp.task("html", function() {
  return gulp.src("src/*.html")
    .pipe(posthtml([
      include()]))
    .pipe(gulp.dest("build"));
});

gulp.task("css", function() {
  return gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task('server', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('src/sass/**/*.{scss,sass}', gulp.series("css"));
  gulp.watch("src/img/svg-icons/*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("src/*.html", gulp.series("html", "refresh"));
  gulp.watch("src/js/*.js", gulp.series("scripts"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("copy", function () {
  return gulp.src([
    "src/fonts/**/*.{woff,woff2}",
    "src/img/**",
    "src//*.ico"
    ], {
      base: "src"
    })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "scripts", "html"));
gulp.task("start", gulp.series("build", "server"));
