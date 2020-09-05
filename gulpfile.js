const gulp = require("gulp");
const gulpEjsMonster = require("gulp-ejs-monster");
const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const imagemin = require("gulp-imagemin");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const concat = require("gulp-concat");
const replace = require("gulp-replace");
const flatten = require("gulp-flatten");

// ejs
const templates = () => {
  return gulp
    .src([
      "src/views/pages/**/*.ejs",
      "!src/views/pages/**/sections/**/*.ejs",
      "src/common/**/*.ejs",
      "!src/common/**/sections/**/*.ejs",
    ])
    .pipe(gulpEjsMonster().on("error", gulpEjsMonster.preventCrash))
    .pipe(rename({ extname: ".html" }))
    .pipe(flatten())
    .pipe(gulp.dest("./public"));
};

// sass
const styles = () => {
  return (
    gulp
      .src([
        "src/styles/main.scss",
        "src/views/**/*.scss",
        "src/common/**/*.scss",
        "src/common/**/sections/**/*.scss"
      ])
      .pipe(sourcemaps.init())
      .pipe(sassGlob())
      .pipe(sass({ errorlogToConsole: true, outputStyle: "compressed" }))
      // .on("error", console.error.bind(console))
      .pipe(concat("app.css"))
      .pipe(rename({ suffix: ".min" }))
      .pipe(replace(/url\(\".*\//g, 'url("images/'))
      .pipe(sourcemaps.write("./maps"))
      .pipe(gulp.dest("./public/styles"))
      .pipe(browserSync.stream())
  );
};

//imagemin
const images = () => {
  return gulp
    .src(["src/views/**/**/images/*.{png,jpg,bmp,svg}"])
    .pipe(imagemin())
    .pipe(flatten())
    .pipe(gulp.dest("public/images"));
};

// browserSync
const sync = () => {
  return browserSync.init({
    server: {
      baseDir: "./public",
    },
    port: 3000,
  });
};
const browserReload = () => {
  return browserSync.reload();
};
// watchFiles
const watchFiles = () => {
  gulp.watch(
    ["src/styles/main.scss", "src/views/**/*.scss", "src/common/**/*.scss"],
    styles
  );
  gulp.watch(
    [
      "src/views/pages/**/**/*.ejs",
      "src/views/pages/**/sections/**/*.ejs",
      "src/common/**/*.ejs",
      "src/common/**/sections/**/*.ejs",
    ],
    templates
  );
  gulp.watch(["src/views/**/**/images/*.{png,jpg,bmp,svg}"], images);
  gulp.watch("./public/*.html", browserReload);
  gulp.watch("./public/**/*.css", browserReload);
};

exports.templates = templates;
exports.styles = styles;
exports.images = images;
exports.watchFiles = watchFiles;
exports.default = gulp.parallel(images, sync, watchFiles);
