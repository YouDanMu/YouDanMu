var del = require('del');
var path = require('path');
var gulp = require('gulp');
var tsify = require('tsify');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var autoprefixer = require('gulp-autoprefixer');

var paths = {
    src: {
        ts: {
            'js/content-script.js': 'src/ts/content-script/main.ts',
            'js/YouDanMu.js': 'src/ts/YouDanMu/main.ts',
            'js/popup.js': 'src/ts/popup/main.ts'
        },
        scss: {
            'css/content-script.css': 'src/scss/content-script/main.scss',
            'css/popup.css': 'src/scss/popup/main.scss'
        },
        static: 'src/static/**'
    },
    dist: 'dist'
};

var watches = [];

function copy_static() {
    return gulp.src(paths.src.static)
        .pipe(gulp.dest(paths.dist));
}

function generate_ts(from, to) {
    return function () {
        return browserify({
            basedir: '.', debug: true, entries: [from],
            cache: {}, packageCache: {}
        })
        .plugin(tsify).bundle()
        .pipe(source(to)).pipe(gulp.dest(paths.dist));
    };
}

Object.keys(paths.src.ts).map(function(target) {
    var from = paths.src.ts[target];
    gulp.task(target, generate_ts(from, target));
    watches.push([from, target]);
});

function generate_scss(from, to) {
    return function() {
        return gulp.src(from)
            .pipe(sass()).on('error', sass.logError)
            .pipe(autoprefixer())
            .pipe(rename(to))
            .pipe(gulp.dest(paths.dist));
    };
}

Object.keys(paths.src.scss).map(function(target) {
    var from = paths.src.scss[target];
    gulp.task(target, generate_scss(from, target));
    watches.push([from, target]);
});

function clean_task(done) {
    del.sync(paths.dist + '/**/*');
    done();
}

function watch_task() {
    watches.forEach(function(args) {
        gulp.watch(path.dirname(args[0]) + '/**/*', gulp.parallel(args[1]));
    });
    gulp.watch(paths.src.static, gulp.parallel('copy-static'));
}

gulp.task('clean', clean_task);
gulp.task('copy-static', copy_static);
gulp.task('default', gulp.series(
    'clean',
    gulp.parallel(
        'copy-static',
        Object.keys(paths.src.ts),
        Object.keys(paths.src.scss))));
gulp.task('watch', gulp.series('default', watch_task));
