var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const minify = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const rollup = require('gulp-better-rollup');
const babel = require('gulp-babel');


gulp.task('style', function () {
	return gulp.src('src/styles/style.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer({
				browsers: [
					'last 2 versions',
					'last 2 Chrome versions',
					'last 2 Firefox versions',
					'last 2 Opera versions',
					'last 2 Edge versions'
				]
			}),
			mqpacker({ sort: true })
		]))
		.pipe(browserSync.stream())
		.pipe(minify())
		.pipe(gulp.dest('build'));
});

gulp.task('scripts', function () {
	return gulp.src('src/scripts/script.js')
		.pipe(plumber())
		.pipe(plumber())
		.pipe(rollup({}, 'iife'))
		.pipe(babel({
			minified: true,
			comments: false,
			presets: [
				["env",
					{
						targets: {
							browsers: ["last 2 versions"]
						}
					}
				]
			]
		}))
		.pipe(gulp.dest('build/scripts'));
});


gulp.task('imagemin', function () {
	return gulp.src('src/images/**/*.{jpg,png,gif}')
		.pipe(imagemin([
			imagemin.optipng({ optimizationLevel: 9 }),
			imagemin.jpegtran({ progressive: true })
		]))
		.pipe(gulp.dest('build/images'));
});

gulp.task('copy', function () {
	return gulp.src([
		'src/*.html',
		'src/fonts/**/*.*',
		'../favicon.ico'
	], { base: './src' })
		.pipe(gulp.dest('build'))
		.pipe(browserSync.stream());
});

gulp.task('copy-ico', function () {
	return gulp.src('*.ico')
		.pipe(gulp.dest('build'))
});

gulp.task('serve', function () {
	browserSync.init({
		server: {
			baseDir: "./build"
		}

	});
	gulp.watch('src/styles/**/*.{scss,sass}', ['style']);


	gulp.watch('src/scripts/**/*.js').on('change', () => {
		gulp.start('scripts');		
		browserSync.reload();
	});

	gulp.watch("src/*.html").on('change', () => {
		gulp.start('copy');
		browserSync.reload();
	});
})

gulp.task('start', ['copy', 'copy-ico', 'style', 'scripts', 'imagemin', 'serve']);
gulp.task('build', ['copy', 'copy-ico', 'style', 'scripts', 'imagemin']);
