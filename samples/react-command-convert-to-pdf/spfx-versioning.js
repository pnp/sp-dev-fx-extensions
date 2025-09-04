// Importing required modules
const log = require('fancy-log');
const fs = require('fs');
const gulp = require('gulp');
const through2 = require('through2');

module.exports = function (build) {
  /**
   * Helper function to read and parse JSON files
   * @param {string} filePath - The path to the JSON file
   * @returns {Object} - The parsed JSON object
   */
  const getJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

  /**
   * Sub-task to automatically bump the revision number in the package-solution.json file.
   * This task will run before each build unless explicitly skipped via the 'revision' flag.
   */
  const bumpRevisionSubTask = build.subTask('bump-revision-subtask', (gulp, buildOptions, done) => {
    // Check if the 'revision' flag is set to false to skip bumping the revision
    const shouldSkipBumpRevision = buildOptions.args['revision'] === false;

    if (!shouldSkipBumpRevision) {
      // Load the package-solution.json file
      const pkgSolution = getJson('./config/package-solution.json');
      const oldVersionNumber = pkgSolution.solution.version;
      log(`Old Version: ${oldVersionNumber}`);

      // Extract the build number (last segment) and increment it
      const oldBuildNumber = parseInt(oldVersionNumber.split('.')[3], 10);
      log(`Old Build Number: ${oldBuildNumber}`);

      const newBuildNumber = oldBuildNumber + 1;
      const newVersionNumber = oldVersionNumber.replace(/\d+$/, newBuildNumber);
      log(`New Version: ${newVersionNumber}`);

      // Update the version in the package-solution.json file
      pkgSolution.solution.version = newVersionNumber;
      fs.writeFileSync('./config/package-solution.json', JSON.stringify(pkgSolution, null, 4));
    }

    // Return the updated package-solution.json file
    return gulp
      .src('./config/package-solution.json')
      .pipe(shouldSkipBumpRevision ? through2.obj() : gulp.dest('./config'));
  });

  // Register the bump revision sub-task as a main task
  const bumpRevisionTask = build.task('bump-revision', bumpRevisionSubTask);

  /**
   * Task to synchronize the version number between package.json and package-solution.json.
   * This ensures that both files have the same version number, which is important for consistency.
   */
  gulp.task('version-sync', () => {
    // Load both package.json and package-solution.json files
    const pkgConfig = getJson('./package.json');
    const pkgSolution = getJson('./config/package-solution.json');

    log(`Old Version:\t${pkgSolution.solution.version}`);

    // Update the version number in package-solution.json to match package.json
    const newVersionNumber = `${pkgConfig.version.split('-')[0]}.0`;
    pkgSolution.solution.version = newVersionNumber;

    log(`New Version:\t${pkgSolution.solution.version}`);

    // Write the updated version back to the package-solution.json file
    fs.writeFileSync('./config/package-solution.json', JSON.stringify(pkgSolution, null, 4));
  });

  // Add the bump revision task as a pre-build task to ensure it runs before the main build
  build.rig.addPreBuildTask(bumpRevisionTask);
};