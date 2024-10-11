"use strict";
const gulp = require('gulp');
const build = require("@microsoft/sp-build-web");
var getTasks = build.rig.getTasks;

build.addSuppression(
  `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);
build.addSuppression(/error semicolon: Unnecessary semicolon$/);
build.addSuppression(/error semicolon: Missing semicolon$/);
build.addSuppression(/filename should end with module.sass or module.scss$/);
build.addSuppression(/Warning/gi);
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

require("./spfx-versioning")(build);
build.tslintCmd.enabled = false;
build.initialize(require("gulp"));
