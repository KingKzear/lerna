"use strict";

const Package = require("@lerna/package");

// file under test
const PackageGraph = require("..");

describe("PackageGraph", () => {
  describe("constructor", () => {
    it("throws an error when duplicate package names are present", () => {
      const pkgs = [
        new Package({ name: "pkg-1", version: "1.0.0" }, "/test/pkg-1", "/test"),
        new Package({ name: "pkg-2", version: "2.0.0" }, "/test/pkg-2", "/test"),
        new Package({ name: "pkg-2", version: "3.0.0" }, "/test/pkg-3", "/test"),
      ];

      try {
        // eslint-disable-next-line no-unused-vars
        const graph = new PackageGraph(pkgs);
      } catch (err) {
        expect(err.prefix).toBe("ENAME");
        expect(err.message).toMatchInlineSnapshot(`
"Package name \\"pkg-2\\" used in multiple packages:
	/test/pkg-2
	/test/pkg-3"
`);
      }

      expect.assertions(2);
    });
  });

  describe("Node", () => {
    it("proxies Package properties", () => {
      const pkg = new Package({ name: "my-pkg", version: "1.2.3" }, "/path/to/my-pkg");
      const graph = new PackageGraph([pkg]);
      const node = graph.get("my-pkg");

      // most of these properties are non-enumerable, so a snapshot doesn't work
      expect(node.name).toBe("my-pkg");
      expect(node.location).toBe("/path/to/my-pkg");
      expect(node.prereleaseId).toBeUndefined();
      expect(node.version).toBe("1.2.3");
      expect(node.pkg).toBe(pkg);
    });

    it("exposes graph-specific Map properties", () => {
      const node = new PackageGraph([
        new Package({ name: "my-pkg", version: "4.5.6" }, "/path/to/my-pkg"),
      ]).get("my-pkg");

      expect(node).toHaveProperty("externalDependencies", expect.any(Map));
      expect(node).toHaveProperty("localDependencies", expect.any(Map));
      expect(node).toHaveProperty("localDependents", expect.any(Map));
    });

    it("computes prereleaseId from prerelease version", () => {
      const node = new PackageGraph([
        new Package({ name: "my-pkg", version: "1.2.3-rc.4" }, "/path/to/my-pkg"),
      ]).get("my-pkg");

      expect(node.prereleaseId).toBe("rc");
    });
  });

  describe(".get()", () => {
    it("should return a node with localDependencies", () => {
      const packages = [
        new Package(
          {
            name: "my-package-1",
            version: "1.0.0",
            dependencies: {
              "external-thing": "^1.0.0",
            },
          },
          "/path/to/package-1"
        ),
        new Package(
          {
            name: "my-package-2",
            version: "1.0.0",
            devDependencies: {
              "my-package-1": "^1.0.0",
            },
          },
          "/path/to/package-2"
        ),
      ];
      const graph = new PackageGraph(packages, "allDependencies");

      expect(graph.get("my-package-1").localDependencies.size).toBe(0);
      expect(graph.get("my-package-2").localDependencies.has("my-package-1")).toBe(true);
    });

    it("should skip gitCommittish of packages that are not in localDependencies", () => {
      const packages = [
        new Package(
          {
            name: "my-package-1",
            version: "1.0.0",
            devDependencies: {
              "my-package-2": "^1.0.0",
            },
          },
          "/path/to/package-1"
        ),
        new Package(
          {
            name: "my-package-2",
            version: "1.0.0",
            dependencies: {
              "external-thing": "github:user-foo/project-foo#v1.0.0",
            },
          },
          "/path/to/package-2"
        ),
      ];
      const graph = new PackageGraph(packages, "dependencies");

      expect(graph.get("my-package-1").localDependencies.size).toBe(0);
      expect(graph.get("my-package-2").localDependencies.size).toBe(0);
    });

    it("should return the localDependencies for matched gitCommittish", () => {
      const packages = [
        new Package(
          {
            name: "my-package-1",
            version: "1.0.0",
            dependencies: {
              "external-thing": "^1.0.0",
            },
          },
          "/path/to/package-1"
        ),
        new Package(
          {
            name: "my-package-2",
            version: "1.0.0",
            devDependencies: {
              "my-package-1": "github:user-foo/project-foo#v1.0.0",
            },
          },
          "/path/to/package-2"
        ),
      ];
      const graph = new PackageGraph(packages);

      expect(graph.get("my-package-2").localDependencies.has("my-package-1")).toBe(true);
    });
  });
});

// eslint-disable-next-line no-unused-vars
function deepInspect(obj) {
  // jest console mutilates console.dir() options argument,
  // so sidestep it by requiring the non-shimmed method directly.
  // eslint-disable-next-line global-require
  require("console").dir(obj, { depth: 10, compact: false });
}
