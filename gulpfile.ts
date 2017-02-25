const del = require('del');
const gulp = require('gulp');
const opn = require('gulp-open');
const sass = require('gulp-sass');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
const autoprefixer = require('gulp-autoprefixer');

const Task = (name?: string): Function =>
    (self: any, key: string): void =>
        void (gulp.task(name || key, self[key]));

const ts2es5 = typescript.createProject('tsconfig.json');

class Gulpfile {

    @Task()
    compile_es5() {
        return gulp.src(['src/ts/**/*.ts', 'spec*/**/*.ts'])
            .pipe(sourcemaps.init())
            .pipe(ts2es5())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('build/es5'));
    }

    @Task('background.js')
    background() {
        let b = browserify({
            entries: './build/es5/background/main.js',
            debug: true
        });

        return b.bundle()
            .pipe(source('background.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            // .pipe(uglify()).on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./build/dist/js'))
    }

    @Task('content-script.js')
    content_script() {
        let b = browserify({
            entries: './build/es5/content-script/main.js',
            debug: true
        });

        return b.bundle()
            .pipe(source('content-script.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            // .pipe(uglify()).on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./build/dist/js'))
    }

    @Task('popup.js')
    popup() {
        let b = browserify({
            entries: './build/es5/popup/main.js',
            debug: true
        });

        return b.bundle()
            .pipe(source('popup.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            // .pipe(uglify()).on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./build/dist/js'))
    }

    @Task('YouDanMu.js')
    YouDanMu() {
        let b = browserify({
            entries: './build/es5/YouDanMu/main.js',
            debug: true
        });

        return b.bundle()
            .pipe(source('YouDanMu.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            // .pipe(uglify()).on('error', gutil.log)
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./build/dist/js'))
    }

    @Task('all-spec.js')
    spec() {
        let b = browserify({
            entries: './build/es5/spec/all-spec.js',
            debug: true
        });

        return b.bundle()
            .pipe(source('all-spec.js'))
            .pipe(gulp.dest('./build/spec'))
    }

    @Task('content-script.css')
    content_script_css() {
        return gulp.src('src/scss/content-script/main.scss')
            .pipe(sass()).on('error', sass.logError)
            .pipe(autoprefixer())
            .pipe(rename('content-script.css'))
            .pipe(gulp.dest('build/dist/css'));
    }

    @Task('popup.css')
    popup_css() {
        return gulp.src('src/scss/popup/main.scss')
            .pipe(sass()).on('error', sass.logError)
            .pipe(autoprefixer())
            .pipe(rename('popup.css'))
            .pipe(gulp.dest('build/dist/css'));
    }

    @Task()
    copy_static() {
        return gulp.src("src/static/**")
            .pipe(gulp.dest("build/dist"));
    }

    @Task()
    watch(done: Function) {
        return gulp.series('default', () => {
            gulp.watch('src/ts/content-script/**/*.ts', gulp.series('compile_es5', 'content-script.js'));
            gulp.watch('src/ts/popup/**/*.ts', gulp.series('compile_es5', 'popup.js'));
            gulp.watch('src/ts/YouDanMu/**/*.ts', gulp.series('compile_es5', 'YouDanMu.js'));
            gulp.watch('src/ts/background/**/*.ts', gulp.series('compile_es5', 'background.js'));
            gulp.watch('spec/**/*.ts', gulp.series('compile_es5', 'all-spec.js'));
            gulp.watch('src/scss/content-script/**', gulp.series('content-script.css'));
            gulp.watch('src/scss/popup/**', gulp.series('popup.css'));
            gulp.watch('src/static/**', gulp.series('copy_static'));
        })(done);
    }

    @Task()
    test(done: Function) {
        return gulp.series('default', () =>
            gulp.src('spec/mocha-browser-runner.html')
                .pipe(opn()))(done);
    }

    @Task()
    clean() {
        return del(['build']);
    }
}

gulp.task('default', gulp.series(
    'clean',
    gulp.parallel(
        'copy_static',
        'content-script.css',
        'popup.css',
        gulp.series(
            'compile_es5',
            gulp.parallel(
                'background.js',
                'content-script.js',
                'popup.js',
                'YouDanMu.js',
                'all-spec.js'
            )))));
