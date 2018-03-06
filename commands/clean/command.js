"use strict";

const filterable = require("@lerna/filter-options");
const CleanCommand = require(".");

/**
 * @see https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
 */
exports.command = "clean";

exports.describe = "Remove the node_modules directory from all packages.";

exports.builder = yargs => {
  yargs.options({
    yes: {
      group: "Command Options:",
      describe: "Skip all confirmation prompts",
    },
  });

  return filterable(yargs);
};

exports.handler = function handler(argv) {
  return new CleanCommand(argv);
};
