'use strict';

let gulp = require('gulp'),
	sass = require('gulp-sass');

sass.compiler = require('node-sass');

gulp.task('sass', function () {
	return gulp.src('./sass/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function () {
	let cwd = { cwd: './' };

	gulp.watch('sass/**/*.scss', cwd, gulp.series('sass'));
});

gulp.task('deploy', function () {
	let files = ['**/*.*', '!node_modules/', '!.git'];

	return gulp.src(files)
		.pipe(gulp.dest('../../../dist/config/stream-interaction'));
});
