'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');

require('./gulpfile-serve-info');

build.initialize(gulp);

gulp.tasks['serve-info'].dep.push('serve');
