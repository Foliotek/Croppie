
var Q = require("q");
var BOOT = require("./fs-boot");
var COMMON = require("./fs-common");

module.exports = RootFs;

function RootFs(outer, root) {
    var inner = Object.create(BOOT);

    function attenuate(path) {

        // the machinations of projecting a path inside a
        // subroot
        var actual;
        // if it's absolute, we want the path relative to
        // the root of the inner file system
        if (outer.isAbsolute(path)) {
            actual = outer.relativeFromDirectory(outer.ROOT, path);
        } else {
            actual = path;
        }
        // we join the path onto the root of the inner file
        // system so that parent references from the root
        // return to the root, emulating standard unix
        // behavior
        actual = outer.join(outer.ROOT, actual);
        // then we reconstruct the path relative to the
        // inner root
        actual = outer.relativeFromDirectory(outer.ROOT, actual);
        // and rejoin it on the outer root
        actual = outer.join(root, actual);
        // and find the corresponding real path
        return outer.canonical(actual)
        .then(function (actual) {
            return actual;
        }, function () {
            return actual;
        }).then(function (actual) {
            // and verify that the outer canonical path is
            // actually inside the inner canonical path, to
            // prevent break-outs
            if (outer.contains(root, actual)) {
                return {
                    "inner": outer.join(outer.ROOT, outer.relativeFromDirectory(root, actual)),
                    "outer": actual
                };
            } else {
                return Q.reject("Can't find: " + JSON.stringify(path));
            }
        });
    }

    function workingDirectory() {
        return outer.ROOT;
    }

    COMMON.update(inner, workingDirectory);

    inner.list = function (path) {
        return attenuate(path).then(function (path) {
            return outer.list(path.outer);
        }).then(null, function (reason) {
            return Q.reject("Can't list " + JSON.stringify(path));
        });
    };

    inner.open = function (path, flags, charset) {
        return attenuate(path).then(function (path) {
            return outer.open(path.outer, flags, charset);
        }).then(null, function (reason) {
            return Q.reject("Can't open " + JSON.stringify(path));
        });
    };

    inner.stat = function (path) {
        return attenuate(path).then(function (path) {
            return outer.stat(path.outer);
        }).then(null, function (reason) {
            return Q.reject("Can't stat " + JSON.stringify(path));
        });
    };

    inner.statLink = function (path) {
        return attenuate(path).then(function (path) {
            return outer.statLink(path.outer);
        }).then(null, function (reason) {
            return Q.reject("Can't statLink " + JSON.stringify(path));
        });
    };

    inner.canonical = function (path) {
        return attenuate(path).then(function (path) {
            return path.inner;
        }).then(null, function (reason) {
            return Q.reject("Can't find canonical of " + JSON.stringify(path));
        });
    };

    inner.makeDirectory = function (path) {
        return attenuate(path).then(function (path) {
            return outer.makeDirectory(path.outer);
        }).catch(function (error) {
            throw new Error("Can't make directory " + JSON.stringify(path));
        });
    };

    inner.removeDirectory = function (path) {
        return attenuate(path).then(function (path) {
            return outer.removeDirectory(path.outer);
        }).catch(function (error) {
            throw new Error("Can't remove directory " + JSON.stringify(path));
        });
    };

    inner.remove = function (path) {
        return attenuate(path).then(function (path) {
            return outer.remove(path.outer);
        }).catch(function (error) {
            throw new Error("Can't remove " + JSON.stringify(path));
        });
    };

    inner.makeTree = function (path) {
        return attenuate(path).then(function (path) {
            return outer.makeTree(path.outer);
        }).catch(function (error) {
            throw new Error("Can't make tree " + JSON.stringify(path));
        });
    };

    inner.removeTree = function (path) {
        return attenuate(path).then(function (path) {
            return outer.removeTree(path.outer);
        }).catch(function (error) {
            throw new Error("Can't remove tree " + JSON.stringify(path));
        });
    };

    return Q.when(outer.canonical(root), function (_root) {
        root = _root;
        return inner;
    });
}

