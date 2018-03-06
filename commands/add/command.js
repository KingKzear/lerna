"use strict";

const AddCommand = require(".");

/**
 * @see https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module
 */
exports.command = "add [pkgNames..]";

exports.describe = "Add dependencies to matched packages";

exports.builder = yargs =>
  yargs
    .positional("pkgNames", {
      describe: "One or more package names to add as a dependency",
      type: "string",
    })
    .options({
      dev: {
        group: "Command Options:",
        describe: "Save to devDependencies",
      },
    });

exports.handler = function handler(argv) {
  return new AddCommand(argv);
};
