const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify-es').default
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const fs = require('fs')

const browserSyncing = () => {
  browserSync.init({
    server: {baseDir: 'app'},
    notify: false
  })
}

const stylesVendors = () => {
  return gulp.src('app/sass/vendors.sass')
  .pipe(sass({ outputStyle: 'compressed'}).on('error', sass.logError) )
  .pipe(concat('vendors.min.css'))
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.stream())
}

const styles = () => {
  return gulp.src('app/sass/app.sass')
  .pipe(sass({ outputStyle: 'compressed'}).on('error', sass.logError) )
  .pipe(concat('app.min.css'))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.stream())
}

const scriptsVendors = () => {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js'
  ])
  .pipe(concat('vendors.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('app/js'))
}

const scripts = () => {
  return gulp.src([
    'app/js/app.js' 
  ])
  .pipe(babel({ presets: ['@babel/env'] }))
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('app/js'))
  .pipe(browserSync.stream())
}

const removeDist = async () => {
  return fs.rmdirSync('dist', {recursive: true})
}

const buildImages = () => {
  return gulp.src('app/images/**/*')
  .pipe(imagemin({interlaced: true, progressive: true, optimizationLevel: 5}))
  .pipe(gulp.dest('dist/img'))
}

const buildCopy = () => {
  return gulp.src([
    'app/css/**/*.min.css',
    'app/js/**/*.min.js',
    'app/img/**/*',
    'app/fonts/**/*',
    'app/**/*.html'
  ], {base: 'app'})
  .pipe(gulp.dest('dist'))
}

const watching = () => {
  gulp.watch(['app/sass/*.sass', '!app/sass/vendors.sass'], styles)
  gulp.watch(['app/sass/vendors.sass'], stylesVendors)
  gulp.watch(['app/js/*.js', '!app/js/*.min.js'], scripts)
  gulp.watch('app/**/*.html').on('change', browserSync.reload)
}

exports.build = gulp.series(removeDist, stylesVendors, styles, scriptsVendors, scripts, buildCopy, buildImages)
exports.default = gulp.parallel(stylesVendors, styles, scriptsVendors, scripts, browserSyncing, watching)
