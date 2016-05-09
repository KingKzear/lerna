import FileSystemUtilities from "../FileSystemUtilities";
import Command from "../Command";
import objectAssignSorted from "object-assign-sorted";

export default class InitCommand extends Command {
  // don't do any of this.
  runValidations() {}
  runPreparations() {}

  initialize(callback) {
    // Nothing to do...
    callback(null, true);
  }

  execute(callback) {
    this.ensurePackagesDirectory();
    this.ensurePackageJSON();
    this.ensureLernaJson();
    this.ensureNoVersionFile();
    this.logger.success("Successfully created Lerna files");
    callback(null, true);
  }

  ensurePackagesDirectory() {
    const packagesLocation = this.repository.packagesLocation;
    if (!FileSystemUtilities.existsSync(packagesLocation)) {
      this.logger.info("Creating packages folder.");
      FileSystemUtilities.mkdirSync(packagesLocation);
    }
  }

  ensurePackageJSON() {
    let {packageJsonLocation, packageJson} = this.repository;

    if (!packageJson) packageJson = {};
    // if (!packageJson.private) packageJson.private = true;
    if (!packageJson.dependencies) packageJson.dependencies = {};

    objectAssignSorted(packageJson.dependencies, {
      lerna: this.lernaVersion
    });

    if (!packageJson) {
      this.logger.info("Creating package.json.");
    } else {
      this.logger.info("Updating package.json.");
    }

    FileSystemUtilities.writeFileSync(packageJsonLocation, JSON.stringify(packageJson, null, "  "));
  }

  ensureLernaJson() {
    const {versionLocation, lernaJsonLocation, lernaJson} = this.repository;

    let version;

    if (this.flags.independent) {
      version = "independent";
    } else if (FileSystemUtilities.existsSync(versionLocation)) {
      version = FileSystemUtilities.readFileSync(versionLocation);
    } else if (lernaJson && lernaJson.version) {
      version = lernaJson.version;
    } else {
      version = "0.0.0";
    }

    if (!lernaJson) {
      this.logger.info("Creating lerna.json.");
    } else {
      this.logger.info("Updating lerna.json.");
    }

    FileSystemUtilities.writeFileSync(lernaJsonLocation, JSON.stringify({
      lerna: this.lernaVersion,
      version: version
    }, null, "  "));
  }

  ensureNoVersionFile() {
    const versionLocation = this.repository.versionLocation;
    if (FileSystemUtilities.existsSync(versionLocation)) {
      this.logger.info("Removing old VERSION file.");
      FileSystemUtilities.unlinkSync(versionLocation, "0.0.0");
    }
  }
}
