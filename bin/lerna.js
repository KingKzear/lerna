#!/usr/bin/env node

var lerna = require("../lib/index");
var chalk = require("chalk");
var meow = require("meow");

var cli = meow([
  "Usage",
  "  $ lerna [command]",
  "",
  "Commands:",
  "  bootstrap  Link together local packages and npm install remaining package dependencies",
  "  publish    Publish updated packages to npm",
  "  updated    Check which packages have changed since the last release",
  "  diff       Diff all packages or a single package since the last release",
  "  init       Initialize a lerna repo",
  "  run        Run npm script in each package",
  "  ls         List all public packages",
  "",
  "Options:",
  "  --independent, -i  Version packages independently",
  "  --canary, -c       Publish packages after every successful merge using the sha as part of the tag"
], {
  alias: {
    independent: "i",
    canary: "c"
  }
});

require("signal-exit").unload();

var commandName = cli.input[0];
var Command = lerna.__commands__[commandName];

if (!Command) {
  console.log(chalk.red("Invalid lerna command: " + commandName));
  cli.showHelp();
} else {
  var command = new Command(cli.input.slice(1), cli.flags);
  command.run();
}
