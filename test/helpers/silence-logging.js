"use strict";

const log = require("npmlog");

// silence logs
log.level = "silent";

// keep snapshots stable
log.disableColor();

// avoid corrupting test logging
log.disableProgress();
