module.exports = function(build) {
    const gutil = require("gulp-util");
    const fs = require("fs");
    const gulp = require('gulp');
  
    var getJson = function(file) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    };
  
    let bumpRevisionSubTask = build.subTask("bump-revision-subtask", function(
      gulp,
      buildOptions,
      done
    ) {
      var skipBumpRevision = buildOptions.args["revision"] === false;
      if (!skipBumpRevision) {
        var pkgSolution = getJson("./config/package-solution.json");
        var oldVersionNumber = String(pkgSolution.solution.version);
        gutil.log("Old Version: " + oldVersionNumber);
        var oldBuildNumber = parseInt(oldVersionNumber.split(".")[3]);
        gutil.log("Old Build Number: " + oldBuildNumber);
        var newBuildNumber = oldBuildNumber + 1;
        gutil.log("New Build Number: " + newBuildNumber);
        var newVersionNumber =
          oldVersionNumber.substring(
            0,
            String(oldVersionNumber).length - String(oldBuildNumber).length
          ) + String(newBuildNumber);
        gutil.log("New Version: " + newVersionNumber);
        pkgSolution.solution.version = newVersionNumber;
        fs.writeFileSync(
          "./config/package-solution.json",
          JSON.stringify(pkgSolution, null, 4)
        );
      }
      return gulp
        .src("./config/package-solution.json")
        .pipe(skipBumpRevision ? gutil.noop() : gulp.dest("./config"));
    });
  
    let bumpRevisionTask = build.task("bump-revision", bumpRevisionSubTask);
  
    gulp.task("version-sync", function() {
      var pkgConfig = getJson("./package.json");
      var pkgSolution = getJson("./config/package-solution.json");
      gutil.log("Old Version:\t" + pkgSolution.solution.version);
      var newVersionNumber = pkgConfig.version.split("-")[0] + ".0";
      pkgSolution.solution.version = newVersionNumber;
      gutil.log("New Version:\t" + pkgSolution.solution.version);
      fs.writeFileSync(
        "./config/package-solution.json",
        JSON.stringify(pkgSolution, null, 4)
      );
    });
  
    build.rig.addPreBuildTask(bumpRevisionTask);
  };
  