const os = require("os");
const { ipcRenderer, remote } = require("electron");
const Runtime = require("jest-runtime");
const runTest = require("jest-runner/build/run_test");

ipcRenderer.on("run", (evt, { file, config, globalConfig }) => {
  Runtime.createHasteMap(config, {
    maxWorkers: os.cpus().length - 1,
    watchman: globalConfig.watchman
  })
    .build()
    .then(hasteMap => {
      const resolver = Runtime.createResolver(config, hasteMap.moduleMap);
      runTest(file, globalConfig, config, resolver)
        .then(results => {
          ipcRenderer.send("test-results", results);
          window.close();
        })
        .catch(e => {
          ipcRenderer.send(
            "error",
            e instanceof Error ? e.message : e.toString()
          );
          window.close();
        });
    });
});
