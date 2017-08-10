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
        switch (manifest.extensionType) {
          case "ApplicationCustomizer":
            console.log(`?loadSPFX=true&debugManifestsFile=${url}&customActions={"${manifest.id}":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"prop1":"val1"}}}`);
            break;
          case "FieldCustomizer":
            console.log(`?loadSPFX=true&debugManifestsFile=${url}&fieldCustomizers={"FieldName":{"id":"${manifest.id}","properties":{"prop1":"val1"}}}`);
            break;
          case "ListViewCommandSet":
            console.log(`?loadSPFX=true&debugManifestsFile=${url}&customActions={"${manifest.id}":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}`);
            break;
        }
        console.log();
      }

      resolve();
    });
  }
});
