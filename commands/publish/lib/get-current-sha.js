"use strict";

const log = require("npmlog");
const childProcess = require("@lerna/child-process");

module.exports.getCurrentSHA = getCurrentSHA;

/**
 * Retrieve current SHA from git.
 * @param {CommandExecOpts} opts
 */
function getCurrentSHA(opts) {
  log.silly("getCurrentSHA");

  const sha = childProcess.execSync("git", ["rev-parse", "HEAD"], opts);
  log.verbose("getCurrentSHA", sha);

  return sha;
}
