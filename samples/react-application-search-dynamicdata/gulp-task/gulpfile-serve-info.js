'use strict';

const build = require('@microsoft/sp-build-web');
const common = require("@microsoft/sp-build-common");

const originalBundleTask = build.rig.getBundleTask;
build.rig.getBundleTask = function () {
    const originalTask = originalBundleTask.apply(build.rig);
    return common.serial(originalTask, serveInfo);
}

const serveInfo = build.subTask('serve-info', (gulp, config, cb) => {
    var serveTask = config.uniqueTasks.find((task) => {
        return task.name === 'serve' /* SPFx < 1.2.0 */ ||
            task.name === 'spfx-serve' /* SPFx >= 1.2.0 */ ;
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

    cb();
});