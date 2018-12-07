"use strict";

const log = require("libnpm/log");
const childProcess = require("@lerna/child-process");

module.exports = getLastCommit;

function getLastCommit(execOpts) {
  if (hasTags(execOpts)) {
    log.silly("getLastTagInBranch");

    return childProcess.execSync("git", ["describe", "--tags", "--abbrev=0"], execOpts);
  }

  log.silly("getFirstCommit");
  return childProcess.execSync("git", ["rev-list", "--max-parents=0", "HEAD"], execOpts);
}

function hasTags(opts) {
  let result = false;

  try {
    result = !!childProcess.execSync("git", ["tag"], opts);
  } catch (err) {
    log.warn("ENOTAGS", "No git tags were reachable from this branch!");
    log.verbose("hasTags error", err);
  }

  log.verbose("hasTags", result);

  return result;
}
