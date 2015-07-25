(function () {
    "use strict";
    var root = this, FS = {};
    if (typeof exports !== 'undefined') {
        FS = exports;
        root._ = require('underscore')._;
        root.Backbone = require('backbone');
        root.Net = require('net');
        root.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        root.WebSocket = require("websocket.js").WebSocket;
    } else {
        if (typeof root.FS !== 'object') {
            root.FS = {};
        }
        FS = root.FS;
        root.WebSocket = root.WebSocket || root.MozWebSocket;
        root.console = root.console || {
                log: function () {
                }, debug: function () {
                }
            };
    }
    FS.Templates = FS.Templates || {};
    FS.sdkVersionInfo = function () {
        return {
            buildNumber: 165,
            gitCommit: "commit 698d5a7edf06a36dc92a3a7f87adf6c9674c5742",
            user: "bamboo",
            date: "Thu Jun 26 23:29:35 UTC 2014"
        };
    };
    FS.EventDispatcher = function () {
    };
    FS.EventDispatcher.prototype = {
        bind: function (msg, cb, ctx, once) {
            if (this.eventCallbacks === undefined) {
                this.eventCallbacks = {};
            }
            if (this.eventCallbacks[msg] === undefined) {
                this.eventCallbacks[msg] = [];
            }
            var evtObject = {callback: cb, context: ctx, once: once};
            this.eventCallbacks[msg].push(evtObject);
            this.emit('newListener', {dispatcher: this, event: msg, callback: cb, context: ctx, once: once});
        }, once: function (msg, cb, ctx) {
            this.bind(msg, cb, ctx, true);
        }, unbind: function (msg, cb, ctx) {
            if (this.eventCallbacks === undefined || this.eventCallbacks[msg] === undefined) {
                return;
            }
            this.eventCallbacks[msg] = this.eventCallbacks[msg].filter(function (e) {
                return (e.callback !== cb) || (e.context !== ctx);
            });
        }, unbindAll: function (msg) {
            if (this.eventCallbacks === undefined) {
                return;
            }
            delete this.eventCallbacks[msg];
        }, listeners: function (msg) {
            if (this.eventCallbacks === undefined) {
                return [];
            }
            return (this.eventCallbacks[msg] || []).concat();
        }, emit: function (msg) {
            if (this.eventCallbacks === undefined) {
                return;
            }
            var data = Array.prototype.slice.call(arguments, 1);
            this.listeners(msg).forEach(function (cb) {
                cb.callback.apply(cb.context || this, data);
            });
            this.eventCallbacks[msg] = this.listeners(msg).filter(function (cb) {
                return !cb.once;
            });
        }
    };
    FS.EventDispatcher.prototype.trigger = FS.EventDispatcher.prototype.emit;
    FS.Utils = {};
    FS.Utils._monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    FS.Utils._dayArray = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
    FS.Utils.bindAll = function (ctx) {
        var calls;
        if (arguments.length > 1) {
            calls = Array.prototype.slice.call(arguments, 1);
        } else {
            calls = ctx.keys();
        }
        calls.forEach(function (name) {
            var call = ctx[name];
            ctx[name] = function () {
                call.apply(ctx, arguments);
            };
        });
    };
    FS.detectMobile = function () {
        var a = navigator.userAgent || navigator.vendor || window.opera, b = /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a), c = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
        return (b || c);
    };
    FS.isCrossDomain = function (url) {
        var p = /^https?\:\/\/([^\/]*)\//;
        var p2 = /^\/\/([^\/]*)\//;
        var match = url.match(p) || url.match(p2);
        return match && (match[1] !== document.location.host);
    };
    FS.hasCORSSupport = function () {
        if (!FS.Utils.hasOwnProperty('_hasCORSSupport')) {
            FS.Utils._hasCORSSupport = ('withCredentials'in new root.XMLHttpRequest());
        }
        return FS.Utils._hasCORSSupport;
    };
    FS.XDomainLoad = function (method, url, post, callback) {
        var http;
        callback = callback || (function () {
            });
        if (!FS.hasCORSSupport() && root.XDomainRequest && FS.isCrossDomain(url)) {
            http = new root.XDomainRequest();
            http.open(method, url, true);
            http.onload = function () {
                var result;
                var status = 200;
                try {
                    result = JSON.parse(http.responseText);
                } catch (err) {
                    if (FS.Debug.error) {
                        console.log("Failed to parse JSON: " + http.responseText)
                    }
                    result = {};
                    status = 500;
                }
                callback(status, result, http.responseText);
            };
            http.onprogress = function () {
            };
            http.ontimeout = http.onerror = function (evt) {
                callback(500, {}, evt);
            };
        } else {
            http = new root.XMLHttpRequest();
            http.open(method, url, true);
            if (method === "POST") {
                http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
            http.onreadystatechange = function () {
                if (http.readyState !== 4) {
                    return;
                }
                callback(http.status, (http.status === 200) && JSON.parse(http.responseText), http.responseText);
            };
        }
        if (post) {
            http.send(post);
        } else {
            http.send();
        }
    };
    FS.Query = function (obj, queries) {
        if (typeof obj !== 'object') {
            throw new Error('Cannot query non-object');
        } else if (obj === null) {
            throw new Error('Cannot perform query on a null object');
        }
        function test(value, query) {
            if (typeof query === 'function') {
                return query(value);
            } else if (typeof query === 'object' && query !== null) {
                if (query instanceof RegExp) {
                    return query.test(value);
                }
                for (var q in query) {
                    var c = query[q];
                    switch (q) {
                        case'$exists':
                            if (value === undefined) {
                                return false;
                            }
                            break;
                        case'$gt':
                            if (c >= value) {
                                return false;
                            }
                            break;
                        case'$gte':
                            if (c > value) {
                                return false;
                            }
                            break;
                        case'$lte':
                            if (c < value) {
                                return false;
                            }
                            break;
                        case'$lt':
                            if (c <= value) {
                                return false;
                            }
                            break;
                        case'$not':
                            if (typeof c !== 'object' || c === null) {
                                throw new Error("Cannot invert a non-query");
                            }
                            if (test(value, c)) {
                                return false;
                            }
                            break;
                        case'$in':
                            if (!Array.isArray(c)) {
                                throw new Error("$in query requires an array of queries");
                            }
                            if (c.indexOf(value) < 0) {
                                return false;
                            }
                            break;
                        case'$nin':
                            if (!Array.isArray(c)) {
                                throw new Error("$nin query requires an array of queries");
                            }
                            if (c.indexOf(value) >= 0) {
                                return false;
                            }
                            break;
                        case'$or':
                            if (!Array.isArray(c)) {
                                throw new Error("$or query requires an array of queries");
                            }
                            if (!c.some(function (query) {
                                    return test(value, query);
                                })) {
                                return false;
                            }
                            break;
                        case'$nor':
                            if (!Array.isArray(c)) {
                                throw new Error("$nor query requires an array of queries");
                            }
                            if (c.some(function (query) {
                                    return test(value, query);
                                })) {
                                return false;
                            }
                            break;
                        case'$and':
                            if (!Array.isArray(c)) {
                                throw new Error("$and query requires an array of queries");
                            }
                            if (!c.every(function (query) {
                                    return test(value, query);
                                })) {
                                return false;
                            }
                            break;
                        default:
                            throw new Error("Unknown query " + q);
                    }
                }
                return true;
            } else {
                return query === value;
            }
        }

        for (var key in queries) {
            if (!test(obj[key], queries[key]))
                return false;
        }
        return true;
    };
    FS.Utils.getURLParams = function () {
        var vars = [];
        window.location.search.substr(1).split('&').forEach(function (hash, idx) {
            var v, d;
            hash = hash.split('=').map(function (s) {
                return s.toLowerCase();
            });
            vars[idx] = hash[0];
            if (hash.length > 1) {
                vars[hash[0]] = hash[1];
            }
        });
        return vars;
    };
    FS.Utils.getAppPlatform = function () {
        var appPlatform = "unknown";
        if (typeof root.exports !== 'undefined') {
            appPlatform = "node";
        } else {
            var params = FS.Utils.getURLParams();
            var appPlatformParam = params.ap;
            if (appPlatformParam === "fb" || appPlatformParam === "gh" || appPlatformParam === "ios") {
                appPlatform = appPlatformParam;
            } else {
                appPlatform = "gs";
            }
        }
        return appPlatform;
    };
    FS.Utils.extend = function (subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype, {constructor: {value: subClass}});
        subClass.superclass = superClass.prototype;
        if (superClass.prototype.constructor === Object.prototype.constructor) {
            superClass.prototype.constructor = superClass;
        }
        return subClass;
    };
    FS.Utils.shallowCopy = function (src) {
        return FS.Utils.mergeProperties({}, src);
    };
    FS.Utils.mergeProperties = function (dest, src, withRemove) {
        if (typeof withRemove !== "boolean") {
            withRemove = false;
        }
        var key;
        for (key in src) {
            if (src.hasOwnProperty(key)) {
                if (withRemove && src[key] === null) {
                    delete dest[key];
                } else {
                    dest[key] = src[key];
                }
            }
        }
        return dest;
    };
    FS.Utils.unfoldObjectKV = function (list) {
        var o = {};
        list.forEach(function (kv) {
            o[kv.key] = kv.value;
        });
        return o;
    };
    FS.Utils.foldObjectKV = function (obj) {
        var list = [], key;
        for (key in obj) {
            var kv = {};
            kv[key] = obj[key];
            list.push(kv);
        }
        return list;
    };
    FS.Utils.InfoCookie = function (id, defaults) {
        if (typeof id === "string") {
            this.id = id.toLowerCase();
        } else {
            this.id = "funsocketsplayercookie";
        }
        if (typeof defaults === "object") {
            defaults.vers = "1.3";
            FS.Utils.mergeProperties(this, defaults);
        }
    };
    FS.Utils.InfoCookie.prototype.get = function () {
        var cookie = new RegExp("(^|;)\\s*" + encodeURI(this.id) + "\\s*=\\s*(.*?)\\s*($|;)", "g");
        var match = cookie.exec(document.cookie);
        if (match !== null) {
            try {
                var json = JSON.parse(decodeURI(match[2]));
                if (json !== null) {
                    if (json.vers === "1.3") {
                        FS.Utils.mergeProperties(this, json);
                    } else {
                        this.remove();
                    }
                }
            } catch (e) {
                this.remove();
            }
        }
    };
    FS.Utils.InfoCookie.prototype.put = function (path, expiry, data) {
        var cookiedata = data || this, cookie, domain = document.location.hostname.split(".");
        cookiedata.vers = "1.3";
        cookie = encodeURI(this.id) + "=" + encodeURI(JSON.stringify(cookiedata));
        if (domain.length > 2) {
            domain[0] = '';
            cookie += ";domain=" + domain.join(".");
        }
        else if (document.location.host.indexOf("localhost") < 0) {
            cookie += ";domain=." + domain.join(".");
        }
        if (path) {
            cookie += ";path=" + path;
        }
        if (expiry) {
            var d = new Date();
            d.setUTCMilliseconds(d.getUTCMilliseconds() + expiry);
            cookie += ";expires=" + d.toUTCString();
        }
        cookie += ";vers=1.3";
        document.cookie = cookie;
    };
    FS.Utils.InfoCookie.prototype.remove = function () {
        var d = new Date(), cookie, domain = document.location.host.split(".");
        d.setUTCMilliseconds(d.getUTCMilliseconds() - 1);
        cookie = encodeURI(this.id) + '=;expires=' + d.toUTCString();
        if (domain.length > 2) {
            domain[0] = '';
            cookie += ";domain=" + domain.join(".");
        }
        else {
            cookie += ";domain=." + domain.join(".");
        }
        document.cookie = cookie;
        cookie = encodeURI(this.id) + '=;path=/;expires=' + d.toUTCString();
        if (domain.length > 2) {
            domain[0] = '';
            cookie += ";domain=" + domain.join(".");
        }
        else {
            cookie += ";domain=." + domain.join(".");
        }
        document.cookie = cookie;
    };
    FS.Utils.InfoCookie.removeAll = function () {
        var put = this.prototype.put;
        document.cookie.split(";").forEach(function (cookie) {
            var d = new Date();
            d.setUTCMilliseconds(d.getUTCMilliseconds() - 1);
            document.cookie = cookie + ";expires=" + d.toUTCString();
            document.cookie = cookie + ";path=/;expires=" + d.toUTCString();
        });
    };
    FS.Utils.signOut = function () {
        var params = FS.Utils.getURLParams(), cookie;
        if (typeof params.cookieid === "undefined") {
            params.cookieid = null;
        }
        cookie = new FS.Utils.InfoCookie(params.cookieid);
        cookie.remove();
    };
    FS.Utils.gatherUrlCookieParams = function (debug, defaults) {
        var params, cookie;
        if (typeof window !== "undefined") {
            params = FS.Utils.getURLParams();
            if (debug) {
                console.log("gatherUrlCookieParams found the following URL params:", params);
            }
            if (typeof params.cookieid === "undefined") {
                params.cookieid = null;
            }
            cookie = new FS.Utils.InfoCookie(params.cookieid, defaults);
            cookie.get();
            FS.Utils.mergeProperties(cookie);
            FS.Utils.mergeProperties(cookie, params);
            if (debug) {
                console.log("ConnectionMaker merged the following cookie params:", params);
            }
            return cookie;
        } else {
            return defaults;
        }
    };
    FS.Utils.ConnectionMaker = function (kind, options, overrideserver) {
        this.options = options;
        this.overrideserver = overrideserver;
        if (typeof options.httpUrl !== "string") {
            throw"ConnectionMake must have at least a httpUrl passed in to work";
        }
        this.kind = kind;
    };
    FS.Utils.extend(FS.Utils.ConnectionMaker, FS.EventDispatcher);
    FS.Utils.ConnectionMaker.prototype.getConnection = function (cb) {
        this.options = FS.Utils.gatherUrlCookieParams(FS.Debug.error, this.options);
        if (typeof this.options.connectionInfo === 'object' && this.options.connectionInfo.kind === this.kind && typeof this.options.connectionInfo === 'object' && this.options.connectionInfo.playerPoolId === this.options.playerPoolId && typeof this.options.connectionInfo === 'object' && this.options.connectionInfo.httpUrl === this.options.httpUrl) {
            this.connInfo = new FS.ConnectionInfo(this.options.httpUrl, this.options);
            try {
                this.connInfo.restore(this.options.connectionInfo);
            } catch (err) {
                if (FS.Debug.error) {
                    console.log("ConnectionMaker found connectionInfo is incomplete,", err);
                }
                this.connInfo = null;
            }
        }
        if (this.connInfo) {
            if (FS.Debug.error) {
                console.log("ConnectionMaker connectionInfo valid, trying to use it");
            }
            var that = this;
            this.conn = new FS.Connection(this.connInfo, this.options);
            this.conn.connect(function (resp) {
                if (resp.data.code === 0) {
                    if (FS.Debug.error) {
                        console.log("ConnectionMaker connection established using connInfo");
                    }
                    if (that.connInfo.kind === 'player' || that.connInfo.kind === 'guest') {
                        that.conn.playerNotificationOn({gameId: that.options.gameId}, function (resp) {
                            if (resp.data.code === 0) {
                                console.log("Successfully subscribed to game notifications");
                            }
                        });
                        that.conn.playerNotificationOn({playerId: that.connInfo.playerId}, function (resp) {
                            if (resp.data.code === 0) {
                                console.log("Successfully subscribed to player notifications");
                            }
                        });
                    }
                    cb(that.conn);
                    return;
                } else {
                    if (FS.Debug.error) {
                        console.log("ConnectionMaker connectionInfo was invalid");
                    }
                    that.getConnPhase2.call(that, cb);
                }
            });
        } else {
            this.getConnPhase2(cb);
        }
    };
    FS.Utils.ConnectionMaker.prototype.getConnPhase2 = function (cb, over) {
        if (FS.Debug.error) {
            console.log("ConnectionMaker trying to make get new ConnectionInfo from defaults");
        }
        this.connInfo = new FS.ConnectionInfo(this.options.httpUrl, this.options);
        var apiCall = "login" + this.kind.charAt(0).toUpperCase() + this.kind.substring(1);
        var that = this;
        try {
            this.connInfo[apiCall](this.options, function (resp) {
                if (resp.data.code !== 0) {
                    if (FS.Debug.error) {
                        console.log("ConnectionMaker authentication failed:", resp);
                    }
                    cb(null);
                    return;
                }
                if (FS.Debug.error) {
                    console.log("ConnectionMaker authentication success:");
                }
                that.conn = new FS.Connection(that.connInfo, that.options);
                that.conn.connect(function (resp) {
                    if (resp.data.code !== 0) {
                        if (FS.Debug.error) {
                            console.log("ConnectionMaker connection failure:", resp);
                        }
                        cb(null);
                        return;
                    }
                    if (FS.Debug.error) {
                        console.log("ConnectionMaker connection success:");
                    }
                    if (that.connInfo.kind === 'player' || that.connInfo.kind === 'guest') {
                        that.conn.playerNotificationOn({playerId: that.connInfo.playerId}, function (resp) {
                            if (resp.data.code === 0) {
                                console.log("Successfully subscribed to player notifications");
                            }
                        });
                    }
                    cb(that.conn);
                });
            }, this.overrideserver);
        } catch (err) {
            if (FS.Debug.error) {
                console.log("ConnectionMaker not enough parameter to create a connection:", err);
            }
            cb(null);
        }
    };
    FS.Utils.isArray = function (testObject) {
        return (!!testObject) && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
    };
    FS.Utils.getObjectClass = function (obj) {
        var arr;
        if (obj && obj.constructor && obj.constructor.toString) {
            arr = obj.constructor.toString().match(/function\s*(\w+)/);
            return arr && arr.length === 2 ? arr[1] : undefined;
        } else {
            return undefined;
        }
    };
    FS.Utils.construct = function (className, args) {
        var o = Object.create(className.prototype);
        className.apply(o, args);
        return o;
    };
    FS.Utils.checkObj = function (proto, obj) {
        var missing = "", x;
        for (x in proto) {
            if (typeof proto[x] === "object") {
                if (typeof obj[x] === "object") {
                    missing = missing + this.checkObj(proto[x], obj[x]);
                } else {
                    missing = missing + x + ", ";
                }
            } else if (proto[x] === "array" && typeof obj[x] === 'object') {
                if (FS.Utils.isArray(obj[x]) === false) {
                    missing = missing + x + ", ";
                }
            } else if (proto[x] === "number" && typeof obj[x] === "string") {
                var numericExpression = /^[0-9]+$/;
                if (obj[x].match(numericExpression)) {
                    obj[x] = parseInt(obj[x], 10);
                } else {
                    missing = missing + x + ", ";
                }
            } else if (typeof obj[x] !== proto[x]) {
                missing = missing + x + ", ";
            }
        }
        return missing;
    };
    FS.Utils.isNodeJS = function () {
        return typeof module !== 'undefined' && module.exports;
    };
    FS.Utils._debugOutlineRects = function (ctx, rects) {
        ctx.save();
        var i;
        for (i = 0; i < rects.length; i += 1) {
            var rect = rects[i];
            ctx.rect(rect.x, rect.y, rect.w, rect.h);
            ctx.strokeStyle = 'rgb(200,200,0)';
            ctx.strokeWidth = 5;
            ctx.stroke();
        }
        ctx.restore();
    };
    FS.Utils._debugFillRect = function (ctx, rect) {
        ctx.save();
        ctx.fillStyle = "rgb(200,0,0)";
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.restore();
    };
    FS.Utils.getTimestamp = function () {
        var d = new Date();
        var yearStr = d.getFullYear();
        var monthStr = FS.Utils._monthArray[d.getMonth()];
        var dayStr = FS.Utils._dayArray[d.getDate()];
        var timeStr = d.toLocaleTimeString() + " " + (d.getTimezoneOffset() / -0.6 );
        var dateTimeStamp = "[" + dayStr + "/" + monthStr + "/" + yearStr + ":" + timeStr + "]";
        return dateTimeStamp;
    };
    FS.Utils.useConsoleLogWithTimestamp = function () {
        if (!FS.Utils._clog) {
            FS.Utils._clog = console.log;
            console.log = function () {
                var dateTimeStamp = FS.Utils.getTimestamp();
                if (arguments.length > 0) {
                    var args = arguments;
                    args[0] = dateTimeStamp + " " + arguments[0];
                    FS.Utils._clog.apply(this, args);
                } else {
                    FS.Utils._clog(dateTimeStamp);
                }
            };
        }
        ;
        if (!FS.Utils._cerror) {
            FS.Utils._cerror = console.error;
            console.error = function () {
                var dateTimeStamp = FS.Utils.getTimestamp();
                if (arguments.length > 0) {
                    var args = arguments;
                    args[0] = dateTimeStamp + " " + arguments[0];
                    FS.Utils._cerror.apply(this, args);
                } else {
                    FS.Utils._cerror(dateTimeStamp);
                }
            };
        }
        ;
        process.on("uncaughtException", function (err) {
            console.error("UNCAUGHT EXCEPTION");
            if (err && err.stack) {
                console.error(err.stack);
            } else if (err) {
                console.error(err);
            }
            if (!FS.Utils._forever) {
                process.exit(-1);
            }
        });
    };
    FS.Utils.startServerLog = function (name, callback) {
        FS.Utils.useConsoleLogWithTimestamp();
        if (name) {
            console.log("FS.Utils.startServerLog: " + name);
        } else {
            console.log("FS.Utils.startServerLog");
        }
        if (callback) {
            callback();
        }
    };
    FS.Utils.startServerForever = function (name, callback) {
        FS.Utils.useConsoleLogWithTimestamp();
        FS.Utils._forever = 1;
        if (name) {
            console.log("FS.Utils.startServerForever: " + name);
        } else {
            console.log("FS.Utils.startServerForever");
        }
        if (callback) {
            callback();
        }
    };
    (function () {
        FS.Debug = {
            "all": {"enabled": false},
            "notice": {"parent": "all", "enabled": false},
            "warning": {"parent": "all", "enabled": true},
            "error": {"parent": "all", "enabled": true},
            "comet": {"enabled": false},
            "message": {
                "illegal": {"parent": "error", "enabled": false},
                "ping": {"parent": "message.traffic", "enabled": false},
                "raw": {"parent": "message.transaction", "enabled": false},
                "status": {"parent": "message.transaction", "enabled": false},
                "request": {"parent": "message.transaction", "enabled": false},
                "response": {"parent": "message.transaction", "enabled": false},
                "events": {"parent": "message.transaction", "enabled": false},
                "transaction": {"parent": "message.traffic", "enabled": false},
                "decryptMessages": {"parent": "message.transaction", "enabled": false},
                "traffic": {"parent": "notice", "enabled": false},
                "statechange": {"parent": "notice", "enabled": false}
            },
            "meeting": {
                "chat": {"parent": "notice", "enabled": false},
                "playerlist": {"parent": "notice", "enabled": false}
            },
            "game": {"message": {"parent": "notice", "enabled": false}}
        };
        function _makePropertyDef(enabled, parent) {
            return {
                "get": function () {
                    if (enabled) {
                        return true;
                    } else if (parent) {
                        var map = FS.Debug;
                        parent.split(".").forEach(function (name) {
                            if (map[name] === undefined) {
                                throw new Error('Could not find debug property ' + parent);
                            }
                            map = map[name];
                        });
                        return map;
                    }
                    return false;
                }, "set": function (value) {
                    enabled = Boolean(value);
                }
            };
        }

        function _mapProperties(map) {
            var k, obj;
            for (k in map) {
                obj = map[k];
                if (obj.enabled !== undefined) {
                    Object.defineProperty(map, k, _makePropertyDef(obj.enabled, obj.parent));
                } else {
                    _mapProperties(obj);
                }
            }
        }

        function _setByName(name, value) {
            var node = name.split("."), i;
            var map = FS.Debug;
            for (i = 0; i < node.length - 1; i += 1) {
                if (map[node[i]] !== 'object') {
                    throw new Error('Could not find property name ' + node[i]);
                }
                map = map[node[i]];
            }
            map[node[node.length - 1]] = Boolean(value);
        }

        FS.mapDebug = function (options, lead) {
            lead = lead || "FS.Debug.";
            for (var key in options) {
                try {
                    if (key.substr(0, lead.length) !== lead) {
                        continue;
                    }
                    _setByName(key.substr(lead.length), Boolean(options[key]));
                } catch (e) {
                }
            }
        };
        _mapProperties(FS.Debug);
        if (typeof exports !== 'undefined') {
            process.argv.slice(2).forEach(function (prop) {
                if (prop[0] !== '-') {
                    return;
                }
                try {
                    _setByName.apply(undefined, prop.substr(1).split('='));
                } catch (e) {
                }
            });
        } else {
            FS.mapDebug(FS.Utils.getURLParams(), 'debug.');
        }
    }).call(this);
    (function () {
        FS.JobQueue = FS.Utils.extend(function () {
            var jobs = [];
            var queue = this;
            var fullStop = false;

            function onstarted(evt) {
                queue.emit('started', evt);
            }

            function onlog(evt) {
                queue.emit('log', evt);
            }

            function onerror(evt) {
                queue.emit('error', evt);
                if (!queue.running) {
                    queue.emit('finished');
                }
            }

            function oncomplete(evt) {
                queue.emit('complete', evt);
                if (!queue.running) {
                    queue.emit('finished');
                }
            }

            function attach(job) {
                job.bind('started', onstarted);
                job.bind('error', onerror);
                job.bind('log', onlog);
                job.bind('complete', oncomplete);
                jobs.push(job);
            }

            function runJobs(jobs) {
                jobs.forEach(function (job) {
                    job.start();
                });
            }

            Object.defineProperties(this, {
                'running': {
                    get: function () {
                        return jobs.reduce(function (acc, r) {
                            return acc || r.started;
                        }, this.started);
                    }
                }, 'complete': {
                    get: function () {
                        return jobs.reduce(function (acc, r) {
                            return acc && r.complete;
                        }, true);
                    }
                }, 'finished': {
                    get: function () {
                        return jobs.reduce(function (acc, r) {
                            return acc && r.finished;
                        }, true);
                    }
                }, 'error': {
                    get: function () {
                        return jobs.reduce(function (acc, r) {
                            return acc || r.error;
                        }, false);
                    }
                }
            });
            this.start = function () {
                this.started = true;
                runJobs(jobs);
                this.started = false;
                if (!queue.running) {
                    queue.emit('finished');
                }
            };
            this.allStop = function () {
                fullStop = true;
            };
            this.clear = function () {
                fullStop = false;
                jobs.forEach(function (job) {
                    job.clear();
                });
            };
            this.Job = function (task, userdata) {
                this.queue = queue;
                this.task = task;
                this.dependants = [];
                this.required = [];
                this.args = Array.prototype.slice.call(arguments, 1);
                this.userdata = userdata || {};
                this.started = false;
                this.finished = false;
                attach(this);
            };
            FS.Utils.extend(this.Job, FS.EventDispatcher);
            var job = this.Job.prototype;
            Object.defineProperties(this.Job.prototype, {
                'ready': {
                    get: function () {
                        return this.required.reduce(function (acc, r) {
                            return acc && r.finished;
                        }, true);
                    }
                }, 'complete': {
                    get: function () {
                        return this.error || this.finished;
                    }
                }
            });
            job.require = function () {
                Array.prototype.forEach.call(arguments, function (job) {
                    this.required.push(job);
                    job.dependants.push(this);
                }, this);
            };
            job.start = function () {
                if (fullStop || this.error || this.finished || this.started) {
                    return;
                }
                if (!this.ready) {
                    runJobs(this.required);
                    return;
                }
                this.started = true;
                this.emit('started', {target: this});
                this.task.apply(this, this.args);
            };
            job.done = function () {
                this.finished = true;
                runJobs(this.dependants);
                this.started = false;
                this.emit('complete', {target: this});
            };
            job.log = function () {
                this.emit('log', {target: this, info: Array.prototype.slice.call(arguments)});
            };
            job.clear = function () {
                delete this.error;
            };
            job.fail = function (err) {
                this.error = err;
                this.started = false;
                this.emit('error', {target: this, error: err});
            };
        }, FS.EventDispatcher);
    }).call(this);
    (function () {
        FS.Promise = FS.Utils.extend(function () {
        }, FS.EventDispatcher);
        FS.Promise.isPromise = function (o) {
            return o && (typeof o === 'object') && (o instanceof FS.Promise);
        };
        FS.Promise.all = function () {
            var p = new FS.Promise();
            var total = arguments.length;
            var resps = new Array(total);
            if (arguments.length) {
                Array.prototype.forEach.call(arguments, function (pr, i) {
                    pr.then(function (r) {
                        resps[i] = pr.resolution;
                        if (--total === 0) {
                            p.resolve(resps);
                        }
                    }, function (err) {
                        p.fail(err);
                    });
                });
            } else {
                p.resolve(resps);
            }
            return p;
        };
        FS.Promise.prototype.then = function (succ, fail) {
            if (this.resolved) {
                succ.apply(null, this.resolution);
            } else {
                this.once('resolved', function (evt) {
                    succ.apply(null, evt.result);
                });
            }
            if (fail) {
                if (this.error) {
                    fail.apply(null, this.error);
                } else {
                    this.once('error', fail);
                }
            }
        };
        FS.Promise.prototype.chain = function (other) {
            if (this.resolved) {
                return other;
            } else if (other.resolved) {
                return this;
            }
            var p = new FS.Promise();
            this.then(function (a) {
                other.then(function (b) {
                    p.resolve(b);
                }, function (err) {
                    p.fail(err);
                });
            }, function (err) {
                p.fail(err);
            });
            return p;
        };
        FS.Promise.prototype.resolve = function () {
            this.resolution = Array.prototype.slice.call(arguments, 0);
            this.resolved = true;
            this.emit('resolved', {result: this.resolution});
            this.unbindAll('error');
        };
        FS.Promise.prototype.fail = function (err) {
            this.error = Array.prototype.slice.call(arguments, 0);
            this.emit.apply(this, ['error'].concat(this.error));
            this.unbindAll('resolved');
        };
    }).call(this);
    (function () {
        FS.Model = FS.Utils.extend(function () {
            FS.EventDispatcher.call(this);
        }, FS.EventDispatcher);
        FS.Model.prototype.refresh = function (data) {
            FS.Utils.mergeProperties(this, data);
        };
        FS.Model.prototype.defineModel = function (fields, data) {
            var promise = new FS.Promise();
            var that = this;
            promise.resolve(this);
            function joinPromise(pj) {
                promise = promise.chain(pj);
            }

            Object.defineProperties(that, {
                "promise": {
                    'get': function () {
                        return promise;
                    }
                }, "ready": {
                    'get': function () {
                        return promise.ready;
                    }
                }
            });
            function defaultModel(name) {
                var o = {};
                var data;
                o[name] = {
                    'get': function () {
                        return data;
                    }, 'set': function (v) {
                        var old = data;
                        data = v;
                        this.emit("changed:" + name, {target: this, value: v, old: old});
                    }, 'configurable': false, 'enumerable': true
                };
                return o;
            }

            for (var key in fields) {
                var type = fields[key];
                var o;
                if (type.model) {
                    o = type.model(key, joinPromise);
                } else {
                    o = defaultModel(key);
                }
                Object.defineProperties(this, o);
            }
            if (data) {
                this.refresh(data);
            }
        };
        FS.Model.ObjectKeyModel = function (type) {
            return function (name, pj) {
                var o = {};
                var data;
                o[name] = {
                    'get': function () {
                        return data;
                    }, 'set': function (v) {
                        if (!type.prototype.isPrototypeOf(v)) {
                            throw"Cannot assign confliction type";
                        } else if (data === v) {
                            return;
                        }
                        var old = data;
                        data = v;
                        this.emit("changed:" + name, {target: this, value: v, old: old});
                    }, 'enumerable': true, 'configurable': false
                };
                o[name + "Id"] = {
                    'get': function () {
                        return data ? data.id : undefined;
                    }, 'set': function (v) {
                        var p = new FS.Promise();
                        var that = this;
                        if (data && data.id === v) {
                            return;
                        } else if (!data) {
                            data = null;
                        }
                        pj(p);
                        type.getById(this.connection, v).then(function (np) {
                            data = np;
                            p.resolve(that);
                        }, function (err) {
                            p.fail(err);
                        });
                    }, 'enumerable': true, 'configurable': false
                };
                return o;
            };
        };
        FS.PrimaryKey = function () {
        };
        FS.PrimaryKey.model = function (name, pj) {
            var o = {
                'id': {
                    'get': function () {
                        return this[name];
                    }, 'enumerable': true, 'configurable': false
                }
            };
            return o;
        };
    }).call(this);
    (function () {
        FS.Collection = FS.Utils.extend(function (baseType, length) {
            FS.Model.call(this);
            if (length !== undefined) {
                Object.defineProperty(this, 'length', {value: length, 'configurable': false});
            }
            Object.defineProperties(this, {
                'baseType': {value: this.baseType, 'configurable': false},
                '_collection': {value: (length && new Array(length)) || [], 'configurable': false, 'enumerable': false}
            });
        }, FS.Model);
        FS.Collection.isCollection = function (e) {
            return e instanceof FS.Collection;
        };
        FS.Collection.fromArray = function (a, type) {
            var c = new FS.Collection(type);
            a.forEach(function (v, i) {
                c.set(i, v);
            });
            return c;
        };
        Object.defineProperties(FS.Collection.prototype, {
            'reset': {
                value: function () {
                    while (this.length > 0) {
                        this.removeAt(this.length - 1);
                    }
                }
            }, 'filter': {
                value: function (a, b) {
                    return this._collection.filter(a, b);
                }
            }, 'forEach': {
                value: function (a, b) {
                    return this._collection.forEach(a, b);
                }
            }, 'map': {
                value: function (a, b) {
                    return this._collection.map(a, b);
                }
            }, 'reduce': {
                value: function (a, b) {
                    return this._collection.reduce(a, b);
                }
            }, 'reduceRight': {
                value: function (a, b) {
                    return this._collection.reduceRight(a, b);
                }
            }, 'every': {
                value: function (a, b) {
                    return this._collection.every(a, b);
                }
            }, 'some': {
                value: function (a, b) {
                    return this._collection.some(a, b);
                }
            }, 'length': {
                'get': function () {
                    return this._collection.length;
                }, 'set': function (v) {
                    if (v != this._collection.length) {
                        this.emit('resized', {source: this, target: v, old: this.length});
                        this._collection.length = v;
                    }
                }
            }, 'remove': {
                value: function () {
                    var elements = Array.prototype.slice.call(arguments);
                    var removed = [];
                    var that = this;
                    elements.forEach(function (e) {
                        that.indexOf(e).reverse().forEach(function (idx) {
                            removed.push(that.removeAt(idx));
                        });
                    });
                    return removed;
                }
            }, 'removeAt': {
                value: function (index, count) {
                    var r = this._collection.splice(index, count || 1);
                    var that = this;
                    r.forEach(function (e, i) {
                        that.emit('removed', {source: that, index: i, target: e});
                    });
                    if (count) {
                        return r;
                    } else {
                        return r.length ? r[0] : -1;
                    }
                }
            }, 'indexOf': {
                value: function (element) {
                    return this._collection.reduce(function (p, e, i) {
                        if (e === element) {
                            p.push(i);
                        }
                        return p;
                    }, []);
                }
            }, 'get': {
                value: function (index) {
                    return this._collection[index];
                }
            }, 'where': {
                value: function (prop, val) {
                    for (var i = 0; i < this._collection.length; i++) {
                        if (this._collection[i][prop] === val) {
                            return i;
                        }
                    }
                    return null;
                }
            }, 'set': {
                value: function (index, value) {
                    if (value !== null && this.baseType && !(value instanceof this.baseType)) {
                        throw new Error(value + " is not an accepted type");
                    }
                    this.length = Math.max(this.length, index + 1);
                    if (index >= this.length || index < 0) {
                        throw"Assignment out of bound";
                    }
                    var oldValue = this._collection[index];
                    this._collection[index] = value;
                    if (oldValue && value === undefined) {
                        this.emit('removed', {source: this, target: oldValue, index: index});
                    } else if (oldValue === undefined && value) {
                        this.emit('added', {source: this, target: value, index: index});
                    }
                    if (oldValue !== value) {
                        this.emit('changed', {source: this, target: value, index: index, oldValue: oldValue});
                    }
                }
            }, 'add': {
                value: function (value) {
                    this.set(this.length, value);
                }
            }
        });
    }).call(this);
    var CryptoJS = CryptoJS || function (h, i) {
            var e = {}, f = e.lib = {}, l = f.Base = function () {
                function a() {
                }

                return {
                    extend: function (j) {
                        a.prototype = this;
                        var d = new a;
                        j && d.mixIn(j);
                        d.$super = this;
                        return d
                    }, create: function () {
                        var a = this.extend();
                        a.init.apply(a, arguments);
                        return a
                    }, init: function () {
                    }, mixIn: function (a) {
                        for (var d in a)a.hasOwnProperty(d) && (this[d] = a[d]);
                        a.hasOwnProperty("toString") && (this.toString = a.toString)
                    }, clone: function () {
                        return this.$super.extend(this)
                    }
                }
            }(), k = f.WordArray = l.extend({
                init: function (a, j) {
                    a = this.words = a || [];
                    this.sigBytes = j != i ? j : 4 * a.length
                }, toString: function (a) {
                    return (a || m).stringify(this)
                }, concat: function (a) {
                    var j = this.words, d = a.words, c = this.sigBytes, a = a.sigBytes;
                    this.clamp();
                    if (c % 4)for (var b = 0; b < a; b++)j[c + b >>> 2] |= (d[b >>> 2] >>> 24 - 8 * (b % 4) & 255) << 24 - 8 * ((c + b) % 4); else if (65535 < d.length)for (b = 0; b < a; b += 4)j[c + b >>> 2] = d[b >>> 2]; else j.push.apply(j, d);
                    this.sigBytes += a;
                    return this
                }, clamp: function () {
                    var a = this.words, b = this.sigBytes;
                    a[b >>> 2] &= 4294967295 << 32 - 8 * (b % 4);
                    a.length = h.ceil(b / 4)
                }, clone: function () {
                    var a = l.clone.call(this);
                    a.words = this.words.slice(0);
                    return a
                }, random: function (a) {
                    for (var b = [], d = 0; d < a; d += 4)b.push(4294967296 * h.random() | 0);
                    return k.create(b, a)
                }
            }), o = e.enc = {}, m = o.Hex = {
                stringify: function (a) {
                    for (var b = a.words, a = a.sigBytes, d = [], c = 0; c < a; c++) {
                        var e = b[c >>> 2] >>> 24 - 8 * (c % 4) & 255;
                        d.push((e >>> 4).toString(16));
                        d.push((e & 15).toString(16))
                    }
                    return d.join("")
                }, parse: function (a) {
                    for (var b = a.length, d = [], c = 0; c < b; c += 2)d[c >>> 3] |= parseInt(a.substr(c, 2), 16) << 24 - 4 * (c % 8);
                    return k.create(d, b / 2)
                }
            }, q = o.Latin1 = {
                stringify: function (a) {
                    for (var b = a.words, a = a.sigBytes, d = [], c = 0; c < a; c++)d.push(String.fromCharCode(b[c >>> 2] >>> 24 - 8 * (c % 4) & 255));
                    return d.join("")
                }, parse: function (a) {
                    for (var b = a.length, d = [], c = 0; c < b; c++)d[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - 8 * (c % 4);
                    return k.create(d, b)
                }
            }, r = o.Utf8 = {
                stringify: function (a) {
                    try {
                        return decodeURIComponent(escape(q.stringify(a)))
                    } catch (b) {
                        throw Error("Malformed UTF-8 data");
                    }
                }, parse: function (a) {
                    return q.parse(unescape(encodeURIComponent(a)))
                }
            }, b = f.BufferedBlockAlgorithm = l.extend({
                reset: function () {
                    this._data = k.create();
                    this._nDataBytes = 0
                }, _append: function (a) {
                    "string" == typeof a && (a = r.parse(a));
                    this._data.concat(a);
                    this._nDataBytes += a.sigBytes
                }, _process: function (a) {
                    var b = this._data, d = b.words, c = b.sigBytes, e = this.blockSize, g = c / (4 * e), g = a ? h.ceil(g) : h.max((g | 0) - this._minBufferSize, 0), a = g * e, c = h.min(4 * a, c);
                    if (a) {
                        for (var f = 0; f < a; f += e)this._doProcessBlock(d, f);
                        f = d.splice(0, a);
                        b.sigBytes -= c
                    }
                    return k.create(f, c)
                }, clone: function () {
                    var a = l.clone.call(this);
                    a._data = this._data.clone();
                    return a
                }, _minBufferSize: 0
            });
            f.Hasher = b.extend({
                init: function () {
                    this.reset()
                }, reset: function () {
                    b.reset.call(this);
                    this._doReset()
                }, update: function (a) {
                    this._append(a);
                    this._process();
                    return this
                }, finalize: function (a) {
                    a && this._append(a);
                    this._doFinalize();
                    return this._hash
                }, clone: function () {
                    var a = b.clone.call(this);
                    a._hash = this._hash.clone();
                    return a
                }, blockSize: 16, _createHelper: function (a) {
                    return function (b, d) {
                        return a.create(d).finalize(b)
                    }
                }, _createHmacHelper: function (a) {
                    return function (b, d) {
                        return g.HMAC.create(a, d).finalize(b)
                    }
                }
            });
            var g = e.algo = {};
            return e
        }(Math);
    (function (h) {
        var i = CryptoJS, e = i.lib, f = e.WordArray, e = e.Hasher, l = i.algo, k = [], o = [];
        (function () {
            function e(a) {
                for (var b = h.sqrt(a), d = 2; d <= b; d++)if (!(a % d))return !1;
                return !0
            }

            function f(a) {
                return 4294967296 * (a - (a | 0)) | 0
            }

            for (var b = 2, g = 0; 64 > g;)e(b) && (8 > g && (k[g] = f(h.pow(b, 0.5))), o[g] = f(h.pow(b, 1 / 3)), g++), b++
        })();
        var m = [], l = l.SHA256 = e.extend({
            _doReset: function () {
                this._hash = f.create(k.slice(0))
            }, _doProcessBlock: function (e, f) {
                for (var b = this._hash.words, g = b[0], a = b[1], j = b[2], d = b[3], c = b[4], h = b[5], l = b[6], k = b[7], n = 0; 64 > n; n++) {
                    if (16 > n)m[n] = e[f + n] | 0; else {
                        var i = m[n - 15], p = m[n - 2];
                        m[n] = ((i << 25 | i >>> 7) ^ (i << 14 | i >>> 18) ^ i >>> 3) + m[n - 7] + ((p << 15 | p >>> 17) ^ (p << 13 | p >>> 19) ^ p >>> 10) + m[n - 16]
                    }
                    i = k + ((c << 26 | c >>> 6) ^ (c << 21 | c >>> 11) ^ (c << 7 | c >>> 25)) + (c & h ^ ~c & l) + o[n] + m[n];
                    p = ((g << 30 | g >>> 2) ^ (g << 19 | g >>> 13) ^ (g << 10 | g >>> 22)) + (g & a ^ g & j ^ a & j);
                    k = l;
                    l = h;
                    h = c;
                    c = d + i | 0;
                    d = j;
                    j = a;
                    a = g;
                    g = i + p | 0
                }
                b[0] = b[0] + g | 0;
                b[1] = b[1] + a | 0;
                b[2] = b[2] + j | 0;
                b[3] = b[3] + d | 0;
                b[4] = b[4] + c | 0;
                b[5] = b[5] + h | 0;
                b[6] = b[6] + l | 0;
                b[7] = b[7] + k | 0
            }, _doFinalize: function () {
                var e = this._data, f = e.words, b = 8 * this._nDataBytes, g = 8 * e.sigBytes;
                f[g >>> 5] |= 128 << 24 - g % 32;
                f[(g + 64 >>> 9 << 4) + 15] = b;
                e.sigBytes = 4 * f.length;
                this._process()
            }
        });
        i.SHA256 = e._createHelper(l);
        i.HmacSHA256 = e._createHmacHelper(l)
    })(Math);
    (function () {
        var h = CryptoJS, i = h.enc.Utf8;
        h.algo.HMAC = h.lib.Base.extend({
            init: function (e, f) {
                e = this._hasher = e.create();
                "string" == typeof f && (f = i.parse(f));
                var h = e.blockSize, k = 4 * h;
                f.sigBytes > k && (f = e.finalize(f));
                for (var o = this._oKey = f.clone(), m = this._iKey = f.clone(), q = o.words, r = m.words, b = 0; b < h; b++)q[b] ^= 1549556828, r[b] ^= 909522486;
                o.sigBytes = m.sigBytes = k;
                this.reset()
            }, reset: function () {
                var e = this._hasher;
                e.reset();
                e.update(this._iKey)
            }, update: function (e) {
                this._hasher.update(e);
                return this
            }, finalize: function (e) {
                var f = this._hasher, e = f.finalize(e);
                f.reset();
                return f.finalize(this._oKey.clone().concat(e))
            }
        })
    })();
    (function () {
        var g = CryptoJS, i = g.lib, f = i.WordArray, i = i.Hasher, b = [], m = g.algo.SHA1 = i.extend({
            _doReset: function () {
                this._hash = f.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
            }, _doProcessBlock: function (f, n) {
                for (var d = this._hash.words, j = d[0], k = d[1], h = d[2], g = d[3], a = d[4], e = 0; 80 > e; e++) {
                    if (16 > e)b[e] = f[n + e] | 0; else {
                        var c = b[e - 3] ^ b[e - 8] ^ b[e - 14] ^ b[e - 16];
                        b[e] = c << 1 | c >>> 31
                    }
                    c = (j << 5 | j >>> 27) + a + b[e];
                    c = 20 > e ? c + ((k & h | ~k & g) + 1518500249) : 40 > e ? c + ((k ^ h ^ g) + 1859775393) : 60 > e ? c + ((k & h | k & g | h & g) - 1894007588) : c + ((k ^ h ^ g) - 899497514);
                    a = g;
                    g = h;
                    h = k << 30 | k >>> 2;
                    k = j;
                    j = c
                }
                d[0] = d[0] + j | 0;
                d[1] = d[1] + k | 0;
                d[2] = d[2] + h | 0;
                d[3] = d[3] + g | 0;
                d[4] = d[4] + a | 0
            }, _doFinalize: function () {
                var b = this._data, f = b.words, d = 8 * this._nDataBytes, j = 8 * b.sigBytes;
                f[j >>> 5] |= 128 << 24 - j % 32;
                f[(j + 64 >>> 9 << 4) + 15] = d;
                b.sigBytes = 4 * f.length;
                this._process()
            }
        });
        g.SHA1 = i._createHelper(m);
        g.HmacSHA1 = i._createHmacHelper(m)
    })();
    (function () {
        var g = CryptoJS, i = g.lib, f = i.Base, b = i.WordArray, i = g.algo, m = i.HMAC, l = i.PBKDF2 = f.extend({
            cfg: f.extend({
                keySize: 4,
                hasher: i.SHA1,
                iterations: 1
            }), init: function (b) {
                this.cfg = this.cfg.extend(b)
            }, compute: function (f, d) {
                for (var g = this.cfg, k = m.create(g.hasher, f), h = b.create(), i = b.create([1]), a = h.words, e = i.words, c = g.keySize, g = g.iterations; a.length < c;) {
                    var l = k.update(d).finalize(i);
                    k.reset();
                    for (var q = l.words, t = q.length, r = l, s = 1; s < g; s++) {
                        r = k.finalize(r);
                        k.reset();
                        for (var v = r.words, p = 0; p < t; p++)q[p] ^= v[p]
                    }
                    h.concat(l);
                    e[0]++
                }
                h.sigBytes = 4 * c;
                return h
            }
        });
        g.PBKDF2 = function (b, d, f) {
            return l.create(f).compute(b, d)
        }
    })();
    FS.CryptoJS = CryptoJS;
    FS.LogLevel = function () {
    };
    FS.LogLevel.OFF = 0;
    FS.LogLevel.FATAL = 1;
    FS.LogLevel.ERROR = 2;
    FS.LogLevel.WARN = 3;
    FS.LogLevel.INFO = 4;
    FS.LogLevel.DEBUG = 5;
    FS.LogLevel.TRACE = 6;
    FS.LogLevel.ALL = 7;
    FS.ConsoleAppender = function () {
    };
    FS.ConsoleAppender.prototype.log = function (level, s) {
        switch (level) {
            case FS.LogLevel.FATAL:
            case FS.LogLevel.ERROR:
                (console.error || console.log)(s);
                break;
            case FS.LogLevel.WARN:
                console.warn(s);
                break;
            case FS.LogLevel.INFO:
            case FS.LogLevel.DEBUG:
                console.info(s);
                break;
            case FS.LogLevel.TRACE:
            default:
                console.trace(s);
                break;
        }
    };
    FS.LogServerAppender = function () {
        this.host = "localhost";
        this.port = 9999;
        this.queue = [];
    };
    FS.LogServerAppender.prototype.log = function (level, s) {
        var self = this;
        if (self.client && self.client.connected) {
            self.client.write(s + '\n');
            return;
        }
        self.queue.push(s);
        if (self.client) {
            return;
        }
        self.client = root.Net.connect(self.port, self.host, function () {
            self.client.write('@{name:LogServerAppender,level:DEBUG}\n');
            var s;
            while (s = self.queue.shift()) {
                self.client.write(s + '\n');
            }
            self.client.connected = true;
        });
        self.client.on('data', function (data) {
            console.error('Unexpected response from log server: ' + data.toString());
        });
        self.client.on('end', function () {
            if (self.client) {
                self.client.end();
                delete self.client;
            }
        });
        self.client.on('drain', function () {
        });
        self.client.on('error', function (errobj) {
            if (self.client) {
                self.client.end();
                delete self.client;
            }
        });
        self.client.on('close', function (had_error) {
            if (self.client) {
                self.client.end();
                delete self.client;
            }
        });
    }
    FS.Logger = function (name) {
        this.name = (name ? name : "Logger");
        this.level = FS.LogLevel.OFF;
        this.appenders = [];
    };
    FS.Logger.prototype.setLevel = function (level) {
        this.level = level;
    };
    FS.Logger.prototype.addAppender = function (appender) {
        this.appenders.push(appender);
    };
    FS.Logger.prototype.log = function (level, msg) {
        if (level > this.level) {
            return;
        }
        for (var idx in this.appenders) {
            var appender = this.appenders[idx];
            appender.log(level, msg);
        }
    }
    FS.Logger.prototype.fatal = function (s) {
        this.log(FS.LogLevel.FATAL, s);
    };
    FS.Logger.prototype.error = function (s) {
        this.log(FS.LogLevel.ERROR, s);
    };
    FS.Logger.prototype.warn = function (s) {
        this.log(FS.LogLevel.WARN, s);
    };
    FS.Logger.prototype.info = function (s) {
        this.log(FS.LogLevel.INFO, s);
    };
    FS.Logger.prototype.debug = function (s) {
        this.log(FS.LogLevel.DEBUG, s);
    };
    FS.Logger.prototype.trace = function (s) {
        this.log(FS.LogLevel.TRACE, s);
    };
    FS.Logger.getRootLogger = function () {
        if (!FS.Logger.root)
            FS.Logger.root = new FS.Logger("[root]");
        return FS.Logger.root;
    };
    FS.Logger.getLogger = function (name) {
        if (!name) {
            return FS.Logger.getRootLogger();
        }
        if (!FS.Logger.loggers) {
            FS.Logger.loggers = [];
        }
        if (!FS.Logger.loggers[name]) {
            FS.Logger.loggers[name] = new FS.Logger(name);
        }
        return FS.Logger.loggers[name];
    };
    (function () {
        root.GibberishAES = (function () {
            var Nr = 14, Nk = 8, Decrypt = false, enc_utf8 = function (s) {
                try {
                    return unescape(encodeURIComponent(s));
                }
                catch (e) {
                    throw'Error on UTF-8 encode';
                }
            }, dec_utf8 = function (s) {
                try {
                    return decodeURIComponent(escape(s));
                }
                catch (e) {
                    throw('Bad Key');
                }
            }, padBlock = function (byteArr) {
                var array = [], cpad, i;
                if (byteArr.length < 16) {
                    cpad = 16 - byteArr.length;
                    array = [cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad];
                }
                for (i = 0; i < byteArr.length; i++) {
                    array[i] = byteArr[i];
                }
                return array;
            }, block2s = function (block, lastBlock) {
                var string = '', padding, i;
                if (lastBlock) {
                    padding = block[15];
                    if (padding > 16) {
                        throw('Decryption error: Maybe bad key');
                    }
                    if (padding == 16) {
                        return '';
                    }
                    for (i = 0; i < 16 - padding; i++) {
                        string += String.fromCharCode(block[i]);
                    }
                } else {
                    for (i = 0; i < 16; i++) {
                        string += String.fromCharCode(block[i]);
                    }
                }
                return string;
            }, a2h = function (numArr) {
                var string = '', i;
                for (i = 0; i < numArr.length; i++) {
                    string += (numArr[i] < 16 ? '0' : '') + numArr[i].toString(16);
                }
                return string;
            }, h2a = function (s) {
                var ret = [];
                s.replace(/(..)/g, function (s) {
                    ret.push(parseInt(s, 16));
                });
                return ret;
            }, s2a = function (string, binary) {
                var array = [], i;
                if (!binary) {
                    string = enc_utf8(string);
                }
                for (i = 0; i < string.length; i++) {
                    array[i] = string.charCodeAt(i);
                }
                return array;
            }, size = function (newsize) {
                switch (newsize) {
                    case 128:
                        Nr = 10;
                        Nk = 4;
                        break;
                    case 192:
                        Nr = 12;
                        Nk = 6;
                        break;
                    case 256:
                        Nr = 14;
                        Nk = 8;
                        break;
                    default:
                        throw('Invalid Key Size Specified:' + newsize);
                }
            }, randArr = function (num) {
                var result = [], i;
                for (i = 0; i < num; i++) {
                    result = result.concat(Math.floor(Math.random() * 256));
                }
                return result;
            }, openSSLKey = function (passwordArr, saltArr) {
                var rounds = Nr >= 12 ? 3 : 2, key = [], iv = [], md5_hash = [], result = [], data00 = passwordArr.concat(saltArr), i;
                md5_hash[0] = GibberishAES.Hash.MD5(data00);
                result = md5_hash[0];
                for (i = 1; i < rounds; i++) {
                    md5_hash[i] = GibberishAES.Hash.MD5(md5_hash[i - 1].concat(data00));
                    result = result.concat(md5_hash[i]);
                }
                key = result.slice(0, 4 * Nk);
                iv = result.slice(4 * Nk, 4 * Nk + 16);
                return {key: key, iv: iv};
            }, rawEncrypt = function (plaintext, key, iv) {
                key = expandKey(key);
                var numBlocks = Math.ceil(plaintext.length / 16), blocks = [], i, cipherBlocks = [];
                for (i = 0; i < numBlocks; i++) {
                    blocks[i] = padBlock(plaintext.slice(i * 16, i * 16 + 16));
                }
                if (plaintext.length % 16 === 0) {
                    blocks.push([16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]);
                    numBlocks++;
                }
                for (i = 0; i < blocks.length; i++) {
                    blocks[i] = (i === 0) ? xorBlocks(blocks[i], iv) : xorBlocks(blocks[i], cipherBlocks[i - 1]);
                    cipherBlocks[i] = encryptBlock(blocks[i], key);
                }
                return cipherBlocks;
            }, rawDecrypt = function (cryptArr, key, iv, binary) {
                key = expandKey(key);
                var numBlocks = cryptArr.length / 16, cipherBlocks = [], i, plainBlocks = [], string = '';
                for (i = 0; i < numBlocks; i++) {
                    cipherBlocks.push(cryptArr.slice(i * 16, (i + 1) * 16));
                }
                for (i = cipherBlocks.length - 1; i >= 0; i--) {
                    plainBlocks[i] = decryptBlock(cipherBlocks[i], key);
                    plainBlocks[i] = (i === 0) ? xorBlocks(plainBlocks[i], iv) : xorBlocks(plainBlocks[i], cipherBlocks[i - 1]);
                }
                for (i = 0; i < numBlocks - 1; i++) {
                    string += block2s(plainBlocks[i]);
                }
                string += block2s(plainBlocks[i], true);
                return binary ? string : dec_utf8(string);
            }, encryptBlock = function (block, words) {
                Decrypt = false;
                var state = addRoundKey(block, words, 0), round;
                for (round = 1; round < (Nr + 1); round++) {
                    state = subBytes(state);
                    state = shiftRows(state);
                    if (round < Nr) {
                        state = mixColumns(state);
                    }
                    state = addRoundKey(state, words, round);
                }
                return state;
            }, decryptBlock = function (block, words) {
                Decrypt = true;
                var state = addRoundKey(block, words, Nr), round;
                for (round = Nr - 1; round > -1; round--) {
                    state = shiftRows(state);
                    state = subBytes(state);
                    state = addRoundKey(state, words, round);
                    if (round > 0) {
                        state = mixColumns(state);
                    }
                }
                return state;
            }, subBytes = function (state) {
                var S = Decrypt ? SBoxInv : SBox, temp = [], i;
                for (i = 0; i < 16; i++) {
                    temp[i] = S[state[i]];
                }
                return temp;
            }, shiftRows = function (state) {
                var temp = [], shiftBy = Decrypt ? [0, 13, 10, 7, 4, 1, 14, 11, 8, 5, 2, 15, 12, 9, 6, 3] : [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11], i;
                for (i = 0; i < 16; i++) {
                    temp[i] = state[shiftBy[i]];
                }
                return temp;
            }, mixColumns = function (state) {
                var t = [], c;
                if (!Decrypt) {
                    for (c = 0; c < 4; c++) {
                        t[c * 4] = G2X[state[c * 4]] ^ G3X[state[1 + c * 4]] ^ state[2 + c * 4] ^ state[3 + c * 4];
                        t[1 + c * 4] = state[c * 4] ^ G2X[state[1 + c * 4]] ^ G3X[state[2 + c * 4]] ^ state[3 + c * 4];
                        t[2 + c * 4] = state[c * 4] ^ state[1 + c * 4] ^ G2X[state[2 + c * 4]] ^ G3X[state[3 + c * 4]];
                        t[3 + c * 4] = G3X[state[c * 4]] ^ state[1 + c * 4] ^ state[2 + c * 4] ^ G2X[state[3 + c * 4]];
                    }
                } else {
                    for (c = 0; c < 4; c++) {
                        t[c * 4] = GEX[state[c * 4]] ^ GBX[state[1 + c * 4]] ^ GDX[state[2 + c * 4]] ^ G9X[state[3 + c * 4]];
                        t[1 + c * 4] = G9X[state[c * 4]] ^ GEX[state[1 + c * 4]] ^ GBX[state[2 + c * 4]] ^ GDX[state[3 + c * 4]];
                        t[2 + c * 4] = GDX[state[c * 4]] ^ G9X[state[1 + c * 4]] ^ GEX[state[2 + c * 4]] ^ GBX[state[3 + c * 4]];
                        t[3 + c * 4] = GBX[state[c * 4]] ^ GDX[state[1 + c * 4]] ^ G9X[state[2 + c * 4]] ^ GEX[state[3 + c * 4]];
                    }
                }
                return t;
            }, addRoundKey = function (state, words, round) {
                var temp = [], i;
                for (i = 0; i < 16; i++) {
                    temp[i] = state[i] ^ words[round][i];
                }
                return temp;
            }, xorBlocks = function (block1, block2) {
                var temp = [], i;
                for (i = 0; i < 16; i++) {
                    temp[i] = block1[i] ^ block2[i];
                }
                return temp;
            }, expandKey = function (key) {
                var w = [], temp = [], i, r, t, flat = [], j;
                for (i = 0; i < Nk; i++) {
                    r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
                    w[i] = r;
                }
                for (i = Nk; i < (4 * (Nr + 1)); i++) {
                    w[i] = [];
                    for (t = 0; t < 4; t++) {
                        temp[t] = w[i - 1][t];
                    }
                    if (i % Nk === 0) {
                        temp = subWord(rotWord(temp));
                        temp[0] ^= Rcon[i / Nk - 1];
                    } else if (Nk > 6 && i % Nk == 4) {
                        temp = subWord(temp);
                    }
                    for (t = 0; t < 4; t++) {
                        w[i][t] = w[i - Nk][t] ^ temp[t];
                    }
                }
                for (i = 0; i < (Nr + 1); i++) {
                    flat[i] = [];
                    for (j = 0; j < 4; j++) {
                        flat[i].push(w[i * 4 + j][0], w[i * 4 + j][1], w[i * 4 + j][2], w[i * 4 + j][3]);
                    }
                }
                return flat;
            }, subWord = function (w) {
                for (var i = 0; i < 4; i++) {
                    w[i] = SBox[w[i]];
                }
                return w;
            }, rotWord = function (w) {
                var tmp = w[0], i;
                for (i = 0; i < 4; i++) {
                    w[i] = w[i + 1];
                }
                w[3] = tmp;
                return w;
            }, strhex = function (str, size) {
                var i, ret = [];
                for (i = 0; i < str.length; i += size)
                    ret[i / size] = parseInt(str.substr(i, size), 16);
                return ret;
            }, invertArr = function (arr) {
                var i, ret = [];
                for (i = 0; i < arr.length; i++)
                    ret[arr[i]] = i;
                return ret;
            }, Gxx = function (a, b) {
                var i, ret;
                ret = 0;
                for (i = 0; i < 8; i++) {
                    ret = ((b & 1) == 1) ? ret ^ a : ret;
                    a = (a > 0x7f) ? 0x11b ^ (a << 1) : (a << 1);
                    b >>>= 1;
                }
                return ret;
            }, Gx = function (x) {
                var r = [];
                for (var i = 0; i < 256; i++)
                    r[i] = Gxx(x, i);
                return r;
            }, SBox = strhex('637c777bf26b6fc53001672bfed7ab76ca82c97dfa5947f0add4a2af9ca472c0b7fd9326363ff7cc34a5e5f171d8311504c723c31896059a071280e2eb27b27509832c1a1b6e5aa0523bd6b329e32f8453d100ed20fcb15b6acbbe394a4c58cfd0efaafb434d338545f9027f503c9fa851a3408f929d38f5bcb6da2110fff3d2cd0c13ec5f974417c4a77e3d645d197360814fdc222a908846eeb814de5e0bdbe0323a0a4906245cc2d3ac629195e479e7c8376d8dd54ea96c56f4ea657aae08ba78252e1ca6b4c6e8dd741f4bbd8b8a703eb5664803f60e613557b986c11d9ee1f8981169d98e949b1e87e9ce5528df8ca1890dbfe6426841992d0fb054bb16', 2), SBoxInv = invertArr(SBox), Rcon = strhex('01020408102040801b366cd8ab4d9a2f5ebc63c697356ad4b37dfaefc591', 2), G2X = Gx(2), G3X = Gx(3), G9X = Gx(9), GBX = Gx(0xb), GDX = Gx(0xd), GEX = Gx(0xe), enc = function (string, pass, binary) {
                var salt = randArr(8), pbe = openSSLKey(s2a(pass, binary), salt), key = pbe.key, iv = pbe.iv, cipherBlocks, saltBlock = [[83, 97, 108, 116, 101, 100, 95, 95].concat(salt)];
                string = s2a(string, binary);
                cipherBlocks = rawEncrypt(string, key, iv);
                cipherBlocks = saltBlock.concat(cipherBlocks);
                return Base64.encode(cipherBlocks);
            }, dec = function (string, pass, binary) {
                var cryptArr = Base64.decode(string), salt = cryptArr.slice(8, 16), pbe = openSSLKey(s2a(pass, binary), salt), key = pbe.key, iv = pbe.iv;
                cryptArr = cryptArr.slice(16, cryptArr.length);
                string = rawDecrypt(cryptArr, key, iv, binary);
                return string;
            }, MD5 = function (numArr) {
                function rotateLeft(lValue, iShiftBits) {
                    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
                }

                function addUnsigned(lX, lY) {
                    var lX4, lY4, lX8, lY8, lResult;
                    lX8 = (lX & 0x80000000);
                    lY8 = (lY & 0x80000000);
                    lX4 = (lX & 0x40000000);
                    lY4 = (lY & 0x40000000);
                    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                    if (lX4 & lY4) {
                        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                    }
                    if (lX4 | lY4) {
                        if (lResult & 0x40000000) {
                            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                        } else {
                            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                        }
                    } else {
                        return (lResult ^ lX8 ^ lY8);
                    }
                }

                function f(x, y, z) {
                    return (x & y) | ((~x) & z);
                }

                function g(x, y, z) {
                    return (x & z) | (y & (~z));
                }

                function h(x, y, z) {
                    return (x ^ y ^ z);
                }

                function funcI(x, y, z) {
                    return (y ^ (x | (~z)));
                }

                function ff(a, b, c, d, x, s, ac) {
                    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
                    return addUnsigned(rotateLeft(a, s), b);
                }

                function gg(a, b, c, d, x, s, ac) {
                    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
                    return addUnsigned(rotateLeft(a, s), b);
                }

                function hh(a, b, c, d, x, s, ac) {
                    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
                    return addUnsigned(rotateLeft(a, s), b);
                }

                function ii(a, b, c, d, x, s, ac) {
                    a = addUnsigned(a, addUnsigned(addUnsigned(funcI(b, c, d), x), ac));
                    return addUnsigned(rotateLeft(a, s), b);
                }

                function convertToWordArray(numArr) {
                    var lWordCount, lMessageLength = numArr.length, lNumberOfWords_temp1 = lMessageLength + 8, lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
                        lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16, lWordArray = [], lBytePosition = 0, lByteCount = 0;
                    while (lByteCount < lMessageLength) {
                        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                        lBytePosition = (lByteCount % 4) * 8;
                        lWordArray[lWordCount] = (lWordArray[lWordCount] | (numArr[lByteCount] << lBytePosition));
                        lByteCount++;
                    }
                    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                    lBytePosition = (lByteCount % 4) * 8;
                    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                    return lWordArray;
                }

                function wordToHex(lValue) {
                    var lByte, lCount, wordToHexArr = [];
                    for (lCount = 0; lCount <= 3; lCount++) {
                        lByte = (lValue >>> (lCount * 8)) & 255;
                        wordToHexArr = wordToHexArr.concat(lByte);
                    }
                    return wordToHexArr;
                }

                var x = [], k, AA, BB, CC, DD, a, b, c, d, rnd = strhex('67452301efcdab8998badcfe10325476d76aa478e8c7b756242070dbc1bdceeef57c0faf4787c62aa8304613fd469501698098d88b44f7afffff5bb1895cd7be6b901122fd987193a679438e49b40821f61e2562c040b340265e5a51e9b6c7aad62f105d02441453d8a1e681e7d3fbc821e1cde6c33707d6f4d50d87455a14eda9e3e905fcefa3f8676f02d98d2a4c8afffa39428771f6816d9d6122fde5380ca4beea444bdecfa9f6bb4b60bebfbc70289b7ec6eaa127fad4ef308504881d05d9d4d039e6db99e51fa27cf8c4ac5665f4292244432aff97ab9423a7fc93a039655b59c38f0ccc92ffeff47d85845dd16fa87e4ffe2ce6e0a30143144e0811a1f7537e82bd3af2352ad7d2bbeb86d391', 8);
                x = convertToWordArray(numArr);
                a = rnd[0];
                b = rnd[1];
                c = rnd[2];
                d = rnd[3]
                for (k = 0; k < x.length; k += 16) {
                    AA = a;
                    BB = b;
                    CC = c;
                    DD = d;
                    a = ff(a, b, c, d, x[k + 0], 7, rnd[4]);
                    d = ff(d, a, b, c, x[k + 1], 12, rnd[5]);
                    c = ff(c, d, a, b, x[k + 2], 17, rnd[6]);
                    b = ff(b, c, d, a, x[k + 3], 22, rnd[7]);
                    a = ff(a, b, c, d, x[k + 4], 7, rnd[8]);
                    d = ff(d, a, b, c, x[k + 5], 12, rnd[9]);
                    c = ff(c, d, a, b, x[k + 6], 17, rnd[10]);
                    b = ff(b, c, d, a, x[k + 7], 22, rnd[11]);
                    a = ff(a, b, c, d, x[k + 8], 7, rnd[12]);
                    d = ff(d, a, b, c, x[k + 9], 12, rnd[13]);
                    c = ff(c, d, a, b, x[k + 10], 17, rnd[14]);
                    b = ff(b, c, d, a, x[k + 11], 22, rnd[15]);
                    a = ff(a, b, c, d, x[k + 12], 7, rnd[16]);
                    d = ff(d, a, b, c, x[k + 13], 12, rnd[17]);
                    c = ff(c, d, a, b, x[k + 14], 17, rnd[18]);
                    b = ff(b, c, d, a, x[k + 15], 22, rnd[19]);
                    a = gg(a, b, c, d, x[k + 1], 5, rnd[20]);
                    d = gg(d, a, b, c, x[k + 6], 9, rnd[21]);
                    c = gg(c, d, a, b, x[k + 11], 14, rnd[22]);
                    b = gg(b, c, d, a, x[k + 0], 20, rnd[23]);
                    a = gg(a, b, c, d, x[k + 5], 5, rnd[24]);
                    d = gg(d, a, b, c, x[k + 10], 9, rnd[25]);
                    c = gg(c, d, a, b, x[k + 15], 14, rnd[26]);
                    b = gg(b, c, d, a, x[k + 4], 20, rnd[27]);
                    a = gg(a, b, c, d, x[k + 9], 5, rnd[28]);
                    d = gg(d, a, b, c, x[k + 14], 9, rnd[29]);
                    c = gg(c, d, a, b, x[k + 3], 14, rnd[30]);
                    b = gg(b, c, d, a, x[k + 8], 20, rnd[31]);
                    a = gg(a, b, c, d, x[k + 13], 5, rnd[32]);
                    d = gg(d, a, b, c, x[k + 2], 9, rnd[33]);
                    c = gg(c, d, a, b, x[k + 7], 14, rnd[34]);
                    b = gg(b, c, d, a, x[k + 12], 20, rnd[35]);
                    a = hh(a, b, c, d, x[k + 5], 4, rnd[36]);
                    d = hh(d, a, b, c, x[k + 8], 11, rnd[37]);
                    c = hh(c, d, a, b, x[k + 11], 16, rnd[38]);
                    b = hh(b, c, d, a, x[k + 14], 23, rnd[39]);
                    a = hh(a, b, c, d, x[k + 1], 4, rnd[40]);
                    d = hh(d, a, b, c, x[k + 4], 11, rnd[41]);
                    c = hh(c, d, a, b, x[k + 7], 16, rnd[42]);
                    b = hh(b, c, d, a, x[k + 10], 23, rnd[43]);
                    a = hh(a, b, c, d, x[k + 13], 4, rnd[44]);
                    d = hh(d, a, b, c, x[k + 0], 11, rnd[45]);
                    c = hh(c, d, a, b, x[k + 3], 16, rnd[46]);
                    b = hh(b, c, d, a, x[k + 6], 23, rnd[47]);
                    a = hh(a, b, c, d, x[k + 9], 4, rnd[48]);
                    d = hh(d, a, b, c, x[k + 12], 11, rnd[49]);
                    c = hh(c, d, a, b, x[k + 15], 16, rnd[50]);
                    b = hh(b, c, d, a, x[k + 2], 23, rnd[51]);
                    a = ii(a, b, c, d, x[k + 0], 6, rnd[52]);
                    d = ii(d, a, b, c, x[k + 7], 10, rnd[53]);
                    c = ii(c, d, a, b, x[k + 14], 15, rnd[54]);
                    b = ii(b, c, d, a, x[k + 5], 21, rnd[55]);
                    a = ii(a, b, c, d, x[k + 12], 6, rnd[56]);
                    d = ii(d, a, b, c, x[k + 3], 10, rnd[57]);
                    c = ii(c, d, a, b, x[k + 10], 15, rnd[58]);
                    b = ii(b, c, d, a, x[k + 1], 21, rnd[59]);
                    a = ii(a, b, c, d, x[k + 8], 6, rnd[60]);
                    d = ii(d, a, b, c, x[k + 15], 10, rnd[61]);
                    c = ii(c, d, a, b, x[k + 6], 15, rnd[62]);
                    b = ii(b, c, d, a, x[k + 13], 21, rnd[63]);
                    a = ii(a, b, c, d, x[k + 4], 6, rnd[64]);
                    d = ii(d, a, b, c, x[k + 11], 10, rnd[65]);
                    c = ii(c, d, a, b, x[k + 2], 15, rnd[66]);
                    b = ii(b, c, d, a, x[k + 9], 21, rnd[67]);
                    a = addUnsigned(a, AA);
                    b = addUnsigned(b, BB);
                    c = addUnsigned(c, CC);
                    d = addUnsigned(d, DD);
                }
                return wordToHex(a).concat(wordToHex(b), wordToHex(c), wordToHex(d));
            }, encString = function (plaintext, key, iv) {
                plaintext = s2a(plaintext);
                key = s2a(key);
                for (var i = key.length; i < 32; i++)
                    key[i] = 0;
                if (iv == null) {
                    iv = genIV();
                } else {
                    iv = s2a(iv);
                    for (var i = iv.length; i < 16; i++)
                        iv[i] = 0;
                }
                var ct = rawEncrypt(plaintext, key, iv);
                var ret = [iv];
                for (var i = 0; i < ct.length; i++)
                    ret[ret.length] = ct[i];
                return Base64.encode(ret);
            }, decString = function (ciphertext, key) {
                var tmp = Base64.decode(ciphertext);
                var iv = tmp.slice(0, 16);
                var ct = tmp.slice(16, tmp.length);
                key = s2a(key);
                for (var i = key.length; i < 32; i++)
                    key[i] = 0;
                var pt = rawDecrypt(ct, key, iv, false);
                return pt;
            }, Base64 = (function () {
                var _chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', chars = _chars.split(''), encode = function (b, withBreaks) {
                    var flatArr = [], b64 = '', i, broken_b64;
                    var totalChunks = Math.floor(b.length * 16 / 3);
                    for (i = 0; i < b.length * 16; i++) {
                        flatArr.push(b[Math.floor(i / 16)][i % 16]);
                    }
                    for (i = 0; i < flatArr.length; i = i + 3) {
                        b64 += chars[flatArr[i] >> 2];
                        b64 += chars[((flatArr[i] & 3) << 4) | (flatArr[i + 1] >> 4)];
                        if (!(flatArr[i + 1] === undefined)) {
                            b64 += chars[((flatArr[i + 1] & 15) << 2) | (flatArr[i + 2] >> 6)];
                        } else {
                            b64 += '=';
                        }
                        if (!(flatArr[i + 2] === undefined)) {
                            b64 += chars[flatArr[i + 2] & 63];
                        } else {
                            b64 += '=';
                        }
                    }
                    broken_b64 = b64.slice(0, 64) + '\n';
                    for (i = 1; i < (Math.ceil(b64.length / 64)); i++) {
                        broken_b64 += b64.slice(i * 64, i * 64 + 64) + (Math.ceil(b64.length / 64) == i + 1 ? '' : '\n');
                    }
                    return broken_b64;
                }, decode = function (string) {
                    string = string.replace(/\n/g, '');
                    var flatArr = [], c = [], b = [], i;
                    for (i = 0; i < string.length; i = i + 4) {
                        c[0] = _chars.indexOf(string.charAt(i));
                        c[1] = _chars.indexOf(string.charAt(i + 1));
                        c[2] = _chars.indexOf(string.charAt(i + 2));
                        c[3] = _chars.indexOf(string.charAt(i + 3));
                        b[0] = (c[0] << 2) | (c[1] >> 4);
                        b[1] = ((c[1] & 15) << 4) | (c[2] >> 2);
                        b[2] = ((c[2] & 3) << 6) | c[3];
                        flatArr.push(b[0], b[1], b[2]);
                    }
                    flatArr = flatArr.slice(0, flatArr.length - (flatArr.length % 16));
                    return flatArr;
                };
                if (typeof Array.indexOf === "function") {
                    _chars = chars;
                }
                return {"encode": encode, "decode": decode};
            })();
            return {
                "size": size,
                "h2a": h2a,
                "expandKey": expandKey,
                "encryptBlock": encryptBlock,
                "decryptBlock": decryptBlock,
                "Decrypt": Decrypt,
                "s2a": s2a,
                "rawEncrypt": rawEncrypt,
                "dec": dec,
                "openSSLKey": openSSLKey,
                "a2h": a2h,
                "enc": enc,
                "Hash": {"MD5": MD5},
                "Base64": Base64
            };
        })();
        if (typeof define === "function") {
            define(function () {
                return GibberishAES;
            });
        }
        ;
    }).call(this);
    (function () {
        FS.encrypt = root.GibberishAES;
        FS.Crypto = FS.Utils.extend(function () {
        }, FS.EventDispatcher);
        FS.Crypto.prototype.setSize = function (val) {
            this.strength = val;
            root.GibberishAES.size(this.strength);
        };
        FS.Crypto.prototype.setStrength = function (val) {
            this.setSize(val);
        };
        FS.Crypto.prototype.setType = function (val) {
        };
        FS.Crypto.prototype.setPassphrase = function (val) {
            this.passphrase = val;
        };
        FS.Crypto.prototype.encrypt = function (val, passphrase) {
            if (passphrase) {
                return root.GibberishAES.enc(val, passphrase);
            }
            else {
                return root.GibberishAES.enc(val, this.passphrase);
            }
        };
        FS.Crypto.prototype.decrypt = function (val, passphrase) {
            if (passphrase) {
                return root.GibberishAES.dec(val, passphrase);
            }
            else {
                return root.GibberishAES.dec(val, this.passphrase);
            }
        };
    }).call(this);
    (function () {
        var CryptoJS2 = CryptoJS || function (p, h) {
                var i = {}, l = i.lib = {}, r = l.Base = function () {
                    function a() {
                    }

                    return {
                        extend: function (e) {
                            a.prototype = this;
                            var c = new a;
                            e && c.mixIn(e);
                            c.$super = this;
                            return c
                        }, create: function () {
                            var a = this.extend();
                            a.init.apply(a, arguments);
                            return a
                        }, init: function () {
                        }, mixIn: function (a) {
                            for (var c in a)a.hasOwnProperty(c) && (this[c] = a[c]);
                            a.hasOwnProperty("toString") && (this.toString = a.toString)
                        }, clone: function () {
                            return this.$super.extend(this)
                        }
                    }
                }(), o = l.WordArray = r.extend({
                    init: function (a, e) {
                        a = this.words = a || [];
                        this.sigBytes = e != h ? e : 4 * a.length
                    }, toString: function (a) {
                        return (a || s).stringify(this)
                    }, concat: function (a) {
                        var e = this.words, c = a.words, b = this.sigBytes, a = a.sigBytes;
                        this.clamp();
                        if (b % 4)for (var d = 0; d < a; d++)e[b + d >>> 2] |= (c[d >>> 2] >>> 24 - 8 * (d % 4) & 255) << 24 - 8 * ((b + d) % 4); else if (65535 < c.length)for (d = 0; d < a; d += 4)e[b + d >>> 2] = c[d >>> 2]; else e.push.apply(e, c);
                        this.sigBytes += a;
                        return this
                    }, clamp: function () {
                        var a = this.words, e = this.sigBytes;
                        a[e >>> 2] &= 4294967295 << 32 - 8 * (e % 4);
                        a.length = p.ceil(e / 4)
                    }, clone: function () {
                        var a = r.clone.call(this);
                        a.words = this.words.slice(0);
                        return a
                    }, random: function (a) {
                        for (var e = [], c = 0; c < a; c += 4)e.push(4294967296 * p.random() | 0);
                        return o.create(e, a)
                    }
                }), m = i.enc = {}, s = m.Hex = {
                    stringify: function (a) {
                        for (var e = a.words, a = a.sigBytes, c = [], b = 0; b < a; b++) {
                            var d = e[b >>> 2] >>> 24 - 8 * (b % 4) & 255;
                            c.push((d >>> 4).toString(16));
                            c.push((d & 15).toString(16))
                        }
                        return c.join("")
                    }, parse: function (a) {
                        for (var e = a.length, c = [], b = 0; b < e; b += 2)c[b >>> 3] |= parseInt(a.substr(b, 2), 16) << 24 - 4 * (b % 8);
                        return o.create(c, e / 2)
                    }
                }, n = m.Latin1 = {
                    stringify: function (a) {
                        for (var e = a.words, a = a.sigBytes, c = [], b = 0; b < a; b++)c.push(String.fromCharCode(e[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
                        return c.join("")
                    }, parse: function (a) {
                        for (var e = a.length, c = [], b = 0; b < e; b++)c[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
                        return o.create(c, e)
                    }
                }, k = m.Utf8 = {
                    stringify: function (a) {
                        try {
                            return decodeURIComponent(escape(n.stringify(a)))
                        } catch (e) {
                            throw Error("Malformed UTF-8 data");
                        }
                    }, parse: function (a) {
                        return n.parse(unescape(encodeURIComponent(a)))
                    }
                }, f = l.BufferedBlockAlgorithm = r.extend({
                    reset: function () {
                        this._data = o.create();
                        this._nDataBytes = 0
                    }, _append: function (a) {
                        "string" == typeof a && (a = k.parse(a));
                        this._data.concat(a);
                        this._nDataBytes += a.sigBytes
                    }, _process: function (a) {
                        var e = this._data, c = e.words, b = e.sigBytes, d = this.blockSize, q = b / (4 * d), q = a ? p.ceil(q) : p.max((q | 0) - this._minBufferSize, 0), a = q * d, b = p.min(4 * a, b);
                        if (a) {
                            for (var j = 0; j < a; j += d)this._doProcessBlock(c, j);
                            j = c.splice(0, a);
                            e.sigBytes -= b
                        }
                        return o.create(j, b)
                    }, clone: function () {
                        var a = r.clone.call(this);
                        a._data = this._data.clone();
                        return a
                    }, _minBufferSize: 0
                });
                l.Hasher = f.extend({
                    init: function () {
                        this.reset()
                    }, reset: function () {
                        f.reset.call(this);
                        this._doReset()
                    }, update: function (a) {
                        this._append(a);
                        this._process();
                        return this
                    }, finalize: function (a) {
                        a && this._append(a);
                        this._doFinalize();
                        return this._hash
                    }, clone: function () {
                        var a = f.clone.call(this);
                        a._hash = this._hash.clone();
                        return a
                    }, blockSize: 16, _createHelper: function (a) {
                        return function (e, c) {
                            return a.create(c).finalize(e)
                        }
                    }, _createHmacHelper: function (a) {
                        return function (e, c) {
                            return g.HMAC.create(a, c).finalize(e)
                        }
                    }
                });
                var g = i.algo = {};
                return i
            }(Math);
        (function () {
            var p = CryptoJS, h = p.lib.WordArray;
            p.enc.Base64 = {
                stringify: function (i) {
                    var l = i.words, h = i.sigBytes, o = this._map;
                    i.clamp();
                    for (var i = [], m = 0; m < h; m += 3)for (var s = (l[m >>> 2] >>> 24 - 8 * (m % 4) & 255) << 16 | (l[m + 1 >>> 2] >>> 24 - 8 * ((m + 1) % 4) & 255) << 8 | l[m + 2 >>> 2] >>> 24 - 8 * ((m + 2) % 4) & 255, n = 0; 4 > n && m + 0.75 * n < h; n++)i.push(o.charAt(s >>> 6 * (3 - n) & 63));
                    if (l = o.charAt(64))for (; i.length % 4;)i.push(l);
                    return i.join("")
                }, parse: function (i) {
                    var i = i.replace(/\s/g, ""), l = i.length, r = this._map, o = r.charAt(64);
                    o && (o = i.indexOf(o), -1 != o && (l = o));
                    for (var o = [], m = 0, s = 0; s < l; s++)if (s % 4) {
                        var n = r.indexOf(i.charAt(s - 1)) << 2 * (s % 4), k = r.indexOf(i.charAt(s)) >>> 6 - 2 * (s % 4);
                        o[m >>> 2] |= (n | k) << 24 - 8 * (m % 4);
                        m++
                    }
                    return h.create(o, m)
                }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
            }
        })();
        (function (p) {
            function h(f, g, a, e, c, b, d) {
                f = f + (g & a | ~g & e) + c + d;
                return (f << b | f >>> 32 - b) + g
            }

            function i(f, g, a, e, c, b, d) {
                f = f + (g & e | a & ~e) + c + d;
                return (f << b | f >>> 32 - b) + g
            }

            function l(f, g, a, e, c, b, d) {
                f = f + (g ^ a ^ e) + c + d;
                return (f << b | f >>> 32 - b) + g
            }

            function r(f, g, a, e, c, b, d) {
                f = f + (a ^ (g | ~e)) + c + d;
                return (f << b | f >>> 32 - b) + g
            }

            var o = CryptoJS, m = o.lib, s = m.WordArray, m = m.Hasher, n = o.algo, k = [];
            (function () {
                for (var f = 0; 64 > f; f++)k[f] = 4294967296 * p.abs(p.sin(f + 1)) | 0
            })();
            n = n.MD5 = m.extend({
                _doReset: function () {
                    this._hash = s.create([1732584193, 4023233417, 2562383102, 271733878])
                }, _doProcessBlock: function (f, g) {
                    for (var a = 0; 16 > a; a++) {
                        var e = g + a, c = f[e];
                        f[e] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360
                    }
                    for (var e = this._hash.words, c = e[0], b = e[1], d = e[2], q = e[3], a = 0; 64 > a; a += 4)16 > a ? (c = h(c, b, d, q, f[g + a], 7, k[a]), q = h(q, c, b, d, f[g + a + 1], 12, k[a + 1]), d = h(d, q, c, b, f[g + a + 2], 17, k[a + 2]), b = h(b, d, q, c, f[g + a + 3], 22, k[a + 3])) : 32 > a ? (c = i(c, b, d, q, f[g + (a + 1) % 16], 5, k[a]), q = i(q, c, b, d, f[g + (a + 6) % 16], 9, k[a + 1]), d = i(d, q, c, b, f[g + (a + 11) % 16], 14, k[a + 2]), b = i(b, d, q, c, f[g + a % 16], 20, k[a + 3])) : 48 > a ? (c = l(c, b, d, q, f[g + (3 * a + 5) % 16], 4, k[a]), q = l(q, c, b, d, f[g + (3 * a + 8) % 16], 11, k[a + 1]), d = l(d, q, c, b, f[g + (3 * a + 11) % 16], 16, k[a + 2]), b = l(b, d, q, c, f[g + (3 * a + 14) % 16], 23, k[a + 3])) : (c = r(c, b, d, q, f[g + 3 * a % 16], 6, k[a]), q = r(q, c, b, d, f[g + (3 * a + 7) % 16], 10, k[a + 1]), d = r(d, q, c, b, f[g + (3 * a + 14) % 16], 15, k[a + 2]), b = r(b, d, q, c, f[g + (3 * a + 5) % 16], 21, k[a + 3]));
                    e[0] = e[0] + c | 0;
                    e[1] = e[1] + b | 0;
                    e[2] = e[2] + d | 0;
                    e[3] = e[3] + q | 0
                }, _doFinalize: function () {
                    var f = this._data, g = f.words, a = 8 * this._nDataBytes, e = 8 * f.sigBytes;
                    g[e >>> 5] |= 128 << 24 - e % 32;
                    g[(e + 64 >>> 9 << 4) + 14] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;
                    f.sigBytes = 4 * (g.length + 1);
                    this._process();
                    f = this._hash.words;
                    for (g = 0; 4 > g; g++)a = f[g], f[g] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360
                }
            });
            o.MD5 = m._createHelper(n);
            o.HmacMD5 = m._createHmacHelper(n)
        })(Math);
        (function () {
            var p = CryptoJS, h = p.lib, i = h.Base, l = h.WordArray, h = p.algo, r = h.EvpKDF = i.extend({
                cfg: i.extend({
                    keySize: 4,
                    hasher: h.MD5,
                    iterations: 1
                }), init: function (i) {
                    this.cfg = this.cfg.extend(i)
                }, compute: function (i, m) {
                    for (var h = this.cfg, n = h.hasher.create(), k = l.create(), f = k.words, g = h.keySize, h = h.iterations; f.length < g;) {
                        a && n.update(a);
                        var a = n.update(i).finalize(m);
                        n.reset();
                        for (var e = 1; e < h; e++)a = n.finalize(a), n.reset();
                        k.concat(a)
                    }
                    k.sigBytes = 4 * g;
                    return k
                }
            });
            p.EvpKDF = function (i, l, h) {
                return r.create(h).compute(i, l)
            }
        })();
        CryptoJS.lib.Cipher || function (p) {
            var h = CryptoJS, i = h.lib, l = i.Base, r = i.WordArray, o = i.BufferedBlockAlgorithm, m = h.enc.Base64, s = h.algo.EvpKDF, n = i.Cipher = o.extend({
                cfg: l.extend(),
                createEncryptor: function (b, d) {
                    return this.create(this._ENC_XFORM_MODE, b, d)
                },
                createDecryptor: function (b, d) {
                    return this.create(this._DEC_XFORM_MODE, b, d)
                },
                init: function (b, d, a) {
                    this.cfg = this.cfg.extend(a);
                    this._xformMode = b;
                    this._key = d;
                    this.reset()
                },
                reset: function () {
                    o.reset.call(this);
                    this._doReset()
                },
                process: function (b) {
                    this._append(b);
                    return this._process()
                },
                finalize: function (b) {
                    b && this._append(b);
                    return this._doFinalize()
                },
                keySize: 4,
                ivSize: 4,
                _ENC_XFORM_MODE: 1,
                _DEC_XFORM_MODE: 2,
                _createHelper: function () {
                    return function (b) {
                        return {
                            encrypt: function (a, q, j) {
                                return ("string" == typeof q ? c : e).encrypt(b, a, q, j)
                            }, decrypt: function (a, q, j) {
                                return ("string" == typeof q ? c : e).decrypt(b, a, q, j)
                            }
                        }
                    }
                }()
            });
            i.StreamCipher = n.extend({
                _doFinalize: function () {
                    return this._process(!0)
                }, blockSize: 1
            });
            var k = h.mode = {}, f = i.BlockCipherMode = l.extend({
                createEncryptor: function (b, a) {
                    return this.Encryptor.create(b, a)
                }, createDecryptor: function (b, a) {
                    return this.Decryptor.create(b, a)
                }, init: function (b, a) {
                    this._cipher = b;
                    this._iv = a
                }
            }), k = k.CBC = function () {
                function b(b, a, d) {
                    var c = this._iv;
                    c ? this._iv = p : c = this._prevBlock;
                    for (var e = 0; e < d; e++)b[a + e] ^= c[e]
                }

                var a = f.extend();
                a.Encryptor = a.extend({
                    processBlock: function (a, d) {
                        var c = this._cipher, e = c.blockSize;
                        b.call(this, a, d, e);
                        c.encryptBlock(a, d);
                        this._prevBlock = a.slice(d, d + e)
                    }
                });
                a.Decryptor = a.extend({
                    processBlock: function (a, d) {
                        var c = this._cipher, e = c.blockSize, f = a.slice(d, d +
                            e);
                        c.decryptBlock(a, d);
                        b.call(this, a, d, e);
                        this._prevBlock = f
                    }
                });
                return a
            }(), g = (h.pad = {}).Pkcs7 = {
                pad: function (b, a) {
                    for (var c = 4 * a, c = c - b.sigBytes % c, e = c << 24 | c << 16 | c << 8 | c, f = [], g = 0; g < c; g += 4)f.push(e);
                    c = r.create(f, c);
                    b.concat(c)
                }, unpad: function (b) {
                    b.sigBytes -= b.words[b.sigBytes - 1 >>> 2] & 255
                }
            };
            i.BlockCipher = n.extend({
                cfg: n.cfg.extend({mode: k, padding: g}), reset: function () {
                    n.reset.call(this);
                    var b = this.cfg, a = b.iv, b = b.mode;
                    if (this._xformMode == this._ENC_XFORM_MODE)var c = b.createEncryptor; else c = b.createDecryptor, this._minBufferSize = 1;
                    this._mode = c.call(b, this, a && a.words)
                }, _doProcessBlock: function (b, a) {
                    this._mode.processBlock(b, a)
                }, _doFinalize: function () {
                    var b = this.cfg.padding;
                    if (this._xformMode == this._ENC_XFORM_MODE) {
                        b.pad(this._data, this.blockSize);
                        var a = this._process(!0)
                    } else a = this._process(!0), b.unpad(a);
                    return a
                }, blockSize: 4
            });
            var a = i.CipherParams = l.extend({
                init: function (a) {
                    this.mixIn(a)
                }, toString: function (a) {
                    return (a || this.formatter).stringify(this)
                }
            }), k = (h.format = {}).OpenSSL = {
                stringify: function (a) {
                    var d = a.ciphertext, a = a.salt, d = (a ? r.create([1398893684, 1701076831]).concat(a).concat(d) : d).toString(m);
                    return d = d.replace(/(.{64})/g, "$1\n")
                }, parse: function (b) {
                    var b = m.parse(b), d = b.words;
                    if (1398893684 == d[0] && 1701076831 == d[1]) {
                        var c = r.create(d.slice(2, 4));
                        d.splice(0, 4);
                        b.sigBytes -= 16
                    }
                    return a.create({ciphertext: b, salt: c})
                }
            }, e = i.SerializableCipher = l.extend({
                cfg: l.extend({format: k}), encrypt: function (b, d, c, e) {
                    var e = this.cfg.extend(e), f = b.createEncryptor(c, e), d = f.finalize(d), f = f.cfg;
                    return a.create({
                        ciphertext: d,
                        key: c,
                        iv: f.iv,
                        algorithm: b,
                        mode: f.mode,
                        padding: f.padding,
                        blockSize: b.blockSize,
                        formatter: e.format
                    })
                }, decrypt: function (a, c, e, f) {
                    f = this.cfg.extend(f);
                    c = this._parse(c, f.format);
                    return a.createDecryptor(e, f).finalize(c.ciphertext)
                }, _parse: function (a, c) {
                    return "string" == typeof a ? c.parse(a) : a
                }
            }), h = (h.kdf = {}).OpenSSL = {
                compute: function (b, c, e, f) {
                    f || (f = r.random(8));
                    b = s.create({keySize: c + e}).compute(b, f);
                    e = r.create(b.words.slice(c), 4 * e);
                    b.sigBytes = 4 * c;
                    return a.create({key: b, iv: e, salt: f})
                }
            }, c = i.PasswordBasedCipher = e.extend({
                cfg: e.cfg.extend({kdf: h}), encrypt: function (a, c, f, j) {
                    j = this.cfg.extend(j);
                    f = j.kdf.compute(f, a.keySize, a.ivSize);
                    j.iv = f.iv;
                    a = e.encrypt.call(this, a, c, f.key, j);
                    a.mixIn(f);
                    return a
                }, decrypt: function (a, c, f, j) {
                    j = this.cfg.extend(j);
                    c = this._parse(c, j.format);
                    f = j.kdf.compute(f, a.keySize, a.ivSize, c.salt);
                    j.iv = f.iv;
                    return e.decrypt.call(this, a, c, f.key, j)
                }
            })
        }();
        (function () {
            var p = CryptoJS, h = p.lib.BlockCipher, i = p.algo, l = [], r = [], o = [], m = [], s = [], n = [], k = [], f = [], g = [], a = [];
            (function () {
                for (var c = [], b = 0; 256 > b; b++)c[b] = 128 > b ? b << 1 : b << 1 ^ 283;
                for (var d = 0, e = 0, b = 0; 256 > b; b++) {
                    var j = e ^ e << 1 ^ e << 2 ^ e << 3 ^ e << 4, j = j >>> 8 ^ j & 255 ^ 99;
                    l[d] = j;
                    r[j] = d;
                    var i = c[d], h = c[i], p = c[h], t = 257 * c[j] ^ 16843008 * j;
                    o[d] = t << 24 | t >>> 8;
                    m[d] = t << 16 | t >>> 16;
                    s[d] = t << 8 | t >>> 24;
                    n[d] = t;
                    t = 16843009 * p ^ 65537 * h ^ 257 * i ^ 16843008 * d;
                    k[j] = t << 24 | t >>> 8;
                    f[j] = t << 16 | t >>> 16;
                    g[j] = t << 8 | t >>> 24;
                    a[j] = t;
                    d ? (d = i ^ c[c[c[p ^ i]]], e ^= c[c[e]]) : d = e = 1
                }
            })();
            var e = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], i = i.AES = h.extend({
                _doReset: function () {
                    for (var c = this._key, b = c.words, d = c.sigBytes / 4, c = 4 * ((this._nRounds = d + 6) + 1), i = this._keySchedule = [], j = 0; j < c; j++)if (j < d)i[j] = b[j]; else {
                        var h = i[j - 1];
                        j % d ? 6 < d && 4 == j % d && (h = l[h >>> 24] << 24 | l[h >>> 16 & 255] << 16 | l[h >>> 8 & 255] << 8 | l[h & 255]) : (h = h << 8 | h >>> 24, h = l[h >>> 24] << 24 | l[h >>> 16 & 255] << 16 | l[h >>> 8 & 255] << 8 | l[h & 255], h ^= e[j / d | 0] << 24);
                        i[j] = i[j - d] ^ h
                    }
                    b = this._invKeySchedule = [];
                    for (d = 0; d < c; d++)j = c - d, h = d % 4 ? i[j] : i[j - 4], b[d] = 4 > d || 4 >= j ? h : k[l[h >>> 24]] ^ f[l[h >>> 16 & 255]] ^ g[l[h >>> 8 & 255]] ^ a[l[h & 255]]
                }, encryptBlock: function (a, b) {
                    this._doCryptBlock(a, b, this._keySchedule, o, m, s, n, l)
                }, decryptBlock: function (c, b) {
                    var d = c[b + 1];
                    c[b + 1] = c[b + 3];
                    c[b + 3] = d;
                    this._doCryptBlock(c, b, this._invKeySchedule, k, f, g, a, r);
                    d = c[b + 1];
                    c[b + 1] = c[b + 3];
                    c[b + 3] = d
                }, _doCryptBlock: function (a, b, d, e, f, h, i, g) {
                    for (var l = this._nRounds, k = a[b] ^ d[0], m = a[b + 1] ^ d[1], o = a[b + 2] ^ d[2], n = a[b + 3] ^ d[3], p = 4, r = 1; r < l; r++)var s = e[k >>> 24] ^ f[m >>> 16 & 255] ^ h[o >>> 8 & 255] ^ i[n & 255] ^ d[p++], u = e[m >>> 24] ^ f[o >>> 16 & 255] ^ h[n >>> 8 & 255] ^ i[k & 255] ^ d[p++], v = e[o >>> 24] ^ f[n >>> 16 & 255] ^ h[k >>> 8 & 255] ^ i[m & 255] ^ d[p++], n = e[n >>> 24] ^ f[k >>> 16 & 255] ^ h[m >>> 8 & 255] ^ i[o & 255] ^ d[p++], k = s, m = u, o = v;
                    s = (g[k >>> 24] << 24 | g[m >>> 16 & 255] << 16 | g[o >>> 8 & 255] << 8 | g[n & 255]) ^ d[p++];
                    u = (g[m >>> 24] << 24 | g[o >>> 16 & 255] << 16 | g[n >>> 8 & 255] << 8 | g[k & 255]) ^ d[p++];
                    v = (g[o >>> 24] << 24 | g[n >>> 16 & 255] << 16 | g[k >>> 8 & 255] << 8 | g[m & 255]) ^ d[p++];
                    n = (g[n >>> 24] << 24 | g[k >>> 16 & 255] << 16 | g[m >>> 8 & 255] << 8 | g[o & 255]) ^ d[p++];
                    a[b] = s;
                    a[b + 1] = u;
                    a[b + 2] = v;
                    a[b + 3] = n
                }, keySize: 8
            });
            p.AES = h._createHelper(i)
        })();
        FS.encrypt2 = CryptoJS2;
    }).call(this);
    FS.MessageFactory = function (options) {
        options = options || {};
        this.options = FS.Utils.mergeProperties({
            version: 1,
            authorizationAgent: "Local",
            messageEncryption: true
        }, options);
        this.apiOptions = null;
        this.messageEncryption = this.options.messageEncryption;
        this.encryptionWhiteList = ["Status", "Ping", "PlayerNotificationOn", "GetDefaultMessageTemplates", "GetInventoryList", "CreatePlayerAchievements", "GetBotList", "GetObjectTemplates", "GetAvatar", "CopyTemplateInventory", "GetInventory", "GetRoomList", "GetProperty", "GetRating", "EnterRoom", "RoomStatus", "TableState", "GetObjects", "JoinTable", "OwnTable", "SetReady", "SitSeat", "SetTableSettings", "StartTable", "GameServerHello", "GameMessage", "Chat", "Escrow", "AddItemsToEscrow", "GetStore"];
    };
    FS.MessageFactory.prototype.getDefault = function () {
    };
    FS.MessageFactory.prototype.getParam = function () {
    };
    FS.MessageFactory.prototype.setOptions = function (options) {
        FS.Utils.mergeProperties(this.options, options, true);
    };
    var structs = {
        "AchievementData": {
            "currentUnlockPoints": {"type": "number", "optional": true, "canDefault": false},
            "containerObjectId": {"type": "string", "optional": "true", "canDefault": "false"},
            "gameId": {"type": "string", "optional": true, "canDefault": false},
            "name": {"type": "string", "optional": false, "canDefault": false},
            "containedTemplates": {
                "type": "array",
                "elementType": "ContainedTemplateData",
                "optional": "true",
                "canDefault": "false"
            },
            "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
            "description": {"type": "string", "optional": true, "canDefault": false},
            "achievementId": {"type": "string", "optional": true, "canDefault": false},
            "containedObjectIds": {"type": "array", "elementType": "string", "optional": "true", "canDefault": "false"},
            "objectData": {"type": "array", "elementType": "ObjectKV", "optional": "true", "canDefault": "false"},
            "recommended": {"type": "boolean", "optional": false, "canDefault": false},
            "customId": {"type": "number", "optional": true, "canDefault": false},
            "maximumUnlockPoints": {"type": "number", "optional": false, "canDefault": false},
            "achievementTemplateId": {"type": "string", "optional": true, "canDefault": false},
            "unlocked": {"type": "boolean", "optional": true, "canDefault": false},
            "templateData": {"type": "array", "elementType": "ObjectKV", "optional": "true", "canDefault": "false"}
        },
        "AvatarData": {
            "playerId": {"type": "string", "optional": false, "canDefault": false},
            "playerName": {"type": "string", "optional": false, "canDefault": false},
            "avatarName": {"type": "string", "optional": false, "canDefault": false},
            "playerType": {"type": "string", "optional": false, "canDefault": false}
        },
        "DeveloperData": {
            "developerId": {"type": "string", "optional": false, "canDefault": false},
            "developerName": {"type": "string", "optional": false, "canDefault": false}
        },
        "GetObjectTemplatesData": {
            "buyoutPrice": {
                "type": "array",
                "elementType": "PriceTagBuyoutData",
                "optional": "true",
                "canDefault": "false"
            },
            "templateData": {"type": "array", "elementType": "ObjectKV", "optional": "true", "canDefault": "false"},
            "isStackable": {"type": "boolean", "optional": "false", "canDefault": "false"},
            "name": {"type": "string", "optional": "false", "canDefault": "false"},
            "containedTemplates": {
                "type": "array",
                "elementType": "ContainedTemplateData",
                "optional": "true",
                "canDefault": "false"
            },
            "tags": {"type": "array", "elementType": "string", "optional": "true", "canDefault": "false"},
            "developerId": {"type": "string", "optional": "false", "canDefault": "true"},
            "objectData": {"type": "array", "elementType": "ObjectKV", "optional": "true", "canDefault": "false"},
            "gameId": {"type": "string", "optional": "true", "canDefault": "true"},
            "clientCanTrade": {"type": "boolean", "optional": "false", "canDefault": "false"},
            "cashPrice": {"type": "number", "optional": "true", "canDefault": "false"},
            "templateId": {"type": "string", "optional": "false", "canDefault": "false"},
            "clientCanManage": {"type": "boolean", "optional": "false", "canDefault": "false"},
            "type": {"type": "string", "optional": "false", "canDefault": "false"},
            "maximumStackSize": {"type": "number", "optional": "false", "canDefault": "false"}
        },
        "PropertyData": {
            "propertyName": {"type": "string", "optional": "false", "canDefault": "false"},
            "propertyValue": {
                "type": ["string", {"elementType": "string", "type": "array"}],
                "optional": "false",
                "canDefault": "false"
            }
        },
        "GetRoomListData": {
            "tables": {"type": "number", "optional": false, "canDefault": false},
            "gameId": {"type": "string", "optional": false, "canDefault": false},
            "name": {"type": "string", "optional": false, "canDefault": false},
            "playerPoolId": {"type": "string", "optional": false, "canDefault": false},
            "minimumToStart": {"type": "number", "optional": false, "canDefault": false},
            "currentPlayers": {"type": "number", "optional": false, "canDefault": false},
            "static": {"type": "boolean", "optional": false, "canDefault": false},
            "seats": {"type": "number", "optional": false, "canDefault": false},
            "roomId": {"type": "string", "optional": false, "canDefault": false}
        },
        "TeamResultsData": {
            "playerIds": {
                "type": "array",
                "elementType": "string",
                "optional": true,
                "canDefault": false
            }, "rank": {"type": "number", "optional": false, "canDefault": false}
        },
        "TemplateInStore": {
            "forSaleTemplateId": {"type": "string", "optional": false, "canDefault": false},
            "price": {"type": "array", "elementType": "QuantityOfTemplate", "optional": false, "canDefault": false},
            "inStock": {"type": "number", "optional": true, "canDefault": false}
        },
        "AuthorizationLogin": {
            "fbAppSignedRequest": {"type": "string", "optional": true, "canDefault": true},
            "password": {"type": "string", "optional": true, "autoHash": true, "canDefault": true},
            "agent": {"type": "string", "optional": false, "canDefault": true},
            "uniqueId": {"type": "string", "optional": false, "canDefault": true},
            "fbAppId": {"type": "string", "optional": true, "canDefault": true}
        },
        "AchievementUnlockData": {
            "achievementId": {"type": "string", "optional": false, "canDefault": false},
            "achievementName": {"type": "string", "optional": false, "canDefault": false},
            "achievementTemplateId": {"type": "string", "optional": false, "canDefault": false}
        },
        "GetBotListData": {
            "playerId": {"type": "string", "optional": false, "canDefault": false},
            "name": {"type": "string", "optional": false, "canDefault": false}
        },
        "PlatformGoingDownData": {"time": {"type": "FSDate", "optional": false, "canDefault": false}},
        "CustomMessageData": {"message": {"type": "string", "optional": false, "canDefault": false}},
        "GameSeekCriteria": {
            "key": {"type": "string", "optional": false, "canDefault": false},
            "value": {"type": "primitive", "optional": false, "canDefault": false},
            "match": {"type": "string", "optional": false, "canDefault": false},
            "initialRange": {"type": "number", "optional": true, "canDefault": false}
        },
        "GetInventoryListData": {
            "gameId": {"type": "string", "optional": "false", "canDefault": "true"},
            "name": {"type": "string", "optional": "false", "canDefault": "false"},
            "playerPoolId": {"type": "string", "optional": "false", "canDefault": "true"},
            "playerId": {"type": "string", "optional": "false", "canDefault": "true"},
            "developerId": {"type": "string", "optional": "false", "canDefault": "true"},
            "restrictByGame": {"type": "boolean", "optional": "false", "canDefault": "false"},
            "restrictByOwner": {"type": "boolean", "optional": "false", "canDefault": "false"},
            "inventoryId": {"type": "string", "optional": "false", "canDefault": "true"},
            "ownerId": {"type": "string", "optional": "false", "canDefault": "false"},
            "type": {"type": "string", "optional": "false", "canDefault": "false"}
        },
        "NotificationData": {
            "arrived": {"type": "FSDate", "optional": "false", "canDefault": "false"},
            "expires": {"type": "FSDate", "optional": "true", "canDefault": "false"},
            "data": {
                "type": ["CustomMessageData", "PlatformGoingDownData", "GameGoingDownData", "AchievementUnlockData", "StorePurchaseData", "GameServerDownData"],
                "optional": false,
                "canDefault": false
            },
            "notificationType": {"type": "string", "optional": false, "canDefault": false},
            "level": {"type": "string", "optional": false, "canDefault": false}
        },
        "AuthorizationPlayer": {
            "playerContextAllowed": {"type": "boolean", "optional": false, "canDefault": true},
            "userData": {"type": "string", "optional": true, "canDefault": true},
            "password": {"type": "string", "optional": true, "autoHash": true, "canDefault": true},
            "agent": {"type": "string", "optional": false, "canDefault": true},
            "uniqueId": {"type": "string", "optional": false, "canDefault": true}
        },
        "ContainedTemplateData": {
            "templateId": {"type": "string", "optional": false, "canDefault": false},
            "quantity": {"type": "number", "optional": false, "canDefault": false}
        },
        "PriceTagBuyoutData": {
            "templateId": {"type": "string", "optional": false, "canDefault": false},
            "quantity": {"type": "number", "optional": false, "canDefault": false}
        },
        "ObjectPrice": {
            "objectTemplateId": {"type": "string", "optional": false, "canDefault": false},
            "ownerId": {"type": "string", "optional": false, "canDefault": false},
            "objectId": {"type": "string", "optional": false, "canDefault": false},
            "quantity": {"type": "number", "optional": false, "canDefault": false}
        },
        "PlayerData": {
            "playerId": {"type": "string", "optional": false, "canDefault": false},
            "playerName": {"type": "string", "optional": false, "canDefault": false}
        },
        "PaymentEntry": {
            "paymentTransactionIdentifier": {"type": "string", "optional": false, "canDefault": false},
            "paymentId": {"type": "string", "optional": false, "canDefault": false},
            "paymentProvider": {"type": "string", "optional": false, "canDefault": false},
            "paymentTransactionData": {"type": "object", "optional": false, "canDefault": false},
            "escrowId": {"type": "string", "optional": false, "canDefault": false},
            "creationDate": {"type": "FSDate", "optional": false, "canDefault": false}
        },
        "AuthorizationSpecifier": {
            "agent": {"type": "string", "optional": false, "canDefault": true},
            "uniqueId": {"type": "string", "optional": false, "canDefault": true}
        },
        "GetAuthAgents": {
            "hasPassword": {"type": "boolean", "optional": true, "canDefault": true},
            "playerContextAllowed": {"type": "boolean", "optional": false, "canDefault": true},
            "agent": {"type": "string", "optional": false, "canDefault": true},
            "uniqueId": {"type": "string", "optional": false, "canDefault": true},
            "userData": {"type": "string", "optional": true, "canDefault": true}
        },
        "QuantityAndOwnerOfTemplate": {
            "ownedByStoreOwner": {"type": "boolean", "optional": false, "canDefault": false},
            "ownedByMe": {"type": "boolean", "optional": false, "canDefault": false},
            "templateId": {"type": "string", "optional": false, "canDefault": false},
            "quantity": {"type": "number", "optional": false, "canDefault": false}
        },
        "Equation": {
            "key": {"type": "string", "optional": false, "canDefault": false},
            "value": {"type": "primitive", "optional": false, "canDefault": false},
            "op": {"type": "string", "optional": false, "canDefault": false}
        },
        "AuthorizationDeveloper": {
            "userData": {"type": "string", "optional": true, "canDefault": true},
            "password": {"type": "string", "optional": true, "autoHash": true, "canDefault": true},
            "agent": {"type": "string", "optional": false, "canDefault": true},
            "uniqueId": {"type": "string", "optional": false, "canDefault": true}
        },
        "LeaderboardPlayerData": {
            "competitionRank": {"type": "number", "optional": false, "canDefault": false},
            "rating": {"type": "number", "optional": false, "canDefault": false},
            "ratingMovement": {"type": "number", "optional": false, "canDefault": false},
            "playerId": {"type": "string", "optional": false, "canDefault": false},
            "ratingData": {"type": "object", "optional": true, "canDefault": false},
            "rank": {"type": "number", "optional": false, "canDefault": false},
            "playerName": {"type": "string", "optional": false, "canDefault": false},
            "rankMovement": {"type": "number", "optional": true, "canDefault": false}
        },
        "PriceTag": {
            "buyoutPrice": {
                "type": "array",
                "elementType": "PriceTagBuyoutData",
                "optional": false,
                "canDefault": false
            },
            "bidderQuantity": {"type": "number", "optional": true, "canDefault": false},
            "bidDuration": {"type": "number", "optional": true, "canDefault": false},
            "bidMinimumQuantity": {"type": "number", "optional": true, "canDefault": false},
            "bidderId": {"type": "string", "optional": true, "canDefault": false},
            "inventoryId": {"type": "string", "optional": false, "canDefault": false},
            "bidTemplateId": {"type": "string", "optional": true, "canDefault": false}
        },
        "RoomGatewayConnectData": {"token": {"type": "string", "optional": true, "canDefault": true}},
        "RatingUpdateData": {
            "playerId": {"type": "string", "optional": false, "canDefault": false},
            "newRating": {"type": "number", "optional": false, "canDefault": false}
        },
        "MessageTemplateData": {
            "templates": {"type": "object", "optional": "false", "canDefault": "false"},
            "language": {"type": "string", "optional": "false", "canDefault": "false"},
            "templateName": {"type": "string", "optional": "false", "canDefault": "false"}
        },
        "FSDate": {
            "type": "string",
            "regex_values": ["\\d\\d\\d\\d\\d\\d\\d\\d\\d\\d", "\\w{3,10} \\d{1,2}, \\d\\d\\d\\d \\d{1,2}:\\d{1,2} (AM|PM)"],
            "canDefault": false
        },
        "ObjectKV": {
            "key": {"type": "string", "optional": false, "canDefault": false},
            "value": {"type": "string", "optional": true, "canDefault": false}
        },
        "GetObjectsData": {
            "buyoutPrice": {
                "type": "array",
                "elementType": "PriceTagBuyoutData",
                "optional": "true",
                "canDefault": "false"
            },
            "containerObjectId": {"type": "string", "optional": "true", "canDefault": "false"},
            "name": {"type": "string", "optional": "false", "canDefault": "false"},
            "objectId": {"type": "string", "optional": "false", "canDefault": "false"},
            "creationTime": {"type": "string", "optional": "false", "canDefault": "false"},
            "auctionTemplateId": {"type": "string", "optional": "true", "canDefault": "false"},
            "auctionTimeRemaining": {"type": "number", "optional": "true", "canDefault": "false"},
            "containedObjectIds": {"type": "array", "elementType": "string", "optional": "true", "canDefault": "false"},
            "objectData": {"type": "array", "elementType": "ObjectKV", "optional": "true", "canDefault": "false"},
            "cashPrice": {"type": "number", "optional": "true", "canDefault": "false"},
            "templateId": {"type": "string", "optional": "false", "canDefault": "false"},
            "inventoryId": {"type": "string", "optional": "false", "canDefault": "true"},
            "ownerId": {"type": "string", "optional": "false", "canDefault": "true"},
            "auctionBidQuantity": {"type": "number", "optional": "true", "canDefault": "false"},
            "quantity": {"type": "number", "optional": "false", "canDefault": "false"}
        },
        "ResultsData": {
            "playerId": {"type": "string", "optional": false, "canDefault": false},
            "opponentIds": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
            "result": {"type": "primitive", "optional": false, "canDefault": false}
        },
        "StorePurchaseData": {"escrowId": {"type": "string", "optional": false, "canDefault": false}},
        "QuantityOfTemplate": {
            "templateId": {"type": "string", "optional": false, "canDefault": false},
            "quantity": {"type": "number", "optional": false, "canDefault": false}
        },
        "GameServerDownData": {
            "gameId": {"type": "string", "optional": "false", "canDefault": "false"},
            "rooms": {"type": "object", "optional": "false", "canDefault": "false"}
        },
        "PlayerRatingsData": {
            "historyRatings": {
                "contexts": ["internal"],
                "optional": true,
                "elementType": "number",
                "type": "array",
                "canDefault": false
            },
            "rating": {"type": "number", "optional": false, "canDefault": false},
            "quitCount": {"type": "number", "optional": true, "canDefault": false},
            "ratingSystemId": {"type": "string", "optional": false, "canDefault": false},
            "playerId": {"type": "string", "optional": false, "canDefault": false},
            "lossCount": {"type": "number", "optional": true, "canDefault": false},
            "ratingData": {"type": "object", "optional": true, "canDefault": false},
            "bestRating": {"type": "number", "optional": false, "canDefault": false},
            "bestRank": {"contexts": ["internal"], "type": "number", "optional": false, "canDefault": false},
            "winCount": {"type": "number", "optional": true, "canDefault": false},
            "historyRanks": {
                "contexts": ["internal"],
                "optional": true,
                "elementType": "number",
                "type": "array",
                "canDefault": false
            },
            "playCount": {"type": "number", "optional": true, "canDefault": false},
            "ratingDataId": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": true},
            "drawCount": {"type": "number", "optional": true, "canDefault": false}
        },
        "UniqueIdPlayerIdData": {
            "playerId": {"type": "string", "optional": true, "canDefault": false},
            "uniqueId": {"type": "string", "optional": false, "canDefault": false}
        },
        "StoreEntry": {
            "storeData": {"type": "array", "elementType": "ObjectKV", "optional": true, "canDefault": false},
            "templatesInStore": {
                "type": "array",
                "elementType": "TemplateInStore",
                "optional": false,
                "canDefault": false
            },
            "name": {"type": "string", "optional": true, "canDefault": false},
            "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
            "storeId": {"type": "string", "optional": false, "canDefault": false},
            "developerId": {"type": "string", "optional": false, "canDefault": false},
            "gameId": {"type": "string", "optional": false, "canDefault": false}
        },
        "GameGoingDownData": {
            "gameId": {"type": "string", "optional": false, "canDefault": false},
            "time": {"type": "FSDate", "optional": false, "canDefault": false}
        },
        "ObjectKeyNumber": {
            "key": {"type": "string", "optional": false, "canDefault": false},
            "value": {"type": "number", "optional": false, "canDefault": false}
        },
        "RoomStatusData": {
            "playerId": {"type": "string", "optional": false, "canDefault": false},
            "playerName": {"type": "string", "optional": false, "canDefault": false},
            "playerAddress": {"type": "string", "optional": false, "canDefault": false}
        },
        "RoomTableData": {
            "fromSeat": {"type": "number", "optional": true, "canDefault": false},
            "settings": {"type": "string", "optional": true, "canDefault": false},
            "playerId": {"type": "string", "optional": true, "canDefault": false},
            "bot": {"type": "boolean", "optional": true, "canDefault": false},
            "playerAddress": {"type": "string", "optional": true, "canDefault": false},
            "requestJoin": {"type": "boolean", "optional": true, "canDefault": false},
            "owner": {"type": "boolean", "optional": true, "canDefault": false},
            "seat": {"type": "number", "optional": true, "canDefault": false},
            "bootPlayerAddress": {"type": "string", "optional": true, "canDefault": false},
            "state": {"type": "string", "optional": true, "canDefault": false},
            "requestSit": {"type": "boolean", "optional": true, "canDefault": false},
            "seatLocks": {"type": "array", "elementType": "number", "optional": true, "canDefault": false},
            "booted": {"type": "boolean", "optional": true, "canDefault": false},
            "table": {"type": "number", "optional": false, "canDefault": false},
            "ready": {"type": "boolean", "optional": true, "canDefault": false},
            "shared": {"type": "boolean", "optional": true, "canDefault": false},
            "leaving": {"type": "boolean", "optional": true, "canDefault": false},
            "type": {"type": "string", "optional": true, "canDefault": false},
            "tableLocked": {"type": "boolean", "optional": true, "canDefault": false}
        }
    };
    var messages = {
        "WebSocketGateway": {
            "APIs": {
                "GatewayEndSession": {
                    "contexts": ["game", "bot"],
                    "version": 1,
                    "request": {},
                    "response": {}
                },
                "Ping": {"contexts": ["internal"], "version": 1, "request": {}, "response": {}},
                "LoginGateway": {
                    "contexts": ["unconnected"],
                    "version": 1,
                    "request": {"sessionId": {"type": "string", "optional": false, "canDefault": true}},
                    "response": {}
                },
                "DeleteWithDependencies": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "id": {"type": "string", "optional": false, "canDefault": false},
                        "collection": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "TerminateConnection": {"contexts": ["internal"], "version": 1, "request": {}, "response": {}},
                "SendAnalytics": {
                    "contexts": ["bot", "player", "game"],
                    "version": 1,
                    "request": {"analytics": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {}
                },
                "GatewayDisconnect": {
                    "contexts": ["developer", "player", "game", "bot"],
                    "version": 1,
                    "request": {"disconnectDestination": {"type": "string", "optional": false, "canDefault": true}},
                    "response": {}
                },
                "Reconnect": {"contexts": ["internal"], "version": 1, "request": {}, "response": {}},
                "InternalLoginGateway": {
                    "contexts": ["internal", "unconnected"],
                    "version": 1,
                    "request": {},
                    "response": {}
                },
                "GatewayConnect": {
                    "contexts": ["developer", "player", "game", "bot"],
                    "version": 1,
                    "request": {
                        "connectData": {"type": "RoomGatewayConnectData", "optional": true, "canDefault": false},
                        "connectDestination": {"type": "string", "optional": false, "canDefault": true},
                        "linkdeadProcessing": {"type": "boolean", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "StartGame": {
                    "contexts": ["game"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "gameId": {"type": "string", "optional": false, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": true},
                        "settings": {"type": "string", "optional": false, "canDefault": false},
                        "playerList": {
                            "type": "array",
                            "elementType": "RoomTableData",
                            "optional": false,
                            "canDefault": false
                        },
                        "table": {"type": "number", "optional": false, "canDefault": false},
                        "roomId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "version": 1,
                    "response": {}
                }
            },
            "Events": {
                "GameMessage": {
                    "contexts": ["bot", "player", "game"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "data": {
                        "data": {"type": "object", "optional": true, "canDefault": false},
                        "messageName": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "version": 1
                },
                "PleaseExit": {
                    "contexts": ["bot", "game"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "data": {},
                    "version": 1
                },
                "StoppedGame": {
                    "contexts": ["game"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "data": {
                        "table": {"type": "number", "optional": false, "canDefault": false},
                        "roomId": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "version": 1
                },
                "StoppedBot": {
                    "contexts": ["bot"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "data": {"name": {"type": "string", "optional": false, "canDefault": false}},
                    "version": 1
                },
                "GameServerHello": {
                    "contexts": ["bot", "player", "game"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "data": {
                        "gameServerAddress": {"type": "string", "optional": false, "canDefault": false},
                        "table": {"type": "number", "optional": false, "canDefault": false},
                        "roomId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "version": 1
                }
            },
            "default_destination": ""
        },
        "Notification": {
            "APIs": {
                "CreateOrUpdateMessageTemplate": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "language": {"type": "string", "optional": false, "canDefault": false},
                        "templateName": {"type": "string", "optional": false, "canDefault": false},
                        "title": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": false},
                        "template": {"type": "string", "optional": false, "canDefault": false},
                        "channel": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "GetMessageTemplates": {
                    "contexts": ["developer", "siteowner"],
                    "version": 1,
                    "request": {"developerId": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {
                        "messageTemplates": {
                            "type": "array",
                            "elementType": "MessageTemplateData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "SendCustomNotificationMessage": {
                    "contexts": ["game", "developer", "siteowner"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "priority": {"type": "number", "optional": true, "canDefault": false},
                        "message": {"type": "string", "optional": false, "canDefault": false},
                        "timeToLive": {"type": "number", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "PlayerNotificationOn": {
                    "contexts": ["game", "developer", "player"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "SendCustomNotification": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "type": {"type": "string", "optional": false, "canDefault": false},
                        "priority": {"type": "number", "optional": true, "canDefault": false},
                        "timeToLive": {"type": "number", "optional": true, "canDefault": false},
                        "scope": {"type": "string", "optional": false, "canDefault": false},
                        "data": {"type": "object", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "SendEmailNotification": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "type": {"type": "string", "optional": false, "canDefault": false},
                        "data": {"type": "object", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "priority": {"type": "number", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "PlayerNotificationOff": {
                    "contexts": ["game", "developer", "player"],
                    "version": 1,
                    "request": {"playerId": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {}
                },
                "GetNotificationMessages": {
                    "contexts": ["player"],
                    "version": 1,
                    "request": {},
                    "response": {
                        "messages": {
                            "type": "array",
                            "elementType": "NotificationData",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                }
            },
            "Events": {
                "NotificationArrival": {
                    "contexts": ["player", "bot"],
                    "version": 1,
                    "data": {
                        "arrived": {"type": "FSDate", "optional": "false", "canDefault": "false"},
                        "expires": {"type": "FSDate", "optional": "true", "canDefault": "false"},
                        "data": {
                            "type": ["CustomMessageData", "PlatformGoingDownData", "GameGoingDownData", "AchievementUnlockData", "StorePurchaseData", "GameServerDownData"],
                            "optional": false,
                            "canDefault": false
                        },
                        "notificationType": {"type": "string", "optional": false, "canDefault": false}
                    }
                }
            },
            "default_destination": "Notification"
        },
        "RemoteJob": {
            "APIs": {
                "ScheduleJob": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "payload": {"type": "object", "optional": false, "canDefault": false},
                        "jobName": {"type": "string", "optional": false, "canDefault": false},
                        "eventDestinationType": {"type": "string", "optional": true, "canDefault": false},
                        "eventDestinationId": {"type": "string", "optional": true, "canDefault": false},
                        "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false}
                    },
                    "response": {"jobId": {"type": "string", "optional": false, "canDefault": false}}
                }
            },
            "Events": {
                "JobComplete": {
                    "contexts": ["player", "bot"],
                    "version": 1,
                    "data": {
                        "jobId": {"type": "string", "optional": false, "canDefault": false},
                        "code": {"type": "number", "optional": false, "canDefault": false},
                        "payload": {"type": "object", "optional": false, "canDefault": false},
                        "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "jobName": {"type": "string", "optional": false, "canDefault": false}
                    }
                }
            },
            "default_destination": "RemoteJob"
        },
        "Object": {
            "APIs": {
                "UpdateTemplatesInStore": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "removePrevious": {"type": "boolean", "optional": true, "canDefault": false},
                        "templatesInStore": {
                            "type": "array",
                            "elementType": "TemplateInStore",
                            "optional": false,
                            "canDefault": false
                        },
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "storeId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "UpdateObjectTemplate": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "buyoutPrice": {
                            "type": "array",
                            "elementType": "PriceTagBuyoutData",
                            "optional": true,
                            "canDefault": false
                        },
                        "templateData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "isStackable": {"type": "boolean", "optional": true, "canDefault": false},
                        "maximumStackSize": {"type": "number", "optional": true, "canDefault": false},
                        "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "objectData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "clientCanTrade": {"type": "boolean", "optional": true, "canDefault": false},
                        "cashPrice": {"type": "number", "optional": true, "canDefault": false},
                        "clientCanManage": {"type": "boolean", "optional": true, "canDefault": false},
                        "templateId": {"type": "string", "optional": false, "canDefault": false},
                        "gameId": {"type": "string", "optional": true, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "FindAchievements": {
                    "contexts": ["player", "bot", "developer"],
                    "version": 1,
                    "request": {
                        "achievementObjectId": {"type": "string", "optional": true, "canDefault": false},
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "customId": {"type": "number", "optional": true, "canDefault": false},
                        "achievementTemplateId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "achievementList": {
                            "type": "array",
                            "elementType": "AchievementData",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                },
                "PriceObject": {
                    "contexts": ["player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "inventoryId": {"type": "string", "optional": true, "canDefault": false},
                        "price": {"type": "PriceTag", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": true},
                        "objectId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "GetPayment": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "paymentId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "paymentTransactionIdentifier": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "paymentId": {"type": "string", "optional": false, "canDefault": false},
                        "paymentProvider": {"type": "string", "optional": false, "canDefault": false},
                        "paymentTransactionData": {"type": "object", "optional": false, "canDefault": false},
                        "escrowId": {"type": "string", "optional": false, "canDefault": false},
                        "creationDate": {"type": "FSDate", "optional": false, "canDefault": false}
                    }
                },
                "CreateObject": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "containedObjectIds": {
                            "contexts": ["internal"],
                            "optional": true,
                            "elementType": "string",
                            "type": "array",
                            "canDefault": false
                        },
                        "isStackable": {
                            "contexts": ["internal"],
                            "type": "boolean",
                            "optional": true,
                            "canDefault": false
                        },
                        "name": {"contexts": ["internal"], "type": "string", "optional": false, "canDefault": false},
                        "priceData": {
                            "contexts": ["internal"],
                            "optional": true,
                            "elementType": "ObjectKeyNumber",
                            "type": "array",
                            "canDefault": false
                        },
                        "tags": {
                            "contexts": ["internal"],
                            "optional": true,
                            "elementType": "string",
                            "type": "array",
                            "canDefault": false
                        },
                        "timeStamp": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "privateData": {
                            "contexts": ["internal"],
                            "optional": true,
                            "elementType": "ObjectKV",
                            "type": "array",
                            "canDefault": false
                        },
                        "containerObjectId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "objectData": {
                            "contexts": ["internal"],
                            "optional": true,
                            "elementType": "ObjectKV",
                            "type": "array",
                            "canDefault": false
                        },
                        "destructionTimeStamp": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        },
                        "templateId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "inventoryId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "ownerId": {"contexts": ["internal"], "type": "string", "optional": false, "canDefault": false},
                        "type": {"contexts": ["internal"], "type": "string", "optional": false, "canDefault": false},
                        "id": {"contexts": ["internal"], "type": "string", "optional": false, "canDefault": false},
                        "quantity": {"contexts": ["internal"], "type": "number", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "CountPlayerItems": {
                    "contexts": ["internal", "player"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "templates": {"type": "array", "elementType": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "items": {
                            "type": "array",
                            "elementType": "QuantityOfTemplate",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "CreateInventory": {
                    "contexts": ["developer", "game"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "maximumSlots": {"type": "number", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "restrictByGame": {"type": "boolean", "optional": true, "canDefault": false},
                        "restrictByOwner": {"type": "boolean", "optional": true, "canDefault": false},
                        "type": {"type": "string", "optional": false, "canDefault": false},
                        "id": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {"inventoryId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetInventoryList": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "maximumSlots": {"type": "number", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "playerId": {"type": "string", "optional": true, "canDefault": true},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "type": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "inventoryList": {
                            "type": "array",
                            "elementType": "GetInventoryListData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "AddContainedObjectTemplate": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "containerTemplateId": {"type": "string", "optional": false, "canDefault": true},
                        "containeeTemplateId": {"type": "string", "optional": false, "canDefault": true},
                        "quantity": {"type": "number", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "GetObjects": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "objectIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        }, "developerId": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "response": {
                        "objectList": {
                            "type": "array",
                            "elementType": "GetObjectsData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "AddContainedObject": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "containeeId": {"type": "string", "optional": false, "canDefault": true},
                        "containerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "UpdateInventory": {
                    "contexts": ["developer", "game"],
                    "version": 1,
                    "request": {
                        "inventoryId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "RemoveContainedObject": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "containeeId": {"type": "string", "optional": false, "canDefault": true},
                        "containerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "CopyTemplateInventory": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "inventoryId": {"type": "string", "optional": false, "canDefault": false},
                        "templateInventoryId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {
                        "objectIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "RemovePlayerAchievements": {
                    "contexts": ["game", "player"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "achievementIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "response": {}
                },
                "GetStorePriceForItems": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "items": {
                            "type": "array",
                            "elementType": "QuantityOfTemplate",
                            "optional": false,
                            "canDefault": false
                        },
                        "storeId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "playerCurrencyItems": {
                            "type": "array",
                            "elementType": "QuantityAndOwnerOfTemplate",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "CreateObjectTemplate": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "buyoutPrice": {
                            "type": "array",
                            "elementType": "PriceTagBuyoutData",
                            "optional": true,
                            "canDefault": false
                        },
                        "clientCanManage": {"type": "boolean", "optional": true, "canDefault": false},
                        "templateData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "isStackable": {"type": "boolean", "optional": true, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "privateData": {
                            "contexts": ["internal"],
                            "optional": true,
                            "elementType": "ObjectKV",
                            "type": "array",
                            "canDefault": false
                        },
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "objectData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "clientCanTrade": {"type": "boolean", "optional": true, "canDefault": false},
                        "cashPrice": {"type": "number", "optional": true, "canDefault": false},
                        "defaultPriceData": {
                            "contexts": ["internal"],
                            "optional": true,
                            "elementType": "ObjectKeyNumber",
                            "type": "array",
                            "canDefault": false
                        },
                        "gameId": {"type": "string", "optional": true, "canDefault": true},
                        "type": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false},
                        "id": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false},
                        "maximumStackSize": {"type": "number", "optional": true, "canDefault": false}
                    },
                    "response": {"templateId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "CreateObjectTransaction": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "sourceTemplateId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "sourceObjectId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "destinationQuantity": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "destinationTemplateId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "timeStamp": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "destinationOwnerId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "id": {"contexts": ["internal"], "type": "string", "optional": false, "canDefault": false},
                        "priceInObjects": {
                            "contexts": ["internal"],
                            "optional": true,
                            "elementType": "ObjectPrice",
                            "type": "array",
                            "canDefault": false
                        },
                        "sourceOwnerId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "sourceQuantity": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        },
                        "destinationObjectId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "cashPriceInCents": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        },
                        "transactionType": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        }
                    },
                    "response": {}
                },
                "FindAchievementTemplates": {
                    "contexts": ["bot", "game", "player", "developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "tagFilter": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "achievementTemplateList": {
                            "type": "array",
                            "elementType": "AchievementData",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                },
                "RemoveContainedObjectTemplate": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "containerTemplateId": {"type": "string", "optional": false, "canDefault": true},
                        "containeeTemplateId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "CloseEscrow": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "siteData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "paymentTransactionIdentifier": {"type": "string", "optional": true, "canDefault": false},
                        "paymentProvider": {"type": "string", "optional": true, "canDefault": false},
                        "paymentTransactionData": {"type": "object", "optional": true, "canDefault": false},
                        "escrowId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {"paymentId": {"type": "string", "optional": true, "canDefault": false}}
                },
                "CreatePlayerAchievements": {
                    "contexts": ["game", "player"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": true},
                        "gameId": {"type": "string", "optional": true, "canDefault": true},
                        "achievementTemplateIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "response": {
                        "achievementIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                },
                "SetObjectData": {
                    "contexts": ["game", "developer"],
                    "version": 1,
                    "request": {
                        "developerId": {"type": "string", "optional": true, "canDefault": true},
                        "objectId": {"type": "string", "optional": false, "canDefault": false},
                        "objectData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "response": {}
                },
                "BidObject": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "objectId": {"type": "string", "optional": false, "canDefault": false},
                        "currencyObjectId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "DeleteStore": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "storeId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "DeleteObjects": {
                    "contexts": ["game", "developer"],
                    "version": 1,
                    "request": {
                        "objectIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        }, "developerId": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "response": {}
                },
                "GetInventory": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "count": {"type": "number", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "queryFilter": {
                            "type": "array",
                            "elementType": {"elementType": "string", "type": "array"},
                            "optional": true,
                            "canDefault": false
                        },
                        "developerId": {"type": "string", "optional": true, "canDefault": true},
                        "tagFilter": {"type": "string", "optional": true, "canDefault": false},
                        "sortOrder": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "offset": {"type": "number", "optional": true, "canDefault": false},
                        "inventoryId": {"type": "string", "optional": false, "canDefault": true},
                        "ownerId": {"type": "string", "optional": true, "canDefault": false},
                        "buyoutFilter": {
                            "type": "array",
                            "elementType": {"elementType": "string", "type": "array"},
                            "optional": true,
                            "canDefault": false
                        },
                        "sortBy": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "objectIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "GetAchievementTemplate": {
                    "contexts": ["player", "game", "bot", "developer"],
                    "version": 1,
                    "request": {"achievementTemplateId": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {"achievementData": {"type": "AchievementData", "optional": false, "canDefault": false}}
                },
                "TransferObject": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "objectId": {"type": "string", "optional": false, "canDefault": true},
                        "changeOwnership": {"type": "boolean", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": true},
                        "currencyObjectIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "inventoryId": {"type": "string", "optional": false, "canDefault": true},
                        "ignoreBuyoutPrice": {"type": "boolean", "optional": true, "canDefault": false}
                    },
                    "response": {"transferredObjectId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetStores": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": true},
                        "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "stores": {
                            "type": "array",
                            "elementType": "StoreEntry",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "GetInventoryInfo": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "inventoryId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "gameId": {"type": "string", "optional": "false", "canDefault": "true"},
                        "name": {"type": "string", "optional": "false", "canDefault": "false"},
                        "playerPoolId": {"type": "string", "optional": "false", "canDefault": "true"},
                        "playerId": {"type": "string", "optional": "false", "canDefault": "true"},
                        "developerId": {"type": "string", "optional": "false", "canDefault": "true"},
                        "restrictByGame": {"type": "boolean", "optional": "false", "canDefault": "false"},
                        "restrictByOwner": {"type": "boolean", "optional": "false", "canDefault": "false"},
                        "inventoryId": {"type": "string", "optional": "false", "canDefault": "true"},
                        "ownerId": {"type": "string", "optional": "false", "canDefault": "false"},
                        "type": {"type": "string", "optional": "false", "canDefault": "false"}
                    }
                },
                "CreateObjects": {
                    "contexts": ["game", "developer"],
                    "version": 1,
                    "request": {
                        "inventoryId": {"type": "string", "optional": false, "canDefault": true},
                        "explodeBundles": {"type": "boolean", "optional": true, "canDefault": true},
                        "templateId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "quantity": {"type": "number", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "objectIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "UpdateAchievementTemplate": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "currentUnlockPoints": {"type": "number", "optional": true, "canDefault": false},
                        "templateData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "description": {"type": "string", "optional": true, "canDefault": false},
                        "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "objectData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "recommended": {"type": "boolean", "optional": true, "canDefault": false},
                        "clientCanManage": {"type": "boolean", "optional": true, "canDefault": false},
                        "customId": {"type": "number", "optional": true, "canDefault": false},
                        "maximumUnlockPoints": {"type": "number", "optional": true, "canDefault": false},
                        "achievementTemplateId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "CancelEscrow": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "escrowId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "GetEscrow": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "escrowId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "siteData": {"type": "array", "elementType": "ObjectKV", "optional": true, "canDefault": false},
                        "storeId": {"type": "string", "optional": false, "canDefault": false},
                        "intention": {"type": "string", "optional": false, "canDefault": false},
                        "playerInventoryId": {"type": "string", "optional": false, "canDefault": false},
                        "siteInventoryId": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "CreateAchievementTemplate": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "currentUnlockPoints": {"type": "number", "optional": true, "canDefault": false},
                        "templateData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "gameId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "objectData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "recommended": {"type": "boolean", "optional": false, "canDefault": false},
                        "clientCanManage": {"type": "boolean", "optional": true, "canDefault": false},
                        "customId": {"type": "number", "optional": true, "canDefault": false},
                        "maximumUnlockPoints": {"type": "number", "optional": false, "canDefault": false},
                        "description": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {"achievementTemplateId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetObjectTemplates2": {
                    "contexts": ["bot", "player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "count": {"type": "number", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "queryFilter": {
                            "type": "array",
                            "elementType": {"elementType": "string", "type": "array"},
                            "optional": true,
                            "canDefault": false
                        },
                        "templateIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "offset": {"type": "number", "optional": true, "canDefault": false},
                        "tagFilter": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "templates": {
                            "type": "array",
                            "elementType": "GetObjectTemplatesData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "DeleteInventory": {
                    "contexts": ["developer", "game"],
                    "version": 1,
                    "request": {
                        "inventoryId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "UpdateUnlockPoints": {
                    "contexts": ["game"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": true},
                        "value": {"type": "number", "optional": true, "canDefault": false},
                        "increment": {"type": "number", "optional": true, "canDefault": false},
                        "achievementObjectId": {"type": "string", "optional": true, "canDefault": false},
                        "customId": {"type": "number", "optional": true, "canDefault": false},
                        "achievementTemplateId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {"percent": {"type": "number", "optional": false, "canDefault": false}}
                },
                "DeleteAchievementTemplate": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "achievementTemplateId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "AttachObject": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "sourceObjectId": {"type": "string", "optional": false, "canDefault": false},
                        "destinationObjectId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "response": {}
                },
                "CreateEscrow": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "siteData": {"type": "array", "elementType": "ObjectKV", "optional": true, "canDefault": false},
                        "storeId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "playerInventoryId": {"type": "string", "optional": false, "canDefault": false},
                        "siteInventoryId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {
                        "escrowId": {"type": "string", "optional": false, "canDefault": false},
                        "playerCurrencyItems": {
                            "type": "array",
                            "elementType": "QuantityAndOwnerOfTemplate",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "GetObjectTemplates": {
                    "contexts": ["bot", "player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "count": {"type": "number", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "queryFilter": {
                            "type": "array",
                            "elementType": {"elementType": "string", "type": "array"},
                            "optional": true,
                            "canDefault": false
                        },
                        "developerId": {"type": "string", "optional": true, "canDefault": true},
                        "templateIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "offset": {"type": "number", "optional": true, "canDefault": false},
                        "tagFilter": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "templates": {
                            "type": "array",
                            "elementType": "GetObjectTemplatesData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "DeleteTradeToken": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {"token": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {}
                },
                "GetStore": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {"storeId": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {
                        "storeData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "templatesInStore": {
                            "type": "array",
                            "elementType": "TemplateInStore",
                            "optional": false,
                            "canDefault": false
                        },
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "storeId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": false},
                        "gameId": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "MakeStack": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "developerId": {"type": "string", "optional": true, "canDefault": true},
                        "objectId": {"type": "string", "optional": false, "canDefault": false},
                        "quantity": {"type": "number", "optional": false, "canDefault": false}
                    },
                    "response": {"objectId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "CreateTradeToken": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {"objectId": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {"token": {"type": "string", "optional": false, "canDefault": false}}
                },
                "FindPayments": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "escrowId": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "paymentProvider": {"type": "string", "optional": false, "canDefault": false},
                        "paymentTransactionIdentifier": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "payments": {
                            "type": "array",
                            "elementType": "PaymentEntry",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "GetObjects2": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "objectIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "response": {
                        "objectList": {
                            "type": "array",
                            "elementType": "GetObjectsData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "CreatePayment": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "paymentTransactionData": {"type": "object", "optional": true, "canDefault": false},
                        "escrowId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "paymentProvider": {"type": "string", "optional": true, "canDefault": false},
                        "paymentTransactionIdentifier": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {"paymentId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "UpdateStore": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "storeData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "storeId": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "UseTradeToken": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "inventoryId": {"type": "string", "optional": false, "canDefault": false},
                        "token": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "CreateStore": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "storeData": {
                            "type": "array",
                            "elementType": "ObjectKV",
                            "optional": true,
                            "canDefault": false
                        },
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "tags": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": false},
                        "templatesInStore": {
                            "type": "array",
                            "elementType": "TemplateInStore",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "response": {"storeId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "CombineStack": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "sourceObjectId": {"type": "string", "optional": false, "canDefault": false},
                        "destinationObjectId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "response": {}
                },
                "DeleteObjectTemplate": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "templateId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "UnattachObject": {
                    "contexts": ["player", "game"],
                    "version": 1,
                    "request": {
                        "developerId": {"type": "string", "optional": true, "canDefault": true},
                        "objectId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "AddItemsToEscrow": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "items": {
                            "type": "array",
                            "elementType": "QuantityOfTemplate",
                            "optional": false,
                            "canDefault": false
                        },
                        "escrowId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "siteData": {"type": "array", "elementType": "ObjectKV", "optional": true, "canDefault": false}
                    },
                    "response": {}
                }
            }, "Events": {}, "default_destination": "Object"
        },
        "Player": {
            "APIs": {
                "GetRatings": {
                    "contexts": ["player", "developer", "game", "internal"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "playerIds": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "ratingSystemId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "ratings": {
                            "type": "array",
                            "elementType": "PlayerRatingsData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "CreateRatingSystem": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "updateHistoriesDaily": {"type": "boolean", "optional": true, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "seedRating": {"type": "number", "optional": false, "canDefault": false},
                        "ratingSystemData": {"type": "object", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": false},
                        "method": {"type": "string", "optional": false, "canDefault": false},
                        "wipeRatingsDaily": {"type": "boolean", "optional": true, "canDefault": true},
                        "clientCanManage": {"type": "boolean", "optional": true, "canDefault": false},
                        "systemName": {"type": "string", "optional": false, "canDefault": false},
                        "id": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {"ratingSystemId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetPlayerAvatars": {
                    "contexts": ["player", "developer", "game", "bot"],
                    "version": 1,
                    "request": {
                        "playerIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        }, "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "avatars": {
                            "type": "array",
                            "elementType": "AvatarData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "FindPlayer": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "status": {"type": "string", "optional": true, "canDefault": false},
                        "count": {"type": "number", "optional": false, "canDefault": false},
                        "startCreationDate": {"type": "FSDate", "optional": true, "canDefault": false},
                        "guest": {"type": "boolean", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": true},
                        "startIndex": {"type": "number", "optional": true, "canDefault": false},
                        "email": {"type": "string", "optional": true, "canDefault": true},
                        "endCreationDate": {"type": "FSDate", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "playerList": {
                            "type": "array",
                            "elementType": "PlayerData",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                },
                "GetRatingSystemId": {
                    "contexts": ["player", "developer", "game", "bot"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "systemName": {"type": "string", "optional": false, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {"ratingSystemId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetPlayerId": {
                    "contexts": ["player", "developer", "game"],
                    "version": 1,
                    "request": {
                        "playerName": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "response": {"playerId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetRatingSystemStatistics": {
                    "contexts": ["player", "developer", "game", "bot"],
                    "version": 1,
                    "request": {"ratingSystemId": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {
                        "standardDeviation": {"type": "number", "optional": false, "canDefault": false},
                        "minimumRating": {"type": "number", "optional": false, "canDefault": false},
                        "systemName": {"type": "string", "optional": false, "canDefault": false},
                        "ratedCount": {"type": "number", "optional": false, "canDefault": false},
                        "maximumRating": {"type": "number", "optional": false, "canDefault": false},
                        "medianRating": {"type": "number", "optional": false, "canDefault": false},
                        "averageRating": {"type": "number", "optional": false, "canDefault": false}
                    }
                },
                "UnseekGame": {
                    "contexts": ["player"],
                    "version": 1,
                    "request": {"seekId": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {}
                },
                "AddToRating": {
                    "contexts": ["game", "developer"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "ratingChange": {"type": "number", "optional": false, "canDefault": false},
                        "ratingSystemId": {"type": "string", "optional": false, "canDefault": false},
                        "result": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "ConvertToPlayerIds": {
                    "contexts": ["player", "developer", "game"],
                    "version": 1,
                    "request": {
                        "uniqueIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "authorizationAgent": {"type": "string", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": true},
                        "developerId": {"type": "string", "optional": true, "canDefault": true},
                        "agent": {"type": "string", "optional": true, "canDefault": false},
                        "playerIds": {"type": "array", "elementType": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "playerList": {
                            "type": "array",
                            "elementType": "UniqueIdPlayerIdData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "GetRank": {
                    "contexts": ["player", "developer", "game", "bot"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "interval": {"type": "number", "optional": true, "canDefault": false},
                        "ratingSystemId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {
                        "competitionRank": {"type": "number", "optional": false, "canDefault": false},
                        "lossCount": {"type": "number", "optional": false, "canDefault": false},
                        "quitCount": {"type": "number", "optional": false, "canDefault": false},
                        "rank": {"type": "number", "optional": true, "canDefault": false},
                        "bestRank": {"type": "number", "optional": true, "canDefault": false},
                        "winCount": {"type": "number", "optional": false, "canDefault": false},
                        "playCount": {"type": "number", "optional": false, "canDefault": false},
                        "drawCount": {"type": "number", "optional": false, "canDefault": false},
                        "movement": {"type": "number", "optional": true, "canDefault": false}
                    }
                },
                "GetPlayer": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "authorizationAgents": {
                            "type": "array",
                            "elementType": "GetAuthAgents",
                            "optional": false,
                            "canDefault": false
                        },
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "botId": {"type": "string", "optional": true, "canDefault": false},
                        "creationDate": {"type": "FSDate", "optional": false, "canDefault": false},
                        "type": {"type": "string", "optional": false, "canDefault": false},
                        "email": {"type": "string", "optional": true, "canDefault": false}
                    }
                },
                "SetPlayerAvatar": {
                    "contexts": ["player", "developer", "game", "bot"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "avatarName": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "SetRating": {
                    "contexts": ["game"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "rating": {"type": "number", "optional": true, "canDefault": false},
                        "result": {"type": "string", "optional": true, "canDefault": false},
                        "ratingData": {"type": "object", "optional": true, "canDefault": false},
                        "ratingSystemId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "SeekGame": {
                    "contexts": ["player"],
                    "version": 1,
                    "request": {
                        "numberToStart": {"type": "number", "optional": false, "canDefault": false},
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "criterias": {
                            "type": "array",
                            "elementType": "GameSeekCriteria",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "response": {"seekId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "CreateRating": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "historyRatings": {
                            "contexts": ["internal"],
                            "optional": false,
                            "elementType": "number",
                            "type": "array",
                            "canDefault": false
                        },
                        "rating": {"contexts": ["internal"], "type": "number", "optional": false, "canDefault": false},
                        "ratingSystemId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "playerId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "quitCount": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        },
                        "ratingData": {
                            "contexts": ["internal"],
                            "type": "object",
                            "optional": true,
                            "canDefault": false
                        },
                        "bestRating": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "bestRank": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "historyRanks": {
                            "contexts": ["internal"],
                            "optional": false,
                            "elementType": "number",
                            "type": "array",
                            "canDefault": false
                        },
                        "playCount": {
                            "contexts": ["internal"],
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        },
                        "id": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {"ratingId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetRating": {
                    "contexts": ["player", "developer", "game", "bot"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "interval": {"type": "number", "optional": true, "canDefault": false},
                        "ratingSystemId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {
                        "rating": {"type": "number", "optional": true, "canDefault": false},
                        "lossCount": {"type": "number", "optional": false, "canDefault": false},
                        "quitCount": {"type": "number", "optional": false, "canDefault": false},
                        "ratingData": {"type": "object", "optional": true, "canDefault": false},
                        "bestRating": {"type": "number", "optional": true, "canDefault": false},
                        "winCount": {"type": "number", "optional": false, "canDefault": false},
                        "playCount": {"type": "number", "optional": false, "canDefault": false},
                        "drawCount": {"type": "number", "optional": false, "canDefault": false},
                        "movement": {"type": "number", "optional": true, "canDefault": false}
                    }
                },
                "DeleteRatingSystem": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "ratingSystemId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "GetLeaderboard": {
                    "contexts": ["player", "developer", "game", "bot"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "count": {"type": "number", "optional": false, "canDefault": false},
                        "interval": {"type": "number", "optional": true, "canDefault": false},
                        "ratingSystemId": {"type": "string", "optional": false, "canDefault": false},
                        "startRank": {"type": "number", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "playerList": {
                            "type": "array",
                            "elementType": "LeaderboardPlayerData",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                },
                "ClearRatingMovement": {
                    "contexts": ["player", "developer", "game", "bot"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "ratingSystemId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "ReportResults": {
                    "contexts": ["game", "player"],
                    "version": 1,
                    "request": {
                        "teamResults": {
                            "type": "array",
                            "elementType": "TeamResultsData",
                            "optional": true,
                            "canDefault": false
                        },
                        "ratingSystemId": {"type": "string", "optional": false, "canDefault": false},
                        "results": {
                            "type": "array",
                            "elementType": "ResultsData",
                            "optional": true,
                            "canDefault": false
                        }
                    },
                    "response": {
                        "ratingUpdates": {
                            "type": "array",
                            "elementType": "RatingUpdateData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                }
            }, "Events": {}, "default_destination": "Player"
        },
        "Authentication": {
            "APIs": {
                "GetGame": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "playerPoolIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "siteData": {"type": "object", "optional": true, "canDefault": false},
                        "botList": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "ratingSystemList": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false}
                    }
                },
                "EnableDeveloper": {
                    "contexts": ["internal", "siteowner"],
                    "version": 1,
                    "request": {
                        "enabled": {"type": "boolean", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "UpdateDeveloper": {
                    "contexts": ["internal", "siteowner"],
                    "version": 1,
                    "request": {
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "whichAuthorization": {"type": "AuthorizationSpecifier", "optional": true, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "authorization": {"type": "AuthorizationDeveloper", "optional": true, "canDefault": true},
                        "email": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "UpdateBot": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "botId": {"type": "string", "optional": false, "canDefault": true},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "FindDeveloper": {
                    "contexts": ["internal", "siteowner"],
                    "version": 1,
                    "request": {
                        "status": {"type": "string", "optional": true, "canDefault": false},
                        "count": {"type": "number", "optional": true, "canDefault": false},
                        "startCreationDate": {"type": "FSDate", "optional": true, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "startIndex": {"type": "number", "optional": true, "canDefault": false},
                        "email": {"type": "string", "optional": true, "canDefault": false},
                        "endCreationDate": {"type": "FSDate", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "developerList": {
                            "type": "array",
                            "elementType": "DeveloperData",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                },
                "UpdatePlayerPool": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "EnableGame": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "gameId": {"type": "string", "optional": false, "canDefault": true},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "GetPlayerPool": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {"playerPoolId": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "gameIds": {"type": "array", "elementType": "string", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": false},
                        "playerCount": {"type": "number", "optional": false, "canDefault": false}
                    }
                },
                "CreateGame": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "siteData": {"type": "object", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "id": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false},
                        "migrationStatus": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "createTime": {
                            "contexts": ["internal"],
                            "type": "FSDate",
                            "optional": true,
                            "canDefault": false
                        }
                    },
                    "response": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "UpdateApiExtension": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "apiExtensionId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "CreateBot": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "id": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false},
                        "migrationStatus": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "createTime": {
                            "contexts": ["internal"],
                            "type": "FSDate",
                            "optional": true,
                            "canDefault": false
                        }
                    },
                    "response": {"botId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetApiExtension": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "apiExtensionId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "apiExtensionId": {"type": "string", "optional": false, "canDefault": false},
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false}
                    }
                },
                "CreateDeveloper": {
                    "contexts": ["internal", "siteowner"],
                    "version": 1,
                    "request": {
                        "name": {"type": "string", "optional": false, "canDefault": true},
                        "createTime": {
                            "contexts": ["internal"],
                            "type": "FSDate",
                            "optional": true,
                            "canDefault": false
                        },
                        "email": {"type": "string", "optional": true, "canDefault": true},
                        "migrationStatus": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "id": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false},
                        "authorization": {"type": "AuthorizationDeveloper", "optional": false, "canDefault": true}
                    },
                    "response": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "email": {"type": "string", "optional": false, "canDefault": false},
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "GetBot": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "botId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "botId": {"type": "string", "optional": false, "canDefault": false},
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false},
                        "botGameId": {"type": "string", "optional": false, "canDefault": false},
                        "botPlayerList": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                },
                "DeleteBotPlayer": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": true},
                        "botId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "UpdateGame": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "siteData": {"type": "object", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "LoginDeveloper": {
                    "contexts": ["unconnected"],
                    "version": 1,
                    "request": {"authorization": {"type": "AuthorizationLogin", "optional": false, "canDefault": true}},
                    "response": {
                        "developerId": {"type": "string", "optional": false, "canDefault": false},
                        "gatewayURL": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "AddBotPlayer": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "botId": {"type": "string", "optional": false, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {"playerId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetGameId": {
                    "contexts": ["bot", "game", "player", "developer"],
                    "version": 1,
                    "request": {
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {"gameId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetPlayerPoolId": {
                    "contexts": ["bot", "player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {"playerPoolId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "EnableBot": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "botId": {"type": "string", "optional": false, "canDefault": true},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "DeleteGame": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "EnableApiExtension": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "apiExtensionId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "CreatePlayerPool": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "id": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "AddGamePlayerPool": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "DeleteGamePlayerPool": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": false, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "DeleteBot": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "botId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "GetBotId": {
                    "contexts": ["bot", "game", "player", "developer"],
                    "version": 1,
                    "request": {
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {"botId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetDeveloper": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": true},
                        "developerId": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "response": {
                        "playerPoolIds": {
                            "type": "array",
                            "elementType": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "authorizationAgents": {
                            "type": "array",
                            "elementType": "GetAuthAgents",
                            "optional": false,
                            "canDefault": false
                        },
                        "developerId": {"type": "string", "optional": false, "canDefault": false},
                        "email": {"type": "string", "optional": false, "canDefault": false},
                        "apiExtensionList": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "gameIds": {"type": "array", "elementType": "string", "optional": false, "canDefault": false},
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false}
                    }
                },
                "UpdateBotPlayer": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": true},
                        "botId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {}
                },
                "DeleteApiExtension": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "apiExtensionId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "DeletePlayerPool": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {"playerPoolId": {"type": "string", "optional": false, "canDefault": false}},
                    "response": {}
                },
                "CreateApiExtension": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "id": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "developerId": {"type": "string", "optional": false, "canDefault": true},
                        "createTime": {
                            "contexts": ["internal"],
                            "type": "FSDate",
                            "optional": true,
                            "canDefault": false
                        },
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "migrationStatus": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        }
                    },
                    "response": {"apiExtensionId": {"type": "string", "optional": false, "canDefault": false}}
                },
                "GetGameName": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "siteData": {"type": "object", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false}
                    }
                },
                "GetApiExtensionId": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "name": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {"apiExtensionId": {"type": "string", "optional": false, "canDefault": false}}
                }
            }, "Events": {}, "default_destination": "Authentication"
        },
        "Login": {
            "APIs": {
                "EnablePlayer": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": true},
                        "enabled": {"type": "boolean", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "ConvertGuest": {
                    "contexts": ["player", "developer"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": true},
                        "name": {"type": "string", "optional": false, "canDefault": true},
                        "authorization": {"type": "AuthorizationPlayer", "optional": false, "canDefault": true},
                        "email": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "response": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false}
                    }
                },
                "LoginApiExtension": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "namedSession": {"type": "string", "optional": true, "canDefault": true},
                        "apiExtensionId": {"type": "string", "optional": false, "canDefault": true},
                        "authorization": {"type": "AuthorizationLogin", "optional": false, "canDefault": true}
                    },
                    "response": {
                        "sessionId": {"type": "string", "optional": false, "canDefault": false},
                        "gatewayURL": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "LoginBot": {
                    "contexts": ["unconnected"],
                    "version": 1,
                    "request": {
                        "namedSession": {"type": "string", "optional": true, "canDefault": true},
                        "botId": {"type": "string", "optional": false, "canDefault": true},
                        "authorization": {"type": "AuthorizationLogin", "optional": false, "canDefault": true},
                        "serverRotationGroup": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "sessionId": {"type": "string", "optional": false, "canDefault": false},
                        "gatewayURL": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "LoginGame": {
                    "contexts": ["unconnected"],
                    "version": 1,
                    "request": {
                        "namedSession": {"type": "string", "optional": true, "canDefault": true},
                        "gameId": {"type": "string", "optional": false, "canDefault": true},
                        "authorization": {"type": "AuthorizationLogin", "optional": false, "canDefault": true},
                        "serverRotationGroup": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "sessionId": {"type": "string", "optional": false, "canDefault": false},
                        "gatewayURL": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "CreatePlayer": {
                    "contexts": ["player", "developer"],
                    "version": 1,
                    "request": {
                        "status": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "name": {"type": "string", "optional": false, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": true},
                        "botId": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false},
                        "id": {"contexts": ["internal"], "type": "string", "optional": true, "canDefault": false},
                        "email": {"type": "string", "optional": true, "canDefault": true},
                        "migrationStatus": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "findUniqueName": {"type": "boolean", "optional": true, "canDefault": false},
                        "createTime": {
                            "contexts": ["internal"],
                            "type": "FSDate",
                            "optional": true,
                            "canDefault": false
                        },
                        "authorization": {"type": "AuthorizationPlayer", "optional": true, "canDefault": true}
                    },
                    "response": {
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false}
                    }
                },
                "GetHmacSecret": {
                    "contexts": ["developer"],
                    "version": 1,
                    "request": {"sessionId": {"type": "string", "optional": false, "canDefault": true}},
                    "response": {"hmacSecret": {"type": "string", "optional": false, "canDefault": false}}
                },
                "LoginPlayer": {
                    "contexts": ["unconnected"],
                    "version": 1,
                    "request": {
                        "loginFromOutside": {"type": "boolean", "optional": true, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": true},
                        "authorization": {"type": "AuthorizationLogin", "optional": false, "canDefault": true}
                    },
                    "response": {
                        "status": {"type": "string", "optional": false, "canDefault": false},
                        "hmacSecret": {"type": "string", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "gatewayURL": {"type": "string", "optional": false, "canDefault": false},
                        "sessionId": {"type": "string", "optional": false, "canDefault": false},
                        "gatewayURLHTTP": {"type": "string", "optional": false, "canDefault": false},
                        "createTime": {"type": "FSDate", "optional": false, "canDefault": false}
                    }
                },
                "ChangePassword": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "password1": {"type": "string", "optional": false, "canDefault": true},
                        "token": {"type": "string", "optional": false, "canDefault": true},
                        "password2": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {}
                },
                "UpdatePlayer": {
                    "contexts": ["siteowner"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": true},
                        "whichAuthorization": {"type": "AuthorizationSpecifier", "optional": true, "canDefault": false},
                        "name": {"type": "string", "optional": true, "canDefault": true},
                        "authorization": {"type": "AuthorizationPlayer", "optional": true, "canDefault": true},
                        "email": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "response": {}
                },
                "LoginGuest": {
                    "contexts": ["unconnected"],
                    "version": 1,
                    "request": {
                        "playerName": {"type": "string", "optional": false, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {
                        "hmacSecret": {"type": "string", "optional": false, "canDefault": false},
                        "playerId": {"type": "string", "optional": false, "canDefault": false},
                        "gatewayURL": {"type": "string", "optional": false, "canDefault": false},
                        "playerName": {"type": "string", "optional": false, "canDefault": false},
                        "sessionId": {"type": "string", "optional": false, "canDefault": false},
                        "captchaURL": {"type": "string", "optional": true, "canDefault": false},
                        "gatewayURLHTTP": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "ResetPassword": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": true},
                        "name": {"type": "string", "optional": true, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": true},
                        "email": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "response": {}
                },
                "InternalCreatePlayerToken": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "playerName": {"type": "string", "optional": false, "canDefault": true},
                        "authorizationData": {
                            "type": "AuthorizationAgentLocalPlayer",
                            "optional": false,
                            "canDefault": false
                        },
                        "authorizationAgent": {"type": "AuthorizationAgent", "optional": false, "canDefault": true},
                        "playerPoolId": {"type": "string", "optional": false, "canDefault": true}
                    },
                    "response": {"token": {"type": "string", "optional": false, "canDefault": false}}
                },
                "InternalDeletePlayerToken": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": false, "canDefault": true},
                        "token": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                }
            }, "Events": {}, "default_destination": "Login"
        },
        "Property": {
            "APIs": {
                "InternalSetProperty": {
                    "contexts": ["internal", "player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "value": {
                            "type": ["string", {"elementType": "string", "type": "array"}],
                            "optional": true,
                            "canDefault": false
                        },
                        "key": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "GetProperty": {
                    "contexts": ["player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "key": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {
                        "value": {
                            "type": ["string", {"elementType": "string", "type": "array"}],
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "AppendProperty": {
                    "contexts": ["player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "value": {"type": "string", "optional": true, "canDefault": false},
                        "key": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "InternalGetProperty": {
                    "contexts": ["internal", "player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "key": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {
                        "value": {
                            "type": ["string", {"elementType": "string", "type": "array"}],
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "SetProperty": {
                    "contexts": ["player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "value": {
                            "type": ["string", {"elementType": "string", "type": "array"}],
                            "optional": true,
                            "canDefault": false
                        },
                        "key": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "CreateProperty": {
                    "contexts": ["internal"],
                    "version": 1,
                    "request": {
                        "ownerId": {
                            "contexts": ["internal"],
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "values": {
                            "contexts": ["internal"],
                            "optional": false,
                            "elementType": "string",
                            "type": "array",
                            "canDefault": false
                        },
                        "id": {"contexts": ["internal"], "type": "string", "optional": false, "canDefault": false},
                        "key": {"contexts": ["internal"], "type": "string", "optional": false, "canDefault": false},
                        "type": {"contexts": ["internal"], "type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {}
                },
                "PropertyContains": {
                    "contexts": ["player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "value": {"type": "string", "optional": true, "canDefault": false},
                        "key": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {"index": {"type": "number", "optional": false, "canDefault": false}}
                },
                "FindProperty": {
                    "contexts": ["player", "game", "developer"],
                    "version": 1,
                    "request": {
                        "count": {"type": "number", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": true, "canDefault": false},
                        "playerPoolId": {"type": "string", "optional": true, "canDefault": false},
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "developerId": {"type": "string", "optional": true, "canDefault": false},
                        "searchFor": {"type": "primitive", "optional": false, "canDefault": false},
                        "startIndex": {"type": "number", "optional": true, "canDefault": false},
                        "type": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "properties": {
                            "type": "array",
                            "elementType": "PropertyData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                }
            }, "Events": {}, "default_destination": "Property"
        },
        "Room": {
            "APIs": {
                "UseTableToken": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {"token": {"type": "string", "optional": false, "canDefault": false}},
                    "version": 1,
                    "response": {}
                },
                "LeaveTable": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {"table": {"type": "number", "optional": false, "canDefault": true}},
                    "version": 1,
                    "response": {}
                },
                "OwnTable": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "table": {"type": "number", "optional": true, "canDefault": true},
                        "requestSit": {"type": "boolean", "optional": true, "canDefault": true},
                        "requestJoin": {"type": "boolean", "optional": true, "canDefault": true},
                        "tableLocked": {"type": "boolean", "optional": true, "canDefault": true}
                    },
                    "version": 1,
                    "response": {"table": {"type": "number", "optional": false, "canDefault": false}}
                },
                "SetReady": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "ready": {"type": "boolean", "optional": false, "canDefault": true},
                        "table": {"type": "number", "optional": false, "canDefault": true}
                    },
                    "version": 1,
                    "response": {}
                },
                "EnterRoom": {
                    "contexts": ["player", "game", "bot"],
                    "version": 1,
                    "request": {
                        "sessionId": {"type": "string", "optional": true, "canDefault": false},
                        "roomId": {"type": "string", "optional": false, "canDefault": false}
                    },
                    "response": {
                        "tables": {"type": "number", "optional": false, "canDefault": false},
                        "name": {"type": "string", "optional": false, "canDefault": false},
                        "minimumToStart": {"type": "number", "optional": false, "canDefault": false},
                        "roomDestination": {"type": "string", "optional": false, "canDefault": false},
                        "token": {"type": "string", "optional": false, "canDefault": false},
                        "seats": {"type": "number", "optional": false, "canDefault": false}
                    }
                },
                "CancelPermit": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {},
                    "version": 1,
                    "response": {}
                },
                "LockTable": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "table": {"type": "number", "optional": false, "canDefault": true},
                        "requestSit": {"type": "boolean", "optional": true, "canDefault": true},
                        "requestJoin": {"type": "boolean", "optional": true, "canDefault": true},
                        "tableLocked": {"type": "boolean", "optional": true, "canDefault": true}
                    },
                    "version": 1,
                    "response": {}
                },
                "LockSeats": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "table": {"type": "number", "optional": false, "canDefault": true},
                        "seat": {"type": "array", "elementType": "number", "optional": false, "canDefault": true}
                    },
                    "version": 1,
                    "response": {}
                },
                "UnlockSeats": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "table": {"type": "number", "optional": false, "canDefault": true},
                        "seat": {"type": "array", "elementType": "number", "optional": false, "canDefault": true}
                    },
                    "version": 1,
                    "response": {}
                },
                "ReleaseTable": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {"table": {"type": "number", "optional": true, "canDefault": true}},
                    "version": 1,
                    "response": {}
                },
                "StartTable": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "table": {"type": "number", "optional": false, "canDefault": true},
                        "lockUnusedSeats": {"type": "boolean", "optional": true, "canDefault": true},
                        "namedSession": {"type": "string", "optional": true, "canDefault": true}
                    },
                    "version": 1,
                    "response": {}
                },
                "JoinAndSit": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "requestSit": {"type": "boolean", "optional": true, "canDefault": true},
                        "requestJoin": {"type": "boolean", "optional": true, "canDefault": true},
                        "seat": {"type": "number", "optional": true, "canDefault": false},
                        "tableLocked": {"type": "boolean", "optional": true, "canDefault": true},
                        "table": {"type": "number", "optional": false, "canDefault": true},
                        "makeOwner": {"type": "boolean", "optional": true, "canDefault": false}
                    },
                    "version": 1,
                    "response": {"seat": {"type": "number", "optional": true, "canDefault": false}}
                },
                "BootTable": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "table": {"type": "number", "optional": false, "canDefault": true},
                        "playerAddress": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "version": 1,
                    "response": {}
                },
                "GetRoomList": {
                    "contexts": ["developer", "player", "game"],
                    "version": 1,
                    "request": {
                        "playerId": {"type": "string", "optional": true, "canDefault": false},
                        "gameId": {"type": "string", "optional": true, "canDefault": true},
                        "groupId": {"type": "string", "optional": true, "canDefault": false}
                    },
                    "response": {
                        "roomList": {
                            "type": "array",
                            "elementType": "GetRoomListData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "JoinTable": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {"table": {"type": "number", "optional": false, "canDefault": true}},
                    "version": 1,
                    "response": {}
                },
                "RoomEvents": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {"enable": {"type": "boolean", "optional": false, "canDefault": false}},
                    "version": 1,
                    "response": {}
                },
                "LeaveSeat": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {"table": {"type": "number", "optional": false, "canDefault": true}},
                    "version": 1,
                    "response": {}
                },
                "CreateTableToken": {
                    "contexts": ["player"],
                    "destination": {"type": "string", "optional": false, "canDefault": true},
                    "request": {
                        "table": {"type": "number", "optional": false, "canDefault": true},
                        "seat": {"type": "number", "optional": true, "canDefault": true}
                    },
                    "version": 1,
                    "response": {
                        "token": {"type": "string", "optional": false, "canDefault": false}
                    }
                },
                "EnterRoomTableToken": {
                    "contexts": [
                        "player",
                        "game",
                        "bot"
                    ],
                    "version": 1,
                    "request": {
                        "token": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "response": {
                        "tables": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "name": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "minimumToStart": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "roomDestination": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "seats": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "roomId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "Permit": {
                    "contexts": [
                        "player"
                    ],
                    "destination": {
                        "type": "string",
                        "optional": false,
                        "canDefault": true
                    },
                    "request": {
                        "table": {
                            "type": "number",
                            "optional": false,
                            "canDefault": true
                        },
                        "playerAddress": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "seat": {
                            "type": "number",
                            "optional": true,
                            "canDefault": true
                        }
                    },
                    "version": 1,
                    "response": {
                        "playerAddress": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "InvitePlayerTableToken": {
                    "contexts": [
                        "player"
                    ],
                    "destination": {
                        "type": "string",
                        "optional": false,
                        "canDefault": true
                    },
                    "request": {
                        "token": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "playerAddress": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "version": 1,
                    "response": {}
                },
                "SetTableSettings": {
                    "contexts": [
                        "player"
                    ],
                    "destination": {
                        "type": "string",
                        "optional": false,
                        "canDefault": true
                    },
                    "request": {
                        "table": {
                            "type": "number",
                            "optional": false,
                            "canDefault": true
                        },
                        "settings": {
                            "type": "string",
                            "optional": false,
                            "canDefault": true
                        }
                    },
                    "version": 1,
                    "response": {}
                },
                "GetBotList": {
                    "contexts": [
                        "developer",
                        "player",
                        "game"
                    ],
                    "version": 1,
                    "request": {
                        "gameId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": true
                        }
                    },
                    "response": {
                        "playerList": {
                            "type": "array",
                            "elementType": "GetBotListData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "MoveSeat": {
                    "contexts": [
                        "player"
                    ],
                    "destination": {
                        "type": "string",
                        "optional": false,
                        "canDefault": true
                    },
                    "request": {
                        "requestSit": {
                            "type": "boolean",
                            "optional": true,
                            "canDefault": true
                        },
                        "requestJoin": {
                            "type": "boolean",
                            "optional": true,
                            "canDefault": true
                        },
                        "seat": {
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        },
                        "tableLocked": {
                            "type": "boolean",
                            "optional": true,
                            "canDefault": true
                        },
                        "table": {
                            "type": "number",
                            "optional": false,
                            "canDefault": true
                        },
                        "makeOwner": {
                            "type": "boolean",
                            "optional": true,
                            "canDefault": false
                        }
                    },
                    "version": 1,
                    "response": {}
                },
                "DeleteRoom": {
                    "contexts": [
                        "developer",
                        "player",
                        "game"
                    ],
                    "version": 1,
                    "request": {
                        "roomId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "response": {}
                },
                "SitSeat": {
                    "contexts": [
                        "player"
                    ],
                    "destination": {
                        "type": "string",
                        "optional": false,
                        "canDefault": true
                    },
                    "request": {
                        "table": {
                            "type": "number",
                            "optional": false,
                            "canDefault": true
                        },
                        "seat": {
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        }
                    },
                    "version": 1,
                    "response": {
                        "seat": {
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                },
                "Chat": {
                    "contexts": [
                        "player"
                    ],
                    "destination": {
                        "type": "string",
                        "optional": false,
                        "canDefault": true
                    },
                    "request": {
                        "playerList": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": true
                        },
                        "table": {
                            "type": "number",
                            "optional": true,
                            "canDefault": true
                        },
                        "text": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "version": 1,
                    "response": {}
                },
                "InviteBotTableToken": {
                    "contexts": [
                        "player"
                    ],
                    "destination": {
                        "type": "string",
                        "optional": false,
                        "canDefault": true
                    },
                    "request": {
                        "playerId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "namedSession": {
                            "type": "string",
                            "optional": true,
                            "canDefault": true
                        },
                        "token": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    },
                    "version": 1,
                    "response": {}
                },
                "CreateRoom": {
                    "contexts": [
                        "developer",
                        "player",
                        "game"
                    ],
                    "version": 1,
                    "request": {
                        "tables": {
                            "type": "number",
                            "optional": false,
                            "canDefault": true
                        },
                        "gameId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": true
                        },
                        "name": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "playerPoolId": {
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "playerId": {
                            "contexts": [
                                "internal"
                            ],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "minimumToStart": {
                            "type": "number",
                            "optional": false,
                            "canDefault": true
                        },
                        "maxPlayers": {
                            "type": "number",
                            "optional": true,
                            "canDefault": true
                        },
                        "id": {
                            "contexts": [
                                "internal"
                            ],
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "static": {
                            "type": "boolean",
                            "optional": true,
                            "canDefault": false
                        },
                        "groupId": {
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "seats": {
                            "type": "number",
                            "optional": false,
                            "canDefault": true
                        },
                        "unique": {
                            "type": "boolean",
                            "optional": true,
                            "canDefault": false
                        },
                        "requireSessionId": {
                            "type": "boolean",
                            "optional": true,
                            "canDefault": true
                        },
                        "createTime": {
                            "contexts": [
                                "internal"
                            ],
                            "type": "FSDate",
                            "optional": true,
                            "canDefault": false
                        }
                    },
                    "response": {
                        "owner": {
                            "type": "boolean",
                            "optional": true,
                            "canDefault": false
                        },
                        "sessionId": {
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "roomId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                }
            },
            "Events": {
                "InvitePlayer": {
                    "contexts": [
                        "player",
                        "bot"
                    ],
                    "version": 1,
                    "data": {
                        "table": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "token": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "playerAddress": {
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "seat": {
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        }
                    }
                },
                "StartBot": {
                    "contexts": [
                        "bot"
                    ],
                    "version": 1,
                    "data": {
                        "tables": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "gameId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "name": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "playerPoolId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "playerId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "minimumToStart": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "currentPlayers": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "seat": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "static": {
                            "type": "boolean",
                            "optional": false,
                            "canDefault": false
                        },
                        "seats": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "table": {
                            "type": "number",
                            "optional": false,
                            "canDefault": false
                        },
                        "roomId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "RoomExited": {
                    "contexts": [
                        "player",
                        "bot"
                    ],
                    "version": 1,
                    "data": {
                        "playerAddress": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "RoomChat": {
                    "contexts": [
                        "player",
                        "bot"
                    ],
                    "version": 1,
                    "data": {
                        "playerList": {
                            "type": "array",
                            "elementType": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "playerAddress": {
                            "type": "string",
                            "optional": true,
                            "canDefault": false
                        },
                        "table": {
                            "type": "number",
                            "optional": true,
                            "canDefault": false
                        },
                        "text": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "TableState": {
                    "contexts": [
                        "player",
                        "game",
                        "bot"
                    ],
                    "version": 1,
                    "data": {
                        "states": {
                            "type": "array",
                            "elementType": "RoomTableData",
                            "optional": false,
                            "canDefault": false
                        },
                        "roomId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "RoomStatus": {
                    "contexts": [
                        "player",
                        "game",
                        "bot"
                    ],
                    "version": 1,
                    "data": {
                        "playerList": {
                            "type": "array",
                            "elementType": "RoomStatusData",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                },
                "RoomEntered": {
                    "contexts": [
                        "player",
                        "bot"
                    ],
                    "version": 1,
                    "data": {
                        "playerId": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "playerName": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        },
                        "playerAddress": {
                            "type": "string",
                            "optional": false,
                            "canDefault": false
                        }
                    }
                }
            },
            "default_destination": "Room"
        }
    };
// BUILD PROCESSS INSERTS STRUCTURES HERE, DO NOT CHANGE THE CONTENTS OF THIS COMMENT

    var apiNames;
    FS.MessageFactory.getAPINames = function () {
        if (apiNames === undefined) {
            apiNames = [];
            var name, server;
            for (server in messages) {
                for (name in messages[server].APIs) {
                    apiNames.push(name);
                }
            }
        }
        return apiNames;
    };

    var eventNames;
    FS.MessageFactory.getEventNames = function () {
        if (eventNames === undefined) {
            eventNames = [];
            var name, server;
            for (server in messages) {
                for (name in messages[server].Events) {
                    eventNames.push(name);
                }
            }
        }
        return eventNames;
    };

    FS.MessageFactory.defineAPI = function (messages) {
        var oldMessages = this.getStructsAndMessages().messages;
        var call, serverName;

        for (serverName in messages) {
            var server = messages[serverName];
            var prev = oldMessages[serverName];

            if (prev === undefined) {
                prev = oldMessages[serverName] = {
                    default_destination: server.default_destination,
                    APIs: {},
                    Events: {}
                };
            }

            for (call in server.APIs) {
                this.removeAPI(oldMessages, call);
                prev.APIs[call] = server.APIs[call];
            }
            for (call in server.Events) {
                this.removeAPI(oldMessages, call);
                prev.Events[call] = server.Events[call];
            }
        }
    };

    FS.MessageFactory.prototype.isOnEncryptionWhiteList = function (message) {
        if (this.encryptionWhiteList.indexOf(message) != -1) {
            return true;
        }
        return false;
    };

    FS.MessageFactory.defineStructs = function (structs) {
        var os = this.getStructsAndMessages().structs;
        for (var key in structs) {
            if (os.hasOwnProperty(key)) {
                throw "Attempted to redefine API Struct " + key;
            }
            os[key] = structs[key];
        }
    };

    FS.MessageFactory.blacklistAPI = function (calls) {
        var messages = this.getStructsAndMessages().messages;

        calls.forEach(function (name) {
            FS.MessageFactory.removeAPI(messages, name);
        });
    };

    FS.MessageFactory.removeAPI = function (messages, name) {
        for (var server in messages) {
            if (messages[server].APIs.hasOwnProperty(name)) {
                delete messages[server].APIs[name];
            }
            if (messages[server].Events.hasOwnProperty(name)) {
                delete messages[server].APIs[name];
            }
        }
    };

    // BEGIN DEVELOPER_BUILD
    // These routines allow the test code to add some testing structs and messages
    FS.MessageFactory.getStructsAndMessages = function () {
        return {structs: structs, messages: messages};
    };
    // END DEVELOPER_BUILD

    // We need this checkType function to make sure we are filling out the
    // structure properly.  However for production, we can reduce the work
    // it does by having it not do as deep a check on arrays and not
    // check contents against allowed values or regexp values
    function checkType(obj, type, elem, eName) {
        // Multi-type format
        if (FS.Utils.isArray(type)) {
            var found = false;
            type.forEach(function (subtype) {
                var ret = checkType(obj, subtype, elem);
                if (ret === true) {
                    found = true;
                }
            });
            if (found === true) {
                return true;
            }
            return eName + " not any accepted types";
        } else if (typeof type === 'object') {
            return checkType(obj, type.type, type, eName);
        }

        var i;
        switch (type) {
            case "boolean":
            case "object":
                if (type === typeof obj) {
                    return true;
                }
                else {
                    return eName + " not a " + type;
                }

            case "primitive":
                if (typeof obj === "boolean") {
                    return true;
                }
                if (typeof obj !== "number" && typeof obj !== "string") {
                    return eName + " not a " + type;
                }
            // Fall through

            case "number":
            case "string":
                // BEGIN DEVELOPER_BUILD
                // Make the production code smaller and faster by reducing the amount of checking we do
                // in the developer build, check to the extent of the documentation/API definition
                if (elem.values) {
                    for (i in elem.values) {
                        if (obj === elem.values[i]) {
                            return true;
                        }
                    }
                    return eName + " not one of " + elem.values.join("|");
                }
                if (elem.regex_values) {
                    for (i in elem.regex_values) {
                        var patt = new RegExp(elem.regex_values[i]);
                        if (patt.test(obj)) {
                            return true;
                        }
                    }
                    return eName + " not one of " + elem.regex_values.join("|");
                }
                // END DEVELOPER_BUILD
                if (type === "primitive" || type === typeof obj) {
                    return true;
                }
                return eName + " not a " + type;

            case "array":
                if (FS.Utils.isArray(obj) === false) {
                    return "not an array";
                }
                // BEGIN DEVELOPER_BUILD
                // Make the production code smaller and faster by reducing the amount of checking we do
                // in the developer build, check to the extent of the documentation/API definition
                var subelem = {};
                var verifyType = elem.elementType;

                if (structs[elem.elementType] !== undefined) {
                    subelem = structs[elem.elementType];
                    verifyType = elem.elementType;
                }

                var allsame = true;
                obj.forEach(function (curr) {
                    var ret = checkType(curr, verifyType, subelem, eName);
                    if (ret !== true) {
                        allsame = ret;
                    }
                });
                if (allsame === true) {
                    return true;
                }
                return eName + " array incorrect: " + allsame;
                // END DEVELOPER_BUILD
                return true;

            default:    // Must be a FunSockets struct
                if (typeof structs[type] === "undefined") {
                    return eName + " is an expect to be an unknown type:" + type;
                }
                if (structs[type].type) {
                    // If this struct is a "FunSockets type" then just check the obj
                    var result = checkType(obj, structs[type].type, structs[type], eName);
                    if (result === true) {
                        return true;
                    }
                    return eName + " not a " + type + " because " + result;
                } else {
                    // else its an "Object Struct" and has elements
                    if (typeof obj !== "object") {
                        return false;
                    }
                    for (i in structs[type]) {
                        if (obj[i] !== undefined || structs[type][i].optional === false) {
                            var res = checkType(obj[i], structs[type][i].type, structs[type][i], i);
                            if (res !== true) {
                                return eName + "." + res;
                            }
                        }
                    }
                    return true;
                }
        }
    }

    FS.MessageFactory.hashAlgorithm = function (input) {
        if (typeof input !== 'string') {
            return input;
        }

        // TEMPORARY: disable client site hashing until we make migration script
        return input;

        // This is about as weak PBKDF2 that is recommended
        return FS.CryptoJS.PBKDF2(
            input, "assault",
            {keySize: 256 / 16, iterations: 1000}).toString(FS.CryptoJS.enc.Latin1);
    };

    FS.MessageFactory.prototype.processElement = function (mName, eName, eTemp, callOpts) {
        // Check to see if the value was undefined
        if (callOpts[eName] === undefined) {
            // If this element can use defaults, then check if we have a default for it
            if (eTemp.canDefault === true) {
                res = checkType(this.options[eName], eTemp.type, eTemp, eName);
                if (res === true) {
                    return eTemp.autoHash ? FS.MessageFactory.hashAlgorithm(this.options[eName]) : this.options[eName];
                }
            }

            // If we haven't found an existing value to use yet, check if this is not FunSockets type
            // and if so we have to recurse into it to build it up
            if (structs[eTemp.type] !== undefined && structs[eTemp.type].type === undefined) {
                try {
                    var i, elem = {};
                    var temp = structs[eTemp.type];
                    for (i in temp) {
                        elem[i] = this.processElement(mName, i, temp[i], callOpts);
                    }
                    return elem;
                } catch (e) {
                    // Could not build out, so don't default
                }
            }

            // We can't find or build the element, so if its optional, return null and it won't be sent
            if (eTemp.optional) {
                return undefined;
            }
        }

        var res = checkType(callOpts[eName], eTemp.type, eTemp, eName);
        if (res === true) {
            return eTemp.autoHash ? FS.MessageFactory.hashAlgorithm(callOpts[eName]) : callOpts[eName];
        } else if (callOpts[eName] !== undefined) {
            if (FS.Debug.error) {
                console.log("element " + eName + " incorrect: " + res);
            }
            throw "element " + eName + " incorrect: " + res;
        }

        // Otherwise we are missing a non-optional parameter
        throw "Required parameter missing and has no default.  Message = " + mName + ", parameter = " + eName + " due to " + res;
    };

    /**
     * Create the given message, using a the MessageFactory's default options and the options provided
     * by the caller to fill in the elements of the message required.
     *
     * @function
     * @param {string} messageName For example "LoginPlayer", this must match an element found in the
     *        "messages" JSON object defined in this file.  The messages object is created at the FSSDK
     *        build time from the FunSockets API/Message definition source file.
     * @param {object} options all parameters to set for the given message. For "LoginPlayer", these
     *          may include playerName or version (e.g. {playerName: "Lee", version: 1}.  Note that
     *          this is a flat key/value object so if the message results in { param1: 1, { nested: 2}}
     *          you would still only pass in {nested: 2} as options
     * @param {boolean} isResponse If true, construct a response message rather then a request message.
     *        This is ignored if the messageName is an Event (which has no request or response)
     * @returns {object} a simple JSON object representing the message with all the values filled in
     *          from either the options passed in or the default provide when creating the MessageFactory
     *          object
     * @throws {string} A string indicating if an unknown message is requested or if a parameter is missing
     */
    FS.MessageFactory.prototype.create = function (messageName, callOptions, isResponse, cryptoKey, cryptoIV) {
        var name, elem, server, container, template = null;
        for (server in messages) {
            for (name in messages[server].APIs) {
                if (name === messageName) {
                    container = messages[server].APIs[name];
                    template = messages[server].APIs[name].request;
                    if (isResponse) {
                        template = messages[server].APIs[name].response;
                    }
                    break;
                }
            }
            if (template) {
                break;
            }

            for (name in messages[server].Events) {
                if (name === messageName) {
                    container = messages[server].Events[name];
                    template = messages[server].Events[name].data;
                    break;
                }
            }
            if (template) {
                break;
            }
        }

        if (template) {
            var msg = {
                message: (isResponse === true ? "Status" : name),
                version: container.version,
                tag: this.options.tag || '',
                source: this.options.source,
                data: {
                    responseMessage: (isResponse === true ? name : undefined)
                }
            };
            if (typeof container.destination === "undefined") {
                msg.destination = messages[server].default_destination;
            } else {
                if (typeof container.destination === "string") {
                    msg.destination = container.destination;
                } else {
                    msg.destination = this.processElement(name, "destination", container.destination, callOptions);
                }
            }
            // version cannot be overridden by defaults cause it is per call
            if (callOptions.version !== undefined) {
                msg.version = callOptions.version;
            }
            // tag should always use the calls tag if present
            if (callOptions.tag !== undefined) {
                msg.tag = callOptions.tag;
            }
            if (callOptions.source !== undefined) {
                msg.source = callOptions.source;
            }

            for (elem in template) {
                msg.data[elem] = this.processElement(name, elem, template[elem], callOptions);
            }
            if (isResponse) {
                msg.data.code = this.processElement(name, "code", {
                    optional: true,
                    canDefault: false,
                    type: "number"
                }, callOptions);
                msg.data.errorText = this.processElement(name, "errorText", {
                    optional: true,
                    canDefault: false,
                    type: "string"
                }, callOptions);
            }

            if (!isResponse && !this.isOnEncryptionWhiteList(msg.message)) {
                // encryption stuff here
                //if (!FS.Debug.message.encryption && this.messageEncryption && cryptoKey && cryptoIV) { {
                if (!FS.Debug.message.decryptMessages && this.messageEncryption && cryptoKey && cryptoIV) {
                    FS.encrypt.size(128);
                    msg.packageType = "2";
                    var t1 = FS.encrypt.rawEncrypt(FS.encrypt.s2a(JSON.stringify(msg.data)), FS.encrypt.h2a(cryptoKey), FS.encrypt.h2a(cryptoIV));
                    msg.data = {iv: cryptoIV, payload: FS.encrypt.Base64.encode(t1)};
                }
            }

            return msg;
        } else {
            throw "Cannot create unknown message.  message: " + messageName;
        }
    };


    /**
     * Verify that a object passed in matches a given FunSocket API request, response, or Event message.
     *
     * @function
     * @param {string} messageName For example "LoginPlayer", this must match an element found in the
     *        "messages" JSON object defined in this file.  The messages object is created at the FSSDK
     *        build time from the FunSockets API/Message definition source file.
     * @param {object} data The Javascript object to be checked.
     * @param {boolean} isResponse If true, check data against the APIs response rather then the request
     *        template.  This is ignored if the messageName is an Event (which has no request or response)
     * @returns {boolean} Returns true if the object matched the indicated API/Event
     * @throws {string} A string indicating if an unknown message is requested or if a parameter is missing
     */
    FS.MessageFactory.prototype.verifyMessage = function (messageName, data, isResponse) {
        var name, elem, server, template = null;
        for (server in messages) {
            for (name in messages[server].APIs) {
                if (name === messageName) {
                    template = messages[server].APIs[name].request;
                    if (isResponse) {
                        template = messages[server].APIs[name].response;
                    }
                    break;
                }
            }
            if (template) {
                break;
            }

            for (name in messages[server].Events) {
                if (name === messageName) {
                    template = messages[server].Events[name];
                    break;
                }
            }
            if (template) {
                break;
            }
        }
        if (template) {
            for (elem in template) {
                var result = checkType(data, template[elem].type, template[elem], elem);
                if (result !== true) {
                    return result;
                }
            }
        } else {
            throw "Cannot verify unknown message.  message: " + messageName;
        }

        return true;
    };

    /**
     * Verify that a object passed in matches a given FunSocket API structure
     *
     * @function
     * @param {string} structName For example "FSDate", this must match an element found in the
     *        "structs" JSON object defined in this file.  The structs object is created at the FSSDK
     *        build time from the FunSockets API/Message definition source file.
     * @param {object} data The Javascript object to be checked.
     * @returns {boolean} Returns true if the object matched the indicated struct
     * @throws {string} A string indicating if an unknown message is requested or if a parameter is missing
     */
    FS.MessageFactory.prototype.verifyStruct = function (structName, data) {
        var name, elem, server, template = null;
        template = structs[structName];
        if (template) {
            return checkType(data, structName, template, "verify");
        } else {
            throw "Cannot verify unknown struct: " + structName;
        }
    };


// FS.Connection.js
//      This javascript library holds the code to create a javascript object that makes
//  creating and managing developer accounts easier by providing a set of calls that
//  allows the creation and managment of developer accounts.
//


    /**
     * @constant
     */
    var ERR_NOTCONNECTED = 1000;
    /**
     * @constant
     */
    var ERR_MALFORMEDSERVERMESSAGE = 1001;
    /**
     * @constant
     */
    var ERR_INTERNALERROR = 1002;
    /**
     * @constant
     */
    var ERR_MISSING_PARAMETERS = 1003;
    /**
     * @constant
     */
    var ERR_CONNECTION_FAILED = 1004;

    var errorStrings = {
        0: "Success",
// BEGIN DEVELOPER_BUILD    These errors are only needed in the developer build. Remove to make the min version smaller
        ERR_MISSING_PARAMETERS: "There are missing requirement parameters",
// END DEVELOPER_BUILD
        ERR_NOTCONNECTED: "Not connected to a server",
        ERR_INTERNALERROR: "Internal error",
        ERR_CONNECTION_FAILED: "Cannot connect to the FunSockets servers",
        ERR_MALFORMEDSERVERMESSAGE: "The response from the server was malformed"
    };

    /**
     * Creates an instance of a Connection class
     *
     * @constructor
     * @class The Connection class handles connecting to the FunSockets WebSocket gateway. This class automatically
     *        maintains the connection by handling platform Ping messages.  The ConnectionInfo object passed in determines
     *        the context (Player, Bot, Game, or Developer) that the connection will operate under (i.e. Developer only
     *        API calls (enablePlayer) will not be available to Player context connections and operations and some parameters
     *        may be available to on context but not another)
     *        <p>
     *        To send messages, ....
     *        </p>
     *        <p>
     *        To receive messages, ...
     *        </p>
     *
     * @param connectionInfo    This is a connectionInfo object containing the gateway connection info resulting from
     *                          authenticating a player, developer, game or bot
     * @param options           This object contains a number of defaults for parameters that are used in many API calls.  This
     *                          allows the developer to not have to specify them to each API call.
     */

    FS.Connection = function (connectionInfo, options) {
        FS.Connection.createConnectionCalls();

        this.msgConnection = null;
        this.connInfo = {};
        this.options = {};
        this._allowRetries = 5;
        FS.Utils.mergeProperties(this.connInfo, connectionInfo);  // The connectionInfo sets the connection type which shouldn't change, so copy it now
        this.setOptions(options);
    };
    FS.Utils.extend(FS.Connection, FS.EventDispatcher);

    /**
     *  Set the default parameters for API calls.  This object holds a list of parameters that will be used if they are not provided
     * to API calls.  Only some parameters of some API calls will use defaults if not specified, see the documentation for each
     * call for details.
     *  This function is used to add or remove options after the Connection object has been created.
     *  Setting a parameter to null will remove it
     *
     * @function
     * @param options
     *          {object} an object whose key/values are added(or removed if null) from the defaults used in API calls
     *                   i.e. { aParam : "newVal", bParam : null }
     *
     */
    FS.Connection.prototype.setOptions = function (options) {
        FS.Utils.mergeProperties(this.options, options, true);

        // if they set a httpUrl, then we re-create the MessageHTTPConnection object for later use
        if (typeof this.options === "object" && typeof this.options.httpUrl === "string") {
            this.httpConn = new FS.MessageHttpConnection(this.options.httpUrl, this.options);
        }

        if (this.msgConnection) {
            this.msgConnection.setOptions(this.options);
        }
    };

    FS.Connection.prototype.getKind = function () {
        return this.connInfo.kind;
    };

    /**
     *  Create a status response for asynchronous client side errors.  Because they are async, we must return a structure that is
     * the same as a real response, but if the error is client side then we won't have one from the server to use so we make one.
     *
     * @function
     * @private
     * @param clientErrorCode
     *          {number} one of the error constants defined in this module to identify what kind of error this is
     * @param extra
     *          {string} a string that holds information specific to this particular error
     *
     * @returns {Object} a simple JSON object representing a status message.
     *
     */
    FS.Connection.prototype.makeResponse = function (clientErrorCode, extraInfo) {
        var msgFactory = new FS.MessageFactory(this.options);
        var msg = {message: "Status", destination: "", version: 1, data: {code: clientErrorCode, responseMessage: ""}};
        msg.data.errorText = errorStrings[clientErrorCode];
        msg.data.extraInfo = extraInfo;

        return msg;
    };

    /**
     *  Connect to the websocket gateway to allow API calls to be sent and to get status message back from the server.
     *
     * @function
     * @param {function} [callback] Called when the connection is made, callback function is passed a FS.Status object
     *
     */
    FS.Connection.prototype.connect = function (callback, forceCometD) {
        var msg, self = this;

        if (this.msgConnection === null) {
            // In the case of a lack of websocket support
            if (forceCometD || FS.Debug.comet || root.WebSocket === undefined) {
                this.msgConnection = new FS.MessageHmacConnection(this.connInfo.gatewayURLHTTP, this, this.options);
            } else {
                // BEGIN DEVELOPER_BUILD    No parameter checking done in the minimized version
                if (typeof this.connInfo !== "object" || typeof this.connInfo.gatewayUrl !== "string" ||
                    this.connInfo.gatewayUrl.indexOf("ws://") !== 0) {
                    msg = this.makeResponse(ERR_MISSING_PARAMETERS, "connect called with invalid connectionInfo");
                    return this.sendNotification("connect", msg, callback);
                }
                // END DEVELOPER_BUILD
                this.msgConnection = new FS.MessageWebSocketConnection(this.connInfo.gatewayUrl, this.options, self);

                // Mark WebSocket as once successful
                this.once("connect", function () {
                    FS.Connection.webSocketSuccess = true;
                });
            }
        }

        function attemptRetry() {
            if (!self._connected) {
                if (FS.Connection.webSocketSuccess && self._allowRetries-- > 0) {
                    self.msgConnection.unbindAll();
                    self.msgConnection = null;
                    self.connect(callback);
                    return false;
                } else if (self.msgConnection instanceof FS.MessageWebSocketConnection) {
                    self.msgConnection.unbindAll();
                    self.msgConnection = null;
                    self.connect(callback, true);
                    return false;
                }
            }
            return true;
        }

        this.msgConnection.bind("close", function (msg) {
            if (attemptRetry()) {
                self.sendNotification("close", msg, null);
            }
        });
        this.msgConnection.bind("error", function (msg) {
            if (attemptRetry()) {
                self.sendNotification("close", msg, null);
            }
        });

        this.msgConnection.bind("networkDelay", function (msg) {
            self.sendNotification("networkDelay", msg, null);
        });
        this.msgConnection.bind("message", function (msg) {
            // Check for a Status message which is a response to a previous call made by us
            if (msg.message !== 'Status') {
                // Not Status (i.e. reply from a previous API call) and not Ping, 
                // so we are being sent async call from server
                var lcall = msg.message.charAt(0).toLowerCase() + msg.message.substring(1);
                return self.sendNotification(lcall, msg, null);
            }
        });

        this.msgConnection.connect(function (error) {
            if (typeof error !== "undefined") {  // connection failed
                self.msgConnection = null;
                msg = self.makeResponse(ERR_CONNECTION_FAILED, error);
                return self.sendNotification("connect", msg, callback);
            }
            self._connected = true;
            delete self._allowRetries;

            var call = "LoginGateway";
            if (self.connInfo.kind === "developer") {
                call = "InternalLoginGateway";
            }
            self.msgConnection.sendRequest(call, {sessionId: self.connInfo.sessionId}, function (resp) {
                if (resp.data.code !== 0) {
                    self.msgConnection.close();
                    self.msgConnection = null;
                }
                self.destination = resp.destination;    // Save our destination as our address for messages
                self.setOptions({source: resp.destination});
                self.sendNotification("connect", resp, callback);

                // hook up the notifier.
                if (typeof FS.Notifier !== 'undefined' && resp.data.code === 0 && (typeof self.notifier === 'undefined' || self.notifier === null)) {
                    self.notifier = new FS.Notifier(self, "goko-game", "en", null);
                }
            });
        });
    };

    FS.Connection.prototype.getSessionId = function () {
        return (this.connInfo) ? this.connInfo.sessionId : "";
    }

    FS.Connection.prototype.getConnKind = function () {
        return (this.connInfo) ? this.connInfo.kind : "";
    }

    // Usually only called in a "reconnect failed" situation after we
    // succeed in doing another LoginGateway so user is at least able
    // to go to a different part of the game / game site.
    FS.Connection.prototype.setNewConnInfo = function (resp) {
        var self = this;
        if (resp) {
            self.destination = resp.destination;    // Save our destination as our address for messages
            self.options.source = resp.destination; // DO NOT CALL self.setOptions here -- it does other stuff we don't want to do again.
            if (self.msgConnection) {
                self.msgConnection.setOptions(self.options); // ends up setting "source" again in MessageFactory, which we need.
            }
            self.sendNotification("reconnectUpdate", resp);
        }
    }


    /**
     *  Close the connection to the server down
     *
     * @function
     */
    FS.Connection.prototype.close = function () {
        if (this.msgConnection !== null) {
            this.msgConnection.close();
        }
        this.msgConnection = null;
    };


    /**
     *  SendNotifcation is called anytime the FS.Connection object has data or errors to return to the user.  It complies
     *  with the FunSocket standard for returning data and errors.
     *  (see https://dev.funsockets.com/display/IDOC/FunSockets+standard+for+Returned+Data+or+Errors+from+the+SDK)
     *
     * @function
     * @private
     * @param {string}   evt    This is the name of the event being sent. i.e. getPlayer, or disconnected.
     * @param {object}   [data] Whatever data is assoicated with the event, in most cases it is a FS message object
     * @param {function} [ucb]  a user provided function to be called with the API call completes
     *
     */
    FS.Connection.prototype.sendNotification = function (evt, data, ucb) {
        var txt = "unknown";
        if (FS.Debug.message.events === true) {
            if (typeof data === "string") {
                txt = data;
            } else if (data === null) {
                txt = "null";
            } else if (typeof data === "object") {
                txt = JSON.stringify(data);
            }
        }
        // Each call to an API might have it's own callback,
        if (typeof ucb === "function") {
            ucb(data);
        }
        // Now trigger an event
        this.trigger(evt, data);
    };

    /**
     *  sendStatus() sends a "status" message to the Platform. A "status" message is essentially a one way
     *  message that is not expected to get a "Status" message back in response.
     *
     * @function
     * @private
     * @param {string}   call      This is the name of the API call being sent. i.e. getPlayer
     * @param {object}   [options] This holds the parameter for the call, if a param is was set as a default
     *                             for the FS.Connection object when it was created and the API call allows it
     *                             then the parameter does not have to be in options and the default will be used.
     * @param {function} [ucb]     a user provided function to be called with the API call completes
     *
     */
    FS.Connection.prototype.sendStatus = function (call, options) {
        if (this.msgConnection === null) {
            throw "FS.Connection, " + call + " called when not connected";
        }
        var self = this;
        // The message factory uses platform native API names which are upper case, we expect the 
        // developer to call this send with the JavaScript standard for functions, lowercase first
        var ucall = call.charAt(0).toUpperCase() + call.substring(1);
        this.msgConnection.sendStatus(ucall, options);
    };

    // The following code get executed only at load time.
    // To insure that the JavaScript SDK stays in sync with the Platform SDK, all of the APIs, their parameters and
    // their return values are stored in a generated part of the FSSDK called MessageFactory.  
    //
    // This code creates functions for each API call in the MessageFactory in FS.Connection prototype. 
    // So if there is an entry in the MessageFactory for "GetDeveloper" then there will be a function 
    // FS.Connection.prototype.getDeveloper. This interface should be used when the call is expected
    // to return a status response.  This is not used for status message (one way messages that don't 
    // have a response), status messages should be sent via FS.Connection.prototype.send()
    //
    // Note the lowercase of the first letter.  This is to comply with JavaScript coding standards.
    //
    FS.Connection.createConnectionCalls = function () {
        var idx;
        var names = FS.MessageFactory.getAPINames();
        var events = FS.MessageFactory.getEventNames();

        function makeFunction(name, lname, isResponse, isEvent) {
            var pname = isResponse ? (lname + "Status") : lname,
                call = isResponse ? "sendStatus" : "sendRequest";

            FS.Connection.prototype[pname] = function (options, ucb) {
                if (this.msgConnection === null) {
                    throw "FS.Connection, " + pname + " called when not connected";
                }
                var self = this;

                var p;
                if (ucb === undefined) {
                    p = new FS.Promise();
                    ucb = function (resp) {
                        if (resp.data.code !== 0) {
                            p.fail(resp.data.code, resp.data.errorText, resp);
                        } else {
                            p.resolve(resp.data, resp);
                        }
                    };
                }

                this.msgConnection[call](name, options, !isEvent && function (resp) {
                        self.sendNotification(pname, resp, ucb);
                    });
                return p;
            };
        }

        for (idx = 0; idx < names.length; idx++) {
            var name = names[idx];
            var lname = name.charAt(0).toLowerCase() + name.substring(1);

            if (typeof FS.Connection.prototype[lname] !== "function") {
                makeFunction(name, lname, false, false);
                makeFunction(name, lname, true, false);
            }
        }
        for (idx in events) {
            var eventname = events[idx];
            var leventname = "event" + eventname;

            if (typeof FS.Connection.prototype[leventname] !== "function") {
                makeFunction(eventname, leventname, false, true);
            }
        }

        FS.Connection.createConnectionCalls = function () {
        };
    };
// FS.ConnectionInfo.js
//      This javascript file holds the implementation for ConnectionInfo.  ConnectionInfo holds the result
//  of authenticating credentials against the http services of FunSockets as a Developer, Player, Game, Bot or Api Extension.
//  ConnectionInfo consists mainly of a WebSocket Gateway URL, a SessionId and info about what kind of authorization
//  was done (Developer, Player, Game, Bot or Api Extension)

//      The developer creates a ConnectionInfo object and then can make it "valid" by giving it either credentials
//  for a player, developer, game, bot or api extension, or loading it from a browser Cookie or other external source.  Once it is
//  "valid" it can be used to create a FS.Connection object that facilitates the API communication between the client
//  and the FunSockets platform.

//      ConnectionInfo right now can only be used once, but there are plans to allow ConnectionInfo to be used more then
//  once in the case of disconnection.  If so then this might happen automatically so the developer should always use 
//  the thrown errors to determin if ConnectionInfo object cannot be used again a
//  it to be used more then once.


    /**
     * Creates an instance of a ConnectionInfo class
     *
     * @constructor
     * @class   The ConnectionInfo class handles the authentication of a Player, Developer, Game, Bot or Api Extension with the FunSockets HTTP gateway
     *          and holds the resulting info so that a connection to the FunSockets Platform can be made.  ConnectionInfo object can be
     *          serialized to be stored to or retrieved from browser Cookies or other storage areas
     *          <p>
     *          A single ConnectionInfo object can be used to create any number of connections.  It is expected that they create a new
     *          ConnectionInfo object for each connection, but there isn't anything wrong with re-using one.  The object can only
     *          hold one kind (player, game, bot, api extension, dev) at a time.
     *          </p>
     *
     * @param httpUrl
     * @param options    This object contains a number of defaults for parameters that are used in many API calls.  This
     *                   allows the developer to not have to specify them to each API call.
     */
    FS.ConnectionInfo = function (httpUrl, defaults) {
        // BEGIN DEV ONLY     Start of a block of code that only exists in development version of code
        if (typeof httpUrl !== "string") {
            throw "httpUrl parameter of ConnectionInfo constructor must be in the form 'http://<path>'";
        }
        if (httpUrl.indexOf("http://") !== 0 && httpUrl.indexOf("https://") !== 0) {
            throw "httpUrl parameter of ConnectionInfo constructor must be in the form 'http://<path>'";
        }
        // END DEV ONLY
        this.httpUrl = httpUrl;
        this.defaults = defaults;
        this.kind = "unknown";
        this.expires = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);  // EAS TODO Figure out how to tell when it expires then don't fake this
    };
    FS.Utils.extend(FS.ConnectionInfo, FS.EventDispatcher);   // Extend the class with Event function 

    var storedMembers = {
        httpUrl: "string",
        gatewayUrl: "string",
        sessionId: "string",
        kind: "string",
        playerName: "string",
        playerId: "string",
        playerPoolId: "string",
        botId: "string",
        gameId: "string",
        developerId: "string",
        apiExtensionId: "string",
        expires: "number",
        gatewayURLHTTP: "string",
        hmacSecret: "string"
    };

    // The developer can call this to set the connection info if they have restoring a previously serialized object
    FS.ConnectionInfo.prototype.restore = function (ciInfo) {
        // Check for the minimum needed to restore.  NOTE this checking is needed even in production version.
        // It is depended on by the ConnectionMaker
        if (typeof ciInfo.gatewayUrl !== "string" || typeof ciInfo.sessionId !== "string" || typeof ciInfo.kind !== "string") {
            throw "Cannot restore, source data is not valid connectionInfo stored data";
        }
        if ((ciInfo.kind === "player" || ciInfo.kind === "guest") && typeof ciInfo.playerId !== "string" && typeof ciInfo.playerPoolId !== "string") {
            throw "Cannot restore, source data is not valid connectionInfo stored player data";
        }
        if (ciInfo.kind === "game" && typeof ciInfo.gameId !== "string" && typeof ciInfo.playerPoolId !== "string") {
            throw "Cannot restore, source data is not valid connectionInfo stored game data";
        }
        if (ciInfo.kind === "bot" && typeof ciInfo.botId !== "string" && typeof ciInfo.playerPoolId !== "string") {
            throw "Cannot restore, source data is not valid connectionInfo stored bot data";
        }
        if (ciInfo.kind === "apiExtension" && typeof ciInfo.apiExtensionId !== "string"/* && typeof ciInfo.playerPoolId !== "string"*/) {
            throw "Cannot restore, source data is not valid connectionInfo stored api extension data";
        }
        if (ciInfo.kind === "developer" && typeof ciInfo.developerId !== "string" && typeof ciInfo.playerPoolId !== "string") {
            throw "Cannot restore, source data is not valid connectionInfo stored developer data";
        }
        var p;
        for (p in storedMembers) {
            if (typeof ciInfo[p] === storedMembers[p]) {
                this[p] = ciInfo[p];
            }
        }
    };

    // The developer can call this to get a string representing the ConnectionInfo to store for later
    FS.ConnectionInfo.prototype.store = function () {
        var p;
        var ciInfo = {};
        for (p in storedMembers) {
            ciInfo[p] = this[p];
        }
        return ciInfo;
    };

    FS.ConnectionInfo.prototype.loginPlayer = function (parameters, callback) {
        var that = this;
        this.kind = "player";
        var connection = new FS.MessageHttpConnection(this.httpUrl, this.defaults);
        connection.send("LoginPlayer", parameters, function (statusMessage) {
            if (statusMessage.data.code === 0) {
                that.gatewayUrl = statusMessage.data.gatewayURL;
                that.playerId = statusMessage.data.playerId;
                that.sessionId = statusMessage.data.sessionId;
                that.gatewayURLHTTP = statusMessage.data.gatewayURLHTTP;
                that.hmacSecret = statusMessage.data.hmacSecret;
                that.playerName = statusMessage.data.name;
                that.playerPoolId = parameters.playerPoolId || that.defaults.playerPoolId;
            }

            if (typeof callback === "function") {
                callback(statusMessage);
            }
            that.trigger("loginPlayer", statusMessage);
        });
    };


    FS.ConnectionInfo.prototype.loginGuest = function (parameters, callback) {
        var that = this;
        this.kind = "guest";
        var connection = new FS.MessageHttpConnection(this.httpUrl, this.defaults);
        connection.send("LoginGuest", parameters, function (statusMessage) {
            if (statusMessage.data.code === 0) {
                that.playerId = statusMessage.data.playerId;
                that.sessionId = statusMessage.data.sessionId;
                that.gatewayUrl = statusMessage.data.gatewayURL;
                that.gatewayURLHTTP = statusMessage.data.gatewayURLHTTP;
                that.hmacSecret = statusMessage.data.hmacSecret;
                that.playerName = statusMessage.data.playerName;
            }

            if (typeof callback === "function") {
                callback(statusMessage);
            }
            that.trigger("loginGuest", statusMessage);
        });
    };

    // This only works in development
    FS.ConnectionInfo.prototype.createPlayer = function (parameters, callback) {
        var that = this;
        this.kind = "player";
        var connection = new FS.MessageHttpConnection(this.httpUrl, this.defaults);
        connection.send("CreatePlayer", parameters, function (statusMessage) {
            if (statusMessage.data.code === 0) {
                if (typeof callback === "function") {
                    callback(statusMessage);
                }
                that.trigger("createPlayer", statusMessage);
                /*
                 connection.send("EnablePlayer", {playerId : statusMessage.data.playerId, enabled: true }, function(statusMessage) {
                 if (statusMessage.data.code === 0) {
                 connection.send("LoginPlayer", parameters, function(statusMessage) {
                 that.playerId = statusMessage.data.playerId;
                 that.sessionId = statusMessage.data.sessionId;
                 that.gatewayUrl = statusMessage.data.gatewayURL;
                 that.gatewayURLHTTP = statusMessage.data.gatewayURLHTTP;
                 that.hmacSecret = statusMessage.data.hmacSecret;
                 that.playerName = statusMessage.data.name;
                 if (typeof callback === "function") { callback(statusMessage); }
                 that.trigger("createPlayer", statusMessage);
                 });
                 } else {
                 if (typeof callback === "function") { callback(statusMessage); }
                 that.trigger("createPlayer", statusMessage);
                 }
                 });
                 */
            } else {
                if (typeof callback === "function") {
                    callback(statusMessage);
                }
                that.trigger("createPlayer", statusMessage);
            }
        });
    };

    // This is temporary until we have a solution for developer testing
    FS.ConnectionInfo.prototype.createDeveloper = function (parameters, callback) {
        var that = this;
        this.kind = "developer";
        var connection = new FS.MessageHttpConnection(this.httpUrl, this.defaults);
        connection.send("CreateDeveloper", parameters, function (statusMessage) {
            if (statusMessage.data.code === 0) {
                connection.send("EnableDeveloper", {
                    developerId: statusMessage.data.developerId,
                    enabled: true
                }, function (statusMessage) {
                    if (statusMessage.data.code === 0) {
                        connection.send("LoginDeveloper", parameters, function (statusMessage) {
                            // XXX TODO Need to add a sessionId to the LoginDeveloper to allow developer scripts to run, that.sessionId = statusMessage.data.sessionId;
                            that.sessionId = null;
                            that.gatewayUrl = statusMessage.data.gatewayURL;
                            that.gatewayURLHTTP = statusMessage.data.gatewayURLHTTP;
                            that.hmacSecret = statusMessage.data.hmacSecret;
                            that.developerId = statusMessage.data.developerId;
                            if (typeof callback === "function") {
                                callback(statusMessage);
                            }
                            that.trigger("createDeveloper", statusMessage);
                        });
                    } else {
                        if (typeof callback === "function") {
                            callback(statusMessage);
                        }
                        that.trigger("createDeveloper", statusMessage);
                    }
                });
            } else {
                if (typeof callback === "function") {
                    callback(statusMessage);
                }
                that.trigger("createDeveloper", statusMessage);
            }
        });
    };


    FS.ConnectionInfo.prototype.loginDeveloper = function (parameters, callback, serveroverride) {
        var that = this;
        this.kind = "developer";
        var connection = new FS.MessageHttpConnection(this.httpUrl, this.defaults);
        connection.send("LoginDeveloper", parameters, function (statusMessage) {
            if (statusMessage.data.code === 0) {
                // XXX TODO Need to add a sessionId to the LoginDeveloper to allow developer scripts to run, that.sessionId = statusMessage.data.sessionId;
                that.sessionId = null;
                that.gatewayUrl = statusMessage.data.gatewayURL;
                if (serveroverride !== undefined) that.gatewayUrl = serveroverride;
                that.gatewayURLHTTP = statusMessage.data.gatewayURLHTTP;
                that.hmacSecret = statusMessage.data.hmacSecret;
                that.developerId = statusMessage.data.developerId;
            }

            if (typeof callback === "function") {
                callback(statusMessage);
            }
            that.trigger("loginDeveloper", statusMessage);
        });
    };


    FS.ConnectionInfo.prototype.loginGame = function (parameters, callback, serveroverride) {
        var that = this;
        this.kind = "game";
        var connection = new FS.MessageHttpConnection(this.httpUrl, this.defaults);
        connection.send("LoginGame", parameters, function (statusMessage) {
            if (statusMessage.data.code === 0) {
                that.sessionId = statusMessage.data.sessionId;
                that.gatewayUrl = statusMessage.data.gatewayURL;
                if (serveroverride !== undefined) that.gatewayUrl = serveroverride;
                that.gatewayURLHTTP = statusMessage.data.gatewayURLHTTP;
                that.hmacSecret = statusMessage.data.hmacSecret;
                that.gameId = parameters.gameId;
            }

            if (typeof callback === "function") {
                callback(statusMessage);
            }
            that.trigger("loginDeveloper", statusMessage);
        });
    };


    FS.ConnectionInfo.prototype.loginBot = function (parameters, callback, serveroverride) {
        var that = this;
        this.kind = "bot";
        var connection = new FS.MessageHttpConnection(this.httpUrl, this.defaults);
        connection.send("LoginBot", parameters, function (statusMessage) {
            if (statusMessage.data.code === 0) {
                that.sessionId = statusMessage.data.sessionId;
                that.gatewayUrl = statusMessage.data.gatewayURL;
                if (serveroverride !== undefined) that.gatewayUrl = serveroverride;
                that.gatewayURLHTTP = statusMessage.data.gatewayURLHTTP;
                that.hmacSecret = statusMessage.data.hmacSecret;
                that.botId = parameters.botId;
            }

            if (typeof callback === "function") {
                callback(statusMessage);
            }
            that.trigger("loginBot", statusMessage);
        });
    };

    FS.ConnectionInfo.prototype.loginApiExtension = function (parameters, callback, serveroverride) {
        var that = this;
        this.kind = "apiExtension";
        var connection = new FS.MessageHttpConnection(this.httpUrl, this.defaults);
        connection.send("LoginApiExtension", parameters, function (statusMessage) {
            if (statusMessage.data.code === 0) {
                that.sessionId = statusMessage.data.sessionId;
                that.gatewayUrl = statusMessage.data.gatewayURL;
                if (serveroverride !== undefined) that.gatewayUrl = serveroverride;
                that.gatewayURLHTTP = statusMessage.data.gatewayURLHTTP;
                that.hmacSecret = statusMessage.data.hmacSecret;
                that.apiExtensionId = parameters.apiExtensionId;
            }

            if (typeof callback === "function") {
                callback(statusMessage);
            }
            that.trigger("loginApiExtension", statusMessage);
        });
    };


    // TODO: this has an if case for FS.Utils.isNodeJS() - should instead be two connection classes?
    // for node js, this has a require("./lib/XMLHttpRequest"), it assumes the file is in ./lib
    // could be embedded, but is not necessary for the client case.  The whole node connection class could be in a
    // separate file for the server and client so as not to waste space. Probably not important for the space reason.
    // TODO: callback it returning messsage.data - should return the full message
    /**
     * Create an FS.HttpConnection object.
     *
     * @constructor
     * @class Handles connecting to our http login server to send single JSON messages and get responses. For this reason is is not
     *        really a connection, but we will call it so.
     * @param httpUrl
     */

    FS.HttpConnection = function (httpUrl, timeout) {
        this.url = httpUrl;
        this.timeout = timeout || 300000; // default: 5 mins
    };
    FS.Utils.extend(FS.HttpConnection, FS.EventDispatcher);

    /**
     * Sends data to our Http gateway. Used at the moment for initial login to get the data.
     *
     * @function
     * @param data
     * @param callback
     *          Calls callback(data) when finished, data will be null on failure
     */
    FS.HttpConnection.prototype.send = function (data, callback) {
        var that = this;
        var jsonMessage = JSON.stringify(data);
        if (FS.Debug.message.request && (jsonMessage.toLowerCase().indexOf('password') === -1)) {
            console.log("-- webapp -->> " + jsonMessage);
        }
        var aborted = false;

        FS.XDomainLoad("POST", this.url, jsonMessage, function (status, response, responseText) {
            if (aborted) {
                return;
            }
            clearTimeout(xmlHttpTimeout);
            if (status === 200) {
                if (FS.Debug.message.response && (responseText.toLowerCase().indexOf('password') === -1)) {
                    console.log("-- webapp <<-- " + responseText);
                }
            } else {
                response = {data: {code: 20, errorText: 'IOError'}};
                if (FS.Debug.message.illegal) {
                    console.log("-- webapp <<-- HTTP Request failed: " + status);
                }
            }
            callback(response);
        });

        var timeoutPostRequest = function () {
            aborted = true;
            console.log("Request timed out");
            callback({data: {code: 20, errorText: 'IOError'}});
        };
        var xmlHttpTimeout = setTimeout(timeoutPostRequest, this.timeout);
    };


    /**
     * Create an FS.MessageHttpConnection object.
     *
     * @constructor
     * @class Handles connecting to our http login server to send single messages and get responses. This is a very small layer of the
     *        FS.HttpConnection class, it sends by message name and options, creating an internal FS.MessageFactory with default options
     *        for convenience.
     * @param httpUrl
     */
    FS.MessageHttpConnection = function (httpUrl, options) {
        FS.MessageHttpConnection.superclass.constructor.call(this, httpUrl, options.messageTimeout);
        this.messageFactory = new FS.MessageFactory(options);
    };
    FS.Utils.extend(FS.MessageHttpConnection, FS.HttpConnection);

    FS.MessageHttpConnection.prototype.setOptions = function (options) {
        this.messageFactory.setOptions(options);
    };


    /**
     * retrieves the Initial Vector
     *
     * @function
     */
    FS.MessageHttpConnection.prototype.getIV = function () {
        var retStr = "";
        for (var i = 0; i < 32; i++) {
            retStr += Math.floor(Math.random() * 15).toString(15);
        }
        return retStr;
    };


    /**
     * retrieves the Enc Key
     *
     * @function
     */
    FS.MessageHttpConnection.prototype.getKey = function () {
        return "6aef0698bcab2e042c146fcf96399f26";
    };


    /**
     * Sends the given message to the FunSockets platform. The message is created with the internal messageFactory. The callback
     * function will be called with the status message if a status message is returned from the platform.
     *
     * @function
     * @param messageName
     * @param options
     * @param statusCallback
     */
    FS.MessageHttpConnection.prototype.send = function (messageName, options, statusCallback) {
        var message = this.messageFactory.create(messageName, options, false, this.getKey(), this.getIV());
        FS.MessageHttpConnection.superclass.send.call(this, message, statusCallback);
    };


    var tagCounter = 1,
        tagCallbackMap = {};

    /**
     * Create an FS.MessageHmacConnection object.
     *
     * @constructor
     * @class Handles connecting to our http login server to send single messages and get responses. This is a very small layer of the
     *        FS.HttpConnection class, it sends by message name and options, creating an internal FS.MessageFactory with default options
     *        for convenience.
     * @param httpUrl
     */
    FS.MessageHmacConnection = function (httpUrl, connection, options) {
        FS.MessageHmacConnection.superclass.constructor.call(this, httpUrl);
        this.connection = connection;
        this.messageFactory = new FS.MessageFactory(options);
        this.msgIndex = 0;
        this.msgBuffer = {};
        this.msgOutQueue = [];
        this.msgOutInProgress = false;
        this.pollRetries = 0;
        this.pollMaxRetries = 30;
        this.hmacEventListenerSingletonsAdded = false;
        this.maxMsSinceLastConnect = 20000;
        this.isPrimaryTab = true;

        if (window && window.localStorage) {
            var now = Date.now();
            if (window.localStorage.hmacConnectTimeMs) {
                var msSinceLastConnect = now - window.localStorage.hmacConnectTimeMs;
                if (FS.Debug.error) {
                    console.log("FS.MessageHmacConnection msSinceLastConnect: " + msSinceLastConnect);
                }
                if (msSinceLastConnect < this.maxMsSinceLastConnect) {
                    alert("Only 1 tab supported for this mode. Multiple tabs are supported in Chrome, Firefox, Safari, and Internet Explorer 10");
                    this.isPrimaryTab = false;
                    return;
                }
                window.localStorage.hmacConnectTimeMs = now;
            }
            this.hmacSessionKey = window.localStorage.hmacSessionKey;
        }
    };
    FS.Utils.extend(FS.MessageHmacConnection, FS.HttpConnection);

    FS.MessageHmacConnection.prototype.connect = function (callback) {
        var self = this;

        if (!self.isPrimaryTab) {
            return callback(new Error("Multiple HMAC tabs not supported"));
        }

        // Use a timeout loop, rather than an interval for long polling
        var poll = function () {
            var myTimeoutId = self._polling;
            self.sendNow(undefined, function (status) {
                if (myTimeoutId === self._polling) {
                    var pollTimeoutMs = 0;
                    if (status === 200) {
                        self.pollRetries = 0;
                        if (window && window.localStorage) {
                            window.localStorage.hmacConnectTimeMs = Date.now();
                            if (FS.Debug.error) {
                                console.log("window.localStorage.hmacConnectTimeMs: " + window.localStorage.hmacConnectTimeMs);
                            }
                        }
                    } else {
                        self.pollRetries++;
                        pollTimeoutMs = 1000;
                    }
                    if (self.pollRetries < self.pollMaxRetries) {
                        self._polling = setTimeout(poll, pollTimeoutMs);
                    } else {
                        if (FS.Debug.error) {
                            console.log("Max polling retries attempted");
                        }
                    }
                }
            });
        };

        self.close(function () {
            FS.XDomainLoad("GET",
                self.url + "?sessionId=" + self.connection.connInfo.sessionId + "&ts=" + (new Date()).getTime(), undefined,
                function (status, response) {
                    if (status !== 200) {
                        callback("Server error response: " + status);
                        return;
                    }
                    self.hmacSessionKey = response.sessionKey;
                    if (window && window.localStorage) {
                        window.localStorage.hmacSessionKey = response.sessionKey;
                    }
                    callback();

                    poll();
                });
        });

        if (window && !self.hmacEventListenerSingletonsAdded) {
            self.hmacEventListenerSingletonsAdded = true;
            window.addEventListener("focus", function (event) {
                if (window.localStorage && self.hmacSessionKey) {
                    window.localStorage.hmacSessionKey = self.hmacSessionKey;
                }
            }, false);
            window.addEventListener("unload", function (event) {
                if (FS.Debug.error) {
                    console.log("window unload event in primary tab");
                }
                if (window.localStorage && window.localStorage.hmacConnectTimeMs) {
                    if (FS.Debug.error) {
                        console.log("delete window.localStorage.hmacConnectTimeMs");
                    }
                    delete window.localStorage.hmacConnectTimeMs;
                }
            }, true);
        }
    };

    FS.MessageHmacConnection.prototype.close = function (callback) {
        if (FS.Debug.error) {
            console.log("FS.MessageHmacConnection.close");
        }
        var self = this;
        if (self._polling) {
            clearTimeout(self._polling);
            self._polling = null;
        }

        self.msgOutQueue = [];

        if (self.url && self.hmacSessionKey) {
            FS.XDomainLoad("POST",
                self.url + self.hmacSessionKey,
                "DELETE",
                function (status, response, json) {
                    if (window.localStorage && window.localStorage.hmacConnectTimeMs) {
                        if (FS.Debug.error) {
                            console.log("delete hmacConnectTimeMs and hmacSessionKey");
                        }
                        delete self.hmacConnectTimeMs;
                        delete window.localStorage.hmacConnectTimeMs;
                        delete self.hmacSessionKey;
                        delete window.localStorage.hmacSessionKey;
                    }
                    if (callback) {
                        callback(status);
                    }
                });
        } else {
            if (callback) {
                callback();
            }
        }

    };

    FS.MessageHmacConnection.prototype.setOptions = function (options) {
        this.messageFactory.setOptions(options);
    };

    /**
     * retrieves the Initial Vector
     *
     * @function
     */
    FS.MessageHmacConnection.prototype.getIV = function () {
        var retStr = "";
        for (var i = 0; i < 32; i++) {
            retStr += Math.floor(Math.random() * 15).toString(15);
        }
        return retStr;
    };

    /**
     * retrieves the Enc Key
     *
     * @function
     */
    FS.MessageHmacConnection.prototype.getKey = function () {
        return "6aef0698bcab2e042c146fcf96399f26";
    };

    FS.MessageHmacConnection.dequeueSend = function (self) {
        if (self.msgOutQueue.length === 0) {
            self.msgOutInProgress = false;
            return;
        }
        self.msgOutInProgress = true;
        var msgOut = self.msgOutQueue.shift();
        var p = FS.MessageHmacConnection.sendPromise(msgOut.self, msgOut.data, msgOut.callback);
        p.then(function () {
            FS.MessageHmacConnection.dequeueSend(msgOut.self);
        }, function (err) {
            throw err;
        });
    };

    FS.MessageHmacConnection.sendPromise = function (self, data, callback) {
        var p = new FS.Promise();
        var jsonMessage = data ? JSON.stringify(data) : '';
        if (FS.Debug.message.request && data) {
            console.log("-- hmac -->> " + jsonMessage);
        }

        var hmac = FS.CryptoJS.HmacSHA256(jsonMessage, self.connection.connInfo.hmacSecret).toString();
        FS.XDomainLoad("POST",
            self.url + self.hmacSessionKey + "?hmac=" + encodeURI(hmac) + "&ts=" + (new Date()).getTime(),
            jsonMessage,
            function (status, response, json) {
                if (callback) {
                    callback(status);
                }

                if (status === 200) {
                    p.resolve(status);
                } else {
                    return p.fail(new Error("Could not communicate with server: " + status));
                }

                if (FS.Debug.message.response && response.data && response.data.length) {
                    console.log("-- hmac <<-- " + json);
                }
                return self._onData(response);
            });
        return p;
    };

    /**
     * Sends data to our Http gateway. Used at the moment for initial login to get the data.
     *
     * @function
     * @param data
     * @param callback
     *          Calls callback(data) when finished, data will be null on failure
     */
    FS.MessageHmacConnection.prototype.send = function (data, callback, isPriority) {
        var self = this;
        var messageOut = {self: self, data: data, callback: callback};
        if (data) {
            // enqueue message
            if (isPriority) {
                self.msgOutQueue.unshift(messageOut);
            } else {
                self.msgOutQueue.push(messageOut);
            }
            if (!self.msgOutInProgress) {
                FS.MessageHmacConnection.dequeueSend(self);
            }
        } else {
            // don't delay other messages waiting for this response
            FS.MessageHmacConnection.sendPromise(messageOut.self, messageOut.data, messageOut.callback);
        }
    };

    FS.MessageHmacConnection.prototype.sendNow = function (data, callback) {
        this.send(data, callback, true);
    }

    FS.MessageHmacConnection.prototype._onData = function (jsonData) {
        var self = this,
            messages;

        if (jsonData.index === undefined) {
            return;
        }
        self.msgBuffer[jsonData.index] = jsonData.data;

        while (self.msgBuffer[self.msgIndex]) {
            // Playback all the buffered messages
            self.msgBuffer[self.msgIndex].forEach(function (message) {
                if (message.message === "Ping") {
                    // handle ping messages automatically - see no need for more generality
                    // rather than call self.send, handle specially so we get debugging flag
                    var pingStatusMessage = self.messageFactory.create("Ping", {
                        responseMessage: "Ping",
                        code: 0,
                        destination: ""
                    }, true);
                    self.sendNow(pingStatusMessage);
                } else {
                    if (message.tag && tagCallbackMap[message.tag]) {
                        tagCallbackMap[message.tag](message);
                        delete tagCallbackMap[message.tag];
                    }
                    self.trigger("message", message);
                }
            });

            // Dequeue them
            delete self.msgBuffer[self.msgIndex++];
        }
    };

    FS.MessageHmacConnection.prototype.sendStatus = function (messageName, options) {

        var message = this.messageFactory.create(messageName, options, true, this.getKey(), this.getIV());

        this.send(message);
    };

    FS.MessageHmacConnection.prototype.sendRequest = function (messageName, options, statusCallback) {
        var message = this.messageFactory.create(messageName, options, false, this.getKey(), this.getIV());

        if (statusCallback) {
            var tag = message.tag + "-FSMsgWSTag" + (++tagCounter);
            message.tag = tag;
            tagCallbackMap[tag] = statusCallback;
        }

        this.send(message);
    };

    /**
     * Creates a MessageWebSocketConnection.
     *
     * @constructor
     * @class The MessageWebSocketConnection class handles connecting to the FunSockets WebSocket gateway. It provided a convenient
     *        interface to send messages to the FunSockets platform. FunSockets platform Ping messages are automatically handled.
     *        <p>
     *        To send messages, the <code>send</code> method is invoked. Its first two parameters the messageName and options are sent
     *        to a messageFactory to create the message to be sent. The final parameter is a callback function, this function, if
     *        provided will be invoked when the corresponding message's "Status" message come back. Since most (all) FunSockets platform
     *        messages have corresponding Status messages, this is quite convenient. The callback parameter is optional and if left out,
     *        any status message will be process like normal data.
     *        </p>
     *        <p>
     *        To receive messages, bind to the "message" event. To receive status errors, bind to the "error:status" event. To be
     *        notified of closure of the WebSocket, bind to the "close" event.
     *        </p>
     *
     * <p>
     * The FS.Debug interfaces is supported. Currently "messages" and "pingMessages" flags are supported. If enabled, the appropriate
     * messages will be output to console with <code> console.log</code>.
     * </p>
     *
     */
    FS.MessageWebSocketConnection = function (url, options, connParent) {
        this.url = url;
        this.connParent = connParent; // save so can give new values in event of Reconnect with new LoginGateway.
        this.messageFactory = new FS.MessageFactory(options);
        if (typeof(options.source) != 'undefined') {
            this.msgSource = options.source;
        }
        this.wsgTries = null; // important for this to be "null" -- triggers filling it first time try to connect.
        this.webSocket = null;  // when a "winner" connection is determined, we set a reference to it here.
        this.webSocketAttempts = []; // references to all WebSocket objects created to try to connect (but there's only one winner).
        if (this.activityTimeout) {
            delete this.activityTimeout;
        }

        // Determine if we are a user connection. If so, then use reconnect logic.
        this.connIsUser = (typeof this.msgSource !== 'undefined' && this.msgSource.indexOf("user:") === 0);
        this.cliSeqNum = 1;
        this.cliSeqNumAck = 0;
        this.srvSeqNum = 0;
        this.srvSeqNumNext = 1;
        this.seenPacket = false;
        this.sentMessageBuffer = [];
        this.trynextwsgTimeout = null;
        this.closeTimeout = null;
        this.connectionState = "DISCONNECTED";
        this.gaveUp = false;
        this.maxConnectionAttempts = 0;
        this.gaConnectionHeartbeatTime = 60 * 1000; // 60 seconds per heartbeat GA tag.
        this.curConnectionAttempt = 1; // we try once before the setInterval fires to try again.
        this.trynextwsgTimeLimit = (typeof FS.trynextwsgTimeLimit !== 'undefined' && FS.trynextwsgTimeLimit !== null) ? FS.trynextwsgTimeLimit : 4000; // 4 seconds before try a different WSG connection.
//		if (typeof navigator !== 'undefined' && navigator!==null && typeof navigator.userAgent!=='undefined' && navigator.userAgent!==null && navigator.userAgent.indexOf("Firefox")!==-1) {
//		    this.trynextwsgTimeLimit += 1000; // I saw that firefox sometimes missed valid connections because it didn't recognize it within the timeout window.
//		}
        // this is used to avoid a security violation error in IE10 when transitioning from
        // http-->https and get an "onclose" event for an old websocket connection attempt
        // and, due to closure reasons, GA tries to send an event using "http://www" instead of
        // "https://ssl". See this.websocket.onclose for more info.
        this.curWindowLocation = (typeof window !== 'undefined' && window !== null && typeof window.location !== 'undefined' && window.location !== null) ? "" + window.location : "";

        if (options && typeof(options.reconnectTimeLimit) != 'undefined') {
            this.reconnectTimeLimit = options.reconnectTimeLimit;
            if (this.reconnectTimeLimit == 0) {
                console.log("Reconnect Disabled.")
            }
        } else {
            this.reconnectTimeLimit = 60000;
        }

    };
    FS.Utils.extend(FS.MessageWebSocketConnection, FS.EventDispatcher);

    FS.MessageWebSocketConnection.prototype.setOptions = function (options) {
        if (typeof(options.source) != 'undefined') {
            this.msgSource = options.source;
            // Determine if we are a user connection. If so, then use reconnect logic.
            this.connIsUser = (typeof this.msgSource !== 'undefined' && this.msgSource.indexOf("user:") === 0);
        }
        if (options && typeof(options.reconnectTimeLimit) != 'undefined') {
            this.reconnectTimeLimit = options.reconnectTimeLimit;
            if (this.reconnectTimeLimit == 0) {
                console.log("Reconnect Disabled.")
            }
        }
        this.messageFactory.setOptions(options);
    };

    /**
     * retrieves the Initial Vector
     *
     * @function
     */
    FS.MessageWebSocketConnection.prototype.getIV = function () {
        var retStr = "";
        for (var i = 0; i < 32; i++) {
            retStr += Math.floor(Math.random() * 15).toString(15);
        }
        return retStr;
    };


    /**
     * retrieves the Enc Key
     *
     * @function
     */
    FS.MessageWebSocketConnection.prototype.getKey = function () {
        return "6aef0698bcab2e042c146fcf96399f26";
    };


    /**
     * This function wraps around the WS send function to support the buffer-while-disconnected-functionality
     *
     * @function
     * @param jsonData
     *          This will be passed <code>JSON.stringify</code> and sent to the WebSocket gateway.
     */
    FS.MessageWebSocketConnection.prototype.send = function (stringData, seqNum) {
        if (stringData !== null) {
            this._send(stringData, true, seqNum);
        } else {
            if (FS.Debug.all) {
                console.log("FS.MessageWebSocketConnection.prototype.send: WARNING: stringData was NULL. ");
            }
        }
    };

    /**
     * This function wraps around the WS send function to support the buffer-while-disconnected-functionality
     *
     * @function
     * @param jsonData
     *          This will be passed <code>JSON.stringify</code> and sent to the WebSocket gateway.
     */
    FS.MessageWebSocketConnection.prototype._send = function (stringData, bufferMssg, seqNum) {

        if (this.connIsUser === true && bufferMssg === true) {
            var _seqN = (typeof seqNum !== 'undefined' && seqNum !== null) ? seqNum : 0;
            var _bufferObject = {sqN: _seqN, mssg: stringData};
            this.sentMessageBuffer.push(_bufferObject);
        }

        if (this.webSocket && this.connectionState === "CONNECTED") {

//JQS-ERROR  -- getting NS_ERROR_UNEXPECTED here.

            this.webSocket.send(stringData);
        } else {
            if (FS.Debug.all) {
                console.log("FS.MessageWebSocketConnection.prototype._send: socket not connected, message buffered");
            }
        }
    };


    /**
     * This function can be used to send raw json data the the FunSockets platform. For sending most platform messages, it is
     * recommended to use the send() method and let the this class generate the JSON automatically.`
     *
     * @function
     * @param jsonData
     *          This will be passed <code>JSON.stringify</code> and sent to the WebSocket gateway.
     */
    FS.MessageWebSocketConnection.prototype.sendRaw = function (jsonData) {
        var stringMessage = null;
        if (this.connIsUser === true) {
            jsonData.sqN = this.cliSeqNum++; // assign message sequence number.
            jsonData.sqA = this.srvSeqNum;
        }
        stringMessage = JSON.stringify(jsonData);
        if (FS.Debug.message.raw) {
            console.log("-->> " + stringMessage);
        }
        this.send(stringMessage, jsonData.sqN);
    };

    /**
     * Sends the status message to the FunSockets platform. A Status message is a message that goes one way and is not expected to
     * have a Status message come back in response. The message is created with the internal messageFactory. The callback
     * function is optional and if provided will be called with the status message if a status message is returned from the platform.
     *
     * @function
     * @param messageName
     * @param options
     */
    FS.MessageWebSocketConnection.prototype.sendStatus = function (messageName, options) {
        var message = this.messageFactory.create(messageName, options, true, this.getKey(), this.getIV());
        var stringMessage = null;

        if (this.connIsUser === true) {
            message.sqN = this.cliSeqNum++; // assign message sequence number.
            message.sqA = this.srvSeqNum;
        }
        stringMessage = JSON.stringify(message);
        if (FS.Debug.message.status) {
            console.log("--S> " + stringMessage);
        }
        this.send(stringMessage, message.sqN);
    };

    /**
     * Sends the given message to the FunSockets platform. The message is created with the internal messageFactory. The callback
     * function is optional and if provided will be called with the status message if a status message is returned from the platform.
     *
     * @function
     * @param messageName
     * @param options
     * @param statusCallback
     */
    FS.MessageWebSocketConnection.prototype.sendRequest = function (messageName, options, statusCallback) {
        var message = this.messageFactory.create(messageName, options, false, this.getKey(), this.getIV());
        if (this.connIsUser === true) {
            message.sqN = this.cliSeqNum++; // assign message sequence number.
            message.sqA = this.srvSeqNum;
        }
        // Check if we are tracking this call to do a callback on it.
        if (statusCallback) {
            tagCounter += 1;
            var tag = "-FSMsgWSTag" + tagCounter;
            message.tag += tag;
            tagCallbackMap[messageName + "-" + tag] = statusCallback;
        }
        var stringMessage = JSON.stringify(message);

//TEST CODE
//-----------------------------------------------------------------------------------------
        if (this.jqsInGame === true && stringMessage.indexOf("message\":\"GatewayDisconnect") >= 0) {
            this.jqsInGame = false;
        }
//-----------------------------------------------------------------------------------------

        if (FS.Debug.message.request && (stringMessage.toLowerCase().indexOf('password') === -1)) {
            console.log("--R> " + stringMessage);
        }
        this.send(stringMessage, message.sqN);
    };

    // Sends a raw message, calls the statusCallback on return
    FS.MessageWebSocketConnection.prototype.sendRawRequest = function (jsonData, statusCallback) {
        if (this.connIsUser === true) {
            jsonData.sqN = this.cliSeqNum++; // message sequence number.
            jsonData.sqA = this.srvSeqNum;
        }
        if (statusCallback) {
            tagCounter += 1;
            var tag = "-FSMsgWSTag" + tagCounter;
            jsonData.tag += tag;
            tagCallbackMap[jsonData.message + "-" + tag] = statusCallback;
        }
        var stringMessage = JSON.stringify(jsonData);
        if (FS.Debug.message.request && (stringMessage.toLowerCase().indexOf('password') === -1)) {
            console.log("--R> " + stringMessage);
        }
        this.send(stringMessage, jsonData.sqN);
    };

    /**
     * Connect to the gateway
     *
     * @param url
     * @param options
     * @param callback
     */
    FS.MessageWebSocketConnection.prototype.connect = function (callback) {
        var that = this,
            cbcalled = false,
            curWebsocketTry = null;

        // this gets set in "StartReconnect()"
        that.reconnectTimeout = null;
        // try multiple WSG's and multiple ports to get connected.
        that.setupMultiConnect(callback);

        //----------------------------
        // try to open the websocket.
        //----------------------------
        console.log("FS.MessageWebSocketConnection.prototype.connect: currently trying - " + that.url);
        curWebsocketTry = new root.WebSocket(that.url);
        curWebsocketTry.tryingUrl = that.url;
        that.webSocketAttempts.push(curWebsocketTry); // keep a reference to the websocket object we just created. When we determine a "winner" assign to that.webSocket var.


        if (typeof(window) != 'undefined') {
            // in IE10, if you click on a link that looks like this:
            //     <a href="javascript:void(0);">Howdy</a>
            // the href will be interpreted as a link to another page (since it's not "#").
            // and the event "onbeforeunload" will be triggered (handler below) which, for 
            // "reconnect" functionality purposes, we have disconnecting the websocket.
            // So that just clicking an internal link in the game doesn't kill the
            // websocket connection (AsNet uses this link format in a lot of places) then
            // bind to the click event on anchor tags <a> and set a var that tells us to
            // ignore it when the href = "javascript:void(0);"
            that.leavingPage = true;

            $(document).ready(function () {
                // It's much more efficient to bind to the "body" instead of trying
                // to find to all <a> tags... and even if an <a> tag gets inserted
                // dynamically, we'll still pick it up here.
                $("body").delegate("a", "click", function () {
                    var elHref = $(this).attr('href');
                    if (elHref && elHref === "javascript:void(0);") {
                        that.leavingPage = false;
                    }
                });
            });

            window.onbeforeunload = function (e) {
                if (that.leavingPage) { // see comments above.
                    that.close();
                } else {
                    that.leavingPage = true; // reset the value if it's not true.
                }
            }

        }

        //--------------------------------------------------------------------------------------------------------------------------------------------
        // Here's where things get interesting. The "curWebsocketTry" object to which we're adding functions below is a "WebSocket" object.
        // The .connect() routine is re-entrant, so we'll be creating more WebSocket objects (their scope is contained in the .connect() closure each time).
        //--------------------------------------------------------------------------------------------------------------------------------------------
        // NOTE:
        //  - We're creating closures around "curWebsocketTry" functionality.
        //  - There can be several "curWebsocketTry" objects in play at the same time (i.e., multi-connect).
        //  - Each "curWebsocketTry" will be referencing a particular URL and connection it was trying to establish.
        //  - There can only be one winner -- as soon as one wins, the others exit if they do eventually connect.
        //  - "that" refers the "var that=this;" created in .connect() (i.e., the FS.MessageWebSocketConnection object).
        //  - as used below "this" refers to the curWebsocketTry object.
        //  - DO NOT ASSIGN "that = this" in the curWebsocketTry functions below.
        //--------------------------------------------------------------------------------------------------------------------------------------------

        curWebsocketTry.onopen = function () {
            console.log("FSSDK: webSocket: onopen: top: url:" + this.tryingUrl);

            if (FS.Debug.all) {
                console.log("FSSDK: MessageWebSocketConnection.prototype.onopen: received open for: " + this.tryingUrl);
            }

            // When we are first trying to create a WSG connection, if the first attempt doesn't return within
            // <n> seconds, then we start another attempt. That means that eventually there is a chance we will
            // get two (or more) "connects" if some attempts are slow in responding. Whichever one "wins" is the one
            // that we take.
            if (that.webSocket !== null || that.connectionState === "CONNECTED") { // if we're already connected, then ignore this "connect" response.
                if (FS.Debug.all) {
                    console.log("FSSDK: webSocket: onopen: ALREADY CONNECTED: url:" + this.tryingUrl);
                }
                this.close(); // NOTE: "this" != "that" here. We're not going to use this websocket, so close it.
                return;
            } else if (that.gaveUp === true) { // the open arrived after our overall connection timeout fired.
                if (FS.Debug.all) {
                    console.log("FSSDK: webSocket: onopen: GAVE UP ALREADY: url:" + this.tryingUrl);
                }
                this.close(); //  NOTE: "this" != "that" here. We're not going to use this websocket, so close it.
                return;
            }

            // NOTE: it's possible set off a "security violation" in IE10 still. If we have an outstanding connection request using "ws://"
            // but we timeout and start trying to connect to "ws://" (and change location to "https://")  then the original "ws://" connection
            // attempt succeeds, we'll be in here....... and trying to use a "ws://" websocket in an "https://" environment will trigger it.
            // Should be pretty rare, though.


//------------------------------------------------------------
// the open/error/close events for a websocket connection attempt can arrive AFTER
// we start switching from http --> https (i.e., if no "ws" connections appear to 
// work within the failover timeframe). Due to closure reasons, the window.location is
// still "http://" instead of "https://" and then GA tries to send an event using
// "http://www" instead of "https://ssl" and we get a security violation in IE10.
            var closureWinLocation = (typeof window !== 'undefined' && window !== null && typeof window.location !== -1 && window.location !== null) ? "" + window.location : "";
            var useGA = (typeof that.curWindowLocation !== 'undefined' && that.curWindowLocation.indexOf("https://") !== -1 && closureWinLocation.indexOf("http://") !== -1) ? false : true;

            if (useGA) {
                if (that.connectionState === "RECONNECTING") {
                    that.sendGATag('/websockets2/onopen_reconnected');
                } else {
                    that.sendGATag('/websockets2/onopen_connected');
                }
            }


            if (typeof that.activityTimeout === 'undefined' || that.activityTimeout === null) {
                console.log("Setting up GA connection heartbeat every: " + that.gaConnectionHeartbeatTime + " milliseconds");
                that.activityTimeout = setInterval(function () {
                    that.sendGATag('/websockets2/connection_heartbeat');
                }, that.gaConnectionHeartbeatTime);
            }
//------------------------------------------------------------


            //=======================================================================================================
            //  ONLY ONE WEBSOCKET OBJECT/ATTEMPT WILL/SHOULD EVER GET TO THIS CODE.
            //=======================================================================================================

            // *** Super important*** -- setting this var safeguards the code in the .onerror() and .onclose() 
            // functions in the websocket objects from operating on anything other than the correct connection.
            that.webSocket = this;  // "this" WebSocket connection wins. Create a new reference to it from the master FS.MessageWebSocketConnection object.
            // *** Super important*** Setting connectionState = "CONNECTED" prevents any other WebSocket connections
            // from getting to the code below. In addition. prevent any tardy "error" or "close" events from other 
            // websocket connection attempts from having an effect on our "one true" websocket connection. We check 
            // this state var in .onerror/.onclose.
            that.connectionState = "CONNECTED";
            that.url = this.tryingUrl; // whichever "connect" URL won is what we stick with. Note: "that.url" could have some other connection attempt's url in there.
            that.webSocketAttempts.length = 0;  // Eliminate references to any other websocket objects created.
            // clear all of our timers.
            if (that.trynextwsgTimeout != null) {
                clearInterval(that.trynextwsgTimeout);
                that.trynextwsgTimeout = null;
            }
            if (that.closeTimeout != null) {
                clearTimeout(that.closeTimeout);
                that.closeTimeout = null;
            }
            if (that.reconnectTimeout != null) {
                clearTimeout(that.reconnectTimeout);
                that.reconnectTimeout = null;
            }

            if (FS.Debug.all) {
                console.log("FS.MessageWebSocketConnection.prototype.onconnect: sending buffered messages.");
            }

            if (that.connIsUser === true) {
                that.sendBufferedMessages(); // send anything that's been waiting on this websocket "open" (like a Reconnect situation).
            }

            if (typeof cbcalled !== 'undefined' && cbcalled === false) {
                cbcalled = true;
                if (callback) {
                    callback();
                }
            }
        };

        curWebsocketTry.onmessage = function (e) {
            that._onData(e.data);
        };

        curWebsocketTry.onerror = function (e) {
            console.log("FSSDK: webSocket: onerror: top");

            if (FS.Debug.all) {
                console.log("FSSDK: MessageWebSocketConnection.websocket.onerror: received error for: " + this.tryingUrl);
            }

            // "that.webSocket" only gets set when we have a successful connection. So we ONLY care about an error for that "one true" websocket connection.
            // Through our various connection attempts, we may get various "error" events either before or after finding our "one true" connection, so this 
            // prevents us from responding to an "error" until it is for that one true connection.
            // NOTE: that.webSocket will be "null" if we are trying to reconnect. The websocket object reconnection attempts aren't stored in "that.webSocket"
            // and yet we need to fall thru to the code below to try the "reconnect" again... so if state===RECONNECTING let it go through.
            if (that.webSocket !== this && that.connectionState !== "RECONNECTING") {
                return;
            }

            //-----------------------------------------------------------------------------------------------------------------------------------------
            //-----------------------------------------------------------------------------------------------------------------------------------------
            // WE ONLY GET TO THE CODE BELOW IF THIS IS AN "ERROR" ON A WEBSOCKET THAT PREVIOUSLY SUCCEEDED AND WAS OUR "ONE TRUE" WEBSOCKET CONNECTION.
            //-----------------------------------------------------------------------------------------------------------------------------------------
            //-----------------------------------------------------------------------------------------------------------------------------------------

            // This is for the "one true" websocket connection -- so eliminate the reference to it.
            that.webSocket = null;
            that.stateError = "error";
            that.sendGATag('/websockets2/onerror_top');

            if (that.useReconnect()) {
                that.startReconnect(e);
            } else if (that.connectionState === "CONNECTED") {
                that.sendGATag('/websockets2/onerror_reconnect_off');
                if (FS.Debug.all) {
                    console.log("FS.MessageWebSocketConnection.websocket.onerror: not reconnecting!");
                }
                // If the connection fails we MUST notify the callback function
                if (typeof cbcalled !== 'undefined' && cbcalled === false) {
                    cbcalled = true;
                    if (callback) {
                        callback(e);
                    }
                }

                // publish the error.
                that.connectionState = "DISCONNECTED";
                that.trigger(that.stateError, e);
            }
        };

        curWebsocketTry.onclose = function (e) {
            if (FS.Debug.all) {
                console.log("FSSDK: MessageWebSocketConnection.websocket.onclose: received close for: " + this.tryingUrl);
            }

            // "that.webSocket" only gets set when we have a successful connection. So we ONLY care about the close for the "one true" websocket connection.
            // Through our various connection attempts, we may get various "close" events either before or after finding our "one true" connection, so this 
            // prevents us from responding to a "close" event unless it is for that one true connection.
            // NOTE: that.webSocket will be "null" if we are trying to reconnect. The websocket object reconnection attempts aren't stored in "that.webSocket"
            // and yet we need to fall thru to the code below to try the "reconnect" again... so if state===RECONNECTING let it go through.
            if (that.webSocket !== this && that.connectionState !== "RECONNECTING") {
                return;
            }

            that.sendGATag('/websockets2/onclose_top');

            //-----------------------------------------------------------------------------------------------------------------------------------------
            //-----------------------------------------------------------------------------------------------------------------------------------------
            // WE ONLY GET TO THE CODE BELOW IF THIS IS A "CLOSE" ON A WEBSOCKET THAT PREVIOUSLY SUCCEEDED AND WAS OUR "ONE TRUE" WEBSOCKET CONNECTION.
            //-----------------------------------------------------------------------------------------------------------------------------------------
            //-----------------------------------------------------------------------------------------------------------------------------------------

            that.stateError = "close";

            //-----------------------------------------------------------------------------------------------------------------------
            // (forceClose or !reconnect) means that this gets hit in a couple of cases:
            //  - we're trying to connect for the first time and it can't -- we'll get an "onclose" message from the OS.
            //  - the user has been connected and is now trying to close the connection (i.e., logout).
            //  - our underlying code opened a connection for some temporary purpose (like to retrieve a value for a guest name or something).
            //-----------------------------------------------------------------------------------------------------------------------
            if (that.forceClose || !that.useReconnect()) {
                that.sendGATag('/websockets2/onclose_force__reconnect_off');
                if (that.closeTimeout) {
                    clearTimeout(that.closeTimeout);
                }
                that.webSocket = null;
                that.connectionState = "DISCONNECTED";

                if (typeof cbcalled !== 'undefined' && cbcalled === false) {
                    cbcalled = true;
                    if (callback) {
                        callback(e);
                    }
                }
                that.trigger(that.stateError, e);
            }
            else {
                that.startReconnect(e);
            }
        };
    };

    /**
     * Process a message from the platform
     *
     * @function
     * @private
     * @param stringMessage {string}    The message from the platform in JSON format
     *
     */
    FS.MessageWebSocketConnection.prototype._onData = function (stringMessage) {

        var messages = FS.MessageWebSocketConnection.parseStringMessage(stringMessage);
        var self = this;
        var i;
        for (i = 0; i < messages.length; i++) {
            (function () {
                var message = messages[i];

                // Clear out sent messages that the server tells us it has seen.
                if (self.connIsUser === true) {
                    self.purgeSentMessageBuffer(message);
                }

                if (message.message === "Ping") {
                    // handle ping messages automatically - see no need for more generality
                    // rather than call this.send, handle specially so we get debugging flag
                    if (FS.Debug.message.ping && (stringMessage.toLowerCase().indexOf('password') === -1)) {
                        console.log("<<-- " + stringMessage);
                    }
                    var pingStatusMessage = self.messageFactory.create("Ping", {
                        responseMessage: "Ping",
                        code: 0,
                        destination: ""
                    }, true, self.getKey(), self.getIV());
                    if (self.connIsUser === true && typeof pingStatusMessage !== 'undefined' && pingStatusMessage !== null) {
                        pingStatusMessage.sqA = self.srvSeqNum; // always let the server know what we've seen... even in PING messages.
                    }
                    var stringPingStatusMessage = JSON.stringify(pingStatusMessage);
                    if (FS.Debug.message.ping) {
                        console.log("-->> " + stringPingStatusMessage);
                    }
                    self.send(stringPingStatusMessage);
                } else {

                    var dropReason = "";

                    // If we've already seen this message (or no sqN) then drop it. Otherwise PROCESS it.
                    if (self.connIsUser === true && typeof message.sqN !== 'undefined' && message.sqN !== null && message.sqN <= self.srvSeqNum) { // DROP IT !! Repeat mssg.
                        dropReason = "(DROPPED - repeat sqN) ";
                        // console output... either we're handling it or we dropped it (for reason).
                        if (FS.Debug.message.response && (stringMessage.toLowerCase().indexOf('password') === -1)) {
                            console.log("<<-- " + dropReason + stringMessage);
                        }

                    } else if (self.connIsUser === true && message.message === "ReconnectFailed") { // PROCESS A "RECONNECT FAILED" MESSAGE.
                        // We successfully opened a connection to the server again on a reconnect attempt
                        // but there is no matching session waiting for us (server could have restarted).
                        // Note: If server gets multiple "reconnect" messages, it doesn't update the sqN for those
                        // so they'll get dropped above and won't interfere with what we're about to do by
                        // trying to do it again.

                        self.srvSeqNum = (message.sqN) ? message.sqN : 0; // update our "max" server seqNum seen.
                        self.sentMessageBuffer.length = 0; // clear the array.

// Reconnect didn't work
// Let the user know and refresh the page afterwards.
// Do a pNotify (with a callback to refresh the page if possible).

                        // console output... either we're handling it or we dropped it (for reason).
                        if (FS.Debug.message.response && (stringMessage.toLowerCase().indexOf('password') === -1)) {
                            console.log("<<-- " + stringMessage);
                        }

                        /* JQS - not ready yet
                         // We have a connection to the server again -- but it doesn't know us (reconnect failed). Need to LoginGateway again.
                         var call = "LoginGateway";
                         if (self.connParent.getConnKind() === "developer") { call = "InternalLoginGateway"; }
                         var sessId = self.connParent.getSessionId();
                         self.sendRequest(call, {sessionId : self.connParent.getSessionId()}, function (resp) {
                         if (resp.data.code !== 0) {
                         self.close();
                         } else {
                         self.connParent.setNewConnInfo(resp);
                         }
                         //                                self.sendNotification("reconnect", resp, callback);

                         // NOTE: Notifier already has bindings on the MessageWebSocketConnection object -- don't need to do that again.
                         });
                         */

// For now just reload the page on reconnect failed.
                        if (typeof location !== 'undefined' && location !== null) {
                            location.reload();
                        }

                    } else { // PROCESS IT NORMALLY !!

                        if (self.connIsUser === true) {
                            self.srvSeqNum = message.sqN; // update our "max" server seqNum seen.
                        }

                        // if this is a status message, there may be a tag attached telling us what callback should be called
                        var callback, tag;
                        if (typeof message.tag === "string") {
                            tag = message.tag.match(/-FSMsgWSTag\d+/);
                            if (tag !== null) {
                                tag = tag[0];
                                callback = tagCallbackMap[message.data.responseMessage + "-" + tag];
                                if (callback) {
                                    callback(message);
                                    delete tagCallbackMap[message.data.responseMessage + "-" + tag];
                                }
                                message.tag.replace(tag, "");
                            }
                        }

                        //JQS - test code
                        self.TestForConnectionClosedDuringGame(message);

                        // console output... either we're handling it or we dropped it (for reason).
                        if (FS.Debug.message.response && (stringMessage.toLowerCase().indexOf('password') === -1)) {
                            console.log("<<-- " + stringMessage);
                        }

                        // Allow for processing of message via trigger regardless of callback
                        self.trigger("message", message);
                    }
                }
            })();
        } // for
    };


    /**
     * Closes this WebSocketConnection.
     *
     * @function
     */
    FS.MessageWebSocketConnection.prototype.close = function () {
        clearTimeout(this.activityTimeout);
        this.sentMessageBuffer.length = 0;  // this.sentMessageBuffer.length = splice(0,this.sentMessageBuffer.length); // clear the entire "sentMessage" buffer.

        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = null;
            this.sendGATag('/websockets2/user_closed');
        }
        this.forceClose = true;
    };


    //=================================================================================================================
    //                  MULTI-CONNECT LOGIC
    //=================================================================================================================

    FS.MessageWebSocketConnection.prototype.setupMultiConnect = function (callback) {
        var that = this,
            cbcalled = false,
            tryMultiWsg = false;

        // If we've already been in here, don't do it again ... if not, set true so we don't come in twice.
        if (that.multiConnectSetup == true) {
            return;
        }
        that.multiConnectSetup = true;

        // Fill in the list of WSGs to try
        that.fillWsgTriesArray();

        // Set up the "try the next one" timeout function.
        // NOTE: We also come through here when trying to do "RECONNECT" so
        // only try this multi-WSG connection attempt if NOT doing reconnect.
        // Otherwise, may reconnect to a WSG that doesn't have our state. When doing
        // the initial CONNECT (i.e., not re-connect) there is no state so it doesn't
        // matter which WSG we connect to (but it does for RECONNECT). Reconnect
        // will have it's own timeout function going... so don't interfere with that by
        // introducing another one.
        tryMultiWsg = (typeof that.wsgTries !== 'undefined' && typeof that.wsgTries[0] !== 'undefined' && that.wsgTries[0] !== null);
        if (that.trynextwsgTimeout === null && tryMultiWsg && that.connectionState === "DISCONNECTED") {
            that.trynextwsgTimeout = setInterval(function () {

                var lastUrl = that.url; // whatever url the most recently created WebSocket object is trying to connect to.
                var cb = callback;
                var needReload = false;

                // If another attempt available, then try to make that connection.
                // NOTE: that.curConnectionAttempt is set to zero (0) when this whole
                // class is instantiated.
                if (that.curConnectionAttempt < that.maxConnectionAttempts) {
                    that.url = that.wsgTries[that.curConnectionAttempt]; // the new url to try with a new WebSocket object.
                    that.curConnectionAttempt += 1; // increment this for the next time through.

                    console.log("FS.MessageWebSocketConnection.prototype.setupMultiConnect: trynextwsgTimeout: trying - " + that.url);
                    // if Firefox/IE on HTTP and starting to do WSS then switch over the HTTPS. Chrome/Safari are ok with HTTP/WSS.
                    if ((lastUrl.indexOf("ws://") !== -1) && (that.url.indexOf("wss://") !== -1)) { // see if switching from ws to wss.
                        var loc = "" + window.location;
                        if (typeof loc !== 'undefined' && loc.indexOf("http://") != -1) {
                            needReload = true;
                            that.curWindowLocation = "https://" + loc.substring(7); // used to avoid security violations for IE10... see this.websocket.onclose for more info.
                            window.location = "https://" + loc.substring(7);
                        }
                    }

                    if (!needReload) {
                        that.connect(cb); //************** Call "connect" again since new target url in that.url.
                    }

                } else {
                    // Otherwise, clear everything out, call the callback from the original .connect, and bail.
                    alert("Unable to establish a connection to Dominion Online.");
                    console.log("FS.MessageWebSocketConnection.prototype.connect: trynextwsgTimeout: FAILED. No more attempts.");
                    that.sendGATag('/websockets2/trynextwsgTimeout-FAILED');
                    that.gaveUp = true;
                    clearInterval(that.trynextwsgTimeout);
                    that.trynextwsgTimeout = null;
                    that.webSocketAttempts.length = 0; // clear all references to the websocket objects used in the attempts.
                    if (typeof cbcalled !== 'undefined' && cbcalled === false) {  // If the connection fails we MUST notify the callback function
                        cbcalled = true;
                        if (cb) {
                            cb({errNum: 1, errMssg: "WSG connect error - all attempts failed."})
                        }
                        ;  // original callback passed into ".connect" method.
                    }
                }
            }, that.trynextwsgTimeLimit);

        }
    };

    // For making the initial WebSocketGateway connection, after the user
    // logs in we are passed a WS url that is stuffed into the cookie. We
    // then use that URL to try to log in to the WSG. If that fails, then
    // this method is called to figure out another URL to try to log into.
    // Initially, we try a different port on the same WSG url. If that fails
    // too, then we try a different WSG altogether.
    FS.MessageWebSocketConnection.prototype.fillWsgTriesArray = function () {
        var that = this
            , _useMultiConnect = false
            , _wsMode = 1  // 0 = http, 1 = https
            , _wsgMax = {"://prod-wsg": 5, "://staging-wsg": 2}
            , _wsgPorts = [{0: "80", 1: "8181"}, {0: "443", 1: "8182"}]
            , _wsgNum = 0
            , _oneHost = true //false
            , _maxWsgMachines = 1
            , _newWsgNum = 1
            , _wsgUrl = null;

        that.wsgTries = [];         // reset it to an empty array (it's currently "null" when we get here).
        that.wsgTries[0] = null;

        if (FS.Debug.all) {
            console.log("FSSDK: fillWsgTriesArray: initial WSG url: " + that.url);
        }

        //--------------------------------------------------------------------------------------
        // This is what our initial websocket url will look like:  ws://prod-wsg03.goko.com:80
        //--------------------------------------------------------------------------------------

        // Isolate the parts of the websocket url being provided.
        var _idx1 = that.url.indexOf(":");          // find the first ":" which denotes the protocol (i.e., "ws:","wss:","http:","https:")
        //var _idx2 = that.url.search(".goko");       // find the subdomain (in a non-staging/non-production environment this may be useless).
        var _idx3 = that.url.lastIndexOf(":");      // find the separator before the port number.
        var _portNum = that.url.substr(_idx3 + 1);    // grab the current port number after the end of ".com:" (to the end of the string).

        // If not a consumer port number or not a client browser then bail (i.e., we use other ports for internal systems).
        if (typeof window !== 'undefined' && window !== null && typeof window.location !== 'undefined' && window.location !== null) {
            if (_portNum === "8181" || _portNum === "80" || _portNum === "8182" || _portNum === "443") {
//                var _loc = ""+window.location;   // Check above determines if we're in a client browser (i.e., not node.js) 
//                _wsMode = (_loc.indexOf("https://") != -1) ? 1 : 0;  // 0 = http, 1=https
                _useMultiConnect = true;
            }
        }

        if (!_useMultiConnect) {
            if (FS.Debug.all) {
                console.log("FSSDK: fillWsgTriesArray: not a consumer URL or not a client browser... bailing.");
            }
            return; // we're not in a client browser -- could be node -- either way, bail.
        }

        if (_idx1 === -1 || _idx3 === -1 || _idx1 === _idx3) {
            if (FS.Debug.all) {
                console.log("FSSDK: fillWsgTriesArray: url string index numbers aren't right... bailing.");
            }
            return; // something's not right, we can't find the usual separators... bail and don't try multi-connect.
        }
//         else if (_idx2===-1) {
//             _idx2 = _idx3;  // means the url looks something like this ws://localhost, ws://127.0.0.1, ws://beta ... so grab the whole thing.
//         }


        // Determine how many iterations we should do based on the subdomain (prod/staging/dev machines).
        _maxWsgMachines = 2; // wss.prod.dominion.makingfun.com
        _wsgUrl = that.url.substr(_idx1, _idx3 - _idx1 + 1); // Takes everything between the first ":" and the last ":" inclusive.
        var _wsgSubdomain = "";
//        var _wsgSubdomain = this.url.substr(_idx1,_idx2-_idx1-2);
//         if (_wsgSubdomain in _wsgMax) {
//             _maxWsgMachines = _wsgMax[_wsgSubdomain];
//             _wsgNum = that.url.substr(_idx2-2,2); // grab the "XX" part of "prod-wsgXX.goko.com"
//             _newWsgNum = parseInt(_wsgNum);
//         } else {
//             _oneHost = true;
//             _maxWsgMachines = 2; // 2 ws ports, 2 wss ports -- all on same machine. If already in https mode, then just wss ports.
//             _newWsgNum = 0; // here for conformity sake in the loop below.
//             _wsgUrl = that.url.substr(_idx1,_idx3-_idx1+1); // Takes everything between the first ":" and the last ":" inclusive.
//         }
        var _maxWsgAttempts = (_maxWsgMachines * 2);    // max num WSG machines we know about * 2 ports each. "-1" because one entry already in the cookie.	    

        // Below we alternate machines and ports because if we make two consecutive requests to the same
        // machine but different ports then the browser stacks these up so they are serial requests. This
        // means if the first request takes 20 seconds to timeout it will delay the 2nd request by 20 seconds.
        // Alternating machines and ports allows us to try to find a compatible connection in the shortest amount of time.
        var _tryNum = (_wsMode === 0) ? 0 : _maxWsgMachines; // if user already in https mode, only try https ports.
        for (var _cnt = 0; _tryNum < _maxWsgAttempts; _tryNum++, _cnt++) {
            _portNum = (_tryNum < _maxWsgMachines) ? _wsgPorts[0][_cnt & 0x1] : _wsgPorts[1][_cnt & 0x1]; // For one run of all machines use HTTP... then try HTTPS.
            that.wsgTries[_cnt] = (_tryNum < _maxWsgMachines) ? "ws" : "wss";
            that.wsgTries[_cnt] += (_oneHost) ? _wsgUrl : _wsgSubdomain + ((_newWsgNum < 10) ? "0" : "") + _newWsgNum + ".goko.com:";
            that.wsgTries[_cnt] += _portNum;
            _newWsgNum = (_newWsgNum === _maxWsgMachines) ? 1 : _newWsgNum + 1;   // Move to the next WSG machine.
            if (FS.Debug.all) {
                console.log("FSSDK: fillWsgTriesArray: wsgTries[" + _cnt + "]: " + that.wsgTries[_cnt]);
            }
        }

        // assign the first url to try out of the calculated ones.
        this.url = that.wsgTries[0];
        // Record the max connection URL's we have.
        this.maxConnectionAttempts = that.wsgTries.length;

        //JQS - for now only want a max of 5 tries on production (assuming start with http, not https) -- 3 ws://, 2 wss://
// 		var _tmpUrl = "";
// 		if (_wsgSubdomain==="://prod-wsg" && _wsMode===0) {
// 			_tmpUrl = that.wsgTries[3];
// 			that.wsgTries[3] = that.wsgTries[8];
// 			that.wsgTries[8] = _tmpUrl;
// 			_tmpUrl = that.wsgTries[4];
// 			that.wsgTries[4] = that.wsgTries[9];
// 			that.wsgTries[9] = _tmpUrl;
// 			that.maxConnectionAttempts = _maxWsgMachines; // try 3 ws / 2 wss attempts and then fail over to comet.
// 		} else if (_wsgSubdomain==="://staging-wsg" && _wsMode===0) {
// 			_tmpUrl = that.wsgTries[1];
// 			that.wsgTries[1] = that.wsgTries[3];
// 			that.wsgTries[3] = _tmpUrl;
// 			that.maxConnectionAttempts = _maxWsgMachines;
// 		}

    };


    //=================================================================================================================
    //                  RECONNECT LOGIC
    //=================================================================================================================

    /**
     * returns t/f if reconnect is enabled/appropriate
     *
     * @function
     */
    FS.MessageWebSocketConnection.prototype.useReconnect = function () {
        //  if this is not a player, do not try to reconnect
        if (this.connIsUser === true && this.reconnectTimeLimit !== 0) {
            return true;
        }

        return false;
    };

    FS.MessageWebSocketConnection.prototype.startReconnect = function (e) {

        var self = this,
            reconnectTimeout = 3000; // 3 seconds between reconnect attempts.


        if (!self.useReconnect()) {
            self.sendGATag('/websockets2/startreconnect_top__reconnect_off');
            return;
        }

        //----------------------------------------------------------------------------------
        // IF NO OVERALL "RECONNECT" TIMEOUT EXISTS YET, CREATE IT. IF THIS FIRES, WE BAIL.
        //----------------------------------------------------------------------------------
        if (self.closeTimeout === null && self.connectionState === "CONNECTED") {
            //*****************************************************************
            // *****  THIS IS THE ONLY PLACE THAT "RECONNECTING" GETS SET *****
            //*****************************************************************
            // Only put state as RECONNECTING if we were CONNECTED. Otherwise, when the
            // overall reconnect timeout hit (function below) there may still be an
            // outstanding connection attempt and, if that fails, we'd hit "onclose" or
            // "onerror" again and end up starting all the reconnect stuff over again from scratch.
            self.connectionState = "RECONNECTING";

            self.closeTimeout = setTimeout(function () {
                var err = e; // e is passed in from where this is called in onerror/onclose.
                self.sendGATag('/websockets2/reconnect_overall_timeout_fired');

                // clear any reconnect timer -- we're done trying.
                if (self.reconnectTimeout != null) {
                    clearTimeout(self.reconnectTimeout);
                    self.reconnectTimeout = null;
                }

//JQS-ERROR --- cbcalled is inside a closure now (with the setTimeout above) so no wonder it can't
//              see it. Instead see if I can/should make this a "this" or "that" var so I can get
//              to it again.

                if (FS.Debug.all) {
                    console.log("FS.MessageWebSocketConnection.startReconnect: overall reconnect timeout fired - giving up!");
                }
                // If the connection fails we MUST notify the callback function
                if (typeof cbcalled !== 'undefined' && cbcalled === false) {
                    cbcalled = true;
                    if (callback) {
                        callback();
                    }
                }

                // clear everything out -- we're done trying.
                self.webSocket = null;
                self.closeTimeout = null;
                self.connectionState = "DISCONNECTED";
                self.trigger(self.stateError, err);

//JQS - RECONNECT DONE - If hit this need to let user know we're giving up. No reconnect possible.


            }, self.reconnectTimeLimit);
        }

        //----------------------------------------------------------------------------------
        // IF WAITING ON PREVIOUS RECONNECT ATTEMPT OR NOT IN RECONNECTING MODE, THEN BAIL.
        //----------------------------------------------------------------------------------
        if (self.reconnectTimeout !== null || self.connectionState !== "RECONNECTING") {
            if (FS.Debug.all) {
                console.log("FS.MessageWebSocketConnection.startReconnect: bail -- existing reconnect attempt.");
            }
            console.log("FS.MessageWebSocketConnection.startReconnect: bail -- existing reconnect attempt.");
            return;
        }

        //----------------------------------------------------------------------------------
        // START TRYING TO RECONNECT
        //----------------------------------------------------------------------------------
        self.sendGATag('/websockets2/startReconnect_initating_a_reconnect');

        // eliminate the reference to the current WebSocket object -- it's no longer valid.
        self.webSocket = null;

        // See if the reconnect message already exists on top of the "sentMessageBuffer" queue (i.e., don't create another one)
        var createReconnMssg = (self.sentMessageBuffer.length > 0 && typeof self.sentMessageBuffer[0].mssg !== 'undefined' && self.sentMessageBuffer[0].mssg.indexOf("Reconnect") !== -1) ? false : true;
        if (createReconnMssg) {
            var reconnectMessage = self.messageFactory.create("Reconnect", {  //Reconnect
                message: "Reconnect",
                destination: ""
            }, false, self.getKey(), self.getIV());
            reconnectMessage.sqN = self.cliSeqNum++; // insert client sequence number for this message.
            reconnectMessage.sqA = self.srvSeqNum; // we've seen up to (and including) this server sequence number.
//    		self.connectionState = "RECONNECTING";
            var stringReconnectMessage = JSON.stringify(reconnectMessage);

            // add the reconnect message to the top of the sentMessageBuffer queue.
            var bufferObject = {sqN: reconnectMessage.sqN, mssg: stringReconnectMessage};
            if (self.sentMessageBuffer.length > 0) {
                self.sentMessageBuffer.unshift(bufferObject); // if something in the array already, unshift it.
            }
            else {
                self.sentMessageBuffer.push(bufferObject); // if array is intially empty, then push it.
            }
        }

        // If this is the first time doing a reconnect, then don't wait around - do it pretty much immediately (10ms)
        // Otherwise, wait a few seconds after we got the previous "onclose" before trying again.
        // Do a reconnect pretty much immediately (there's no reason to wait around)
        self.reconnectTimeout = setTimeout(function () {
            self.connect()
        }, ((createReconnMssg === true) ? 10 : reconnectTimeout));
    };


    FS.MessageWebSocketConnection.prototype.sendBufferedMessages = function () {
        var that = this;

        if (that.connIsUser === true && typeof that.sentMessageBuffer !== 'undefined' && that.sentMessageBuffer.length > 0) {
            if (FS.Debug.all) {
                console.log("FS.MessageWebSocketConnection.prototype.sendBufferedMessages: sending messages that were buffered while disconnected (" + that.sentMessageBuffer.length + ")");
            }
            var numToSend = that.sentMessageBuffer.length;
            for (var i = 0; i < numToSend; i++) {
                if (typeof that.sentMessageBuffer[i] !== 'undefined' && that.sentMessageBuffer[i] !== null) {
                    that._send(that.sentMessageBuffer[i].mssg, false, 0); // "false" = don't buffer these messages (they're already buffered - we're resending them).
                    if (FS.Debug.message.status && (that.sentMessageBuffer[i].mssg.toLowerCase().indexOf('password') === -1)) {
                        console.log("--B> " + that.sentMessageBuffer[i].mssg);
                    }
                }
            }
        }
    };


    FS.MessageWebSocketConnection.prototype.purgeSentMessageBuffer = function (rcvdMessage) {
        var self = this, doneChecking = false;

        // If there is an "ACK" message number in this message, then purge sent mssg buffer thru that mssg #.
        // Also, only purge if ACK num is greater than what we've seen before.
        if (self.connIsUser === true && typeof rcvdMessage.sqA !== 'undefined' && rcvdMessage.sqA !== null && rcvdMessage.sqA > self.cliSeqNumAck) {
            while (self.sentMessageBuffer.length > 0 && typeof self.sentMessageBuffer[0] !== 'undefined' && self.sentMessageBuffer[0] !== null && !doneChecking) {
                if (typeof self.sentMessageBuffer[0].sqN === 'undefined') { // if not participating in the seqNum scheme, then just remove it.
                    if (FS.Debug.all && (self.sentMessageBuffer[0].mssg.toLowerCase().indexOf('password') === -1)) {
                        console.log("purgeSentMessageBuffer: buffered client mssg had undefined sqN -- removing from buffer: " + self.sentMessageBuffer[0].mssg);
                    }
                    self.sentMessageBuffer.shift(); // take [0] out of the array.
                } else if (self.sentMessageBuffer[0].sqN === null || self.sentMessageBuffer[0].sqN <= rcvdMessage.sqA) {
                    if (FS.Debug.all) {
                        console.log("purgeSentMessageBuffer: removing from buffered mssgs: " + self.sentMessageBuffer[0].sqN);
                    }
                    self.sentMessageBuffer.shift(); // take [0] out of the array.
                } else {
                    doneChecking = true;
                }
            }
            // Save the new value.
            self.cliSeqNumAck = rcvdMessage.sqA;
        }
    };

    FS.MessageWebSocketConnection.prototype.sendGATag = function (gaReportingUrl) {
        var nowDate = new Date();
        var tzOffset = -nowDate.getTimezoneOffset() / 60;
        var localHr = nowDate.getHours();
        var localMin = nowDate.getMinutes();
        var utcHr = nowDate.getUTCHours();
        var utcMin = nowDate.getUTCMinutes();
        var tzString = "GMT" + tzOffset;

        if (typeof _gaq !== 'undefined' && _gaq) {
            _gaq.push(['_trackPageview', gaReportingUrl]);
            _gaq.push(['_trackPageview', gaReportingUrl + "_local/" + tzString + '/' + localHr + '/' + (Math.floor(localMin / 10) * 10)]);
            _gaq.push(['_trackPageview', gaReportingUrl + "_global/" + utcHr + '/' + tzString + '/' + (Math.floor(utcMin / 10) * 10)]);
        }
    };

    FS.MessageWebSocketConnection.parseStringMessage = function (stringMessage) {
        var parsedJsonMsgObjects = [];
        if (stringMessage) {
            try {
                var message = JSON.parse(stringMessage);
                parsedJsonMsgObjects.push(message);
            } catch (err) {
                if (FS.Debug.notice) {
                    console.log("stringMessage did not parse as single JSON message. Attempt to split into separate JSON strings");
                }
                var newStringMessage = stringMessage.replace(/}{/g, "}@SPLITHERE@{");
                var newStringFragments = newStringMessage.split("@SPLITHERE@");
                var i;
                for (i = 0; i < newStringFragments.length; i++) {
                    try {
                        var message = JSON.parse(newStringFragments[i]);
                        parsedJsonMsgObjects.push(message);
                    } catch (err2) {
                        if (FS.Debug.error) {
                            console.log("ERROR: unable to parse stringMessage:", stringMessage, err2.stack);
                        }
                    }
                }
                if (FS.Debug.notice) {
                    console.log("Number of parsed JSON messages:", parsedJsonMsgObjects.length);
                }
                if (FS.Debug.all) {
                    console.log("parsed JSON messages: ", parsedJsonMsgObjects);
                }
            }
        }
        return parsedJsonMsgObjects;
    };

//================ TEMP CODE ================
// NOTE: There is some matching code in FS.MessageWebSocketConnection.prototype.sendRequest

    FS.MessageWebSocketConnection.prototype.TestForConnectionClosedDuringGame = function (message) {
        var self = this;
        // determine if we are in a game when receive the "ConnectionClosed" message --- GA alert if we are.
        if (message.message === "GameServerHello") {
            var tmpSrc = message.source.substring(0, 54);
            if (typeof message.source !== 'undefined' && message.source !== null && message.source.substring(0, 54) === "game:4f4120146071b0e4dada0f66.4f2c83e7af8ebabc42284370") {
                self.sendGATag('/websockets2/gameserverhello');
                self.jqsInGame = true;
            }
        }
    };

//===========================================


    /**
     * Binds the given callback to eventName. Currently supported events are: "message" and "error:status". The thisObject will be the
     * this object of the callback function if provided.
     *
     * @function
     * @name FS.MessageWebSocketConnection.prototype.bind
     * @param eventName
     * @param callback
     * @param thisObject
     */


    FS.TestLib = {};

    // Returns a FS.Connection object and a FSDevInfo Structure
    // Takes in a FSTestFixture object
    /*
     *
     * FSTest_Fixture object
     *
     var fixture = {
     "nodebug" : true,
     "email" : "A_dev_email@domain.com",
     "password" : "Dev_password",
     "status" : true,        // status is whether the developer is in the "enabled" state, i.e. allowed to login
     "games" : {
     "game1" : {
     "name" : "game1",
     "enabled" : "Live", 
     "achievementTemplates" : [
     { 
     currentUnlockPoints: 0, //(optional) 
     name: "achievementTemp1",
     tags: [ "foo", "bar" ], // <array of string>,(optional) 
     developer: "A_dev_email@domain.com",    // Ignored, we assume is this developer
     recommended: true,
     customId: 123,      // (optional) 
     icon: "http://dev.funsockets.com/foo/bar", //(optional) 
     maximumUnlockPoints: 100,
     imageList: [    // <array of AchievementImageData>,(optional) 
     {   name: "image1", format: "png", newRating: 1, dimensions: "10x10", link: "http://foo.com/bar.png", size: 10000 },
     {   name: "image2", format: "jpg", newRating: 2, dimensions: "20x20", link: "http://foo.com/bar.jpg", size: 20000 }
     ],
     description: "The first achievement" // (optional) 
     }
     ]
     }, 
     "game2" : { "name" : "game2", "enabled" : "Development" }
     },
     "playerPools" : {
     "pool1" : { 
     "name" : "pool1",
     "games" : {
     "game1" : { 
     "name" : "game1", 
     "rooms" : {
     "room1" : { "name" : "room1", "tables" : 10, "seats" : 4, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room2" : { "name" : "room2", "tables" : 11, "seats" : 5, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room3" : { "name" : "room3", "tables" : 12, "seats" : 6, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room4" : { "name" : "room4", "tables" : 13, "seats" : 7, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room5" : { "name" : "room5", "tables" : 14, "seats" : 8, "minimumToStart" : 3, "maxPlayers" : 4 }
     }
     },
     "game2" : { 
     "name" : "game2", 
     "rooms" : {
     "room1" : { "name" : "room1", "tables" : 10, "seats" : 4, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room2" : { "name" : "room2", "tables" : 11, "seats" : 5, "minimumToStart" : 3, "maxPlayers" : 4 }
     }
     }    // For now these must be games that this dev owns
     }
     }
     }, 
     "players" : {
     "Alice" : { "name" : "Alice", "password" : "test123", "email" : "alice@fdev.com", "playerPool" : "pool1", "enable" : true },
     "Bill" : { "name" : "Bill", "password" : "test123" , "email" : "bill@fdev.com", "playerPool" : "pool1", "enable" : false },
     "Carol" : { "name" : "Carol", "password" : "test123" , "email" : "carol@fdev.com", "playerPool" : "pool1", "enable" : true }
     }
     };
     *
     * FSTest_DevInfo object
     *
     var dev_info = {
     conn = <FS.Connection object>
     devInfo = {
     "developerId" : "q23452323",
     "email" : "dev_email@domain.com",
     "password" : "password",
     "authorizationAgents" : [
     { 
     "authorizationAgent" : "Local",
     "email" : usr,
     "status" : true 
     }
     ],
     "games" : {
     "game1" = { "name" : "game1", "gameId" : "1234568", "status" : "Live" },
     "game2" = { "name" : "game2", "gameId" : "1234567", "status" : "Development" }
     },
     "gameIds" : {
     "1234568" = { "name" : "game1", "gameId" : "1234568", "status" : "Live" },
     "1234567" = { "name" : "game2", "gameId" : "1234567", "status" : "Development" }
     }, 
     "playerPools" : {
     "pool1" = { "name" : "pool1", "playerPoolId" : "7654321", "games" : {
     "game1" : { 
     "name" : "game1", 
     "rooms" : {
     "room1" : { "name" : "room1", "roomId" : "234561", "tables" : 10, "seats" : 4, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room2" : { "name" : "room2", "roomId" : "234562", "tables" : 11, "seats" : 5, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room3" : { "name" : "room3", "roomId" : "234563", "tables" : 12, "seats" : 6, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room4" : { "name" : "room4", "roomId" : "234564", "tables" : 13, "seats" : 7, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room5" : { "name" : "room5", "roomId" : "234565", "tables" : 14, "seats" : 8, "minimumToStart" : 3, "maxPlayers" : 4 }
     }
     },
     "game2" : { 
     "name" : "game2", 
     "rooms" : {
     "room1" : { "name" : "room1", "roomId" : "32"tables" : 10, "seats" : 4, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room2" : { "name" : "room2", "tables" : 11, "seats" : 5, "minimumToStart" : 3, "maxPlayers" : 4 }
     }
     }
     }
     },
     "playerPoolsIds" : {
     "7654321" = { "name" : "pool1", "playerPoolId" : "7654321", "games" : {
     { "name" : "game1",
     "rooms" : {
     "234561" : { "name" : "room1", "roomId" : "234561", "tables" : 10, "seats" : 4, "minimumToStart" : 3, "maxPlayers" : 4 },
     "234562" : { "name" : "room2", "roomId" : "234562", "tables" : 11, "seats" : 5, "minimumToStart" : 3, "maxPlayers" : 4 },
     "234563" : { "name" : "room3", "roomId" : "234563", "tables" : 12, "seats" : 6, "minimumToStart" : 3, "maxPlayers" : 4 },
     "234564" : { "name" : "room4", "roomId" : "234564", "tables" : 13, "seats" : 7, "minimumToStart" : 3, "maxPlayers" : 4 },
     "234565" : { "name" : "room5", "roomId" : "234565", "tables" : 14, "seats" : 8, "minimumToStart" : 3, "maxPlayers" : 4 }
     }
     }
     { "name" : "game2",
     "rooms" : {
     "234566" : { "name" : "room1", "roomId" : "234566", "tables" : 10, "seats" : 4, "minimumToStart" : 3, "maxPlayers" : 4 },
     "234567" : { "name" : "room2", "roomId" : "234567", "tables" : 11, "seats" : 5, "minimumToStart" : 3, "maxPlayers" : 4 }
     }
     }
     }
     }
     },
     "players" : {
     "Alice" : { "name" : "Alice", "password" : "test123", "playerPool" : "pool1", "enable" : true, "playerId" : "abcdef" },
     "Bill" : { "name" : "Bill", "password" : "test123" , "playerPool" : "pool1", "enable" : false, "playerId" : "abcde2" },
     "Carol" : { "name" : "Carol", "password" : "test123" , "playerPool" : "pool1", "enable" : true, "playerId" : "abcde3" }
     },
     "playerIds" : {
     "abcdef" : { "name" : "Alice", "password" : "test123", "playerPool" : "pool1", "enable" : true, "playerId" : "abcdef" },
     "abcde2" : { "name" : "Bill", "password" : "test123" , "playerPool" : "pool1", "enable" : false, "playerId" : "abcde2" },
     "abcde3" : { "name" : "Carol", "password" : "test123" , "playerPool" : "pool1", "enable" : true, "playerId" : "abcde3" }
     }
     }
     };
     *
     */
    FS.TestLib.InsureFixture = function (laddr, fixture, donefunc) {
        var devInfo = {httpUrl: laddr};

        function onInsureBots(success) {
            if (success === false) {
                donefunc(false, "Failed to create bots for fixture");
            } else {
                donefunc(true, devInfo);
            }
        }

        function onInsurePlayers(success) {
            if (success === false) {
                donefunc(false, "Failed to create players for fixture");
            } else {
                //FS.TestLib.InsureBotsExist(fixture, devInfo, onInsureBots);
                donefunc(true, devInfo);
            }
        }

        function onInsureRooms(success) {
            if (success === false) {
                donefunc(false, "Failed to create rooms for fixture");
            } else {
                FS.TestLib.InsurePlayersExist(fixture, devInfo, onInsurePlayers);
            }
        }

        function onInsurePools(success) {
            if (success === false) {
                donefunc(false, "Failed to create pools fixture");
            } else {
                FS.TestLib.InsureRoomsExist(fixture, devInfo, onInsureRooms);
            }
        }

        function onInsureAchieveTemplates(success) {
            if (success === false) {
                donefunc(false, "Failed to create achievementTemplates fixture");
            } else {
                FS.TestLib.InsurePoolsExist(fixture, devInfo, onInsurePools);
            }
        }

        function onInsureGame(success) {
            if (success === false) {
                donefunc(false, "Failed to create games fixture");
            } else {
                FS.TestLib.InsureAchievementTemplatesExist(fixture, devInfo, onInsureAchieveTemplates);
            }
        }

        function onInsureDev(success) {
            if (success === false) {
                donefunc(false, "Failed to create developer for fixture");
            } else {
                FS.TestLib.InsureGamesExist(fixture, devInfo, onInsureGame);
            }
        }

        FS.TestLib.InsureDevExists(laddr, fixture, devInfo, onInsureDev);
    };

    FS.TestLib.InsureBotsExist = function (fixture, devInfo, successfunc) {
        FS.Debug.message.transaction = true;

        var jq = new FS.JobQueue();
        var games = {};
        var conn = devInfo.conn;

        var bots = fixture.bots;
        var botPlayers = fixture.botPlayers;
        var botList = {};

        function findAndCreateBots(input) {
            var test = this,
                name = input.name;

            function onGetBotId(resp) {
                if (resp.data.code !== 0) {
                    conn.createBot({
                        gameId: devInfo.games[input.game].gameId,
                        name: name
                    }, onCreateBot);
                } else {
                    conn.getBot({botId: resp.data.botId}, onGetBot);
                }
            }

            function onCreateBot(resp) {
                if (resp.data.code !== 0) {
                    test.error("Could not create bot");
                } else {
                    conn.getBot({botId: resp.data.botId}, onGetBot);
                }
            }

            function onGetBot(resp) {
                if (resp.data.code !== 0 ||
                    resp.data.botGameId === undefined) {
                    test.error("Game existed with bot name (collision)");
                    return;
                } else {
                    devInfo.bots[name] = resp.data;
                    test.done();
                }
            }

            conn.getBotId({name: input.name}, onGetBotId);
        }

        function findAndCreateBotPlayers(input) {
            var test = this;

            var pool = devInfo.playerPools[input.playerPool].playerPoolId;
            var bot = devInfo.bots[input.bot].botGameId;

            function onAddBotPlayer(resp) {
                if (resp.data.code !== 0) {
//                    test.error("Could not add player");
                    test.done();
                } else {
                    devInfo.botPlayers[input.name] = resp.data;
                    test.done();
                }
            }

            conn.addBotPlayer({
                playerPoolId: pool,
                botId: bot,
                name: input.name
            }, onAddBotPlayer);
        }

        var botJobs = {},
            name;

        devInfo.bots = {};
        devInfo.botPlayers = {};

        for (name in fixture.bots) {
            botJobs[name] = new jq.Job(findAndCreateBots, fixture.bots[name]);
        }
        for (name in fixture.botPlayers) {
            var j = new jq.Job(findAndCreateBotPlayers, fixture.botPlayers[name]);
            j.require(botJobs[fixture.botPlayers[name].bot]);
        }

        jq.bind('error', function (err) {
            console.log(err.error);
            successfunc(false);
        });
        jq.bind('complete', function () {
            successfunc(true);
        });
        jq.start();
    };

    // InsurePlayersExist
    //  Parameters:
    //      fixture = a FSTest_Fixture object (see above) containing info about players to create
    //      devInfo = The devInfo built up so far (conn, developer, pools and games should exist)
    //      successfunc = function to call upon completion
    //  success function prototype : successfunc(boolean, PlayerNameObj, PlayerIdObj)
    /* 
     var PlayerNameObj = {
     "Alice" : { "name" : "Alice", "password" : "test123", "playerPool" : "pool1", "enable" : true, "playerId" : "abcdef" },
     "Bill" : { "name" : "Bill", "password" : "test123" , "playerPool" : "pool1", "enable" : false, "playerId" : "abcde2" },
     "Carol" : { "name" : "Carol", "password" : "test123" , "playerPool" : "pool1", "enable" : true, "playerId" : "abcde3" }
     }
     var PlayerIdObj  = {
     "abcdef" : { "name" : "Alice", "password" : "test123", "playerPool" : "pool1", "enable" : true, "playerId" : "abcdef" },
     "abcde2" : { "name" : "Bill", "password" : "test123" , "playerPool" : "pool1", "enable" : false, "playerId" : "abcde2" },
     "abcde3" : { "name" : "Carol", "password" : "test123" , "playerPool" : "pool1", "enable" : true, "playerId" : "abcde3" }
     }
     */
    FS.TestLib.InsurePlayersExist = function (fixture, devInfo, successfunc) {
        var players = fixture.players;
        var num = ( players === undefined ? 0 : Object.keys(players).length );
        if (num === 0) {
            successfunc(true);
            return;
        }

        var error = null;
        var names = {};
        var ids = {};
        var handleCreate;
        var handleEnable;
        var handleGet;
        var connInfo = new FS.ConnectionInfo(devInfo.httpUrl, {});

        var getPlayers = function () {
            if (error !== null) {
                successfunc(false);
            } else {
                var gotten = false;
                num = 1;    // add a "place holder" to avoid a race condition
                var name;
                ///*      Hack until strange platfor issue reslt
                for (name in players) {
                    num += 1;
                    gotten = true;
                    devInfo.conn.getPlayer({
                        developerId: devInfo.developerId,
                        playerId: names[name].playerId
                    }, handleGet);
                }
                //*/
                num -= 1;  // We we are done manipulating numGames, so remove our place holder
                if (num === 0 && gotten === false) {
                    devInfo.players = names;
                    devInfo.playerIds = ids;
                    successfunc(true);
                }
            }
        };

        var enablePlayers = function () {
            if (error !== null) {
                successfunc(false);
            } else {
                var enabled = false;
                num = 1;    // add a "place holder" to avoid a race condition
                var name;
                var make_handler = function (playerId) {
                    return function (resp) {
                        handleEnable(resp, playerId);
                    };
                };
                for (name in players) { // We now need to set the enabled flag properly
                    if (names[name].enabled !== players[name].enabled && typeof ids["disabled_" + name] === "undefined") {
                        enabled = true;
                        num += 1;
                        var playerId = names[name].playerId;
                        devInfo.conn.enablePlayer({
                            playerId: playerId,
                            enabled: players[name].enabled
                        }, make_handler(playerId));
                    }
                }
                num -= 1;  // We we are done manipulating numGames, so remove our place holder
                if (num === 0 && enabled === false) {
                    getPlayers();
                }
            }
        };

        var createPlayers = function () {
            var cnt = ( players === undefined ? 0 : Object.keys(players).length );
            var created = false;
            if (cnt > 0) {  // There are players for us to create
                num = 1;    // add a "place holder" to avoid a race condition
                var pname;
                for (pname in players) {    // create any missing players
                    if (typeof names[pname] === "undefined") {    // We didn't log into this player
                        created = true;
                        num += 1;
                        var pool = devInfo.playerPools[players[pname].playerPool].playerPoolId;
                        devInfo.conn.createPlayer({
                            name: pname,
                            email: players[pname].email,
                            playerPoolId: pool,
                            authorization: players[pname].authorization
                        }, handleCreate);
                    }
                }
                num -= 1;    // We we are done manipulating num, so remove our place holder
            }
            if (num === 0 && created === false) {        // There are no players to create
                enablePlayers();
            }
        };

        var handleLogin = function (resp) {
            num -= 1;
            if (resp.data.code === 0 && resp.data.code === 84) {    // Player disabled
                names[resp.data.name] = resp.data;
                ids["disabled_" + resp.data.name] = resp.data;
            }
            if (resp.data.code === 0) {
                names[resp.data.name] = resp.data;
                ids[resp.data.playerId] = resp.data;
            } // else not an error for the login to fail if the player doesn't exist yet.

            if (num === 0) {        // We have all logged in all players we can, now create missing players
                createPlayers();
            }
        };

        handleCreate = function (resp) {
            num -= 1;
            if (resp.data.code === 0) {
                names[resp.data.name] = resp.data;
                ids[resp.data.playerId] = resp.data;
            } else {
                error = "Can't create player";
            }
            if (num === 0) {    // We have created all missing players
                enablePlayers();
            }
        };

        handleEnable = function (resp, playerId) {
            num -= 1;
            if (resp.data.code === 0) {
                var name = ids[playerId].name;
                names[name].enabled = players[name].enabled;
                ids[playerId].enabled = players[name].enabled;
            } else {
                error = "Can't enable player";
            }

            if (num === 0) {
                // All players are now set properly, use get to get all the latest values
                getPlayers();
            }
        };

        handleGet = function (resp) {
            num -= 1;
            if (resp.data.code === 0) {
                resp.data.status = ids[resp.data.playerId].enabled;
                names[resp.data.name] = resp.data;
                ids[resp.data.playerId] = resp.data;
            } else {
                error = "Can't get player";
            }

            if (num === 0) {
                devInfo.players = names;
                devInfo.playerIds = ids;
                successfunc(error === null);
            }
        };

        // First start by getting the info from any players we know we have
        if (num > 0) {
            var player;
            for (player in players) {
                var pool = devInfo.playerPools[players[player].playerPool].playerPoolId;
                connInfo.loginPlayer({playerPoolId: pool, authorization: players[player].authorization}, handleLogin);
            }
        } else {
            createPlayers(); // call the Get completion routine to start the Creates
        }
    };


    // InsureRoomsExist
    //  Parameters:
    //      fixture = a FSTest_Fixture object (see above) containing info about players to create
    //      devInfo = The devInfo built up so far (conn, developer, pools and games should exist)
    //      successfunc = function to call upon completion
    //  success function prototype : successfunc(boolean, PlayerNameObj, PlayerIdObj)
    /* 
     var RoomNameObj = {
     "room1" : { "name" : "room1", "roomId" : "abcde6", "tables" : 10, "seats" : 4, "minimumToStart" : 3, "maxPlayers" : 4 },
     "room5" : { "name" : "room5", "roomId" : "abcde4", "tables" : 14, "seats" : 8, "minimumToStart" : 3, "maxPlayers" : 4 }
     }
     var RoomIdObj  = {
     "abcde6" : { "name" : "room1", "roomId" : "abcde6", "tables" : 10, "seats" : 4, "minimumToStart" : 3, "maxPlayers" : 4 },
     "abcde4" : { "name" : "room5", "roomId" : "abcde4", "tables" : 14, "seats" : 8, "minimumToStart" : 3, "maxPlayers" : 4 }
     }
     */
    FS.TestLib.InsureRoomsExist = function (fixture, devInfo, successfunc) {
        var num = 0;
        var error = null;
        var handleCreate;

        var createRooms = function () {
            var created = false;
            num = 1;    // add a "place holder" to avoid a race condition
            var pool;
            var make_handler = function (createInfo) {
                return function (resp) {
                    handleCreate(resp, createInfo);
                };
            };
            for (pool in fixture.playerPools) {
                var poolId = devInfo.playerPools[pool].playerPoolId;
                var game;
                for (game in fixture.playerPools[pool].games) {
                    var gameId = devInfo.games[game].gameId;
                    var room;
                    for (room in fixture.playerPools[pool].games[game].rooms) {
                        if (typeof devInfo.playerPools[pool].games[game].rooms === "undefined" ||
                            typeof devInfo.playerPools[pool].games[game].rooms[room] === "undefined" ||
                            typeof devInfo.playerPools[pool].games[game].rooms[room].roomId === "undefined") {
                            created = true;
                            num += 1;
                            var createInfo = {
                                playerPoolId: poolId, gameId: gameId, name: room,
                                tables: fixture.playerPools[pool].games[game].rooms[room].tables,
                                seats: fixture.playerPools[pool].games[game].rooms[room].seats,
                                minimumToStart: fixture.playerPools[pool].games[game].rooms[room].minimumToStart,
                                static: true,
                                maxPlayers: fixture.playerPools[pool].games[game].rooms[room].maxPlayers
                            };
                            devInfo.conn.createRoom(createInfo, make_handler(createInfo));
                        }
                    }
                }
            }
            num -= 1;    // We we are done manipulating num, so remove our place holder
            if (num === 0 && created === false) {        // There are no rooms to create
                successfunc(true);
            }
        };

        handleCreate = function (resp, createInfo) {
            num -= 1;
            if (resp.data.code === 0) {
                var rppid = createInfo.playerPoolId;
                var rgid = createInfo.gameId;
                var room = createInfo.name;
                var rppn = devInfo.playerPoolIds[rppid].name;
                var rgn = devInfo.gameIds[rgid].name;
                if (typeof devInfo.playerPools[rppn].games[rgn].rooms === "undefined") {
                    devInfo.playerPools[rppn].games[rgn].rooms = {};
                }
                devInfo.playerPools[rppn].games[rgn].rooms[room] = resp.data;
                devInfo.playerPoolIds[rppid].games[rgn].rooms[room] = resp.data;
            } else {
                error = "Can't create Room";
            }
            if (num === 0) {    // We have created all missing rooms
                successfunc(error === null);
            }
        };

        var handleGet = function (resp) {
            num -= 1;
            if (resp.data.code === 0) {
                // Go through the returned list and put the data for any rooms we care about into the devInfo
                var i;
                for (i = 0; i < resp.data.roomList.length; i += 1) {
                    var rppid = resp.data.roomList[i].playerPoolId;
                    var rgid = resp.data.roomList[i].gameId;
                    var rn = resp.data.roomList[i].name;
                    // Must be in a playerPool we know about
                    if (typeof devInfo.playerPoolIds[rppid] !== "undefined") {
                        var rppn = devInfo.playerPoolIds[rppid].name;
                        // Must be in a Game we know about
                        if (typeof devInfo.gameIds[rgid].name !== "undefined") {
                            var rgn = devInfo.gameIds[rgid].name;
                            if (typeof devInfo.playerPools[rppn].games[rgn].rooms === "undefined") {
                                devInfo.playerPools[rppn].games[rgn].rooms = {};
                            }
                            devInfo.playerPools[rppn].games[rgn].rooms[rn] = resp.data.roomList[i];
                            devInfo.playerPoolIds[rppid].games[rgn].rooms[rn] = resp.data.roomList[i];
                        }
                    }
                }
            }
            if (num === 0) {
                createRooms();
            }
        };

        num = 1;
        var pool;
        for (pool in fixture.playerPools) {
            var poolId = devInfo.playerPools[pool].playerPoolId;
            var game;
            for (game in fixture.playerPools[pool].games) {
                var gameId = devInfo.games[game].gameId;
                num += 1;
                devInfo.conn.getRoomList({gameId: gameId}, handleGet);
            }
        }
        num -= 1;
        if (num === 0) {
            // There are no playerPools and so no rooms to create
            successfunc(true);
        }
    };


    // InsurePoolsExist
    //  Parameters:
    //      fixture = a FSTest_Fixture object (see above) containing info about pools to create
    //      devInfo = The devInfo built up so far (conn, developer and games should exist)
    //      successfunc = function to call upon completion
    //  success function prototype : successfunc(boolean, GamesNameObj, GamesIdObj)
    /* 
     var PoolsNameObj = {
     "pool1" = { "name" : "pool1", "playerPoolId" : "7654321", "games" : {
     "game1" : { "name" : "game1" },
     "game2" : { "name" : "game2" }
     }
     }
     }
     var PoolsIdObj  = {
     "7654321" = { "name" : "pool1", "playerPoolId" : "7654321", "games" : {
     "game1" : { "name" : "game1" },
     "game2" : { "name" : "game2" }
     }
     }
     }
     */
    FS.TestLib.InsurePoolsExist = function (fixture, devInfo, successfunc) {
        var pools = fixture.playerPools;
        var num = devInfo.playerPoolIds.length;
        var error = null;
        var names = {};
        var ids = {};
        var handleCreate;
        var handleAdd;

        function clone(obj) {
            if (null === obj || "object" !== typeof obj) {
                return obj;
            }
            var attr, copy = obj.constructor();
            for (attr in obj) {
                if ("object" === typeof obj[attr]) {
                    copy[attr] = clone(obj[attr]);
                } else {
                    if (obj.hasOwnProperty(attr)) {
                        copy[attr] = obj[attr];
                    }
                }
            }
            return copy;
        }

        var addGames = function () {
            if (error !== null) {
                successfunc(false);
            } else {
                var added = false;
                num = 1;    // add a "place holder" to avoid a race condition
                var name;
                for (name in pools) {   // We now need to add all the games to the pool
                    names[name].games = clone(pools[name].games);
                    ids[names[name].playerPoolId].games = clone(pools[name].games);
                    var game;
                    for (game in pools[name].games) {
                        var gameid = devInfo.games[game].gameId;
                        added = true;
                        devInfo.conn.addGamePlayerPool({
                            playerPoolId: names[name].playerPoolId,
                            gameId: gameid
                        }, handleAdd);
                        num += 1;
                    }
                }
                num -= 1;  // We we are done manipulating num, so remove our place holder
                if (num === 0 && added === false) {
                    devInfo.playerPools = names;
                    devInfo.playerPoolIds = ids;
                    successfunc(true);
                }
            }
        };

        var createPools = function () {
            if (error !== null) {
                successfunc(false);
            } else {
                var created = false;
                num = 1;        // add a "place holder" to avoid a race condition
                var name;
                var make_handler = function (name) {
                    return function (resp) {
                        handleCreate(resp, name);
                    };
                };
                for (name in pools) {   // create any missing games
                    if (typeof names[name] === "undefined") {
                        created = true;
                        num += 1;
                        devInfo.conn.createPlayerPool({name: name}, make_handler(name));
                    }
                }
                num -= 1;  // We we are done manipulating num, so remove our place holder
                if (num === 0 && created === false) { // There are no pools for us to create, so we are done
                    addGames();
                }
            }
        };

        var handleGet = function (resp) {
            num -= 1;
            if (resp.data.code === 0) {
                names[resp.data.name] = resp.data;
                ids[resp.data.playerPoolId] = resp.data;
            } else {
                error = "Failure in getting pool info";
            }
            if (num === 0) {        // We have all existing pool info
                createPools();
            }
        };

        handleCreate = function (resp, name) {
            num -= 1;
            if (resp.data.code === 0) {
                names[name] = resp.data;
                ids[resp.data.playerPoolId] = resp.data;
                ids[resp.data.playerPoolId].name = name;
            } else {
                error = "Failure in Creating pools";
            }
            if (num === 0) {    // We have created all missing pools
                addGames();
            }
        };

        handleAdd = function (resp) {
            num -= 1;
            if (resp.data.code !== 0 && resp.data.code !== 1022) { //OK to ignore already in pool
                error = "Failure in adding games to pool";
            }
            if (num === 0) {
                devInfo.playerPools = names;
                devInfo.playerPoolIds = ids;
                successfunc(error === null);
            }
        };

        // TODO When the platform allows us to GetPlayerPool by name and devID we will just iterate through all pools in fixture
        // Until then we will iterate through the playerPoolIds object, which was returned by the GetDeveloper call
        if (num > 0) {
            var i;
            for (i = 0; i < devInfo.playerPoolIds.length; i += 1) {
                devInfo.conn.getPlayerPool({playerPoolId: devInfo.playerPoolIds[i]}, handleGet);
            }
        } else {
            // If the developer had no pools, then call createPools directory to create any that are needed
            createPools();
        }
    };


    // InsureAchievementTemplatesExist
    //  Parameters:
    //      fixture = a FSTest_Fixture object (see above) containing info about games to create
    //      devInfo = The devInfo built up so far (conn and developer info should exist)
    //      successfunc = function to call upon completion
    //  success function prototype : successfunc(boolean)
    /* 
     var ATsNameObj = {
     "achievementTemp1" : { 
     currentUnlockPoints: 0, //(optional) 
     name: "achievementTemp1",
     tags: [ "foo", "bar" ], // <array of string>,(optional) 
     developer: "A_dev_email@domain.com",    // Ignored, we assume is this developer
     recommended: true,
     customId: 123,      // (optional) 
     icon: "http://dev.funsockets.com/foo/bar", //(optional) 
     maximumUnlockPoints: 100,
     imageList: [    // <array of AchievementImageData>,(optional) 
     {   name: "image1", format: "png", newRating: 1, dimensions: "10x10", link: "http://foo.com/bar.png", size: 10000 },
     {   name: "image2", format: "jpg", newRating: 2, dimensions: "20x20", link: "http://foo.com/bar.jpg", size: 20000 }
     ],
     description: "The first achievement" // (optional) 
     },
     ...
     }
     var ATsIdObj  = {
     "123215234" : { 
     currentUnlockPoints: 0,
     achievementTemplateId: "123215234",
     name: "achievementTemp1",
     tags: [ "foo", "bar" ],
     developerId: "1292b12dfe324fdg3234",
     recommended: true,
     customId: 123,
     icon: "http://dev.funsockets.com/foo/bar",
     maximumUnlockPoints: 100,
     imageList: [
     {   name: "image1", format: "png", newRating: 1, dimensions: "10x10", link: "http://foo.com/bar.png", size: 10000 },
     {   name: "image2", format: "jpg", newRating: 2, dimensions: "20x20", link: "http://foo.com/bar.jpg", size: 20000 }
     ],
     description: "The first achievement"
     },
     ...
     }
     */
    FS.TestLib.InsureAchievementTemplatesExist = function (fixture, devInfo, successfunc) {
        var games = fixture.games;
        var outstandingRequests = 1;
        var error = null;
        var names = {};
        var ids = {};
        var gameId;

        function testDoneCreating() {
            if (outstandingRequests === 0) { // There are no games for us to create, so we are done
                var agid;
                for (agid in devInfo.gameIds) {
                    devInfo.gameIds[agid].achievementTemplates = names[agid];
                    devInfo.gameIds[agid].achievementTemplateIds = ids[agid];
                }
                successfunc(error === null);
            }
        }

        function createById(gameName, achIdx) {
            return function (resp) {
                outstandingRequests -= 1;

                if (resp.data.code !== 0) {
                    error = "Failure in creating template";
                    successfunc(false);
                } else {
                    var achId = resp.data.achievementTemplateId;
                    var make = fixture.games[gameName].achievementTemplates[achIdx];

                    make.achievementTemplateId = achId;
                    ids[gameId][achId] = make;
                }

                testDoneCreating();
            };
        }

        function createMissingTemplates() {
            var created = false;
            var name, at, gameId;
            if (error !== null) {
                successfunc(false);
            } else {
                outstandingRequests += 1;       // add a "place holder" to avoid a race condition
                for (name in games) {   // create any missing games
                    var ats = games[name].achievementTemplates;
                    gameId = devInfo.games[name].gameId;

                    for (at in ats) {
                        var make = ats[at];
                        var found = names[gameId][make.name];

                        make.developerId = devInfo.developerId;
                        make.gameId = gameId;
                        names[gameId][make.name] = make;

                        if (found !== undefined) {
                            var id = found.achievementTemplateId;
                            make.achievementTemplateId = id;
                            ids[gameId][id] = make;
                        }
                        else {
                            devInfo.conn.createAchievementTemplate(make, createById(name, at));
                            outstandingRequests += 1;
                        }
                    }
                }
                outstandingRequests -= 1;  // We we are done manipulating num, so remove our place holder
            }
            testDoneCreating();
        }

        function handleFind(resp) {
            if (resp.data.code !== 0) {
                error = "Failure in finding templates game";
                return;
            }
            for (var atemp = 0; atemp < resp.data.achievementTemplateList.length; atemp++) {
                var ach = resp.data.achievementTemplateList[atemp];
                names[ach.gameId][ach.name] = ach;
                ids[ach.gameId][ach.achievementTemplateId] = ach;
            }
            outstandingRequests -= 1;
            if (outstandingRequests === 0) {
                // We have all the exiting game template, create anything that is missing
                createMissingTemplates();
            }
        }

        for (gameId in devInfo.gameIds) {   // get info about any existing achievement templates of all the existing games
            outstandingRequests += 1;
            if (names[gameId] === undefined) {
                names[gameId] = {};
            }
            if (ids[gameId] === undefined) {
                ids[gameId] = {};
            }
            devInfo.conn.findAchievementTemplates({gameId: gameId}, handleFind);
        }
        outstandingRequests -= 1;
        if (outstandingRequests === 0) {    // If there was no existing games, we are done
            successfunc(true);
        }
    };


    // InsureGamesExist
    //  Parameters:
    //      fixture = a FSTest_Fixture object (see above) containing info about games to create
    //      devInfo = The devInfo built up so far (conn and developer info should exist)
    //      successfunc = function to call upon completion
    //  success function prototype : successfunc(boolean, GamesNameObj, GamesIdObj)
    /* 
     var GamesNameObj = {
     "game1" = { "name" : "game1", "gameId" : "1234568", "status" : "Live" },
     "game2" = { "name" : "game2", "gameId" : "1234567", "status" : "Development" }
     }
     var GamesIdObj  = {
     "1234568" = { "name" : "game1", "gameId" : "1234568", "status" : "Live" },
     "1234567" = { "name" : "game2", "gameId" : "1234567", "status" : "Development" }
     }
     */
    FS.TestLib.InsureGamesExist = function (fixture, devInfo, successfunc) {
        var games = fixture.games;
        var num = devInfo.gameIds.length;
        var error = null;
        var names = {};
        var ids = {};
        var enableGames;
        var createGames;

        var handleGet = function (resp) {
            num -= 1;
            if (resp.data.code === 0) {
                names[resp.data.name] = resp.data;
                ids[resp.data.gameId] = resp.data;
            } else {
                error = "Failure in getting game info";
            }
            if (num === 0) {        // We have all existing game info
                createGames();
            }
        };
        var handleCreate = function (resp) {
            num -= 1;
            if (resp.data.code === 0) {
                names[resp.data.name] = resp.data;
                ids[resp.data.gameId] = resp.data;
            } else {
                error = "Failure in Creating game";
            }
            if (num === 0) {    // We have created all missing games
                enableGames();
            }
        };

        var handleEnable = function (resp, gameId) {
            num -= 1;
            if (resp.data.code === 0) {
                var name = ids[gameId].name;
                names[name].status = resp.data.status;
                ids[gameId].status = resp.data.status;
            } else {
                error = "Failure in enabling game";
            }
            if (num === 0) {
                devInfo.games = names;
                devInfo.gameIds = ids;
                successfunc(error === null);
            }
        };

        enableGames = function () {
            if (error !== null) {
                successfunc(false);
            } else {
                var enabled = false;
                num = 1;    // add a "place holder" to avoid a race condition
                var name;
                var make_handler = function (gid) {
                    return function (resp) {
                        handleEnable(resp, gid);
                    };
                };
                for (name in games) {   // We now need to set the enabled flag properly
                    if (names[name].enabled !== games[name].enabled) {
                        enabled = true;
                        num += 1;
                        var gid = names[name].gameId;
                        devInfo.conn.enableGame({gameId: gid, status: games[name].enabled}, make_handler(gid));
                    }
                }
                num -= 1;  // We we are done manipulating numGames, so remove our place holder
                if (num === 0 && enabled === false) { // There are no games for us to enable, so we are done
                    devInfo.games = names;
                    devInfo.gameIds = ids;
                    successfunc(true);
                }
            }
        };

        createGames = function () {
            var created = false;
            if (error !== null) {
                successfunc(false);
            } else {
                num = 1;        // add a "place holder" to avoid a race condition
                var name;
                for (name in games) {   // create any missing games
                    if (typeof names[name] === "undefined") {
                        created = true;
                        num += 1;
                        devInfo.conn.createGame({name: name}, handleCreate);
                    }
                }
                num -= 1;  // We we are done manipulating num, so remove our place holder
            }
            if (num === 0 && created === false) { // There are no games for us to create, so we are done
                enableGames();
            }
        };


        // TODO When the platform allows us to GetGame by name and devID we will just iterate through all games in fixture
        // Until then we will iterate through the gameIds object, which was returned by the GetDeveloper call
        if (num > 0) {
            var i;
            for (i = 0; i < devInfo.gameIds.length; i += 1) {
                devInfo.conn.getGame({gameId: devInfo.gameIds[i]}, handleGet);
            }
        } else {
            // If the developer had no games, then call createGames directory to create any that are needed
            createGames();
        }
    };


    // InsureDevExists
    //  Parameters:
    //      laddr = The address of the HTTP server for the platform you want to contact
    //      fixture = a FSTest_Fixture object (see above) containing info about dev to create
    //      successfunc = function to call upon completion
    //  success function prototype : successfunc(boolean)
    /* 
     var GetDeveloperStatus = {
     "developerId" : String,
     "email" : String,
     "createTime" : String,
     "authorizationAgents" : Array of GetDeveloperAuth,
     "gameIds" : Array of String,
     "playerPoolIds" : Array of String,
     "status" : String                // TODO: Is this returned?
     }
     var GetDeveloperAuth  = {
     "agent" : String,
     "uniqueId" : String,
     "playerContextAllowed" : Boolean,
     "status" : String
     }
     var GetDeveloperAuth  = {
     "authorizationAgent" : String,   // for Local agent value is "Local"
     "email" : String,
     "status" : String                // TODO: Figure out if this is a boolean for Local 
     }
     */
    FS.TestLib.InsureDevExists = function (laddr, fixture, devInfo, successfunc) {
        var connInfo = null;
        devInfo.connInfo = new FS.ConnectionInfo(laddr, {authorization: fixture.authorization});

        var onConnectStatus = function (resp) {
            if (resp.data.code !== 0) {
                successfunc(false);
            } else {
                devInfo.conn.getDeveloper({developerId: devInfo.developerId}, function (resp) {
                    if (resp.data.code === 0) {
                        var x;
                        for (x in resp.data) {
                            devInfo[x] = resp.data[x];
                        }
                    }
                    successfunc(resp.data.code === 0);
                });
            }
        };

        devInfo.connInfo.loginDeveloper({authorization: fixture.authorization}, function (resp) {
            if (resp.data.code !== 0) {
                // Developer doesn't exist, create it
                devInfo.connInfo.createDeveloper({
                    name: fixture.name,
                    authorization: fixture.authorization
                }, function (resp) {
                    if (resp.data.code !== 0) {
                        successfunc(false);     // Can't create the developer, nothing else to do
                    } else {
                        devInfo.developerId = resp.data.developerId;
                        devInfo.conn = new FS.Connection(devInfo.connInfo, {});
                        devInfo.conn.setOptions({developerId: devInfo.developerId});
                        devInfo.conn.connect(onConnectStatus);
                    }
                });
            } else {
                devInfo.developerId = resp.data.developerId;
                devInfo.conn = new FS.Connection(devInfo.connInfo, {});
                devInfo.conn.setOptions({developerId: devInfo.developerId});
                devInfo.conn.connect(onConnectStatus);
            }
        });
    };


    /**
     * Creates an FS.GameInstance object.
     *
     * @constructor
     * @borrows FS.Table#getLock
     * @borrows FS.Table#getNumSeats
     * @borrows FS.Table#getOwnerPlayer
     * @borrows FS.Table#getPlayer
     * @borrows FS.Table#getPlayerAtSeat
     * @borrows FS.Table#getPlayers
     * @borrows FS.Table#getPlayerSeatIndex
     * @borrows FS.Table#getSeatedPlayers
     * @borrows FS.Table#getSettings
     * @borrows FS.Table#getTableIndex
     * @borrows FS.Table#getWatchingPlayers
     *
     * @class The GameInstance object contains the routines common to the GameServerInstance and the GameClientInstance.
     *
     */
    FS.GameInstance = function (meetingRoom, table) {
        this.meetingRoom = meetingRoom;
        this.conn = meetingRoom.getConnection();
        this.table = table;
        this._setUpEventBindings();
    };
    FS.Utils.extend(FS.GameInstance, FS.EventDispatcher);

    FS.GameInstance.prototype._setUpEventBindings = function () {
        // watch for all the raw messages - dispatch them nicely to our our user
        // make sure we unbind all these
        var self = this;
        this.stateChangeBind = function () {
            self._onStateChange.apply(self, arguments);
        };
        this.leaveSeatBind = function () {
            self._onPlayerLeaveSeat.apply(self, arguments);
        };
        this.leaveTableBind = function () {
            self._onPlayerLeaveTable.apply(self, arguments);
        };
        this.table.bind("change:state", self.stateChangeBind);
        this.table.bind("seats:change:remove", self.leaveSeatBind);
        this.table.bind("joined:change:remove", self.leaveTableBind);
    };

    FS.GameInstance.prototype._cleanUpEventBindings = function () {
        // should be called by subclass to cleanup
        // separate function to make sure we remember to clean up!
        var self = this;
        this.table.unbind("change:state", self.stateChangeBind);
        this.table.unbind("seats:change:remove", self.leaveSeatBind);
        this.table.unbind("joined:change:remove", self.leaveTableBind);
    };

    FS.GameInstance.prototype._onPlayerLeaveSeat = function () {
        if (this.table.getSeatedCount() === 0) {
            this.trigger("GaIn_NoMoreSeatedPlayers");
        }
    };

    FS.GameInstance.prototype._onPlayerLeaveTable = function () {
        if (this.table.getJoinedCount() === 0) {
            this.trigger("GaIn_NoMoreTablePlayers");
        }
    };


    // EAS TODO XXX need to figure out how/why to forware the following function to the table,  seems like a waste
    //[ "getLock", "getNumSeats", "getOwnerPlayer", "getPlayer", "getPlayerAtSeat", "getPlayers", "getPlayerSeatIndex",
    //"getSeatedPlayers", "getSettings", "getTableIndex", "getWatchingPlayers" ].forEach( function(name) {
    //FS.GameInstance.prototype[name] = function() {
    //return FS.Table.prototype[name].apply(this.table, arguments);
    //};
    //});

    FS.GameInstance.prototype._onStateChange = function () {
        // for both client and server we will send gameExit event
        // does the game server get a Idle message ever? for example when last player goes non-ready?
        if (this.table.get("state") === "Idle") {
            // clean up unbind all and exit
            // this.unbind(); // remove all listener the user of this object might have placed on us! - not needed
            this.trigger("gameExit");
            this._cleanUpEventBindings();
        }
    };


    FS.BotModel = root.Backbone.Model.extend({
        /* name : string
         * playerId : string
         */
        initialize: function () {
        }
    });

    FS.BotListModel = root.Backbone.Collection.extend({
        model: FS.BotModel,
        initialize: function () {
        },

        // public function
        getBotName: function (playerId) {
            var getBotReturnName = "Unknown Bot!";
            this.models.forEach(function (e) {
                if (playerId === e.attributes.playerId) {
                    getBotReturnName = e.attributes.name;
                }
            });
            return getBotReturnName;
        }
    });

    FS.PlayerModel = root.Backbone.Model.extend({
        /* 
         * playerName:    string
         * playerId:      string
         * playerAddress: string
         * isBot:         boolean
         */
        initialize: function (params) {
            if (typeof params.isBot === 'undefined') {
                this.set({isBot: false});
            }
        },

        // Shortcut functions to make code smaller and easier to read
        getAddr: function () {
            return this.get("playerAddress");
        },
        getName: function () {
            return this.get("playerName");
        },
        getId: function () {
            return this.get("playerId");
        },
        isBot: function () {
            return this.get("isBot");
        }
    });

    FS.PlayerListModel = root.Backbone.Collection.extend({
        model: FS.PlayerModel,

        /* We need to access the PlayerList by address often so we are going maintain a hash list
         * keyed by address for lookups. */
        initialize: function () {
            this.addrMap = {};
            // If the Model is initialized with some initial player list data, 
            // then make sure that the address map is set up
            if (this.models.length > 0) {
                this.map(function (player) {
                    if (typeof player.playerAddress === "string") {
                        this.addrMap[player.playerAddress] = player;
                    } else {
                        console.log("while creating player list, the following player didn't have an address: " + JSON.stringify(player.toJSON));
                    }
                });
            }
        },
        // add the Player only if they aren't already in the list
        addPlayer: function (player) {
            var addr = player.getAddr();
            if (typeof this.addrMap[addr] === "undefined") {
                this.addrMap[addr] = player;
                this.add(player);
            }
        },
        removePlayer: function (playerAddress) {
            var p = this.addrMap[playerAddress];
            if (typeof p !== "undefined") {
                delete this.addrMap[playerAddress];
                this.remove(p);
            }
        },

        resetList: function () {
            this.addrMap = {};
            this.reset();
        },

        findByAddress: function (addr) {
            return this.addrMap[addr];
        },

        findById: function (id, func) {
            var pIdx, pa = [];
            for (pIdx in this.addrMap) {
                if (this.addrMap[pIdx].getId() === id) {
                    pa.push(this.addrMap[pIdx]);
                }
            }
            if (typeof func !== "function") {
                return pa;
            }
            for (pIdx in pa) {
                func(pa[pIdx]);
            }
        }
    });

    FS.TablePlayerModel = root.Backbone.Model.extend({
        /* 
         * ready:  boolean        indicate if the player is ready or not
         * roomid: string         *unused* the roomid that contains the table that this player is at
         * table:  object         the table model that this player is at
         * seat:   number         -1 or the seat number if sitting at a table's seat
         * player: Player         pointer to Player;
         */
        initialize: function (params) {
            if (typeof this.ready === 'undefined') {
                this.set({ready: false});
            }
            if (typeof this.seat === 'undefined') {
                this.set({seat: -1});
            }
        },
        // Shortcut functions to make code smaller and easier to read
        getAddr: function () {
            return this.get("player").get("playerAddress");
        },
        getName: function () {
            return this.get("player").get("playerName");
        },
        getId: function () {
            return this.get("player").get("playerId");
        },
        isBot: function () {
            return this.get("player").get("isBot");
        }
    });

    FS.TablePlayerListModel = FS.PlayerListModel.extend({
        model: FS.TablePlayerModel
        // viewData :  object   -> Client side only, this object hold reference/pointers to the DOM elements associated with the data
    });

    FS.ChatModel = root.Backbone.Model.extend({
        /* 
         * playerAddress : string ->  playerAddress   - The person who sent the chat, XXX TODO may be undefned??. may not be a player in the playerlist
         * table : number -> the room to which this chat was directed, may be undefined
         * playerList : Array of Strings -> a list of playerAddresses to which this chat was directed, may be undefined
         * arriveTime : Date    -> The local time when this chat was received
         * text :  string   -> The message
         * player : PlayerModel object or null
         */
        initialize: function () {
        }
    });

    FS.ChatListModel = root.Backbone.Collection.extend({
        model: FS.ChatModel,

        initialize: function () {
        },

        addChat: function (chatData) {
            chatData.arriveTime = new Date();
            var c = new FS.ChatModel(chatData);
            this.add(c);
        }
    });

    FS.SeatModel = root.Backbone.Model.extend({
        /* 
         * number : number - can be a number between 0-N, inclusive, where N is (the number of seats at this table - 1)
         * occupant : a TablePlayer Object  - the player sitting here or undefined if no one is sitting at seat
         * booted_owner : boolean - A flag indicating if this player has voted to boot the owner of the table or not
         * seatLock : boolean - a flag to indicate that the seat is locked and no one can sit. 
         *                  This flag is independant from whether the player will have to request to sit. That is a table flag
         */
        initialize: function () {
            if (typeof this.attributes.occupant === "undefined") {
                this.set({occupant: null});
            }
            if (typeof this.attributes.booted_owner === "undefined") {
                this.set({booted_owner: false});
            }
            if (typeof this.attributes.seatLock === "undefined") {
                this.set({seatLock: false});
            }
        },
        // Shortcut functions to make code smaller and easier to read
        getOccAddr: function () {
            var o = this.get("occupant");
            if (o) {
                return o.getAddr();
            }
            return null;
        }
    });

    FS.SeatListModel = root.Backbone.Collection.extend({
        model: FS.SeatModel,
        // viewData :  object   -> Client side only, this object hold reference/pointers to the DOM elements associated with the data
        initialize: function () {
        },

        findByAddress: function (playerAddress) {
            var seat;
            for (seat = 0; seat < this.models.length; seat++) {
                if (this.at(seat).getOccAddr() === playerAddress) {
                    return this.at(seat).get("occupant");
                }
            }
            return null;
        },

        getPlayerCount: function () {
            var cnt = 0;
            this.models.forEach(function (seat) {
                if (seat.getOccAddr()) {
                    cnt += 1;
                }
            });
            return cnt;
        }
    });

    FS.TableModel = root.Backbone.Model.extend({
        /* 
         * numSeats: number     -> the total number of seats this table should hold
         * number : number      ->  a number from 0-N, inclusive, where N is (number of tables - 1),  identifies the table
         * owner : TablePlayer  ->  the player who owns this table, may be undefined.
         * seats : an ordered Array of Seat objects -> Info about the state of each seat at this table
         * joined : an Collection of TablePlayer -> the players who have joined this table. May be empty
         * tableLock : boolean  -> indicates if the table is locked.  If it is, no player can join the table.  Independant from whether a player must request to join
         * requestJoin : boolean -> if true, then a player must request a token from the owner to join the table.
         * requestSit : boolean -> if true, then the player must request a token from the owner to join the seat.
         * settings : string    -> An game specific string that describes what the game options are in use for the game at this table.
         * state :  string      -> The state of the table. Must be "Idle", "Active", or "Launching"
         * room :  object       -> This holds the Room model object that this table is in
         * viewData :  object   -> Client side only, this object hold reference/pointers to the DOM elements associated with the data
         */
        initialize: function () {
            // The table will start out with a blank set of seats and players
            var self = this;
            var playerList = new FS.TablePlayerListModel();

            var seatList = new FS.SeatListModel();
            this.set({joined: playerList, seats: seatList, viewData: null});

            // forwarding all events on the Joined and sList
            // add or remove:   arguments = [TablePlayer,  TablePlayerModel]
            // change:          arguments = [TablePlayer,  TablePlayerModel]
            // change:attr      arguments = [TablePlayer,  <new attr val>, TablePlayerModel];
            playerList.bind("all", function (type) {
                //console.log("JoinedEvent: ", type, this, arguments);
                var i, args = ["joined:" + type, self];
                for (i = 1; i < arguments.length; i += 1) {
                    args.push(arguments[i]);
                }
                self.trigger.apply(self, args);
            });
            seatList.bind("all", function (type) {
                //console.log("SeatsEvent: ", type, this, arguments);
                var i, args = ["seats:" + type, self];
                for (i = 1; i < arguments.length; i += 1) {
                    args.push(arguments[i]);
                }
                self.trigger.apply(self, args);
            });

            var i;
            for (i = 0; i < this.attributes.numSeats; i += 1) {
                var seat = new FS.SeatModel({"number": i});
                this.get("seats").add(seat);
            }
            if (typeof this.get('owner') === "undefined") {
                this.set({"owner": null});
            }
            if (typeof this.get("tableLock") === "undefined") {
                this.set({"tableLock": false});
            }
            if (typeof this.get("requestSit") === "undefined") {
                this.set({"requestSit": false});
            }
            if (typeof this.get("requestJoin") === "undefined") {
                this.set({"requestJoin": false});
            }
            if (typeof this.get('settings') === "undefined") {
                this.set({"settings": ""});
            }
            if (typeof this.get('state') === "undefined") {
                this.set({"state": "Idle"});
            }
            //this.bind("all", function (type) {
            //console.log("TableEvent: ", type, this, arguments);
            //});
        },

        getSeatedCount: function (onlyReady) {
            var cnt = 0;
            this.get("seats").models.forEach(function (seat) {
                var occ = seat.get("occupant");
                if (occ) {
                    if (occ.get("ready") || !onlyReady) {
                        cnt += 1;
                    }
                }
            });
            return cnt;
        },

        getSeatedPlayers: function (onlyReady) {
            return this.get("seats").models.filter(function (seat) {
                var occ = seat.get("occupant");
                return occ && (!onlyReady || occ.get("ready"));
            }).sort(function (a, b) {
                return a.get("seat") - b.get("seat");
            }).map(function (a) {
                return a.get("occupant");
            });
        },


        getJoinedPlayers: function (onlyReady) {
            return this.get("joined").models.filter(function (player) {
                return (!onlyReady || player.get("ready"));
            });
        },

        // Shortcut functions to make code smaller and easier to read
        getOwnAddr: function () {
            var o = this.get("owner");
            if (o) {
                return o.getAddr();
            }
            return null;
        },

        // Each table object in will bind to the TableState event and handle changes to the table it is 
        // representing
        setTableStateInfo: function (state, playerList) {
            var self = this;
//          state = {
//                    "table" : Number,
//                    "playerAddress" : (optional) String,
//                    "playerId" : (optional) String,
//                    "owner" : (optional) Boolean,
//                    "seat" : (optional) Number,
//                    "shared" : (optional) Boolean,
//                    "bot" : (optional) Boolean,
//                    "leaving" : (optional) Boolean,
//                    "booted" : (optional) Boolean,
//                    "bootPlayerAddress" : (optional) String,
//                    "tableLock" : (optional) Boolean,
//                    "requestJoin" : (optional) Boolean,
//                    "requestSit" : (optional) Boolean,
//                    "settings" : (optional) String,
//                    "state" : (optional) String
//                    "seatLocks" : (optional) Array of seat numbers,
//                    "ready" : (optional) Boolean,
//                    "type" : (optional) String
//                }
            var doTableJoin = function (table, tabnum, player) {
                var tp = new FS.TablePlayerModel({table: table, player: player});
                table.get("joined").addPlayer(tp);
                if (table.get("joined").length === 1) {
                    table.trigger('tableNotEmpty', table);
                }
                return tp;
            };
            var isLocked = function (seat, state) {
                var lseat;
                for (lseat in state.seatLocks) {
                    if (seat === lseat) {
                        return true;
                    }
                }
                return false;
            };

            var doSetReady = function (table, state) {
                var oldState = table.get("state");
                if (state.ready === undefined) {
                    state.ready = false;
                }
                var tp = table.get("joined").findByAddress(state.playerAddress);
                var oldReady;
                if (typeof tp !== "undefined" && tp !== null) {
                    oldReady = tp.get("ready");
                    tp.set({ready: state.ready});
                } else {
                    console.log("ready player not at table?");
                }
                if (oldState === "Active" && oldReady !== state.ready) {
                    var data = {table: table, player: tp, ready: state.ready, inProgress: true};
                    if (typeof state.seat !== 'undefined') {
                        data.seat = state.seat;
                    }
                    table.trigger((state.ready ? 'playerWentActive' : 'playerWentInactive'), data);
                }
            };
            var doSeatChange = function (sitting, table, state) {
                var tp = table.get("joined").findByAddress(state.playerAddress);
                if (typeof tp !== "undefined" && tp !== null) {
                    if (sitting) {
                        tp.set({seat: state.seat});
                        table.get("seats").at(state.seat).set({occupant: tp});
                    } else {
                        table.get("seats").at(state.seat).set({occupant: null});
                        tp.set({seat: -1});
                    }
                } else {
                    console.log("sitting seat player not at table?");
                }
            };
            var doTableOwn = function (owning, table, state) {
                if (owning) {
                    var tp = table.get("joined").findByAddress(state.playerAddress);
                    if (typeof tp !== "undefined" && tp !== null) {
                        table.set({"owner": tp});
                    } else {
                        //console.log("Owning player not at table?");
                        var player = playerList.findByAddress(state.playerAddress);
                        tp = doTableJoin(table, 0, player);
                        table.set({"owner": tp});
                    }
                } else {
                    table.set({"owner": null});
                }
            };


            var i, tp;
            // Only process state changes for the table this model represents
            if (state.table !== this.get("number")) {
                console.log("Got state not for this table", this, state);
            }

            var table = this;
            var changes = {};
            var player;
            if (typeof state.playerAddress === "string") {
                player = playerList.findByAddress(state.playerAddress);
                if (typeof player === "undefined") {    // Must be a bot
                    // EAS TODO XXX, Look this up in the BotList to get the name
                    // If this is a game server, we don't get a enteredRoom when players arrive.  We need to add players as we encounter them
                    var p = new FS.PlayerModel({
                        playerAddress: state.playerAddress,
                        playerId: state.playerId,
                        playerName: "Unknown",
                        isBot: state.bot === true
                    });
                    playerList.addPlayer(p);
                    player = playerList.findByAddress(state.playerAddress);
                }
            }
            switch (state.type) {
                case "OwnershipAcquired":
                case "OwnershipReleased":
                    doTableOwn((state.type === "OwnershipAcquired"), table, state);
                    break;

                case "TableJoin":
                    doTableJoin(table, state.table, player);
                    break;

                case "TableLeave":
                    table.get("joined").removePlayer(state.playerAddress);
                    // EAS XXX TODO, if the player that left is a bot AND there is no other bots in seats in the room, then we need to remove it from the 
                    // player list.  This is a pain cause we have to search through all seats.  Discuss with Ted
                    if (table.get("joined").length === 0) {
                        this.trigger('tableBecameEmpty', table);
                    }
                    if (this.getOwnAddr() === state.playerAddress) {
                        doTableOwn(false, table, state);
                    }

                    break;

                case "SeatSit":
                case "SeatLeave":
                    doSeatChange((state.type === "SeatSit"), table, state);
                    doSetReady(table, state);
                    break;

                case "ReadySet":
                    doSetReady(table, state);
                    break;

                case "BootRequest":
                    table.get("seats").at(state.seat).set({"booted_owner": true});
                    break;

                case "StateUpdate":
                    /* The only possible updates are
                     1) playeraddr + playerId                // Declares a player joined but not at a seat
                     2) playeraddr + playerId + seat            // Declares who is sitting in a seat
                     3) playeraddr + playerId + owner        // Declares a owner who is not in a seat
                     4) playeraddr + playerId + owner + seat    // Declares a owner who is in a seat
                     5) playeraddr + playerId + bot + seat    // Declares a bot, (always in a seat)

                     Ready flag can be set or not set in all cases
                     */
                    tp = doTableJoin(table, state.table, player);
                    if (typeof state.seat !== "undefined") {    // If there is a seat, sit the player into it
                        doSeatChange(true, table, state);
                    }
                    if (typeof state.owner === "boolean" && state.owner === true) {
                        doTableOwn(true, table, state);
                    }
                    if (typeof state.ready === "boolean" && state.ready === true) {
                        doSetReady(table, state);
                    }
                    break;

                case "TableEvent":
                    // NOTE: The way the platform currently handles the table locks and seat locks is a little off
                    // This code models the way it will be after a bug is fixed by interperting the exising modes
                    // to map to the future fields
                    //
                    // Several things can change due to this message, they should be processed in this order:
                    // 1) Table settings can change
                    // 2) Table or seat locks can change
                    // 3) Table or seat request mode can change
                    // 4) Table active state can change
                    table.set({settings: state.settings});
                    if (typeof state.seatLocks !== 'undefined' && FS.Utils.isArray(state.seatLocks)) {
                        // Iterate over the seats and change their seatLock state based on the seatLock array
                        // Any seat in the array should be locked and any seat not in the array should be unlocked
                        var numSeats = table.attributes.numSeats;
                        var seat;
                        for (seat = 0; seat < numSeats; seat += 1) {
                            var locked = isLocked(seat, state);
                            if (table.seats.models[seat].get("seatLock") !== locked) {
                                table.seats.models[seat].set({seatLock: locked});
                            }
                        }
                    }
                    if (typeof state.tableLock !== "boolean") {
                        state.tableLock = false;
                    }
                    if (typeof state.requestJoin !== "boolean") {
                        state.requestJoin = false;
                    }
                    if (typeof state.requestSit !== "boolean") {
                        state.requestSit = false;
                    }

                    table.set({requestJoin: state.requestJoin});
                    table.set({requestSit: state.requestSit});
                    table.set({tableLock: state.tableLock});

                    table.set({"state": state.state});
                    break;
            }
        }
    });


    FS.TableListModel = root.Backbone.Collection.extend({
        model: FS.TableModel,
        // tables : number
        // numSeats : number
        // room :  object       -> This holds the Room model object that this table is in

        initialize: function () {
            if (typeof this.tables !== "number") {
                this.tables = 0;
            }
            if (typeof this.numSeats !== "number") {
                this.numSeats = 0;
            }
            if (typeof this.room !== "object") {
                this.room = null;
            }
            FS.Utils.bindAll(this, 'resetModel');
            //this.bind("all", function (type) {
            //console.log("TableListEvent: ", type, this, arguments);
            //});
        },

        updateTables: function (states, playerList) {
            var self = this;
            states.forEach(function (state) {
                var table = self.at(state.table);
                if (table) {
                    table.setTableStateInfo.call(table, state, playerList);
                }
            });
        },

        resetModel: function (newData) {
            this.tables = newData.tables;
            this.seats = newData.seats;
            this.room = newData.room;
            var tableArray = [], i;

            // Create an array of initial table data to reset the table list with
            for (i = 0; i < newData.tables; i += 1) {
                tableArray.push({"number": i, "numSeats": newData.numSeats, room: newData.room});
            }
            this.reset(tableArray);

            this.trigger("modelReset", this);
        }
    });

    FS.RoomModel = root.Backbone.Model.extend({
        // roomId: string
        // gameId: string
        // playerPoolId: string
        // name: string
        // static: boolean
        // tables: number
        // seats: number
        // minimumToStart: number
        // maxPlayers: number
        // tableList: object of type TableListModel
        initialize: function () {
            var self = this;
            var forwardEvent = function (type) {
                //console.log("roomTabLst: ", type, self, arguments);
                var i, args = ["room:" + type, self];
                for (i = 1; i < arguments.length; i += 1) {
                    args.push(arguments[i]);
                }
                self.trigger.apply(self, args);
            };

            if (this.get("tableList") === undefined) {
                var i, tl = [];
                for (i = 0; i < this.get("tables"); i += 1) {
                    tl.push({number: i, room: this, tables: this.get("tables"), numSeats: this.get("seats")});
                }
                var tableList = new FS.TableListModel(tl);
                this.set({tableList: tableList});
                tableList.bind("all", forwardEvent);
            }
            this.bind("add", function (room) {
                room.get("tableList").bind("all", forwardEvent);
            });
            //this.bind("all", function (type) {
            //console.log("RoomModelEvent: ", type, this, arguments);
            //});
        },

        updateTables: function (states, playerList) {
            var tl = this.get("tableList");
            tl.updateTables.call(tl, states, playerList);
        }
    });

    FS.RoomListModel = root.Backbone.Collection.extend({
        model: FS.RoomModel,

        initialize: function () {
            var cnt = 0;
            this.forEach(function (room) {
                room.set({"index": cnt += 1});
            });
            // We want to bind and unbind functions so we don't get called with events we don't care about.  
            // However we want to make sure the this is set properly so we need to create those functions
            // then refer to them later
            //this.bind("all", function (type) {
            //console.log("RoomListEvent: ", type, this, arguments);
            //});
        },

        resetRooms: function (rooms) {
            var self = this;
            this.removeStaticRoom();
            this.reset();
            if (FS.Utils.isArray(rooms)) {
                rooms.forEach(function (room) {
                    self.add(room);
                });
            }
            this.trigger("modelReset", this);
        },

        getFirstRoom: function () {
            var firstRoom = this.models.filter(function (room) {
                return room.get('static') === true;
            })[0];
            return firstRoom;
        },

        findByRoomName: function (name) {
            var _room = this.models.filter(function (room) {
                return room.get('name').toLowerCase() === unescape(name).toLowerCase();
            })[0];
            return _room;
        },

        updateTables: function (roomId, states, playerList) {
            this.models.forEach(function (room) {
                if (room.get("roomId") === roomId) {
                    room.updateTables.call(room, states, playerList);
                }
            });
        },

        // FIXME: support to debug, will be removed when the createRoom API is ready to use
        findOther: function (id) {
            var _room = this.models.filter(function (room) {
                return room.get('roomId') !== id && room.get('static') === true;
            })[0];
            return _room;
        },

        findByRoomId: function (id) {
            var _room = this.models.filter(function (room) {
                return room.get('roomId') === id;
            })[0];
            return _room;
        },

        removeStaticRoom: function () {
            var self = this,
                rooms;
            rooms = this.models.filter(function (room) {
                return room.get('static') === true;
            });
            rooms.forEach(function (room) {
                self.remove(room, {silent: true});
            });
        }

    });


    FS.MeetingRoom = function (conn, options) {
        var self = this;
        this.options = options;

        // Instantiate the Data Models that are present in both the server and the client
        this.roomList = new FS.RoomListModel();
        this.chatList = new FS.ChatListModel();
        this.playerList = new FS.PlayerListModel();
        this.botList = new FS.BotListModel();
        this.botAddresses = [];

        this.conn = null;
        this.setConnection(conn);

        // Views are instatiated when show happens and are not needed on a server on Node
        // buy may be show as "read only" on the server in the browser
        this.roomListView = null;
        this.roomView = null;
        this.loginView = null;
        this.flashView = null;
        this.genReqView = null;
        this.inviteView = null;
        this.botListView = null;
        this.playerListView = null;
        this.chatListView = null;
        this.editView = null;

        this.localPlayer = null;  // Only on the client will this be set, it tells the views who "this player" is so that they can
        // show buttons and UI elements from that perspective

        this.currentRoomId = null;
        this.doingLaunchParams = false;
        this.GameClass = null;
        this.games = {};

        // We need to make sure that the "this" is set to the MeetingRoom when these events
        // call their handler functions. In addition we need to make sure that we can unbind
        // and re-bind if the connection changes (in case of disconnect). Unbind works by 
        // removing the function passed, but if you use annonymous functions then the one 
        // passed in the bind is different from the one passed to unbind, so it doesn't unbind
        //
        // To solve both these problems we need to create "Bind" functions that use the "self"
        // from a closure to ensure that the context is set and to allow bind and unbind to 
        // refer to the same function 
        this.roomAddBind = function () {
            self.roomAddCB.apply(self, arguments);
        };
        this.tableStateChangeBind = function () {
            self.tableStateChangeCB.apply(self, arguments);
        };
        this.playerWentActiveBind = function () {
            self.playerWentActiveCB.apply(self, arguments);
        };
        this.playerAddedBind = function () {
            self.playerAddCB.apply(self, arguments);
        };
        this.getPlayerBind = function () {
            self.getPlayerCB.apply(self, arguments);
        };
        this.getRoomListBind = function () {
            self.getRoomListCB.apply(self, arguments);
        };
        this.enterRoomTokenBind = function () {
            self.enterRoomTokenCB.apply(self, arguments);
        };
        this.enterRoomBind = function () {
            self.enterRoomCB.apply(self, arguments);
        };
        this.roomEnteredBind = function () {
            self.roomEnteredCB.apply(self, arguments);
        };
        this.roomExitedBind = function () {
            self.roomExitedCB.apply(self, arguments);
        };
        this.roomStatusBind = function () {
            self.roomStatusCB.apply(self, arguments);
        };
        this.roomChatBind = function () {
            self.roomChatCB.apply(self, arguments);
        };
        this.tableStateBind = function () {
            self.tableStateCB.apply(self, arguments);
        };
        this.getBotListBind = function () {
            self.getBotListCB.apply(self, arguments);
        };
        this.createRoomBind = function () {
            self.createRoomCB.apply(self, arguments);
        };
        this.deleteRoomBind = function () {
            self.deleteRoomCB.apply(self, arguments);
        };
        this.gatewayConnectBind = function () {
            self.gatewayConnectCB.apply(self, arguments);
        };
        this.startGameBind = function () {
            self.startGameCB.apply(self, arguments);
        };
        this.joinTableBind = function () {
            self.joinTableCB.apply(self, arguments);
        };
        this.tryToEnterRoomBind = function () {
            self.tryToEnterRoom.apply(self, arguments);
        };
        this.exitedRoomBind = function () {
            self.exitedRoomCB.apply(self, arguments);
        };
        this.userWantsInviteBind = function () {
            self.userWantsInviteCB.apply(self, arguments);
        };
        this.gameServerHelloBind = function () {
            self.gameServerHelloCB.apply(self, arguments);
        };
        this.startBotBind = function () {
            self.startBotCB.apply(self, arguments);
        };
        this.pleaseExitBind = function () {
            self.pleaseExitCB.apply(self, arguments);
        };
        this.stoppedGameBind = function () {
            self.stoppedGameCB.apply(self, arguments);
        };

        this.playerList.bind("add", self.playerAddedBind);
        this.roomList.bind("add", self.roomAddBind);
        this.roomList.bind("room:change:state", self.tableStateChangeBind);
        this.roomList.bind('room:playerWentActive', self.playerWentActiveBind);
        this.trigger('MtRm_Initialized', this);

        this.botPlayers = {};
    };

    FS.Utils.extend(FS.MeetingRoom, FS.EventDispatcher);   // Extend the class with Event function 

    // accessor functions to make code smaller and easier to read
    FS.MeetingRoom.prototype.getPlayerAddr = function () {
        if (this.localPlayer) {
            return this.localPlayer.getAddr();
        }
        return null;
    };

    FS.MeetingRoom.prototype.getLocalPlayer = function () {
        return this.localPlayer;
    };

    FS.MeetingRoom.prototype.getRoomList = function () {
        return this.roomList;
    };

    // The meeting room creates an object when a table goes Active.  It doesn't know if this is a client or a
    // server instance, but it does need to know which instance to create.  The developer sets their instance 
    // using this function.  If this is the client it is a game client instance class, if this is a server then
    // its a game server instance class
    FS.MeetingRoom.prototype.registerGameClass = function (gameclass) {
        this.GameClass = gameclass;
    };
    FS.MeetingRoom.prototype.createGameInstance = function (table, seat, address) {
        if (this.GameClass) {
            var key = table.get("room").get("roomId") + ":" + table.get("number");
            if (this.games[key] === undefined) {
                var game = new this.GameClass(this, this.conn.options.gameServerAddress, table.get('room'), table, seat, address);
                this.games[key] = game;
            }
        } else {
            console.log("Table went active without a game class to instantiate");
        }
    };

    FS.MeetingRoom.prototype.getConnection = function (conn) {
        return this.conn;
    };

    FS.MeetingRoom.prototype.setConnection = function (conn) {
        var self = this;
        if (typeof conn === "undefined") {
            conn = null;
        }
        if (this.conn && conn !== this.conn) {
            this.conn.unbind('getRoomList', self.getRoomListBind);
            this.conn.unbind('enterRoom', self.enterRoomBind);
            this.conn.unbind('enterRoomTableToken', self.enterRoomTokenBind);
            this.conn.unbind('roomEntered', self.roomEnteredBind);
            this.conn.unbind('roomExited', self.roomExitedBind);
            this.conn.unbind('roomStatus', self.roomStatusBind);
            this.conn.unbind('roomChat', self.roomChatBind);
            this.conn.unbind('tableState', self.tableStateBind);
            this.conn.unbind('getBotList', self.getBotListBind);
            this.conn.unbind('createRoom', self.createRoomBind);
            this.conn.unbind('deleteRoom', self.deleteRoomBind);
            this.conn.unbind('joinTable', self.joinTableBind);
            this.conn.unbind('gatewayConnect', self.gatewayConnectBind);
            this.conn.unbind('startGame', self.startGameBind);
            this.conn.unbind('gameServerHello', self.gameServerHelloBind);
            this.conn.unbind('getPlayer', self.getPlayerBind);
            this.conn.unbind('startBot', self.startBotBind);
            this.conn.unbind('pleaseExit', self.pleaseExitBind);
            this.conn.unbind('stoppedGame', self.stoppedGameBind);
            this.conn.unbind('reconnectUpdate', self.reconnectUpdate);
            this.localPlayer = null;
        }
        this.conn = conn;
        // Each model will want to know about the connection
        if (conn) {
            this.conn.bind('getRoomList', self.getRoomListBind);
            this.conn.bind('enterRoom', self.enterRoomBind);
            this.conn.bind('enterRoomTableToken', self.enterRoomTokenBind);
            this.conn.bind('roomEntered', self.roomEnteredBind);
            this.conn.bind('roomExited', self.roomExitedBind);
            this.conn.bind('roomStatus', self.roomStatusBind);
            this.conn.bind('roomChat', self.roomChatBind);
            this.conn.bind('tableState', self.tableStateBind);
            this.conn.bind('getBotList', self.getBotListBind);
            this.conn.bind('createRoom', self.createRoomBind);
            this.conn.bind('deleteRoom', self.deleteRoomBind);
            this.conn.bind('joinTable', self.joinTableBind);
            this.conn.bind('gatewayConnect', self.gatewayConnectBind);
            this.conn.bind('startGame', self.startGameBind);
            this.conn.bind('gameServerHello', self.gameServerHelloBind);
            this.conn.bind('getPlayer', self.getPlayerBind);
            this.conn.bind('startBot', self.startBotBind);
            this.conn.bind('pleaseExit', self.pleaseExitBind);
            this.conn.bind('stoppedGame', self.stoppedGameBind);
            this.conn.bind('reconnectUpdate', self.reconnectUpdate);

            if (conn.connInfo.kind === "player") {
                // This player is the only player in the playerList without a real playerAddress
                var thisplayer = this.playerList.findByAddress(conn.destination);
                if (typeof thisplayer === "undefined") {
                    thisplayer = new FS.PlayerModel({
                        playerAddress: conn.destination,
                        playerId: conn.connInfo.playerId,
                        playerName: conn.connInfo.playerName
                    });
                    this.playerList.addPlayer(thisplayer);
                }
                this.localPlayer = thisplayer;
            }
        }
    };

    FS.MeetingRoom.prototype.reconnectUpdate = function () {
        if (this.conn.connInfo.kind === "player") {
            // This player is the only player in the playerList without a real playerAddress
            var thisplayer = this.playerList.findByAddress(this.conn.destination);
            if (typeof thisplayer === "undefined") {
                thisplayer = new FS.PlayerModel({
                    playerAddress: this.conn.destination,
                    playerId: this.conn.connInfo.playerId,
                    playerName: this.conn.connInfo.playerName
                });
                this.playerList.addPlayer(thisplayer);
            }
            this.localPlayer = thisplayer;
        }
    };


    FS.MeetingRoom.prototype.getPlayerCB = function (resp) {
        if (resp.data.code === 0) {
            this.playerList.findById(resp.data.playerId, function (player) {
                player.set({
                    playerName: resp.data.name,
                    isBot: resp.data.type === "Bot"
                });
            });
        }
    };

    FS.MeetingRoom.prototype.playerAddCB = function (player, playerList) {
        if (player.getName() === "Unknown") {
            // Kick of a call to get an update of the playerName
            this.conn.getPlayer({playerId: player.getId()});
        }
    };

    // If the player went active, we need to send for the gameServerHello before we 
    // notify a game server a player has gone active
    FS.MeetingRoom.prototype.playerWentActiveCB = function (room, data) {
        // {table: table, player: tp, seat: sseat, inProgress: true});
        if (this.conn.getKind() === "game") {
            this.conn.eventGameServerHello({
                roomId: data.table.get('room').get('roomId'),
                table: data.table.get('number'),
                destination: data.player.getAddr(),
                gameServerAddress: this.conn.options.gameServerAddress
            });
            this.trigger("meetingRoom:playerWentActive", this, room, data);
        }
    };

    FS.MeetingRoom.prototype.startBotCB = function (resp) {
        this.botAddresses.push(resp.destination);

        this.conn.setOptions({source: resp.destination});

        // Preserve the settings of this startbot to log the player
        this.botPlayers[resp.destination] = resp.data;

        // First check if there is a room with this Id
        var tableList,
            idx,
            table,
            room = this.roomList.findByRoomId(resp.data.roomId);

        if (room === undefined) {
            room = new FS.RoomModel({
                roomId: resp.data.roomId,
                gameId: this.conn.options.gameId,
                playerPoolId: resp.data.playerPoolId,
                'static': true,           // EAS XXX does this make a difference?
                name: resp.data.roomId,
                tables: resp.data.tables,  // Is this max tables or just this table
                seats: resp.data.seats,
                meetingRoom: this
            });
            var i, tl = [];
            for (i = 0; i <= resp.data.tables; i += 1) {
                tl.push({number: i, room: room, tables: resp.data.tables, numSeats: resp.data.seats});
            }
            tableList = new FS.TableListModel(tl);
            room.set({tableList: tableList});
            this.roomList.add(room);
        }

        // Now check if there is enough tables in the room (we may have first been told about table 4 then later about table 8
        tableList = room.get("tableList");
        for (idx = tableList.length; idx < resp.data.tables; idx += 1) {
            table = new FS.TableModel({number: idx, numSeats: resp.data.seats, room: room});
            tableList.add(table);
        }
        table = tableList.at(resp.data.table);
    };

    FS.MeetingRoom.prototype.pleaseExitCB = function (resp) {
        // The platform is doing active servers mangment. We should be free of any active games so we can shut down
        if (FS.Utils.isNodeJS()) {
            process.exit(0);
        } else {
            window.alert("The platform has asked this server to exit or restart, reload or close the window to comply");
        }
    };

    FS.MeetingRoom.prototype.gameServerHelloCB = function (resp) {
        var address, bp, room, table;

        if (this.conn.getKind() === "player") {
            // make a game when a table the player is ready at goes active
            var caddr = this.getPlayerAddr();
            if (caddr) {
                room = this.roomList.findByRoomId(resp.data.roomId);
                if (room !== undefined) {
                    table = room.get("tableList").at(resp.data.table);
                    this.conn.setOptions({gameServerAddress: resp.data.gameServerAddress});
                    this.createGameInstance(table);
                }
            } else {
                console.log("Got gameServerHello for a room we don't know about");
            }
        } else if (this.conn.getKind() === "bot") {
            bp = this.botPlayers[resp.destination];
            if (bp === undefined) {
                console.log("bot not found");
                return;
            }

            // if this is a bot server, then always make a game when a table goes acive
            room = this.roomList.findByRoomId(resp.data.roomId);

            if (room === undefined) {
                console.log("GameServerHello for a room we could not find");
                return;
            }

            table = room.get("tableList").at(resp.data.table);
            if (table === undefined) {
                console.log("GameServerHello for a table we could not find");
                return;
            }

            // Bypass create game instance, because we cannot depend on a single table instance
            bp.game = new this.GameClass(this, resp.data.gameServerAddress, room, table, resp.destination);
        }
    };

    // When a table changes to Active, we need to decide if we need to instatiate a new Game object
    FS.MeetingRoom.prototype.tableStateChangeCB = function (room, table) {
        var address, bp;

        if (table.get("state") === "Active") {
            if (this.conn.getKind() === "game") {
                // if this is a game server, then always make a game when a table goes active
                this.createGameInstance(table);
            } else if (this.conn.getKind() === "player" ||
                this.conn.getKind() === "bot") {
                // if this is a player, then we don't launch the Instance until we get a gameServerHello
                var f = 1;
            }
        } else {
            // Games and Players are single instance games
            if (this.conn.getKind() === "game" ||
                this.conn.getKind() === "player") {
                // if this is a game server, then always make a game when a table goes inactive

                var key = table.get("room").get("roomId") + ":" + table.get("number");
                // TODO: NOTIFY GAME THAT IT HAS GONE INACTIVE
                if (this.games[key]) {
                    delete this.games[key];
                }
            } else if (this.conn.getKind() === "bot") {
                // TODO: NOTIFY GAME THAT IT HAS GONE INACTIVE
                // TODO: DELETE bp.game
            }

        }
    };

    FS.MeetingRoom.prototype.destroyGameInstance = function (table) {
        var key = table.get("room").get("roomId") + ":" + table.get("number");
        if (this.games[key] !== undefined) {
            // When an instance is done with a table, the disconnect causes the table to go Idle
            this.games[key].trigger('instanceDestroyed');
            table.set({"state": 'Idle'});
            delete this.games[key];
        }
    };

    FS.MeetingRoom.prototype.roomAddCB = function (room) {
        // If this room was just added, make sure that we start games on any tables that are active
        var tl = room.get("tableList");
        tl.forEach(function (table) {
            if (table.get("state") === "Active") {
                this.tableStateChangeCB(table);
            }
        });
    };

    // Create the Views if on browser, show the RoomList
    FS.MeetingRoom.prototype.createViews = function () {
        var self = this;

        if (this.roomView !== null) {
            return;
        }
        this.roomListView = new FS.RoomListView({model: this.roomList, mtgRoom: this});
        this.roomListView.bind("RLVw_RequestToEnterRoom", self.tryToEnterRoomBind, self);

        this.roomView = new FS.RoomView({model: this.roomList, mtgRoom: this, roomIdx: 0});
        this.roomView.bind("RmVw_ExitRoom", self.exitedRoomBind);

        this.flashView = new FS.FlashView({model: {}});
        this.bind('MtRm_AlertMsg', function (data) {
            self.flashView.trigger("FlVw_AlertMsg", data);
        });
        this.bind('MtRm_ErrorMsg', function (data) {
            self.flashView.trigger("FlVw_ErrorMsg", data);
        });

        this.genReqView = new FS.GenRequestView({mtgRoom: this});

        this.inviteView = new FS.InviteView({mtgRoom: this});
        this.inviteView.bind("InVw_InviteRequest", self.userWantsInviteBind);

        this.botListView = new FS.BotListView({model: this.botList, mtgRoom: this});
        this.chatListView = new FS.ChatView({model: this.chatList, mtgRoom: this});
        this.playerListView = new FS.PlayerListView({model: this.playerList, mtgRoom: this});
        this.editView = new FS.EditTableView({model: this.roomList, mtgRoom: this});

    };

    FS.MeetingRoom.prototype.roomChatCB = function (resp) {
        var player = null;
        if (typeof resp.data.playerAddress === "string") {
            player = this.playerList.findByAddress(resp.data.playerAddress);
        }
        resp.data.player = player;
        this.chatList.addChat(resp.data);
    };

    FS.MeetingRoom.prototype.roomStatusCB = function (resp) {
        // data = {
        //   playerList = [
        //     {
        //       'playerAddress' : String,
        //       'playerId' : String, 
        //       'playerName' : String
        //     }
        //   ]
        // }

        // The room should be repopulated
        this.playerList.resetList();

        var arr = resp.data.playerList, i;
        for (i = 0; i < arr.length; i += 1) {
            var p = new FS.PlayerModel(arr[i]);
            this.playerList.addPlayer(p);
        }
    };

    FS.MeetingRoom.prototype.roomExitedCB = function (resp) {
        this.playerList.removePlayer(resp.data.playerAddress);
    };
    FS.MeetingRoom.prototype.roomEnteredCB = function (resp) {
        var p = new FS.PlayerModel(resp.data);
        this.playerList.addPlayer(p);
    };

    FS.MeetingRoom.prototype.showLoginDialog = function (options) {
        var self = this;
        $("#fs-meetingroom-container").css("display", "block");
        this.loginView = new FS.LoginViewClass(options);
        this.flashView = new FS.FlashView({model: {}});
        this.loginView.bind('LoVw_PlayerCreated', function (data) {
            self.trigger("MtRm_PlayerCreated", data);
        });
        this.loginView.bind('LoVw_PlayerLogin', function (data) {
            self.trigger("MtRm_PlayerLogin", data);
        });
        this.loginView.bind('LoVw_ErrorMsg', function (data) {
            self.flashView.trigger("FlVw_ErrorMsg", data);
        });
        this.loginView.setOptions(options);
        this.loginView.render();
    };

    FS.MeetingRoom.prototype.enableGoogleLogin = function () {
        if (this.loginView !== null) {
            this.loginView.enableGoogleLogin();
        }
    };

    // This is called when the meeting room should start up, but with no view
    FS.MeetingRoom.prototype.start = function () {
        if (this.conn !== null) {
            var f = 1;
        }
    };

    FS.MeetingRoom.prototype.hide = function () {
        $("#fs-meetingroom-container").css("display", "none");
    };

    FS.MeetingRoom.prototype.show = function () {
        $("#fs-meetingroom-container").css("display", "block");

        if (this.roomView) {
            return;
        }

        if (this.conn !== null) {
            this.createViews();
            this.roomListView.show(false);
            this.chatListView.setShowing(false);
            this.playerListView.setShowing(false);
            // if there are launch parameters in the URL or Cookie that need processing we will do so, but
            // we need to know when we are done, so we set a flag to indicate that we are starting to process
            // not and when we have process them all, we turn the flag off

            // The roomId launch parameter must be present otherwise no other parameters can be used
            if ((typeof this.conn.options.roomid === "string") || (typeof this.conn.options.roomname === "string")) {
                this.doingLaunchParams = true;
                // Because parameters can come from the URL and there is not way to know whether the options should
                // be numbers or strings without context, the options provided may be the wrong type.  Since we 
                // are now in the right context, lets fix up the params that we know are wrong.
                if (typeof this.conn.options.table === "string") {
                    this.conn.options.table = Number(this.conn.options.table);
                }
                if (typeof this.conn.options.seat === "string") {
                    this.conn.options.seat = Number(this.conn.options.seat);
                }
                if (typeof this.conn.options.ready === "string") {
                    this.conn.options.ready = Boolean(this.conn.options.ready);
                }
                if (typeof this.conn.options.own === "string") {
                    this.conn.options.own = Boolean(this.conn.options.own);
                }
            } else {
                // If there are no launch parameters then just go to the RoomListView
                this.doingLaunchParams = false;
                this.roomListView.show(true);
            }
            this.conn.getRoomList({});
            this.conn.getBotList({});
        }
    };

    var cloneToDynamicRoom = function (roomList, roomId, roomName) {
        var room = roomList.getFirstRoom();
        if (room) {
            room = room.clone();
        } else {
            room = new FS.RoomModel({
                roomId: roomId,
                gameId: "",
                playerPoolId: "",
                'static': true,
                name: roomName,
                tables: 4,
                seats: 2,
                minimumToStart: 2
            });
        }
        room.set({roomId: roomId, name: roomName, 'static': false}, {silent: true});
        return room;
    };

    FS.MeetingRoom.prototype.jumpToRoom = function (roomId) {
        // If we are already in the room, don't leave, just show url
        if (this.roomView && this.roomView.isShowing(roomId)) {
            this.inviteView.checkToShowURL();
            return;
        }

        // Stop getting events from the current room.
        if (this.roomView.isShowing()) {
            this.conn.gatewayDisconnect({});
        }
        this.tryToEnterRoom(roomId);
    };

    FS.MeetingRoom.prototype.userWantsInviteCB = function (data) {// {table: table, roomId: roomId});
        var self = this;
        if (this.inviteView) {
            this.inviteView.getNewRoomParams(this.roomList, data.table, data.roomId, function (roomName, table, seat) {
                var existingRoom = self.roomList.models.filter(function (room) {
                    return (roomName === room.get('name'));
                })[0];
                // If the room doesn't exist, then create it, if it does then jump to there
                self.inviteView.setUrlParams({name: roomName, table: table, seat: seat});
                if (typeof existingRoom === 'undefined') {
                    var numtables = (self.roomList.length === 0 ? 4 : self.roomList.at(0).get("tables"));
                    var numseats = (self.roomList.length === 0 ? 2 : self.roomList.at(0).get("seats"));
                    var mTS = (self.roomList.length === 0 ? 2 : self.roomList.at(0).get('minimumToStart'));
                    var mP = (self.roomList.length === 0 ? undefined : self.roomList.at(0).get('maxPlayers'));
                    var gID = (self.roomList.length === 0 ? undefined : self.roomList.at(0).get('groupId'));
                    var rSID = (self.roomList.length === 0 ? undefined : self.roomList.at(0).get('requireSessionId'));
                    self.conn.createRoom({
                        gameId: self.conn.options.gameId,
                        name: roomName,
                        tables: numtables,
                        seats: numseats,
                        minimumToStart: mTS,
                        maxPlayers: mP,
                        groupId: gID,
                        requireSessionId: rSID
                    });
                } else {
                    self.inviteView.setUrlParams({roomId: existingRoom.get("roomId")});
                    self.jumpToRoom(existingRoom.get("roomId"));
                }
            });
        }
    };

    FS.MeetingRoom.prototype.createRoomCB = function (resp) {
        if (resp.data.code === 0) {
            // create a new room model and add it to the dynamic rooms list
            var room = cloneToDynamicRoom(this.roomList, resp.data.roomId, resp.data.name);

            // we need this list to display a list of dynamic room in the case, user enters a room, then back to room list
            this.roomList.add(room);
            // The only reason we would get a create Room is that we created one, so jump to it.
            this.inviteView.setUrlParams({roomId: resp.data.roomId});
            this.jumpToRoom(resp.data.roomId);
        }
    };

    FS.MeetingRoom.prototype.deleteRoomCB = function (resp) {
        if (resp.data.code === 0) {
            // Doing a GetRoomList resets the RoomList removing any dynamic rooms
            this.conn.getRoomList({});  // Depends on gameId being in the connection defaults
        }
    };

    FS.MeetingRoom.prototype.getBotListCB = function (resp) {
        if (resp.data.code === 0) {
            // The platform doesn't update bot list deltas, it just gives a new list.  
            // Rather then do deltas, just replace all contents
            this.botList.reset(resp.data.playerList);
        }
    };

    FS.MeetingRoom.prototype.tableStateCB = function (resp) {
        this.roomList.updateTables(resp.data.roomId, resp.data.states, this.playerList);
        if (this.haveInitialRoomState !== true) {
            this.haveInitialRoomState = true;
            this.trigger('MtRm_InitializedRoomState', this);
        }

        var room = this.roomList.findByRoomId(resp.data.roomId),
            self = this;

        resp.data.states.forEach(function (state) {
            if (state.type !== "TableLeave") {
                return;
            }

            var table = room.get("tableList").at(state.table),
                onlyBots = true,
                atTable;

            // Bots may still want to play
            if (table.get("state") !== "Idle") {
                return;
            }

            table.get("joined").forEach(function (p) {
                if (p.getAddr() == resp.destination) {
                    atTable = true;
                }
                onlyBots = onlyBots && p.isBot();
            });

            if (self.playerList.findById(state.playerId)[0].isBot()) {
                self.playerList.removePlayer(state.playerAddress);
            }

            if (self.conn.getKind() === "bot") {
                if (onlyBots && atTable) {
                    self.disconnectBot(resp.destination);
                } else if (state.booted === true) {
                    self.disconnectBot(state.playerAddress);
                }
            }
        });
    };

    FS.MeetingRoom.prototype.disconnectBot = function (address) {
        var idx = this.botAddresses.indexOf(address);
        if (idx < 0) {
            return;
        }
        this.botAddresses.splice(idx, 1);

        this.conn.gatewayEndSession({source: address}, function (resp) {
        });
    };

    FS.MeetingRoom.prototype.getRoomIdFromParams = function () {
        var roomId;
        if (typeof this.conn.options.roomname === "string") {
            var room = this.roomList.findByRoomName(this.conn.options.roomname);
            if (room) {
                roomId = room.get("roomId");
            }
        }
        if (roomId === undefined) {
            roomId = this.conn.options.roomid;
        }
        return roomId;
    };

    FS.MeetingRoom.prototype.getRoomListCB = function (resp) {
        if (resp.data.code === 0 || resp.data.code === 4013) {
            this.roomList.resetRooms(resp.data.roomList);
            // The roomId launch parameter is the first we must process
            if (this.doingLaunchParams) {
                var roomId = this.getRoomIdFromParams();
                this.jumpToRoom(roomId);
            }
        } else {
            console.log("MeetingRoom: Error while getting RoomList", resp);
        }
    };

    FS.MeetingRoom.prototype.exitedRoomCB = function () {
        if (this.roomListView) {
            this.roomView.show(false);
            this.roomListView.show(true);
            this.chatListView.setShowing(false);
            this.playerListView.setShowing(false);
        }
        this.conn.gatewayDisconnect({});
        this.conn.setOptions({
            roomId: null,
            connectDestination: null,
            disconnectDestination: null,
            destination: null,
            token: null
        });
    };

    FS.MeetingRoom.prototype.enterRoomTokenCB = function (resp) {
        this.currentRoomId = resp.data.roomId;
        this.enterRoomCB(resp, this.roomToken);
        delete this.roomToken;
    };

    FS.MeetingRoom.prototype.enterRoomCB = function (resp, token) {
        // If this succeeds then we should create the Room view then show it
        if (resp.data.code === 0) {
            // Now that we have successfully entered the room, set the default for roomId in the conn
            // so we don't have to specify it in API calls
            this.conn.setOptions({
                roomId: this.currentRoomId,
                connectDestination: resp.data.roomDestination,
                disconnectDestination: resp.data.roomDestination,
                destination: resp.data.roomDestination,
                token: resp.data.token
            });
            var room = this.roomList.findByRoomId(this.currentRoomId);

            if (!room) {
                room = new FS.RoomModel({
                    roomId: this.currentRoomId,
                    gameId: this.conn.options.gameId,
                    playerPoolId: this.conn.options.playerPoolId,
                    'static': true,           // EAS XXX does this make a difference?
                    tables: resp.data.tables,
                    seats: resp.data.seats,
                    name: resp.data.name,
                    minimumToStart: resp.data.minimumToStart
                });
                this.roomList.add(room);
                // if the current room is dynamic, we want to insure the our model matchs the platform
            } else if (room.get('static') !== true) {
                room.set({  // EAS XXX Why is the necessary?
                    tables: resp.data.tables,
                    seats: resp.data.seats,
                    name: resp.data.name,
                    minimumToStart: resp.data.minimumToStart
                }, {silent: true});
            }
            if (this.roomView) {
                this.roomView.changeRooms(room);
            }

            this.haveInitialRoomState = false;
            this.conn.gatewayConnect({
                roomDestination: resp.data.roomDestination,
                token: token
            });

            // The roomId launch parameter is the first we must process
            if (this.doingLaunchParams === false || typeof this.conn.options.table === "undefined") {
                this.doingLaunchParams = false;
                if (this.roomView) {
                    this.chatListView.setShowing(true);
                    this.playerListView.setShowing(true);
                    this.roomListView.show(false);
                    this.roomView.show(true);
                }
            }
        } else {
            // We cannot continue with launch parameters
            this.doingLaunchParams = false;
            console.log("MeetingRoom: Failed to enter room:", resp);
        }
    };

    FS.MeetingRoom.prototype.stoppedGameCB = function (resp) {
        if (typeof resp.data === "object" && typeof resp.data.roomId === "string" && typeof resp.data.table === "number") {
            var room = this.roomList.findByRoomId(resp.data.roomId);
            if (room !== undefined) {
                var table = room.get("tableList").at(resp.data.table);
                if (table !== undefined) {
                    this.destroyGameInstance(table);
                } else {
                    console.log("Got a stop game for a table that we don't know about", resp);
                }
            } else {
                console.log("Got a stop game for a room we don't know about", resp);
            }
        } else {
            console.log("Got a stop game with no roomId or table!", resp);
        }
    };

    FS.MeetingRoom.prototype.startGameCB = function (resp) {
        var self = this;
        // the room may not yet exist
        this.conn.setOptions({gameServerAddress: resp.destination});
        this.conn.setOptions({source: resp.destination});

        // First check if there is a room with this Id
        var tableList,
            idx,
            table,
            room = this.roomList.findByRoomId(resp.data.roomId);
        if (room === undefined) {
            room = new FS.RoomModel({
                roomId: resp.data.roomId,
                gameId: this.conn.options.gameId,
                playerPoolId: resp.data.playerPoolId,
                'static': true,           // EAS XXX does this make a difference?
                name: resp.data.roomId,
                tables: resp.data.table + 1,  // Is this max tables or just this table
                seats: resp.data.seats
            });
            var i, tl = [];
            for (i = 0; i <= resp.data.table; i += 1) {
                tl.push({number: i, room: room, tables: resp.data.table + 1, numSeats: resp.data.seats});
            }
            tableList = new FS.TableListModel(tl);
            room.set({tableList: tableList});
            this.roomList.add(room);
        }
        this.currentRoomId = resp.data.roomId;

        // Now check if there is enough tables in the room (we may have first been told about table 4 then later about table 8
        tableList = room.get("tableList");
        for (idx = tableList.length; idx < resp.data.table + 1; idx += 1) {
            table = new FS.TableModel({number: idx, numSeats: resp.data.seats, room: room});
            tableList.add(table);
        }
        table = tableList.at(resp.data.table);

        if (table.get("state") === "Active") {
            // The table is already active.  This might happen if the platform determined we took too long to
            // shutdown when no players at the table.  We will send a message to the instance to tell it to
            // clean up and then idle the table
            this.destroyGameInstance(table);
        }

        // The room and table now exists, change its settings if present
        if (typeof resp.data.settings === "string") {
            table.set({settings: resp.data.settings});
        }

        // The last things it to process the array in "playerList" which is the same data as a "StateUpdate" update, so 
        // we will add type : "StateUpdate" and then do a standard update
        for (idx in resp.data.playerList) {
            resp.data.playerList[idx].type = "StateUpdate";
        }

        // We need to make sure the table does not have anyone sitting at it when we start
        for (idx = 0; idx < resp.data.seats; idx++) {
            table.get("seats").at(idx).set({occupant: null});
        }
        table.get("joined").resetList();

        this.roomList.updateTables(this.currentRoomId, resp.data.playerList, this.playerList);

        // We are all prepared, respond to the startGame 
        this.conn.startGameStatus({destination: resp.source, tag: resp.tag, code: 0});

        // Send all players a Hello message to let them know what table we are at
        table.get("joined").models.forEach(function (tablePlayer) {
            var addr = tablePlayer.getAddr();
            if (tablePlayer.get("ready")) {
                self.conn.eventGameServerHello({
                    roomId: resp.data.roomId,
                    table: resp.data.table,
                    destination: addr,
                    gameServerAddress: resp.destination
                });
            }
        });
    };


// EAS XXX TODO bug, need to tell player table is locked rather then ask them to send request to join table
    FS.MeetingRoom.prototype.gatewayConnectCB = function (resp) {
        if (resp.data.code === 0) {
            if (this.doingLaunchParams && typeof this.conn.options.table !== "undefined") {
                this.conn.joinTable({table: Number(this.conn.options.table)});
                if (typeof this.conn.options.seat !== "undefined") {
                    this.conn.sitSeat({table: Number(this.conn.options.table), seat: Number(this.conn.options.seat)});
                }
                if (typeof this.conn.options.own !== "undefined") {
                    if (Boolean(this.conn.options.own)) {
                        this.conn.ownTable({table: Number(this.conn.options.table)});
                    }
                }
                if (typeof this.conn.options.ready !== "undefined") {
                    this.conn.setReady({table: this.conn.options.table, ready: this.conn.options.ready});
                }
            } else {
                this.doingLaunchParams = false;
            }
        } else {
            this.doingLaunchParams = false;
        }
    };

    // The only reason we care about this event is in case we are processing Launch parameters
    // if so then once the join is done we are done processing so show the room view and be done
    FS.MeetingRoom.prototype.joinTableCB = function (resp) {
        if (this.doingLaunchParams) {
            this.doingLaunchParams = false;
            this.chatListView.setShowing(true);
            this.playerListView.setShowing(true);
            this.roomListView.show(false);
            this.roomView.show(true);
        }
    };


    FS.MeetingRoom.prototype.subscribeToPlatform = function () {
        var self = this;
        // Once a player is confirmed logged in we send a GetRoomList.

        // These events will arrive when we try to change to a RoomView but need to verify
        // that we can get into the room in question first.
        this.conn.bind('GatewayDisconnect', self.reconnect);

        // When login happens, start getting messages from FunSockets
        this.conn.bind('MtRm_PlayerLoggedIn', self.loggedIn);

        return this;
    };

    // The user wants to enter a room, either by a URL based request
    // or by them being in the RoomListView and clicking "enter room"
    FS.MeetingRoom.prototype.tryToEnterRoom = function (roomId) {
        this.currentRoomId = roomId;
        this.conn.enterRoom({roomId: roomId});
    };

    /**
     * Creates an FS.ClientGameInstance object.
     *
     * @constructor
     * @augments FS.GameInstance
     *
     * @class The ClientGameInstance is a base class for objects that are created when the MeetingRoom Code detects that a table the
     *        current player is at goes Active. The Meeting room will also create an instance of this calss when the player is at a
     *        table that is already in progress and the player goes "ready".
     *
     *        It is expected that the developer will extend this class to create a class for that handles the specifics of their own game
     *        They register their class with the Meeting Room and it will automatically create one for each table that goes active
     *
     *
     * <h2> Example</h2>
     * <p>
     * If this base class is registered with the Meeting Room, it will implement a simple PING PONG "game" that allows clients to send
     * message back and forth to each other.  Running it requires starting a PING PONG game server
     * </p>
     *
     * <pre>
     * FS.main = function(gameInstance) {
     *     gameInstance.bind(&quot;message:pingMove&quot;, function(data) {
     *         console.log(&quot;received: pingMove&quot; + JSON.stringify(data));
     *         if (gameInstance.getMySeatIndex() == 1) {
     *             gameInstance.send(&quot;pongMove&quot;, {});
     *         }
     *     });
     *     gameInstance.bind(&quot;message:pongMove&quot;, function(data) {
     *         console.log(&quot;received: pongMove&quot; + JSON.stringify(data));
     *         // game over - exit clients from room, game server should exit when all off table
     *             gameInstance.leaveTable();
     *             var roomController = gameInstance.getRoomController();
     *             roomController.exit();
     *             roomController.close();
     *         });
     *     if (gameInstance.getMySeatIndex() == 0) {
     *         gameInstance.send(&quot;pingMove&quot;, {});
     *     }
     * };
     * </pre>
     *
     */
    FS.ClientGameInstance = function (meetingRoom, gameAddress, room, table) {
        this.meetingRoom = meetingRoom;
        this.connection = meetingRoom.getConnection();
        this.gameAddress = gameAddress;
        this.table = table;
        this.room = room;
        FS.ClientGameInstance.superclass.constructor.call(this, meetingRoom, table);
        this.pauseMessages = false;
        this.messageQueue = [];
        var self = this;

        // Need to create functions that we can bind and unbind to.   TODO unbind
        this.gameMessageBind = function () {
            self._onMessage.apply(self, arguments);
        };

        this.connection.bind("gameMessage", self.gameMessageBind);
    };
    FS.Utils.extend(FS.ClientGameInstance, FS.GameInstance);

    /**
     * Leaves the table. Sending the LeaveTable message to the room. What other convenience function are useful? setReady, etc? These
     * table type functions might be in html. Likely not needed.
     *
     * @private
     *
     */
    FS.ClientGameInstance.prototype.leaveTable = function () {
        this.connection.leaveTable({
            table: this.table.get("number")
        });
    };
    /**
     * Gets the FS.PlayerModel object for this current player.
     *
     * @returns {FS.PlayerModel}
     */
    FS.ClientGameInstance.prototype.getLocalPlayer = function () {
        return this.meetingRoom.getLocalPlayer();
    };
    /**
     * Gets the seat index for this player, -1 if not seated.
     *
     * @returns {Number}
     */
    FS.ClientGameInstance.prototype.getMySeatIndex = function () {
        return this.table.get("seats").findByAddress(this.meetingRoom.getPlayerAddr()).get("seat");
    };
    /**
     * Sends the messageName with jsonData to the server. This is used to send game specific messages to the server. For example
     *
     * <pre>
     * gameInstance.send(&quot;move&quot;, {
     *     move : &quot;e4&quot;
     * });
     * gameInstance.send(&quot;move&quot;, {
     *     move : &quot;pass&quot;
     * });
     * gameInstance.send(&quot;pass&quot;, {
     *     cards : [ &quot;AS&quot;, &quot;KS&quot;, &quot;QS&quot; ]
     * });
     * gameInstance.send(&quot;play&quot;, {
     *     card : &quot;AS&quot;
     * });
     * gameInstance.send(&quot;newGame&quot;, {});
     * </pre>
     *
     * The messageName and jsonData can be anything the game developer desires.
     *
     * @param messageName
     * @param jsonData
     */
    FS.ClientGameInstance.prototype.send = function (messageName, jsonData) {
        if (FS.Debug.game.messages) {
            console.log("--> " + messageName + ", " + JSON.stringify(jsonData));
        }
        // destination defaults to gameAddress
        this.connection.eventGameMessage({
            messageName: messageName,
            data: jsonData,
            destination: this.gameAddress
        });
    };
    /**
     * Sets or clears the pauseMessages state. If set to true, no messages will be delivered to the client. The messages will be queued
     * and delivered as soon as pauseMessages is set to false. Pausing messages delivery can be used to load graphics and sound assets
     * during the start of a game for example.
     *
     * @param pauseMessages
     */
    FS.ClientGameInstance.prototype.setPauseMessages = function (pauseMessages) {
        this.pauseMessages = pauseMessages;
        if (!this.pauseMessages) {
            this._deliverMessages();
        }
    };
    /**
     * Checks the pauseMessages state. If true, the messages will be queue and delivered to the client later when it is set to false.
     *
     * @returns
     */
    FS.ClientGameInstance.prototype.isPauseMessages = function () {
        return this.pauseMessages;
    };
    FS.ClientGameInstance.prototype._deliverMessages = function () {
        // deliver if not paused
        if (!this.isPauseMessages()) {
            // deliver the all one after another! is this too fast?
            while (this.messageQueue.length > 0) {
                var message = this.messageQueue.shift();
                this.trigger("incomingMessage", message.data.messageName, message.data.data, message);
                // send the multiplexed message to listeners - assumes message.data.messageName is defined
                this.trigger("incomingMessage:" + message.data.messageName, message.data.data, message);
            }
        }
    };
    FS.ClientGameInstance.prototype._onMessage = function (message) {
        if (FS.Debug.game.messages) {
            console.log("<-- " + message.data.messageName + ", " + JSON.stringify(message.data.data), message);
        }
        if (message.source === this.gameAddress) {
            if (message.message === "GameMessage") {
                this.messageQueue.push(message);
                this._deliverMessages();
            }
        }
    };

    /**
     * Binds the given callback to eventName. Currently supported events include: playerEnter, playerExit, gameExit, and message:xxx.
     * <p>
     * playerEnter and playerExit are sent when a player becomes ready or not ready.
     * </p>
     * <p>
     * gameExit is sent when a game server disconnects. The gameExit event is likely to be ignored by the game client, but but could be
     * useful to display info if a game server crashes. Specifically gameExit occurs when the transition from table state goes from
     * active to Idle.
     * </p>
     * <p>
     * message:xxxx is send with a message of type xxx is received. This can help with message dispatching. The message name (xxx) is
     * also passed as the first parameter, in case all message are sent to one function for convenience.
     * </p>
     * <h2>Examples</h2>
     *
     * <pre>
     * gameInstance.bind(&quot;message&quot;:ChessMove, function(messageName, jsonData) {
     *     // do work here, messageName === &quot;ChessMove&quot;
     * });
     * gameInstance.bind(&quot;playerEnter&quot;, function(player) {
     *     // do work here - FS.TablePlayer, player is now ready
     * });
     * gameInstance.bind(&quot;playerExit&quot;, function(player) {
     *     // do work here - FS.TablePlayer, player is no longer ready
     * });
     * </pre>
     *
     * @function
     * @name FS.ClientGameInstance.prototype.bind
     * @param eventName
     * @param callback
     * @param thisObject
     */


    // DOCUMENT EVENTS:
    // close
    // message
    /**
     * Creates an FS.ServerGameInstance object.
     *
     * @constructor
     * @augments FS.GameInstance
     *
     * @class This class is created internally and passed to the game server developer for each instance of the game server. Along with
     *        the FS.ServerGameInstance, there are many conveniences provided. One major one is the automatic passing of the game server
     *        address to the the client. And then the ability to send/receive only game related messages. Should other messages be
     *        commonly necessary, a convenience function will be provided. If necessary the whole platform interface can be available.
     *        At present we expect the game server developer to be able to do all development with only this interface.
     *
     */
    FS.ServerGameInstance = function (meetingRoom, gameAddress, room, table) {
        var self = this;
        this.meetingRoom = meetingRoom;
        this.connection = meetingRoom.getConnection();
        this.gameAddress = gameAddress;
        this.room = room;
        this.table = table;
        var index;
        FS.ServerGameInstance.superclass.constructor.call(this, meetingRoom, table);

        var seatedPlayers = table.getSeatedPlayers(true);
        for (index in seatedPlayers) {
            //console.log("sitting at table: " + seatedPlayers[index].getName() + " [" + seatedPlayers[index].getAddr() + "]");
            this.connection.gatewayConnect({connectDestination: seatedPlayers[index].getAddr()});
        }

        // Need to create functions that we can bind and unbind to.   TODO unbind
        this.gameMessageBind = function () {
            self._onMessage.apply(self, arguments);
        };
        this.playerJoinedBind = function () {
            self._onPlayerJoinedTable.apply(self, arguments);
        };

        this.connection.bind("gameMessage", self.gameMessageBind);
        this.table.bind("joined:change:add", self.playerJoinedBind);

    };
    FS.Utils.extend(FS.ServerGameInstance, FS.GameInstance);


    /**
     * Stop the game instance and return the table to Idle state
     * This function sends a GatewayEndSession.  When the reply
     * arrives tells the meeting room to release the instance
     */
    FS.ServerGameInstance.prototype.exit = function (callback) {
        var self = this;
        this.connection.gatewayEndSession({source: this.gameAddress}, function (resp) {
            self.connection.unbind("gameMessage", self.gameMessageBind);
            self.table.unbind("joined:change:add", self.playerJoinedBind);
            self._cleanUpEventBindings();

            if (resp.data.code !== 0) {
                console.log("ERROR:  Cannot shut game instance down");
            }
            self.meetingRoom.destroyGameInstance(self.table);

            if (callback !== undefined) {
                callback(resp.data.code === 0);
            }
        });
    };

    // Created an alias for legacy purposes
    FS.ServerGameInstance.prototype.gameOver = FS.ServerGameInstance.prototype.exit;


    FS.ServerGameInstance.prototype._onPlayerJoinedTable = function (player) {
        // allow the game client to get the game server address
        this.connection.gatewayConnect({connectDestination: player.playerAddress});
        this.connection.sendStatus("GameHello", {
            destination: player.playerAddress,
            source: this.gameAddress,
            data: {
                roomId: this.roomId,
                tableIndex: this.getTableIndex()
            }
        });
    };
    // EAS TODO Cases for disconnect/game server quit:
    //      1) The admin kills this server (the process)
    //      2) The platform kills this server (the root connection)
    //      3) The platform kills this game instance (Can it do this?)
    //      4) The game server code decides the game is over (calls function to kill instance)
    //      5) There are no more players at the table (Is this valid, maybe linkdead???)
    FS.ServerGameInstance.prototype._disconnectGameInstance = function () {
        this.trigger("gameExit");
        this.wsc.send("GatewayDisconnect", {
            disconnectDestination: this.roomDestination,
            source: this.gameAddress
        });
    };
    FS.ServerGameInstance.prototype._onMessage = function (message) {
        if (FS.Debug.game.messages) {
            console.log("<-- " + message.data.messageName + ", " + JSON.stringify(message.data.data), message);
        }
        // only bother with messages addressed to this instance
        if (message.destination === this.gameAddress) {
            // send the complete message to listeners - may not be needed
            this.trigger("incomingMessage", message.data.messageName, message.data.data, message);
            // send the multiplexed message to listeners - assumes message.data.messageName is defined
            if (message.data.messageName !== undefined) {
                this.trigger("incomingMessage:" + message.data.messageName, message.data.data, message);
            }
        }
    };
    /**
     * Gets the roomId corresponding to this game instance.
     *
     * @returns {String}
     */
    FS.ServerGameInstance.prototype.getRoomId = function () {
        return this.room.get("roomId");
    };
    /**
     * Gets the roomDestination corresponding to this game instance.
     *
     * @returns {String}
     */
    FS.ServerGameInstance.prototype.getRoomDestination = function () {
        return this.room.get("roomDestination");
    };
    /**
     * Gets the gameAddress corresponding to this game instance.
     *
     * @returns {String}
     */
    FS.ServerGameInstance.prototype.getGameAddress = function () {
        return this.gameAddress;
    };
    /**
     * Gets the the FS.MessageWebSocketConnection corresponding to this game instance. This can be used to send arbitrary messages to
     * the platform or the client if necessary. It is intended that common functionality be provided in the game instance class. Please
     * let use know of commonly need functionality to include in the game server instance before using this method.
     *
     * @returns
     */
    FS.ServerGameInstance.prototype.getConnection = function () {
        return this.connection;
    };

    /**
     * Gets the FS.Table instance corresponding to this game server instance. The table can be used to bind to notifications about
     * players leaving, joining, sitting, etc. See FS.Table for all possible notifications.
     *
     * @returns {FS.Table}
     */
    FS.ServerGameInstance.prototype.getTable = function () {
        return this.table;
    };
    /**
     * Sends JSON data to all seated, ready players at this table.
     *
     * @param messageName
     * @param jsonData
     */
    FS.ServerGameInstance.prototype.sendToAllSeated = function (messageName, jsonData) {
        if (FS.Debug.game.messages) {
            console.log("--> toAllSeated:" + messageName + ", " + JSON.stringify(jsonData));
        }
        var playerList = this.table.getSeatedPlayers(true);
        this._sendToList(playerList, messageName, jsonData);
    };
    /**
     * Sends JSON data to all players (watching, seated, etc.) at this table.
     *
     * @param messageName
     * @param jsonData
     */
    FS.ServerGameInstance.prototype.sendToAllJoined = function (messageName, jsonData) {
        if (FS.Debug.game.messages) {
            console.log("--> toAllJoined:" + messageName + ", " + JSON.stringify(jsonData));
        }
        var playerList = this.table.getJoinedPlayers(true);
        this._sendToList(playerList, messageName, jsonData);
    };
    /**
     * Sends JSON data to all players (watching, seated, etc.) at this table.
     *
     * @param messageName
     * @param jsonData
     */
    FS.ServerGameInstance.prototype._sendToList = function (playerList, messageName, jsonData) {
        playerList.forEach(function (player) {
            this.connection.eventGameMessage({
                destination: player.getAddr(),
                messageName: messageName,
                data: jsonData,
                source: this.gameAddress
            });
        }, this);
    };
    /**
     * Sends the given messageName with the give jsonData to given player.
     *
     * @param messageName
     * @param player
     * @param jsonData
     */
    FS.ServerGameInstance.prototype.sendToPlayer = function (messageName, player, jsonData) {
        if (FS.Debug.game.messages) {
            console.log("--> toPlayer:" + messageName + ", " + player.getName() + ", " + JSON.stringify(jsonData));
        }
        this.connection.eventGameMessage({
            destination: player.getAddr(),
            source: this.gameAddress,
            messageName: messageName,
            data: jsonData
        });
    };

    /**
     * Binds the given callback to eventName. Currently supported events include: playerEnter, playerExit, gameExit, and message:xxx.
     * <p>
     * playerEnter and playerExit are sent when a player becomes ready or not ready.
     * </p>
     * <p>
     * gameExit is sent when a game server instance disconnects.
     * </p>
     * <p>
     * message:xxxx is send with a message of type xxx is received. This can help with message dispatching. The message name (xxx) is
     * also passed as the first parameter, in case all message are sent to one function for convenience.
     * </p>
     * <h2>Examples</h2>
     *
     * <pre>
     * gameInstance.bind(&quot;message&quot;:ChessMove, function(messageName, jsonData) {
     *  // do work here, messageName === &quot;ChessMove&quot;
     * });
     * gameInstance.bind(&quot;playerEnter&quot;, function(player) {
     *  // do work here - FS.TablePlayerModel, player is now ready
     * });
     * gameInstance.bind(&quot;playerExit&quot;, function(player) {
     *  // do work here - FS.TablePlayerModel, player is no longer ready
     * });
     * </pre>
     *
     * @function
     * @name FS.ServerGameInstance.prototype.bind
     * @param eventName
     * @param callback
     * @param thisObject
     */

    /**
     * Creates an FS.BotGameInstance object.
     *
     * @constructor
     * @augments FS.GameInstance
     *
     * @class The BotGameInstance is a base class for objects that are created when the MeetingRoom Code detects that a table the
     *        current player is at goes Active. The Meeting room will also create an instance of this calss when the player is at a
     *        table that is already in progress and the player goes "ready".
     *
     *        It is expected that the developer will extend this class to create a class for that handles the specifics of their own game
     *        They register their class with the Meeting Room and it will automatically create one for each table that goes active
     *
     *
     * <h2> Example</h2>
     * <p>
     * If this base class is registered with the Meeting Room, it will implement a simple PING PONG "game" that allows clients to send
     * message back and forth to each other.  Running it requires starting a PING PONG game server
     * </p>
     *
     * <pre>
     * FS.main = function(gameInstance) {
     *     gameInstance.bind(&quot;message:pingMove&quot;, function(data) {
     *         console.log(&quot;received: pingMove&quot; + JSON.stringify(data));
     *         if (gameInstance.getMySeatIndex() == 1) {
     *             gameInstance.send(&quot;pongMove&quot;, {});
     *         }
     *     });
     *     gameInstance.bind(&quot;message:pongMove&quot;, function(data) {
     *         console.log(&quot;received: pongMove&quot; + JSON.stringify(data));
     *         // game over - exit clients from room, game server should exit when all off table
     *             gameInstance.leaveTable();
     *             var roomController = gameInstance.getRoomController();
     *             roomController.exit();
     *             roomController.close();
     *         });
     *     if (gameInstance.getMySeatIndex() == 0) {
     *         gameInstance.send(&quot;pingMove&quot;, {});
     *     }
     * };
     * </pre>
     *
     */
    FS.BotGameInstance = function (meetingRoom, gameAddress, room, table, address) {
        this.meetingRoom = meetingRoom;
        this.connection = meetingRoom.getConnection();
        this.gameAddress = gameAddress;
        this.botAddress = address;
        this.table = table;
        this.room = room;
        FS.BotGameInstance.superclass.constructor.call(this, meetingRoom, table);
        this.pauseMessages = false;
        this.messageQueue = [];
        var self = this;

        // Need to create functions that we can bind and unbind to.
        this.gameMessageBind = function () {
            self._onMessage.apply(self, arguments);
        };
        this.tableStateBind = function () {
            self.onTableState.apply(self, arguments);
        };

        this.connection.bind("tableState", self.tableStateBind);
        this.connection.bind("gameMessage", self.gameMessageBind);
    };
    FS.Utils.extend(FS.BotGameInstance, FS.GameInstance);

    FS.BotGameInstance.prototype.cleanup = function () {
        this.connection.unbind("tableState", this.tableStateBind);
        this.connection.unbind("gameMessage", this.gameMessageBind);
    };

    /**
     * Gets the FS.PlayerModel object for this current player.
     *
     * @returns {FS.PlayerModel}
     */
    FS.BotGameInstance.prototype.getLocalPlayer = function () {
        return this.meetingRoom.playerList.findByAddress(this.botAddress);
    };

    /**
     * Gets the seat index for this player, -1 if not seated.
     *
     * @returns {Number}
     */
    FS.BotGameInstance.prototype.getMySeatIndex = function () {
        return this.table.get("seats").findByAddress(this.botAddress).get("seat");
    };

    /**
     * Sends the messageName with jsonData to the server. This is used to send game specific messages to the server. For example
     *
     * <pre>
     * gameInstance.send(&quot;move&quot;, {
     *     move : &quot;e4&quot;
     * });
     * gameInstance.send(&quot;move&quot;, {
     *     move : &quot;pass&quot;
     * });
     * gameInstance.send(&quot;pass&quot;, {
     *     cards : [ &quot;AS&quot;, &quot;KS&quot;, &quot;QS&quot; ]
     * });
     * gameInstance.send(&quot;play&quot;, {
     *     card : &quot;AS&quot;
     * });
     * gameInstance.send(&quot;newGame&quot;, {});
     * </pre>
     *
     * The messageName and jsonData can be anything the game developer desires.
     *
     * @param messageName
     * @param jsonData
     */
    FS.BotGameInstance.prototype.send = function (messageName, jsonData) {
        if (FS.Debug.game.messages) {
            console.log("--> " + messageName + ", " + JSON.stringify(jsonData));
        }
        // destination defaults to gameAddress
        this.connection.eventGameMessage({
            source: this.botAddress,
            messageName: messageName,
            data: jsonData,
            destination: this.gameAddress
        });
    };
    /**
     * Sets or clears the pauseMessages state. If set to true, no messages will be delivered to the client. The messages will be queued
     * and delivered as soon as pauseMessages is set to false. Pausing messages delivery can be used to load graphics and sound assets
     * during the start of a game for example.
     *
     * @param pauseMessages
     */
    FS.BotGameInstance.prototype.setPauseMessages = function (pauseMessages) {
        this.pauseMessages = pauseMessages;
        if (!this.pauseMessages) {
            this._deliverMessages();
        }
    };
    /**
     * Checks the pauseMessages state. If true, the messages will be queue and delivered to the client later when it is set to false.
     *
     * @returns
     */
    FS.BotGameInstance.prototype.isPauseMessages = function () {
        return this.pauseMessages;
    };
    FS.BotGameInstance.prototype._deliverMessages = function () {
        // deliver if not paused
        if (!this.isPauseMessages()) {
            // deliver the all one after another! is this too fast?
            while (this.messageQueue.length > 0) {
                var message = this.messageQueue.shift();
                this.trigger("incomingMessage", message.data.messageName, message.data.data, message);
                // send the multiplexed message to listeners - assumes message.data.messageName is defined
                this.trigger("incomingMessage:" + message.data.messageName, message.data.data, message);
            }
        }
    };

    FS.BotGameInstance.prototype._onMessage = function (message) {
        if (FS.Debug.game.messages) {
            console.log("<-- " + message.data.messageName + ", " + JSON.stringify(message.data.data), message);
        }
        if (message.source === this.gameAddress && message.destination === this.botAddress) {
            if (message.message === "GameMessage") {
                this.messageQueue.push(message);
                this._deliverMessages();
            }
        }
    };

    FS.BotGameInstance.prototype.onPlayerLeave = function () {
    };

    FS.BotGameInstance.prototype.onTableState = function (incoming) {
        var self = this;
        /**
         *  Automatically exit when the bot when it is booted
         */
        incoming.data.states.forEach(function (state) {
            if (state.table !== self.table.get("number")) {
                return;
            }

            if (state.type == "TableLeave") {
                self.onPlayerLeave(state.playerAddress);
            } else if (state.type === "ReadySet" && state.playerAddress === self.botAddress) {
                self.exit();
            }
        });
    };

    FS.BotGameInstance.prototype.exit = function () {
        // Do not allow bot to exit multiple times (SecurityViolation)
        this.exit = function () {
        };
        this.connection.gatewayEndSession({source: this.botAddress}, function (resp) {
        });
        this.cleanup();
    };

    /**
     * Binds the given callback to eventName. Currently supported events include: playerEnter, playerExit, gameExit, and message:xxx.
     * <p>
     * playerEnter and playerExit are sent when a player becomes ready or not ready.
     * </p>
     * <p>
     * gameExit is sent when a game server disconnects. The gameExit event is likely to be ignored by the game client, but but could be
     * useful to display info if a game server crashes. Specifically gameExit occurs when the transition from table state goes from
     * active to Idle.
     * </p>
     * <p>
     * message:xxxx is send with a message of type xxx is received. This can help with message dispatching. The message name (xxx) is
     * also passed as the first parameter, in case all message are sent to one function for convenience.
     * </p>
     * <h2>Examples</h2>
     *
     * <pre>
     * gameInstance.bind(&quot;message&quot;:ChessMove, function(messageName, jsonData) {
     *     // do work here, messageName === &quot;ChessMove&quot;
     * });
     * gameInstance.bind(&quot;playerEnter&quot;, function(player) {
     *     // do work here - FS.TablePlayer, player is now ready
     * });
     * gameInstance.bind(&quot;playerExit&quot;, function(player) {
     *     // do work here - FS.TablePlayer, player is no longer ready
     * });
     * </pre>
     *
     * @function
     * @name FS.BotGameInstance.prototype.bind
     * @param eventName
     * @param callback
     * @param thisObject
     */



    FS.Achievement = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            },
            'mediaPackage': {
                'get': function () {
                    if (this.objectData.mediaPackage) {
                        return JSON.parse(this.objectData.mediaPackage);
                    }
                    return this.template.mediaPackage;
                },
                'set': function (v) {
                },
                'configurable': false,
                'enumerable': true
            }
        });

        this.defineModel({
            'achievementId': FS.PrimaryKey,

            'developerId': String,
            'currentUnlockPoints': Number,
            'gameId': String,
            'name': String,
            'tags': Object, // THIS SHOULD MAP TO COLLECTION(STRING)
            'unlocked': Boolean,
            'achievementTemplateId': String,
            'recommended': Boolean,
            'customId': Number,
            'maximumUnlockPoints': Number,
            'description': String
        }, data);
    }, FS.Model);

    FS.Achievement.model = FS.Model.ObjectKeyModel(FS.Achievement);
    FS.Achievement.cache = {};

    FS.Achievement.locateCache = function (conn, data) {
        if (FS.Achievement.cache[data.achievementId] === undefined) {
            FS.Achievement.cache[data.achievementId] = new FS.Achievement(conn, data);
        } else {
            FS.Achievement.cache[data.achievementId].refresh(data);
            if (conn) {
                FS.Achievement.cache[data.achievementId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }
        return FS.Achievement.cache[data.achievementId].promise;
    };

    FS.Achievement.prototype.pull = function () {
        var p = new FS.Promise();
        var that = this;

        this.connection.findAchievements({achievementObjectId: this.id}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            if (resp.data.achievementList.length < 1) {
                p.fail('Not found');
                return;
            }

            that.refresh(resp.data.achievementList[0]);
            p.resolve(that);
        });

        return p;
    };

    FS.Achievement.prototype.refresh = function (v) {
        v.templateData = v.templateData || [];
        v.objectData = v.objectData || [];

        for (var key in v) {
            switch (key) {
                case 'objectData':
                case 'templateData':
                    this[key] = FS.Utils.unfoldObjectKV(v[key]);
                    break;
                default:
                    this[key] = v[key];
                    break;
            }
        }
    };

    FS.Achievement.prototype.getViewer = function (div) {
        return new FS.ItemViewer(this.mediaPackage, div);
    };


    FS.Achievement.isAchievement = function (v) {
        return v instanceof FS.Achievement;
    };

    FS.Achievement.getById = function (conn, id) {
        var p = new FS.Promise();

        if (FS.Achievement.cache[id]) {
            p.resolve(FS.Achievement.cache[id]);
            return p;
        }

        conn.findAchievements({achievementObjectId: id}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            if (resp.data.achievementList.length < 1) {
                p.fail('Not found');
                return;
            }

            FS.Achievement.locateCache(conn, resp.data.achievementList[0]).then(function (resp) {
                p.resolve(resp);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };

    FS.Achievement.getAll = function (conn, options) {
        var p = new FS.Promise();
        var that = this;

        conn.findAchievements(options, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            var jq = new FS.JobQueue();
            var output = new FS.Collection(FS.Achievement);

            resp.data.achievementList.forEach(function (o, idx) {
                new jq.Job(function () {
                    var job = this;

                    FS.Achievement.locateCache(conn, o).then(function (obj) {
                        output.set(idx, obj);
                        job.done();
                    }, function (err) {
                        job.fail(err);
                    });
                });
            });

            jq.bind('error', function (err) {
                p.fail(err);
            });
            jq.bind('finished', function () {
                p.resolve(output);
            });
            jq.start();
        });

        return p;
    };


    FS.Properties = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'enumerable': true,
                'writable': true,
                'configurable': true
            }
        });

        this.defineModel({
            "player": FS.Player,
            'gameId': String,
            "developerId": String
        }, data);
    }, FS.Model);

    FS.Properties.model = FS.Model.ObjectKeyModel(FS.Properties);

    FS.Properties.isProperties = function (v) {
        return v && v instanceof FS.Properties;
    };

    FS.Properties.find = function (value) {
        var p = new FS.Promise();
        var o = FS.Utils.mergeProperties({key: value}, this);

        this.connection.findProperties(o, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.properties);
        });

        return p;
    };

    FS.Properties.get = function (key) {
        var p = new FS.Promise();
        var o = FS.Utils.mergeProperties({key: key}, this);

        this.connection.getProperty(o, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data);
        });

        return p;
    };

    FS.Properties.set = function (key, data) {
        var p = new FS.Promise();
        var o = FS.Utils.mergeProperties({key: key, value: data}, this);

        this.connection.setProperty(o, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data);
        });

        return p;
    };

    FS.Properties.append = function (key, data) {
        var p = new FS.Promise();
        var o = FS.Utils.mergeProperties({key: key}, this);

        this.connection.appendProperty(o, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data);
        });

        return p;
    };

    FS.Properties.contains = function (key, value) {
        var p = new FS.Promise();
        var o = FS.Utils.mergeProperties({key: value}, this);

        this.connection.getProperty(o, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data.index);
        });

        return p;
    };


    FS.AchievementTemplate = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            },
            'mediaPackage': {
                'get': function () {
                    if (this.objectData.mediaPackage) {
                        return JSON.parse(this.objectData.mediaPackage);
                    }
                    return {};
                },
                'set': function (v) {
                },
                'configurable': false,
                'enumerable': true
            }
        });

        this.defineModel({
            'achievementTemplateId': FS.PrimaryKey,

            'gameId': String,
            'developerId': String,
            'tags': Object, // THIS SHOULD MAP TO COLLECTION(STRING)
            'templateData': Object,
            'objectData': Object,
            'name': String,
            'currentUnlockPoints': Number,
            'maximumUnlockPoints': Number,
            'recommended': Boolean,
            'customId': Number,
            'description': String
        }, data);
    }, FS.Model);

    FS.AchievementTemplate.model = FS.Model.ObjectKeyModel(FS.AchievementTemplate);
    FS.AchievementTemplate.cache = {};

    FS.AchievementTemplate.locateCache = function (conn, data) {
        if (FS.AchievementTemplate.cache[data.achievementId] === undefined) {
            FS.AchievementTemplate.cache[data.achievementId] = new FS.AchievementTemplate(conn, data);
        } else {
            FS.AchievementTemplate.cache[data.achievementId].refresh(data);
            if (conn) {
                FS.AchievementTemplate.cache[data.achievementId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }
        return FS.AchievementTemplate.cache[data.achievementId].promise;
    };

    FS.AchievementTemplate.prototype.pull = function () {
        var p = new FS.Promise();
        var that = this;

        this.connection.getAchievementTemplate({achievementTemplateId: this.id}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            that.refresh(resp.data.achievementData);
            p.resolve(that);
        });

        return p;
    };

    FS.AchievementTemplate.prototype.refresh = function (v) {
        v.templateData = v.templateData || [];
        v.objectData = v.objectData || [];

        for (var key in v) {
            switch (key) {
                case 'objectData':
                case 'templateData':
                    this[key] = FS.Utils.unfoldObjectKV(v[key]);
                    break;
                default:
                    this[key] = v[key];
                    break;
            }
        }
    };

    FS.AchievementTemplate.prototype.update = function () {
        var p = new FS.Promise();
        var that = this;

        // Fold the data
        var data = FS.Utils.shallowCopy(this);
        data.templateData = FS.Utils.foldObjectKV(this.templateData);
        data.objectData = FS.Utils.foldObjectKV(this.objectData);

        if (typeof this.id !== 'string') {
            this.connection.createAchievementTemplate(data, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }

                p.resolve(resp.data);
                FS.AchievementTemplate[that.id] = that;
            });
        } else {
            this.connection.updateAchievementTemplate(data, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }
                p.resolve(resp.data);
            });
        }

        return p;
    };

    FS.AchievementTemplate.prototype.getViewer = function (div) {
        return new FS.ItemViewer(this.mediaPackage, div);
    };


    FS.AchievementTemplate.isAchievementTemplate = function (v) {
        return v instanceof FS.AchievementTemplate;
    };

    FS.AchievementTemplate.getAll = function (conn, options) {
        var p = new FS.Promise();

        conn.findAchievementTemplates(options).then(function (data) {
            var jq = new FS.JobQueue();
            var output = new FS.Collection(FS.AchievementTemplate);

            data.achievementTemplateList.forEach(function (o, idx) {
                new jq.Job(function () {
                    var job = this;

                    FS.Object.locateCache(conn, o).then(function (at) {
                        output.set(idx, at);
                        job.done();
                    }, function (err) {
                        job.fail(err);
                    });
                });
            });

            jq.bind('error', function (err) {
                p.fail(err);
            });
            jq.bind('finished', function () {
                p.resolve(output);
            });
            jq.start();
        }, function (code, err) {
            p.fail(err);
        });

        return p;
    };

    FS.AchievementTemplate.getById = function (conn, id) {
        var p = new FS.Promise();

        if (FS.AchievementTemplate.cache[id]) {
            p.resolve(FS.AchievementTemplate.cache[id]);
            return p;
        }

        conn.getAchievementTemplate({achievementTemplateId: id}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            if (resp.data.achievementList.length < 1) {
                p.fail('Not found');
                return;
            }

            FS.AchievementTemplate.locateCache(conn, resp.data.achievementData).then(function (resp) {
                p.resolve(resp);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };


    FS.Inventory = FS.Utils.extend(function (conn, data) {
        FS.Collection.call(this, FS.Object);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            }
        });

        this.defineModel({
            'inventoryId': FS.PrimaryKey,
            'gameId': String,
            'name': String,
            'playerPoolId': String,
            'player': FS.Player,
            'developerId': String, // TODO: MAP TO DEVELOPER
            'restrictByGame': Boolean,
            'restrictByOwner': Boolean,
            'ownerId': String,      // TODO: MAP TO?
            'type': String
        }, data);
    }, FS.Collection);

    FS.Inventory.model = FS.Model.ObjectKeyModel(FS.Inventory);
    FS.Inventory.cache = {};

    FS.Inventory.locateCache = function (conn, data) {
        if (FS.Inventory.cache[data.inventoryId] === undefined) {
            FS.Inventory.cache[data.inventoryId] = new FS.Inventory(conn, data);
        } else {
            FS.Inventory.cache[data.inventoryId].refresh(data);
            if (conn) {
                FS.Inventory.cache[data.inventoryId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }

        var o = FS.Inventory.cache[data.inventoryId];

        return o.promise;
    };

    FS.Inventory.prototype.refresh = function (v) {
        FS.Utils.mergeProperties(this, v);
    };

    FS.Inventory.prototype.pull = function (fetchContents) {
        var p = new FS.Promise();
        var that = this;

        this.connection.getInventory({inventoryId: this.inventoryId}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            if (resp.data.objectIds.length === 0 || fetchContents === false) {
                that.reset();
                p.resolve(that);
                return;
            }

            FS.Object.getAll(that.connection, resp.data.objectIds).then(function (items) {
                that.forEach(function (o) {
                    if (items.indexOf(o) !== 0) {
                        that.remove(o);
                    }
                });

                items.forEach(function (o) {
                    if (that.indexOf(o).length === 0) {
                        that.add(o);
                    }
                });

                p.resolve(that);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };

    FS.Inventory.prototype.update = function () {
        var p = new FS.Promise();

        if (typeof this.id !== 'string') {
            this.connection.createInventory(this, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }

                p.resolve(resp.data);
            });
        } else {
            this.connection.updateInventory(this, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }

                p.resolve(resp.data);
            });
        }

        return p;
    };

    FS.Inventory.prototype.destroy = function () {
        var p = new FS.Promise();

        this.connection.deleteInventory(this, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }
            p.resolve(resp.data);
        });

        return p;
    };

    FS.Inventory.getByName = function (conn, name, fetchContents) {
        var p = new FS.Promise();

        conn.getInventoryList({}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            var list = resp.data.inventoryList.filter(function (o) {
                return o.name === name;
            });

            if (list.length < 1) {
                p.fail("Could not locate by name");
                return;
            }

            FS.Inventory.locateCache(conn, list[0]).then(function (obj) {
                obj.pull(fetchContents).then(function () {
                    p.resolve(obj);
                }, function (err) {
                    p.fail(err);
                });
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };

    FS.Inventory.getById = function (conn, id, fetchContents) {
        var p = new FS.Promise();

        if (FS.Inventory.cache[id]) {
            p.resolve(FS.Inventory.cache[id]);
            return p;
        }

        FS.Inventory.getAll(conn, null, fetchContents).then(function (invs) {
            var i = invs.filter(function (c) {
                return c.inventoryId == id;
            });

            // Could not locate inventory
            if (i.length <= 0) {
                p.fail("Could not locate inventory by id");
                return;
            }

            p.resolve(i[0]);
        }, function (err) {
            p.fail(err);
        });

        return p;
    };

    FS.Inventory.getAll = function (conn, options, fetchContents) {
        var p = new FS.Promise();

        conn.getInventoryList(options || {}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            var jq = new FS.JobQueue();
            var output = new FS.Collection(FS.Inventory);

            resp.data.inventoryList.forEach(function (o, idx) {
                new jq.Job(function () {
                    var job = this;

                    FS.Inventory.locateCache(conn, o).then(function (obj) {
                        output.set(idx, obj);

                        obj.pull(fetchContents).then(function () {
                            job.done();
                        }, function (err) {
                            job.fail(err);
                        });
                    }, function (err) {
                        job.fail(err);
                    });
                });
            });

            jq.bind('error', function (err) {
                p.fail(err);
            });
            jq.bind('finished', function () {
                p.resolve(output);
            });
            jq.start();
        });

        return p;
    };

// Make copies of objects in a template inventory, and place them in an inventory.
    FS.Inventory.copyTemplate = function (conn, templateInventoryId, inventoryId) {
        var p = new FS.Promise();

        conn.copyTemplateInventory({
            templateInventoryId: templateInventoryId,
            inventoryId: inventoryId
        }, function (resp) {
            if ((resp.data.code === 0) || (resp.data.code === 5056)) {
                p.resolve(resp.data);
            } else {
                p.fail("Could not copy template inventory");
            }
        });

        return p;
    };

// Make copies of objects in a template inventory, and place them in a player's inventory.
// This version allows the caller to pick the inventory inventory by name
    FS.Inventory.copyTemplateByName = function (conn, templateInventoryId, inventoryName) {
        var p = new FS.Promise();

        // get the inventory
        FS.Inventory.getByName(conn, inventoryName).then(function (inventory) {

            // copy the template
            FS.Inventory.copyTemplate(conn, templateInventoryId, inventory.inventoryId).then(function (data) {
                p.resolve(data);
            }, function (err) {
                p.fail(err);
            });

        }, function (err) {
            p.fail(err);
        });
        return p;
    };

    FS.Inventory.isInventory = function (v) {
        return v instanceof FS.Inventory;
    };


    FS.RatingSystem = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            }
        });

        this.defineModel({
            'ratingSystemId': FS.PrimaryKey,
            'systemName': String,
            'gameId': String,
            'playerPoolId': String,
            'seedRating': Number,
            'developerId': String,
            'method': String
        }, data);
    }, FS.Model);

    FS.RatingSystem.cache = {};

    FS.RatingSystem.locateCache = function (conn, data) {
        if (FS.RatingSystem.cache[data.playerId] === undefined) {
            FS.RatingSystem.cache[data.playerId] = new FS.RatingSystem(conn, data);
        } else {
            FS.RatingSystem.cache[data.playerId].refresh(data);
            if (conn) {
                FS.RatingSystem.cache[data.playerId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }
        return FS.RatingSystem.cache[data.playerId].promise;
    };

    FS.RatingSystem.prototype.destroy = function () {
        var p = new FS.Promise();
        var that = this;

        this.connection.deleteRatingSystem(this, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(that);
        });

        return p;
    };

    FS.RatingSystem.prototype.getStatistics = function () {
        var p = new FS.Promise();
        var that = this;

        this.connection.getRatingStatistics(this, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data);
        });

        return p;
    };

    FS.RatingSystem.prototype.reportResults = function (result, player, opponents) {
        var p = new FS.Promise();
        var that = this;

        this.connection.reportResults({
            ratingSystemId: this.id,
            results: [
                {
                    result: result,
                    playerId: player,
                    opponents: opponents.map(function (o) {
                        return o.id;
                    })
                }
            ]
        }, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data);
        });

        return p;
    };

    FS.RatingSystem.prototype.getRank = function (player) {
        var p = new FS.Promise();
        var that = this;

        this.connection.getRank({
            playerId: (typeof player === 'string') ? player : player.id,
            ratingSystemId: this.id
        }, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data);
        });

        return p;
    };

    FS.RatingSystem.prototype.getRating = function (player) {
        var p = new FS.Promise();
        var that = this;

        this.connection.getRating({
            playerId: (typeof player === 'string') ? player : player.id,
            ratingSystemId: this.id
        }, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data);
        });

        return p;
    };

    FS.RatingSystem.prototype.setRating = function (player, value) {
        var p = new FS.Promise();
        var that = this;

        this.connection.setRating({
            playerId: (typeof player === 'string') ? player : player.id,
            ratingSystemId: this.id,
            rating: value
        }, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data);
        });

        return p;
    };

    FS.RatingSystem.prototype.addToRating = function (player, change) {
        var p = new FS.Promise();
        var that = this;

        this.connection.addToRating({
            playerId: (typeof player === 'string') ? player : player.id,
            ratingSystemId: this.id,
            ratingChange: change
        }, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp.data);
        });

        return p;
    };

    FS.RatingSystem.prototype.refresh = function (v) {
        FS.Utils.mergeProperties(this, v);
    };

    FS.RatingSystem.prototype.update = function () {
        var p = new FS.Promise();
        var that = this;

        if (typeof this.id !== 'string') {
            // TODO: Actually create the authorization agent stuff here
            this.connection.createRatingSystem(this, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }

                this.refresh(resp.data);
                p.resolve(that);
            });
        } else {
            throw "Rating systems cannot be updated";
        }

        return p;
    };

    FS.RatingSystem.isRatingSystem = function (v) {
        return v instanceof FS.RatingSystem;
    };

    FS.RatingSystem.getByName = function (conn, name) {
        var p = new FS.Promise();

        conn.getRatingSystemId({systemName: name}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            FS.RatingSystem.locateCache(conn, resp.data).then(function (resp) {
                p.resolve(resp);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };


    FS.MediaPackage = function (assets) {
        this.raw = assets;
    };

    FS.MediaPackage.prototype.find = function (asset, mimeTypes /*... filters */) {
        var assets = (this.raw[asset] || []).concat();
        var filters = Array.prototype.slice(arguments, 2);

        filters.forEach(function (filter) {
            if (typeof filter === 'object') {
                filter = function (o) {
                    return FS.Query(o, filter);
                };
            }
            assets = assets.filter(filter);
        });

        if (!mimeTypes) {
            return assets;
        }

        var accept = mimeTypes.map(function (mt) {
            return new RegExp(mt.split('').map(function (c) {
                if (c == '*') {
                    return '.*?';
                }
                if (new RegExp('\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\').test(c)) return '\\' + c;
                return c;
            }).join(''));
        });

        function mimeMatch(c) {
            for (var i = 0; i < accept.length; i++) {
                if (accept[i].test(c.mimeType)) {
                    // this keeps it positive, we don't care about index
                    return i + 1;
                }
            }
            return 0;
        }

        return assets.filter(mimeMatch).sort(function (a, b) {
            return mimeMatch(a) - mimeMatch(b);
        });
    };


    FS.ItemViewer = FS.Utils.extend(function (assets, div) {
        FS.EventDispatcher.call(this);

        var elem;
        if (typeof div === "string") {
            elem = document.getElementById(div) || document.querySelector(div);
            this.div = elem;
        } else if (div) {
            this.div = div;
        } else {
            elem = this.div = document.createElement('div');
            elem.setAttribute('style', 'display: none;');
            document.getElementsByTagName('body')[0].appendChild(elem);
        }

        if (!this.div) {
            throw "Could not locate display container";
        }

        if (FS.detectMobile()) {
            // We only support images and sprite sheets on mobile
            this.allowedMimeTypes = ['application/fs.spritesheet', 'image/*'];
        } else {
            // Prioritize video first, than spritesheets if available
            this.allowedMimeTypes = ['video/*', 'application/fs.spritesheet', '*'];
        }

        this.assets = new FS.MediaPackage(assets);
        this.drawable = null;

        this._playing = false;
        this.autoplay = true;
        this._looping = true;

        this.close();
    }, FS.EventDispatcher);

    FS.ItemViewer.prototype.open = function (name) {
        var filters = Array.prototype.slice.call(arguments, 1);
        var assets = this.assets.find(name, this.allowedMimeTypes);

        filters.forEach(function (filter) {
            if (typeof filter === 'object') {
                filter = function (o) {
                    return FS.Query(o, filter);
                };
            }
            assets = assets.filter(filter);
        });

        for (var i = 0; i < assets.length; i++) {
            var asset = assets[i];

            var mimeType = asset.mimeType.split('/');
            switch (mimeType[0]) {
                case 'application':
                    if (mimeType[1] === 'fs.spritesheet') {
                        this.initalizeSpriteSheet(asset);
                        this.loadSheet(asset);
                        return;
                    }
                    break;
                case 'video':
                    // TODO: Implement video
                    break;
                case 'image':
                    this.mode = 'image';
                    this.div.innerHtml = '';

                    this.width = asset.metadata.width || asset.metadata.dimensions.width;
                    this.height = asset.metadata.height || asset.metadata.dimensions.height;
                    this.drawable = document.createElement('img');
                    this.drawable.setAttribute('src', asset.assetPathUrl || asset.assetPath);
                    this.drawable.setAttribute('width', asset.metadata.width);
                    this.drawable.setAttribute('height', asset.metadata.height);
                    this.div.appendChild(this.drawable);
                    return;
            }
        }

        throw new Error('No accepted mimeTypes located');
    };

    FS.ItemViewer.prototype.play = function () {
        this.playing = true;
    };

    FS.ItemViewer.prototype.pause = function () {
        this.playing = false;
    };

    FS.ItemViewer.prototype.seek = function (v) {
        this.currentTime = v;
    };

    FS.ItemViewer.prototype.close = function () {
        // Clear out the existing html tags
        delete this.spriteSheet;
        delete this.sheetImage;

        this.mode = 'uninit';
        if (this.div) {
            this.div.innerHTML = '';
        }
        this.resources = {};
    };

    /* -------------------------- *
     * SPRITE SHEET PLAYBACK CODE *
     * -------------------------- */

    FS.ItemViewer.prototype.initalizeSpriteSheet = function (asset) {
        // Do we need to rebuild the canvas (?)
        if (this.drawable &&
            this.mode === 'spritesheet' &&
            this.drawable.width === asset.metadata.width &&
            this.drawable.height === asset.metadata.height) {
            return;
        }

        this.div.innerHtml = '';
        this.drawable = document.createElement('canvas');
        this.drawable.setAttribute('width', asset.metadata.width);
        this.drawable.setAttribute('height', asset.metadata.height);
        this.canvasContext = this.drawable.getContext('2d');
        this.div.appendChild(this.drawable);

        delete this.currentTime;
        delete this.duration;
        delete this.playing;
        delete this.muted;
        delete this.volume;

        Object.defineProperties(this, {
            currentTime: {
                get: this.spriteCurrentTime,
                set: this.seekSprite
            },
            duration: {
                get: this.spriteDuration
            },
            playing: {
                get: function () {
                    return this._playing;
                },
                set: this.setSpritePlayback
            },
            looping: {
                get: function () {
                    return this._looping;
                },
                set: function (v) {
                    this._looping = v;
                }
            }
        });
    };

    FS.ItemViewer.prototype.loadSheet = function (asset) {
        var xhr = new XMLHttpRequest(),
            url = asset.assetPathUrl,
            self = this;

        FS.XDomainLoad('GET', url, '', function (status, response, responseText) {
            if (status !== 200) {
                throw new Error('Could not open application/fs.spritesheet:', url);
            }

            self.spriteSheet = self.resources[url] = response;
            self.sheetImage = self.resources[self.spriteSheet.sheet] = new Image();

            self.sheetImage.onload = function () {
                self.resetSprite();
                self.playing = self.autoplay;
                self.updateSprite();

                self.trigger('loaded', {'asset': asset});
            };
            self.sheetImage.src = self.spriteSheet.sheet;
        });
    };

    FS.ItemViewer.prototype.spriteDuration = function () {
        return this.spriteSheet.frames.reduce(function (p, c) {
            return p + c.duration;
        }, 0);
    };

    FS.ItemViewer.prototype.resetSprite = function () {
        this._timeStart = (new Date()).getTime();
        this._sheetIndex = 0;
        this._sheetOffset = 0;
    };

    FS.ItemViewer.prototype.setSpritePlayback = function (v) {
        if (this._playing === v) {
            return;
        }

        this._playing = v;

        if (this._playing) {
            this._timeStart = (new Date()).getTime();
            this.updateSprite();
            this.trigger('playing');
        } else {
            this.spriteTimeAdvance();
            this.trigger('paused');
        }
    };

    FS.ItemViewer.prototype.seekSprite = function (t) {
        this.resetSprite();
        this._sheetOffset = t;
        this.spriteTimeAdvance();
        this.updateSprite();
    };

    FS.ItemViewer.prototype.updateSprite = function () {
        if (this.playing) {
            this.spriteTimeAdvance();
        }

        var f = this.spriteSheet.frames[this._sheetIndex],
            ctx = this.canvasContext,
            self = this;

        ctx.clearRect(0, 0, this.drawable.clientWidth, this.drawable.clientHeight);
        f.chunks.forEach(function (chunk) {
            ctx.drawImage(self.sheetImage,
                chunk.sx, chunk.sy, chunk.w, chunk.h,
                chunk.tx, chunk.ty, chunk.w, chunk.h);
        });

        if (this.playing) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                delete this.timeout;
            }

            this.timeout = setTimeout(function () {
                self.updateSprite();
            }, f.duration - this._sheetOffset);
        }
    };

    FS.ItemViewer.prototype.spriteCurrentTime = function (dt) {
        var frames = this.spriteSheet.frames.slice(0, this._sheetIndex)
                .reduce(function (p, c) {
                    return p + c.duration;
                }, 0) + this._sheetOffset;
    };

    FS.ItemViewer.prototype.spriteTimeAdvance = function () {
        var index = this._sheetIndex,
            nt = (new Date()).getTime(),
            clock;

        clock = nt - this._timeStart + this._sheetOffset;
        this._timeStart = nt;

        do {
            var frame = this.spriteSheet.frames[this._sheetIndex];
            if (frame.duration > clock) {
                break;
            }

            clock -= frame.duration;

            if (++this._sheetIndex >= this.spriteSheet.frames.length) {
                this.resetSprite();

                if (!this.looping) {
                    this._playing = false;
                    this.trigger('ended');
                    break;
                }
            }
        } while (true);

        this._sheetOffset = clock;
    };


    FS.PriceTemplate = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'enumerable': true,
                'writable': true,
                'configurable': true
            }
        });

        this.defineModel({
            "template": FS.ObjectTemplate,
            "quantity": Number
        }, data);
    }, FS.Model);

    FS.StoreTemplate = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        var that = this;
        var price = new FS.Collection(FS.PriceTemplate);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'enumerable': true,
                'writable': true,
                'configurable': true
            },
            'price': {
                'set': function (coll) {
                    // IGNORED FOR NOW
                },
                'get': function () {
                    return price;
                },
                'enumerable': true,
                'configurable': false
            }
        });

        this.defineModel({
            "forSaleTemplate": FS.ObjectTemplate,
            "inStock": Number
//      "price" : Object    // TODO: MAP TO A COLLECTION
        }, data);
    }, FS.Model);

    FS.Store = FS.Utils.extend(function (conn, data) {
        FS.Collection.call(this, FS.StoreTemplate);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            }
        });

        this.defineModel({
            'storeId': FS.PrimaryKey,
            'developerId': String,      // TODO: MAP TO A DEVELOPER
            'gameId': String,
            'name': String,
            'tags': Array
            //'templatesInStore': Object  // TODO: MAP TO A COLLECTION!
        }, data);
    }, FS.Collection);

    FS.Store.model = FS.Model.ObjectKeyModel(FS.Store);
    FS.Store.cache = {};

    FS.Store.locateCache = function (conn, data) {
        if (FS.Store.cache[data.storeId] === undefined) {
            FS.Store.cache[data.storeId] = new FS.Store(conn, data);
        } else {
            FS.Store.cache[data.storeId].refresh(data);
            if (conn) {
                FS.Store.cache[data.storeId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }

        var obj = FS.Store.cache[data.storeId];
        var p = new FS.Promise();
        var ids = [];

        obj.templatesInStore.forEach(function (tmpl) {
            var id = tmpl.forSaleTemplateId;

            if (ids.indexOf(id) < 0) ids.push(id);
            tmpl.price.forEach(function (price) {
                var id = price.templateId;
                if (ids.indexOf(id) < 0) ids.push(id);
            });
        });

        FS.ObjectTemplate.getAllById(conn, ids).then(function () {
            var jq = new FS.JobQueue();
            obj.templatesInStore.forEach(function (tmpl, idx) {
                var st = new FS.StoreTemplate(conn, tmpl);

                // Attempt to build a price
                tmpl.price.forEach(function (ptmpl, pidx) {
                    new jq.Job(function () {
                        var pt = new FS.PriceTemplate(conn, ptmpl);
                        var job = this;

                        pt.promise.then(function () {
                            st.price.set(pidx, pt);
                            job.done();
                        }, function (err) {
                            job.fail(err);
                        });
                    });
                });

                new jq.Job(function () {
                    var job = this;

                    st.promise.then(function () {
                        obj.set(idx, st);
                        job.done();
                    }, function (err) {
                        job.fail(err);
                    });
                });
            });

            jq.bind('error', function (err) {
                p.fail(err);
            });
            jq.bind('finished', function () {
                p.resolve(obj);
            });
            jq.start();
        }, function () {
            p.fail.apply(p, arguments);
        });

        return p;
    };

    FS.Store.prototype.refresh = function (v) {
        FS.Utils.mergeProperties(this, v);
    };

    FS.Store.prototype.update = function () {
        var p = new FS.Promise();
        if (this.id !== undefined) {
            throw "Cannot update an existing store";
        } else {
            this.connection.createStore(this, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }

                this.refresh(resp.data);
                p.resolve(this);
            });
        }
        return p;
    };

    FS.Store.prototype.createCart = function (inv) {
        var cart = new FS.Cart(this.connection, {
            'inventory': inv,
            'store': this
        });

        return cart.update();
    };

    FS.Store.prototype.destroy = function () {
        var p = new FS.Promise();
        this.connection.deleteStore(this, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
            } else {
                p.resolve(resp.data);
            }
        });

        return p;
    };

    FS.Store.getSiteStore = function (conn) {
        return FS.SiteStore.getStore(conn);
    };

    FS.Store.getGameCurrencyStore = function (conn, game) {
        var p = new FS.Promise();

        if (FS.Game.isGame(game)) {
            game = game.id;
        }

        conn.getGameCurrencyStore({gameId: game}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            FS.Store.locateCache(conn, resp.data).then(function (obj) {
                p.resolve(obj);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };

    FS.Store.getById = function (conn, id) {
        var p = new FS.Promise();

        if (FS.Store.cache[id]) {
            p.resolve(FS.Store.cache[id]);
            return p;
        }

        FS.Store.getAll(conn).then(function (invs) {
            var i = invs.filter(function (c) {
                return c.id == id;
            });

            // Could not locate inventory
            if (i.length <= 0) {
                p.fail("Could not locate store by id");
                return;
            }

            p.resolve(i[0]);
        }, function (err) {
            p.fail(err);
        });

        return p;
    };

    FS.Store.getByName = function (conn, name) {
        var p = new FS.Promise();

        conn.getStores({}).then(function (data) {
            var data = data.stores.reduce(function (p, c) {
                return (c.name === name) ? c : p;
            }, null);

            if (!data) {
                p.fail("Could not locate store by name");
                return;
            }

            FS.Store.locateCache(conn, data).then(function (obj) {
                p.resolve(obj);
            }, function (err) {
                p.fail(err);
            });
        }, function (code, err) {
            p.fail(err);
        });

        return p;
    };

    FS.Store.getCurrency = function (conn) {
        var p = new FS.Promise();

        conn.getMyCurrencyInfo(conn, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            var game_p = FS.ObjectTemplate.getById(conn, resp.data.gameCurrency.templateId),
                site_p = FS.ObjectTemplate.getById(conn, resp.data.siteCurrency.templateId);

            game_p.then(function (game) {
                site_p.then(function (site) {
                    p.resolve({
                        gameCurrency: {template: game, quantity: resp.data.gameCurrency.quantity},
                        siteCurrency: {template: site, quantity: resp.data.siteCurrency.quantity}
                    });
                }, function (err) {
                    p.fail(err);
                });
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };

    FS.Store.getAll = function (conn, options) {
        var p = new FS.Promise();

        conn.getStores(options || {}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            var jq = new FS.JobQueue();
            var output = new FS.Collection(FS.Store);

            resp.data.stores.forEach(function (o, idx) {
                new jq.Job(function () {
                    var job = this;

                    FS.Store.locateCache(conn, o).then(function (obj) {
                        output.set(idx, obj);
                        job.done();
                    }, function (err) {
                        job.fail(err);
                    });
                });
            });

            jq.bind('error', function (err) {
                p.fail(err);
            });
            jq.bind('finished', function () {
                p.resolve(output);
            });
            jq.start();
        });

        return p;
    };


    FS.SiteStoreTemplate = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'enumerable': true,
                'writable': true,
                'configurable': true
            }
        });

        this.defineModel({
            "forSaleTemplate": FS.ObjectTemplate,
            "priceInCents": Number
        }, data);
    }, FS.Model);

    FS.SiteStore = FS.Utils.extend(function (conn, data) {
        FS.Collection.call(this, FS.SiteStoreTemplate);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            }
        });

        this.defineModel({
            'storeId': FS.PrimaryKey,
            'developerId': String,      // TODO: MAP TO A DEVELOPER
            'gameId': String,
            'name': String,
            'tags': Array
        }, data);
    }, FS.Store);

    FS.SiteStore.model = FS.Model.ObjectKeyModel(FS.SiteStore);
    FS.SiteStore.cache = {};

    FS.SiteStore.locateCache = function (conn, data) {
        if (FS.SiteStore.cache[data.storeId] === undefined) {
            FS.SiteStore.cache[data.storeId] = new FS.SiteStore(conn, data);
        } else {
            FS.SiteStore.cache[data.storeId].refresh(data);
            if (conn) {
                FS.SiteStore.cache[data.storeId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }

        var obj = FS.SiteStore.cache[data.storeId];
        var p = new FS.Promise();

        var jq = new FS.JobQueue();
        obj.siteCurrencyStoreItems.forEach(function (tmpl, idx) {
            var st = new FS.SiteStoreTemplate(conn, tmpl);

            new jq.Job(function () {
                var job = this;

                st.promise.then(function () {
                    obj.set(idx, st);
                    job.done();
                }, function (err) {
                    job.fail(err);
                });
            });
        });

        jq.bind('error', function (err) {
            p.fail(err);
        });
        jq.bind('finished', function () {
            p.resolve(obj);
        });
        jq.start();
        return p;
    };

    FS.SiteStore.getStore = function (conn) {
        var p = new FS.Promise();

        conn.getSiteCurrencyStore({}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            FS.SiteStore.locateCache(conn, resp.data).then(function (obj) {
                p.resolve(obj);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };


    FS.Avatar = FS.Utils.extend(function (conn, data) {
        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            },
            'mediaPackage': {
                'get': function () {
                    if (this.objectData.mediaPackage) {
                        return JSON.parse(this.objectData.mediaPackage);
                    }
                    return this.template.mediaPackage;
                },
                'set': function (v) {
                },
                'configurable': false,
                'enumerable': false
            },
            'levelProgress': {
                'get': function () {
                    var top = this.experience + this.experienceToLevel - this.levelBase;
                    return this.experienceToLevel / top;
                },
                'configurable': false,
                'enumerable': false
            }
        });

        this.defineModel({
            'buyoutPrice': Array,

            'containerObject': FS.Object,
            'containedObjectIds': Array,    // Will eventually map to Collection(FS.Object)

            'name': String,
            'objectId': FS.PrimaryKey,
            'auctionTimeRemaining': Number,
            'auctionTemplateId': String,        // Will eventually map to an auction
            'creationTime': String,         // will eventually automap to Date
            'objectData': Object,           // will eventually automap from ObjectKV
            'cashPrice': Number,

            'template': FS.ObjectTemplate,
            'ownerId': String,
            'auctionBidQuantity': Number,
            'quantity': Number,

            'level': Number,
            'experience': Number,
            'levelBase': Number,
            'experienceToLevel': Number,
            'gameExperience': Number,

            'victoryPoints': Number,
            'title': String,
            'stats': Object,
            'gameStats': Object
        }, data);
    }, FS.Model);

    FS.Avatar.cache = {};
    FS.Avatar.model = FS.Model.ObjectKeyModel(FS.Avatar);

    FS.Avatar.locateCache = function (conn, data) {
        if (FS.Avatar.cache[data.objectId] === undefined) {
            FS.Avatar.cache[data.objectId] = new FS.Avatar(conn, data);
        } else {
            FS.Avatar.cache[data.objectId].refresh(data);
            if (conn) {
                FS.Avatar.cache[data.objectId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }
        var obj = FS.Avatar.cache[data.objectId];
        obj.objectData = FS.Utils.unfoldObjectKV(data.objectData || []);

        return obj.promise;
    };

    FS.Avatar.prototype.refresh = function (v) {
        v.templateData = v.templateData || [];
        v.objectData = v.objectData || [];

        for (var key in v) {
            switch (key) {
                case 'objectData':
                case 'templateData':
                    this[key] = FS.Utils.unfoldObjectKV(v[key]);
                    break;
                default:
                    this[key] = v[key];
                    break;
            }
        }
    };

    FS.Avatar.getAvatarTypes = function (conn) {
        var p = new FS.Promise();

        conn.getAvatarTypes({}).then(function (data) {
            var d = new FS.Collection(FS.ObjectTemplate);
            var jq = new FS.JobQueue();

            data.avatarTemplates.forEach(function (v, idx) {
                new jq.Job(function () {
                    var job = this;
                    FS.ObjectTemplate.locateCache(conn, v).then(function (obj) {
                        d.set(idx, obj);
                        job.done();
                    }, function (err) {
                        job.fail(err);
                    });
                });
            });

            jq.bind('error', function (err) {
                p.fail(err);
            });
            jq.bind('finished', function () {
                p.resolve(d);
            });
            jq.start();
        }, function (code, error) {
            p.fail(code, error);
        });

        return p;
    };

    FS.Avatar.createAvatar = function (conn, player, template) {
        var p = new FS.Promise();

        if (typeof "template" === "object") {
            template = template.id;
        }

        conn.createAvatar({id: template}).then(function (data) {
            FS.Avatar.getAvatar(conn, player).then(function (resp) {
                p.resolve(resp);
            }, function (code, error) {
                p.fail(code, error);
            });
        }, function (code, error) {
            p.fail(code, error);
        });

        return p;
    };

    FS.Avatar.getAvatar = function (conn, id) {
        var p = new FS.Promise();
        var that = this;

        if (typeof id !== "string") {
            id = id.id;
        }

        if (FS.Avatar.cache[id]) {
            p.resolve(FS.Avatar.cache[id]);
            return p;
        }

        conn.getAvatar({playerId: id}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            FS.Avatar.locateCache(conn, resp.data).then(function (done) {
                p.resolve(done);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };

    FS.Avatar.prototype.getViewer = function (div) {
        return new FS.ItemViewer(this.mediaPackage, div);
    };

    FS.Avatar.prototype.getInventory = function (conn) {
        var p = new FS.Promise();

        conn.getAvatarInventory({playerId: this.ownerId}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            FS.Object.getAll(conn, resp.data.inventory).then(
                function (resp) {
                    p.resolve(resp);
                },
                function (resp) {
                    p.fail(resp);
                }
            );
        });

        return p;
    };

    FS.Avatar.prototype.getEquipment = function (conn) {
        var p = new FS.Promise();

        conn.getAvatarEquipment({playerId: this.ownerId}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            var requests = 0,
                keys = [],
                mapping = {},
                equip = resp.data.equipment;

            equip.forEach(function (slot) {
                keys.push(slot.itemId);
                mapping[slot.itemId] = slot.slot;
            });

            FS.Object.getAll(conn, keys).then(
                function (resp) {
                    resp.forEach(function (o) {
                        o.slot = mapping[o.id];
                    });
                    p.resolve(resp);
                },
                function (err) {
                    p.fail(err);
                }
            );
        });

        return p;
    };


    FS.Object = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            },
            'mediaPackage': {
                'get': function () {
                    if (this.objectData.mediaPackage) {
                        return JSON.parse(this.objectData.mediaPackage);
                    }
                    return this.template.mediaPackage;
                },
                'set': function (v) {
                },
                'configurable': false,
                'enumerable': true
            }
        });

        this.defineModel({
            'buyoutPrice': Array,

            'containerObject': FS.Object,
            'containedObjectIds': Array,    // Will eventually map to Collection(FS.Object)

            'name': String,
            'objectId': FS.PrimaryKey,
            'auctionTimeRemaining': Number,
            'auctionTemplateId': String,        // Will eventually map to an auction
            'creationTime': String,         // will eventually automap to Date
            'objectData': Object,           // will eventually automap from ObjectKV
            'cashPrice': Number,

            'template': FS.ObjectTemplate,
            'inventory': FS.Inventory,
            'ownerId': String,
            'auctionBidQuantity': Number,
            'quantity': Number
        }, data);
    }, FS.Model);

    FS.Object.model = FS.Model.ObjectKeyModel(FS.Object);
    FS.Object.cache = {};

    FS.Object.locateCache = function (conn, data) {
        if (FS.Object.cache[data.objectId] === undefined) {
            FS.Object.cache[data.objectId] = new FS.Object(conn, data);
        } else {
            FS.Object.cache[data.objectId].refresh(data);
            if (conn) {
                FS.Object.cache[data.objectId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }
        var obj = FS.Object.cache[data.objectId];
        obj.objectData = FS.Utils.unfoldObjectKV(data.objectData || []);

        return obj.promise;
    };

    FS.Object.prototype.pull = function (conn) {
        var p = new FS.Promise();
        var that = this;

        conn.getObjects({objectIds: [this.id]}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            that.refresh(resp.data.objectList[0]);
            p.resolve(that);
        });

        return p;
    };

    FS.Object.prototype.getViewer = function (div) {
        return new FS.ItemViewer(this.mediaPackage, div);
    };

    FS.Object.prototype.refresh = function (v) {
        v.templateData = v.templateData || [];
        v.objectData = v.objectData || [];

        for (var key in v) {
            switch (key) {
                case 'objectData':
                case 'templateData':
                    this[key] = FS.Utils.unfoldObjectKV(v[key]);
                    break;
                default:
                    this[key] = v[key];
                    break;
            }
        }
    };

    FS.Object.prototype.update = function () {
        var p = new FS.Promise();

        var data = FS.Utils.mergeProperties({}, this);
        data.objectData = FS.Utils.foldObjectKV(this.objectData);

        if (typeof this.id !== 'string') {
            p.fail("Object must be created from a template");
        } else {
            this.connection.updateObject(data, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }
                p.resolve(resp.data);
            });
        }

        return p;
    };

    FS.Object.prototype.destroy = function () {
        var p = new FS.Promise();

        this.connection.deleteObjects({objectIds: [this.id]}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
            } else {
                p.resolve(resp.data);
            }
        });

        return p;
    };

    FS.Object.getById = function (conn, id) {
        var p = new FS.Promise();
        var that = this;

        if (FS.Object.cache[id]) {
            p.resolve(FS.Object.cache[id]);
            return p;
        }

        conn.getObjects({objectIds: [id]}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            FS.Object.locateCache(that.connection, resp.data.objectList[0]).then(function (done) {
                p.resolve(done);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };

    FS.Object.getAll = function (conn, ids) {
        var p = new FS.Promise();
        var that = this;

        conn.getObjects({objectIds: ids}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            var jq = new FS.JobQueue();
            var output = new FS.Collection(FS.Object);

            resp.data.objectList.forEach(function (o, idx) {
                new jq.Job(function () {
                    var job = this;

                    FS.Object.locateCache(conn, o).then(function (obj) {
                        output.set(idx, obj);
                        job.done();
                    }, function (err) {
                        job.fail(err);
                    });
                });
            });

            jq.bind('error', function (err) {
                p.fail(err);
            });
            jq.bind('finished', function () {
                p.resolve(output);
            });
            jq.start();
        });

        return p;
    };


    FS.Cart = FS.Utils.extend(function (conn, data) {
        FS.Collection.call(this, FS.ObjectTemplate);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            },
            'purse': {
                'get': function () {
                    var currency = {};

                    this.playerCurrencyItems.forEach(function (i) {
                        currency[i.templateId] = {
                            quantity: i.quantity,
                            requiresPaymentGateway: i.requiresPaymentGateway
                        };
                    });

                    return currency;
                },
                'configurable': false,
                'enumerable': false
            }
        });

        this.defineModel({
            "shoppingCartId": FS.PrimaryKey,

            "paymentGatewayUrl": String,
            "inventory": FS.Inventory,
            "store": FS.Store,
            "player": FS.Player,
            "playerCurrencyItems": Object   // TODO: MAKE THIS BETTER
        }, data);
    }, FS.Collection);

    FS.Cart.cache = {};

    FS.Cart.prototype.cost = function () {
        // V:Collection(PriceTemplate)
        var cost = {
            'affordable': true,
            'requiresPaymentGateway': false
        };
        var that = this;
        var args = Array.prototype.slice.call(arguments);
        var currency = this.purse;

        (args.length ? args : this).forEach(function (item) {
            // Regular item store
            if (item.price !== undefined) {
                item.price.forEach(function (price) {
                    var templateId = price.templateId;
                    cost[templateId] = (cost[templateId] || 0) + price.quantity;
                    if (currency[templateId].requiresPaymentGateway) {
                        cost.requiresPaymentGateway = true;
                    }
                    if (cost[templateId] > currency[templateId].quantity) {
                        cost.affordable = false;
                    }
                });
            } else {
                cost.requiresPaymentGateway = true;
            }
        });

        return cost;
    };

    FS.Cart.prototype.refresh = function (v) {
        FS.Utils.mergeProperties(this, v);
    };

    FS.Cart.prototype.update = function () {
        var p = new FS.Promise();
        var that = this;

        if (that.shoppingCartId !== undefined) {
            throw "Cannot update an existing cart";
        } else {
            this.promise.then(function (resp) {
                that.connection.createShoppingCart(that, function (resp) {
                    if (resp.data.code !== 0) {
                        p.fail(resp.data);
                        return;
                    }

                    that.refresh(resp.data);
                    p.resolve(that);
                });
            }, function (err) {
                p.fail(err);
            });
        }

        return p;
    };

    FS.Cart.prototype.complete = function (popupWin) {
        var that = this;
        var p = new FS.Promise();
        var cost = that.cost();
        var shoppingCartId = that.id;
        var request = {};
        var popup = (popupWin) ? popupWin : null; // allow for game to pass in pop-up window to populate... one way of avoiding "pop-up blocked" problem.

        that.forEach(function (i) {
            request[i.forSaleTemplateId] = (request[i.forSaleTemplateId] || 0) + 1;
        });

        var cart = [];
        for (var id in request) {
            cart.push({templateId: id, quantity: request[id]});
        }

        var appPlatform = FS.Utils.getAppPlatform();
        request = {
            appPlatform: appPlatform,
            storeId: that.storeId,
            shoppingCartId: shoppingCartId,
            items: cart
        };

        if (cost.requiresPaymentGateway) {
            if (appPlatform === "fb") {
                that.connection.purchaseShoppingCartWithItems(request, function (resp) {
                    if (resp.data.code !== 0) {
                        return p.fail(resp.data);
                    }
                    if (resp.data.isRealMoneyPurchase) {

                        /**
                         * FB local currency payment
                         * integrated with the MFP
                         *
                         * @author Calvin
                         */
                        FS.Cart.verifyPayment = function (data) {
                            if (!data) {
                                alert('There was an error processing your payment. Please try again!');
                                return;
                            }


                            if (data.payment_id) {
                                // TODO Use MF JSSDK to form the request.
                                var body = {
                                    _t: 'verifyFacebookPayment',
                                    data: data
                                };

                                var req = {
                                    _t: 'mfmessage',
                                    header: {_t: 'mfheader'},
                                    body: body
                                };

                                var mfpData = JSON.stringify(req);


                                var endpoint = 'https://www.playdominion.com/fun/api/json/v2';

                                $.post(endpoint, {json: mfpData})
                                    .done(function (mfres) {
                                        if (mfres.body._t == 'mferror') {
                                            alert(mfres.body.errmsg);
                                            return;
                                        }

                                        Dom.AnalyticsEventManager.getInstance().onEvent({
                                            eventName: 'mf.analytics',
                                            event: {
                                                et: "purchases",
                                                platform: "fb",
                                                uid: loggedInPlayer.playerId,
                                                currency_type: data.currency,
                                                price: data.amount,
                                                item_id: cart[0].templateId,
                                                quantity: data.quantity,
                                                foreign_exchange_rate: -1
                                            }
                                        });

                                        that.forEach(function (i) {
                                            that.inventory.add(i);
                                        });
                                        that.reset();
                                        return p.resolve(that);
                                    });
                            }
                        };

                        FS.Cart.pay = function (cart, data) {
                            var templateId = cart[0].templateId;
                            var host = "https://www.playdominion.com";
                            var productUrl = host + '/fun/fb/og/' + templateId;

                            FB.ui({
                                    method: 'pay',
                                    action: 'purchaseitem',
                                    product: productUrl,
                                    request_id: data.shoppingCartId,
                                    quantity: 1
                                },
                                FS.Cart.verifyPayment
                            );
                        }

                        FS.Cart.pay(cart, resp.data);


                        /*
                         FS.Cart.fbOpenPayDialog(shoppingCartId).then(function() {
                         // update UI directly or wait for notification?
                         that.forEach(function(i) { that.inventory.add(i); });
                         that.reset();
                         return p.resolve(that);
                         }, function(err) {
                         return p.fail(err);
                         });
                         */
                    } else {
                        return p.resolve(that);
                    }
                });
            } else {
                if (popup === null) { // If we don't have a pop-up window yet, create one.
                    popup = window.open('', '_blank', 'width=702,height=425');
                }

                var doc = popup.window.document;

                var form = doc.createElement("form");
                form.setAttribute("method", "post");
                form.setAttribute("action", that.paymentGatewayUrl);

                var input = doc.createElement("input");
                input.setAttribute("name", "data");
                input.setAttribute("value", JSON.stringify(request));
                input.setAttribute("type", "hidden");

                form.appendChild(input);
                doc.body.appendChild(form);

                form.submit();
            }

            var notice = function (msg) {
                var data = msg.data.data;
                if (data.escrowId !== shoppingCartId) {
                    return;
                }
                that.connection.unbind('notificationArrival', notice);
                that.forEach(function (i) {
                    that.inventory.add(i);
                });
                that.reset();
                p.resolve(that);
            };
            that.connection.bind('notificationArrival', notice);

        } else {
            that.connection.purchaseShoppingCartWithItems(request, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }

                var mfEvent = {
                    eventName: 'mf.analytics',
                    event: {
                        et: "in_game_purchases",
                        uid: loggedInPlayer.playerId,
                        item_id: request.items[0].templateId,
                        quantity: request.items[0].quantity,
                        platform: request.appPlatform
                    }
                };

                Dom.AnalyticsEventManager.getInstance().onEvent(mfEvent);

                that.forEach(function (i) {
                    that.inventory.add(i);
                });
                that.reset();

                p.resolve(that);
            });
        }

        return p;
    };

    FS.Cart.fbOpenPayDialog = function (shoppingCartId) {
        var p = new FS.Promise();
        var obj = {
            method: 'pay',
            //order_info: { shoppingCartId: shoppingCartId },
            action: 'purchaseitem',
            //dev_purchase_params: {'oscif': true}
            request_id: shoppingCartId,
            product: window.location.href
        };

        // This JavaScript callback handles FB.ui's return data and differs
        // from the Credits Callbacks.
        var fbCallback = function (data) {
            if (data['order_id']) {
                // Facebook only returns an order_id if you've implemented
                // the Credits Callback payments_status_update and settled
                // the user's placed order.

                // Notify the user that the purchased item has been delivered
                // without a complete reload of the game.
                console.log(
                    "Transaction Completed!"
                    + "Data returned from Facebook: \n"
                    + "Order ID: " + data['order_id'] + "\n"
                    + "Status: " + data['status']);
                p.resolve();
            } else if (data['error_code']) {
                // Appropriately alert the user.
                console.log(
                    "Transaction Failed!"
                    + "Error message returned from Facebook:"
                    + data['error_code'] + " - "
                    + data['error_message']);
                p.fail(new Error("Transaction Failed! Error message returned from Facebook: " + data['error_code'] + " - " + data['error_message']));
            } else {
                // Appropriately alert the user.
                console.log("FB transaction failed!");
                p.fail(new Error("FB transaction failed! data: ", JSON.stringify(data)));
            }
        };

        FB.ui(obj, fbCallback);
        return p;
    };


    FS.ObjectTemplate = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'mediaPackage': {
                'get': function () {
                    if (this.objectData.mediaPackage) {
                        return JSON.parse(this.objectData.mediaPackage);
                    }
                    return {};
                },
                'set': function (v) {
                },
                'configurable': false,
                'enumerable': false
            },
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            }
        });

        this.defineModel({
            'templateId': FS.PrimaryKey,
            'buyoutPrice': Array,

            'clientCanTrade': Boolean,
            'clientCanManage': Boolean,

            'developerId': String,      // This should eventually map to developer

            'tags': Array,
            'templateData': Object,     // TODO: THIS SHOULD BE A SPECIAL ObjectKV item
            'objectData': Object,       // TODO: THIS SHOULD BE A SPECIAL ObjectKV item

            'name': String,
            'cashPrice': Number,
            'gameId': String,           // This should eventually map to game
            'maximumStackSize': Number
        }, data);

        this.rawData = data;

    }, FS.Model);

    FS.ObjectTemplate.model = FS.Model.ObjectKeyModel(FS.ObjectTemplate);
    FS.ObjectTemplate.cache = {};

    FS.ObjectTemplate.locateCache = function (conn, data) {
        if (FS.ObjectTemplate.cache[data.templateId] === undefined) {
            FS.ObjectTemplate.cache[data.templateId] = new FS.ObjectTemplate(conn, data);
        } else {
            FS.ObjectTemplate.cache[data.templateId].refresh(data);
            if (conn) {
                FS.ObjectTemplate.cache[data.templateId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }
        return FS.ObjectTemplate.cache[data.templateId].promise;
    };

    FS.ObjectTemplate.locateCacheRaw = function (conn, templateId) {
        return FS.ObjectTemplate.cache[templateId].promise;
    };

    FS.ObjectTemplate.prototype.pull = function () {
        var p = new FS.Promise();
        var that = this;

        this.connection.getObjectTemplates({
            gameId: null, // TODO: THIS IS TEMPORARY
            templateId: this.id
        }, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            that.refresh(resp.data.templates[0]);
            p.resolve(that);
        });

        return p;
    };

    FS.ObjectTemplate.prototype.refresh = function (v) {
        v.templateData = v.templateData || [];
        v.objectData = v.objectData || [];

        for (var key in v) {
            switch (key) {
                case 'objectData':
                case 'templateData':
                    this[key] = FS.Utils.unfoldObjectKV(v[key]);
                    break;
                default:
                    this[key] = v[key];
                    break;
            }
        }
    };

    FS.ObjectTemplate.prototype.getViewer = function (div) {
        return new FS.ItemViewer(this.mediaPackage, div);
    };

    FS.ObjectTemplate.prototype.update = function () {
        var p = new FS.Promise();
        var that = this;

        // Fold the data
        var data = FS.Utils.shallowCopy(this);
        data.templateData = FS.Utils.foldObjectKV(this.templateData);
        data.objectData = FS.Utils.foldObjectKV(this.objectData);

        if (typeof this.id !== 'string') {
            this.connection.createObjectTemplate(data, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }

                p.resolve(resp.data);
            });
        } else {
            this.connection.updateObjectTemplate(data, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }
                p.resolve(resp.data);
            });
        }

        return p;
    };

    FS.ObjectTemplate.prototype.destroy = function () {
        var p = new FS.Promise();

        this.connection.deleteObjectTemplate(this, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }
            p.resolve(resp.data);
        });

        return p;
    };

    FS.ObjectTemplate.getByName = function (conn, name) {
        var p = new FS.Promise();

        FS.ObjectTemplate.getAll(conn, {name: name}).then(function (collection) {
            if (collection.length <= 0) {
                p.fail("No matching template found");
                return;
            }

            p.resolve(collection.get(0));
        }, function () {
            p.fail.apply(p, arguments);
        });

        return p;
    };

    FS.ObjectTemplate.getById = function (conn, id) {
        var p = new FS.Promise();

        if (FS.ObjectTemplate.cache[id] !== undefined) {
            p.resolve(FS.ObjectTemplate.cache[id]);
            return p;
        }

        FS.ObjectTemplate.getAll(conn, {templateIds: [id]}).then(function (collection) {
            if (collection.length <= 0) {
                p.fail("No matching template found");
                return;
            }

            p.resolve(collection.get(0));
        }, function () {
            p.fail.apply(p, arguments);
        });

        return p;
    };

    FS.ObjectTemplate.getAllById = function (conn, ids) {
        var d = new FS.Collection(FS.ObjectTemplate);
        var p = new FS.Promise();
        var _missingTemplateIds;

        // Determine which ids we need to retrieve, removing redundant values
        _missingTemplateIds = ids.filter(function (id, idx) {
            var cache = FS.ObjectTemplate.cache[id];
            if (cache) {
                d.set(idx, cache);
                return false;
            }

            return ids.indexOf(id) === idx;
        });

        if (!_missingTemplateIds || _missingTemplateIds.length === 0) {
            p.resolve(d);
        }

        FS.ObjectTemplate.getAll(conn, {templateIds: _missingTemplateIds}).then(function (collection) {
            collection.forEach(function (o) {
                ids.forEach(function (id, idx) {
                    if (id == o.id) {
                        d.set(idx, o);
                    }
                });
            });
            p.resolve(d);
        }, function () {
            p.fail.apply(p, arguments);
        });


        return p;
    };

    FS.ObjectTemplate.getAll = function (conn, options) {
        var p = new FS.Promise();

        conn.getObjectTemplates(options || {}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            var d = new FS.Collection(FS.ObjectTemplate);
            var jq = new FS.JobQueue();

            resp.data.templates.forEach(function (v, idx) {
                new jq.Job(function () {
                    var job = this;
                    FS.ObjectTemplate.locateCache(conn, v).then(function (obj) {
                        d.set(idx, obj);
                        job.done();
                    }, function (err) {
                        job.fail(err);
                    });
                });
            });

            jq.bind('error', function (err) {
                p.fail(err);
            });
            jq.bind('finished', function () {
                p.resolve(d);
            });
            jq.start();
        });

        return p;
    };

    FS.ObjectTemplate.isObjectTemplate = function (v) {
        return v instanceof FS.ObjectTemplate;
    };


    FS.ConnectionManager = FS.Utils.extend(function (conn) {
        FS.EventDispatcher.call(this);

        Object.defineProperty(this, 'connection', {
            'value': conn,
            'configurable': false
        });
    }, FS.EventDispatcher);

    Object.defineProperties(FS.ConnectionManager.prototype, {
        'options': {
            'get': function () {
                return this.connection.options;
            },
            'set': function (v) {
                this.connection.setOptions(v);
            }
        }
    });

// Connection Manager static types

    FS.ConnectionManager.restore = function (kind, options) {
        var p = new FS.Promise();

        var cookie = FS.Utils.gatherUrlCookieParams(FS.Debug.error);
        FS.Utils.mergeProperties(cookie, options);

        var info = cookie.connectionInfo || {};
        if (info.playerPoolId != options.playerPoolId ||
            info.kind != kind) {
            p.fail("Existing session is not a valid type");
            return p;
        }

        var connInfo = new FS.ConnectionInfo(cookie.httpUrl, cookie);
        try {
            connInfo.restore(info);
        } catch (err) {
            p.fail("ConnectionMaker found connectionInfo is incomplete," + err);
            return p;
        }

        var conn = new FS.Connection(connInfo, cookie);
        conn.connect(function (resp) {
            if (resp.data.code !== 0) {
                p.fail("ConnectionMaker connectionInfo was invalid");
                return;
            }

            if (connInfo.kind === 'player' || connInfo.kind === 'guest') {
                conn.playerNotificationOn({playerId: connInfo.playerId}, function (resp) {
                    if (resp.data.code === 0) {
                        console.log("Successfully subscribed to player notifications");
                    }
                });
            }

            p.resolve(new FS.ConnectionManager(conn));
        });

        return p;
    };

    FS.ConnectionManager.login = function (kind, url, options) {
        var p = new FS.Promise();

        var connInfo = new FS.ConnectionInfo(url, options);
        connInfo['login' + kind.charAt(0).toUpperCase() + kind.substr(1)](options, function (resp) {
            if (resp.data.code !== 0) {
                p.fail("Could not establish authorization: " + resp.data.errorText);
                return;
            }
            // We don't want to keep this in memory
            delete options.authorization;

            // Store successful connection info
            if (kind === "player" || kind === "guest") {
                var cookie = FS.Utils.gatherUrlCookieParams(FS.Debug.error);
                cookie.connectionInfo = connInfo.store();
                cookie.httpUrl = fsConnectionParams.httpUrl;
                cookie.put("/", (1000 * 60 * 60 * 24 * 7));
            }

            var conn = new FS.Connection(connInfo, options);
            conn.connect(function (resp2) {
                if (resp.data.code !== 0) {
                    p.fail("ConnectionMaker connectionInfo was invalid");
                    return;
                }

                if (connInfo.kind === 'player' || connInfo.kind === 'guest') {
                    conn.playerNotificationOn({playerId: connInfo.playerId}, function (resp) {
                        if (resp.data.code === 0) {
                            console.log("Successfully subscribed to player notifications");
                        }
                    });
                }

                var cm = new FS.ConnectionManager(conn);

                cm.options = resp.data;

                p.resolve(cm);
            });
        });

        return p;
    };


    FS.Player = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            }
        });

        this.defineModel({
            'status': String,
            'name': String,
            'playerId': FS.PrimaryKey,
            'authorizationAgents': Array,
            'creationDate': Number,
            'type': String,
            'email': String
        }, data);
    }, FS.Model);

    FS.Player.model = FS.Model.ObjectKeyModel(FS.Player);
    FS.Player.cache = {};

    FS.Player.locateCache = function (conn, data) {
        if (FS.Player.cache[data.playerId] === undefined) {
            FS.Player.cache[data.playerId] = new FS.Player(conn, data);
        } else {
            FS.Player.cache[data.playerId].refresh(data);
            if (conn) {
                FS.Player.cache[data.playerId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }
        return FS.Player.cache[data.playerId].promise;
    };

    FS.Player.prototype.pull = function () {
        var p = new FS.Promise();
        var that = this;

        this.connection.getPlayer({playerId: this.id}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            that.refresh(resp.data);
            p.resolve(that);
        });

        return p;
    };

    FS.Player.prototype.refresh = function (v) {
        FS.Utils.mergeProperties(this, v);
    };

    FS.Player.prototype.update = function () {
        var p = new FS.Promise();
        var that = this;

        if (typeof this.id !== 'string') {
            // TODO: Actually create the authorization agent stuff here
            this.connection.createPlayer(this, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }

                this.refresh(resp.data);
                p.resolve(that);
            });
        } else {
            this.connection.updatePlayer(this, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }
                p.resolve(that);
            });
        }

        return p;
    };

    FS.Player.prototype.getInventory = function (name) {
        return FS.Inventory.getAll(this.connection, {
            playerId: this.id,
            name: name
        });
    };

    FS.Player.prototype.getAvatar = function () {
        return FS.Avatar.getAvatar(this.connection, this);
    };

    FS.Player.getByName = function (conn, name) {
        var p = new FS.Promise();

        conn.getPlayerId({playerName: name}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            var id = resp.data.playerId;

            if (FS.Player.cache[id]) {
                p.resolve(FS.Player.cache[id]);
                return;
            }

            FS.Player.getById(conn, id).then(function (r) {
                p.resolve(r);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };

    FS.Player.isPlayer = function (v) {
        return v instanceof FS.Player;
    };

    FS.Player.getById = function (conn, id) {
        var p = new FS.Promise();

        if (FS.Player.cache[id]) {
            p.resolve(FS.Player.cache[id]);
            return p;
        }

        conn.getPlayer({playerId: id}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            FS.Player.locateCache(conn, resp.data).then(function (resp) {
                p.resolve(resp);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };


    FS.Game = FS.Utils.extend(function (conn, data) {
        FS.Model.call(this);

        Object.defineProperties(this, {
            'connection': {
                'value': conn,
                'writable': true,
                'configurable': true,
                'enumerable': false
            }
        });

        this.defineModel({
            'gameId': FS.PrimaryKey,
            'developerId': String,
            'status': String,
            'playerPoolIds': Array,
            'name': String,
            'botList': Array,
            'botPlayerList': Array,
            'createTime': Date
        }, data);
    }, FS.Model);

    FS.Game.model = FS.Model.ObjectKeyModel(FS.Game);
    FS.Game.cache = {};

    FS.Game.locateCache = function (conn, data) {
        if (FS.Game.cache[data.templateId] === undefined) {
            FS.Game.cache[data.templateId] = new FS.Game(conn, data);
        } else {
            FS.Game.cache[data.templateId].refresh(data);
            if (conn) {
                FS.Game.cache[data.templateId].connection = conn; // if grab cached data, make sure connection object is up-to-date.
            }
        }
        return FS.Game.cache[data.templateId].promise;
    };

    FS.Game.prototype.enable = function (status) {
        var p = new FS.Promise();

        this.connection.enableGame({gameId: this.id, status: status, developerId: this.DeveloperId}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            p.resolve(resp);
        });

        return p;
    };

    FS.Game.prototype.pull = function () {
        var p = new FS.Promise();
        var that = this;

        this.connection.getGame(this, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            that.refresh(resp.data);
            p.resolve(that);
        });

        return p;
    };

    FS.Game.prototype.refresh = function (v) {
        FS.Utils.mergeProperties(this, v);
    };

    FS.Game.prototype.update = function () {
        var p = new FS.Promise();
        var that = this;

        // Fold the data
        var data = FS.Utils.shallowCopy(this);
        data.templateData = FS.Utils.foldObjectKV(this.templateData);
        data.objectData = FS.Utils.foldObjectKV(this.objectData);

        if (typeof this.id !== 'string') {
            this.connection.createGame(data, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }

                p.resolve(resp.data);
            });
        } else {
            this.connection.updateGame(data, function (resp) {
                if (resp.data.code !== 0) {
                    p.fail(resp.data);
                    return;
                }
                p.resolve(resp.data);
            });
        }

        return p;
    };

    FS.Game.prototype.destroy = function () {
        var p = new FS.Promise();

        this.connection.deleteGame(this, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }
            p.resolve(resp.data);
        });

        return p;
    };

    FS.Game.getById = function (conn, id) {
        var p = new FS.Promise();

        if (FS.Game.cache[id] !== undefined) {
            p.resolve(FS.Game.cache[id]);
            return p;
        }

        conn.getGame({gameId: id}, function (resp) {
            if (resp.data.code !== 0) {
                p.fail(resp.data);
                return;
            }

            FS.Game.locateCache(conn, resp.data).then(function (o) {
                p.resolve(o);
            }, function (err) {
                p.fail(err);
            });
        });

        return p;
    };

    FS.Game.isGame = function (v) {
        return v instanceof FS.Game;
    };

}).call(this);

