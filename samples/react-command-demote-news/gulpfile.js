'use strict';

const build = require('@microsoft/sp-build-web');


let copyIcons = build.subTask('copy-icons', function(gulp, buildOptions, done) {
    gulp.src('./*.svg')
        .pipe(gulp.dest('./temp/deploy'));
    done();
});
build.rig.addPostBuildTask(copyIcons);


build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

build.initialize(require('gulp'));