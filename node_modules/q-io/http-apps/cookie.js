
var Q = require("q");
var Cookie = require("../http-cookie");
Q.longStackSupport = true;

exports.CookieJar = function (app) {
    var hostCookies = {}; // to {} of pathCookies to [] of cookies
    return function (request) {

        if (!request.headers.host) {
            throw new Error("Requests must have a host header");
        }
        var hosts = allHostsContaining(request.headers.host);

        var now = new Date();

        // delete expired cookies
        for (var host in hostCookies) {
            var pathCookies = hostCookies[host];
            for (var path in pathCookies) {
                var cookies = pathCookies[path];
                for (var name in cookies) {
                    var cookie = cookies[name];
                    if (cookie.expires && cookie.expires > now) {
                        delete cookie[name];
                    }
                }
            }
        }

        // collect applicable cookies
        var requestCookies = concat(
            Object.keys(hostCookies)
            .map(function (host) {
                if (!hostContains(host, request.headers.host)) {
                    return [];
                }
                var pathCookies = hostCookies[host];
                return concat(
                    Object.keys(pathCookies)
                    .map(function (path) {
                        if (!pathContains(path, request.path))
                            return [];
                        var cookies = pathCookies[path];
                        return (
                            Object.keys(cookies)
                            .map(function (name) {
                                return cookies[name];
                            })
                            .filter(function (cookie) {
                                return cookie.secure ?
                                    request.ssl :
                                    true;
                            })
                        );
                    })
                )
            })
        );

        if (requestCookies.length) {
            request.headers["cookie"] = (
                requestCookies
                .map(function (cookie) {
                    return Cookie.stringify(
                        cookie.key,
                        cookie.value
                    );
                })
                .join("; ")
            );
        }

        return Q.when(app.apply(this, arguments), function (response) {
            response.headers = response.headers || {};
            if (response.headers["set-cookie"]) {
                var host = request.headers.host;
                var hostParts = splitHost(host);
                var hostname = hostParts[0];
                var requestHost = ipRe.test(hostname) ? host : "." + host;
                // normalize to array
                if (!Array.isArray(response.headers["set-cookie"])) {
                    response.headers["set-cookie"] = [response.headers["set-cookie"]];
                }
                response.headers["set-cookie"].forEach(function (cookie) {
                    var date = response.headers["date"] ?
                        new Date(response.headers["date"]) :
                        new Date();
                    cookie = Cookie.parse(cookie, date);
                    // ignore illegal host
                    if (cookie.host && !hostContains(requestHost, cookie.host))
                        delete cookie.host;
                    var host = requestHost || cookie.host;
                    var path = cookie.path || "/";
                    var pathCookies = hostCookies[host] = hostCookies[host] || {};
                    var cookies = pathCookies[path] = pathCookies[path] || {};
                    cookies[cookie.key] = cookie;
                })
                delete response.headers["set-cookie"];
            }

            return response;
        });

    };
};

var ipRe = /^\d+\.\d+\.\d+\.\d+$/;
var portRe = /^(.*)(:\d+)$/;

function splitHost(host) {
    var match = portRe.exec(host);
    if (match) {
        return [match[1], match[2]];
    } else {
        return [host, ""];
    }
}

function allHostsContaining(host) {
    var parts = splitHost(host);
    var hostname = parts[0];
    var port = parts[1];
    if (ipRe.test(hostname)) {
        return [hostname + port];
    } if (hostname === "localhost") {
        return [hostname + port];
    } else {
        var parts = hostname.split(".");
        var hosts = [];
        while (parts.length > 1) {
            hosts.push("." + parts.join(".") + port);
            parts.shift();
        }
        return hosts;
    }
}

function hostContains(containerHost, contentHost) {
    var containerParts = splitHost(containerHost);
    var containerHostname = containerParts[0];
    var containerPort = containerParts[1];
    var contentParts = splitHost(contentHost);
    var contentHostname = contentParts[0];
    var contentPort = contentParts[1];
    if (containerPort !== contentPort) {
        return false;
    }
    if (ipRe.test(containerHostname) || ipRe.test(contentHostname)) {
        return containerHostname === contentHostname;
    } else if (/^\./.test(containerHostname)) {
        return (
            contentHostname.lastIndexOf(containerHostname) ===
            contentHostname.length - containerHostname.length
        ) || (
            containerHostname.slice(1) === contentHostname
        );
    } else {
        return containerHostname === contentHostname;
    }
};

function pathContains(container, content) {
    if (/^\/$/.test(container)) {
        return content.indexOf(container) === 0;
    } else {
        return (
            content === container ||
            content.indexOf(container + "/") === 0
        );
    }
}

function concat(arrays) {
    return [].concat.apply([], arrays);
}

