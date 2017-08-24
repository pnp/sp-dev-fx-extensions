'use strict';

const build = require('@microsoft/sp-build-web');

build.task('serve-info', {
  execute: (config) => {
    return new Promise((resolve, reject) => {
      var serveTask = config.uniqueTasks.find((task) => {
        return task.name === 'serve';
      });
      var url = `http${serveTask.taskConfig.https ? 's' : ''}://${serveTask.taskConfig.hostname}:${serveTask.taskConfig.port}/temp/manifests.js`;

      for (var key in config.properties.manifests) {
        var manifest = config.properties.manifests[key];
        if (manifest.componentType !== 'Extension') {
          continue;
        }

        console.log(`${manifest.alias}:`);
        console.log();
        console.log(`Copy the querystring parameters on the next line.`);
        console.log(`?loadSPFX=true&debugManifestsFile=${url}&fieldCustomizers={"Priority":{"id":"${manifest.id}"}}`);
        console.log();
      }

      resolve();
    });
  }
});