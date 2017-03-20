const fs = require('fs');
const del = require('del');
const path = require('path');
const gulp = require('gulp');
const rsa = require('node-rsa');
const opn = require('gulp-open');
const sass = require('gulp-sass');
const gutil = require('gulp-util');
const minimist = require('minimist');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const ChromeExtension = require("crx");
const browserify = require('browserify');
const cleanCSS = require('gulp-clean-css');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
const autoprefixer = require('gulp-autoprefixer');

const Task = (name?: string): Function =>
    (self: any, key: string): void =>
        void (gulp.task(name || key, self[key]));

const ts2es5 = typescript.createProject('tsconfig.json');
const knownOptions = {
    boolean: 'sourcemap',
    default: {
        sourcemap: true
    }
};
const options = minimist(process.argv.slice(2), knownOptions);

/**
 * Read a specified key file from disk
 * @param {String} keyPath path to the key to read
 * @returns {Promise}
 */
const readKeyFile = (keyPath: string) =>
    new Promise((resolve, reject) => {
        fs.readFile(keyPath, (err: any, data: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

/**
 * Generate a new key file
 * @param {String} keyPath path of the key file to create
 * @returns {Promise}
 */
const generateKeyFile = (keyPath: string) =>
    new Promise((resolve, reject) => {
        const key = new rsa({b: 2048});
        const keyVal = key.exportKey('pkcs1-private-pem');

        fs.writeFile(keyPath, keyVal, (err: any) => {
            if (err) {
                throw err;
            }
            resolve(keyVal);
        });
    });

class Gulpfile {

    @Task()
    compile_es5() {
        let task = gulp.src([
            'src/ts/**/*.ts?(x)',
            'spec*/**/*.ts?(x)'
        ]);
        if (options.sourcemap) {
            task = task.pipe(sourcemaps.init());
        }
        task = task.pipe(ts2es5())
        if (options.sourcemap) {
            task = task.pipe(sourcemaps.write())
        }
        return task.pipe(gulp.dest('build/es5'));
    }

    @Task('dev/background.js')
    background() {
        let task = browserify({
            entries: './build/es5/background/main.js',
            debug: true
        })
            .bundle()
            .pipe(source('background.js'));
        if (options.sourcemap) {
            task = task.pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(sourcemaps.write('./'));
        }
        return task.pipe(gulp.dest('./build/dev/js'))
    }

    @Task('dev/content-script.js')
    content_script() {
        let task = browserify({
            entries: './build/es5/content-script/main.js',
            debug: true
        })
            .bundle()
            .pipe(source('content-script.js'));
        if (options.sourcemap) {
            task = task.pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(sourcemaps.write('./'));
        }
        return task.pipe(gulp.dest('./build/dev/js'))
    }

    @Task('dev/popup.js')
    popup() {
        let task = browserify({
            entries: './build/es5/popup/main.js',
            debug: true
        })
            .bundle()
            .pipe(source('popup.js'));
        if (options.sourcemap) {
            task = task.pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(sourcemaps.write('./'));
        }
        return task.pipe(gulp.dest('./build/dev/js'))
    }

    @Task('dev/YouDanMu.js')
    YouDanMu() {
        let task = browserify({
            entries: './build/es5/YouDanMu/main.js',
            debug: true
        })
            .bundle()
            .pipe(source('YouDanMu.js'));
        if (options.sourcemap) {
            task = task.pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(sourcemaps.write());
        }
        return task.pipe(gulp.dest('./build/dev/js'))
    }

    @Task('all-spec.js')
    spec() {
        let task = browserify({
            entries: './build/es5/spec/all-spec.js',
            debug: true
        })
            .bundle()
            .pipe(source('all-spec.js'));
        if (options.sourcemap) {
            task = task.pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(sourcemaps.write('./'));
        }
        return task.pipe(gulp.dest('./build/spec'))
    }

    @Task('dev/content-script.css')
    content_script_css() {
        return gulp.src('src/scss/content-script/main.scss')
            .pipe(sass()).on('error', sass.logError)
            .pipe(autoprefixer())
            .pipe(rename('content-script.css'))
            .pipe(gulp.dest('build/dev/css'));
    }

    @Task('dev/popup.css')
    popup_css() {
        return gulp.src('src/scss/popup/main.scss')
            .pipe(sass()).on('error', sass.logError)
            .pipe(autoprefixer())
            .pipe(rename('popup.css'))
            .pipe(gulp.dest('build/dev/css'));
    }

    @Task('dev/static')
    dev_static() {
        return gulp.src("src/static/**")
            .pipe(gulp.dest("build/dev"));
    }

    @Task('dist/static')
    dist_static() {
        return gulp.src([
            'build/dev/*_locales/**',
            'build/dev/*images/**',
            'build/dev/manifest.json',
            'build/dev/popup.html'
        ]).pipe(gulp.dest('build/dist'));
    }

    @Task('dist/js')
    dist_js() {
        let task = gulp.src('build/dev/js/*.js')
        if (options.sourcemap) {
            task = task.pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }));
        }
        task = task.pipe(uglify()).on('error', gutil.log);
        if (options.sourcemap) {
            task = task.pipe(sourcemaps.write());
        }
        return task.pipe(gulp.dest('build/dist/js'));
    }

    @Task('dist/css')
    dist_css() {
        return gulp.src('build/dev/css/*.css')
            .pipe(cleanCSS()).on('error', gutil.log)
            .pipe(gulp.dest('build/dist/css'));
    }

    @Task()
    crx() {
        const keyPath = 'key.pem';
        const crx = new ChromeExtension();
        return readKeyFile(keyPath).then(null, err => {
            // If the key file doesn't exist, create one
            if (err.code === 'ENOENT') {
                return generateKeyFile(keyPath);
            } else {
                throw err;
            }
        }).then(key => {
            crx.privateKey = key;
        }).then(() => {
            return crx.load(path.resolve('build/dist'))
                .then((crx: any) => crx.pack())
                .then((crxBuffer: any) => {
                    fs.writeFileSync('build/YouDanMu.crx', crxBuffer);
                });
        });
    }

    @Task()
    watch(done: Function) {
        return gulp.series('default', () => {
            gulp.watch('src/ts/content-script/**/*.ts?(x)', gulp.series('compile_es5', 'dev/content-script.js'));
            gulp.watch('src/ts/popup/**/*.ts?(x)', gulp.series('compile_es5', 'dev/popup.js'));
            gulp.watch('src/ts/YouDanMu/**/*.ts?(x)', gulp.series('compile_es5', 'dev/YouDanMu.js'));
            gulp.watch('src/ts/background/**/*.ts?(x)', gulp.series('compile_es5', 'dev/background.js'));
            gulp.watch('spec/**/*.ts?(x)', gulp.series('compile_es5', 'all-spec.js'));
            gulp.watch('src/scss/content-script/**', gulp.series('dev/content-script.css'));
            gulp.watch('src/scss/popup/**', gulp.series('dev/popup.css'));
            gulp.watch('src/static/**', gulp.series('dev/static'));
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
        'dev/static',
        'dev/content-script.css',
        'dev/popup.css',
        gulp.series(
            'compile_es5',
            gulp.parallel(
                'dev/background.js',
                'dev/content-script.js',
                'dev/popup.js',
                'dev/YouDanMu.js',
                'all-spec.js'
            )))));

gulp.task('dist', gulp.series(
    'default',
    gulp.parallel(
        'dist/static',
        'dist/css',
        'dist/js'
    ),
    'crx'
))
