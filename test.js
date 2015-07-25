var
    FS = window.FS || {};
FS.SignIn = {View: {}};
FS.SignIn.Persistent = function (opts) {
    this.opts = opts;
    this.conn = (opts && opts.conn) ? opts.conn : null;
};
FS.SignIn.Persistent.getInstance = function (opts) {
    var _instance = FS.SignIn.Persistent._instance;
    if (!_instance) {
        _instance = FS.SignIn.Persistent._instance = new FS.SignIn.Persistent(opts);
    }
    return _instance;
};
FS.SignIn.Persistent.prototype.storeCookie = function (connInfo) {
    var cookie = FS.Utils.gatherUrlCookieParams();
    cookie.connectionInfo = connInfo.store();
    cookie.httpUrl = fsConnectionParams.httpUrl;
    cookie.connectionInfo.playerPoolId = fsConnectionParams.playerPoolId;
    cookie.put('/', 604800000);
};
FS.SignIn.Persistent.prototype.waitForCookie = function (auth, connInfo, data, callback) {
    var _this = this;

    function testCookie() {
        var cookie = FS.Utils.gatherUrlCookieParams();
        if (cookie.connectionInfo && cookie.connectionInfo.sessionId === connInfo.sessionId) {
            _this.getConnection(auth, data, callback);
        } else {
            setTimeout(testCookie, 100);
        }
    }

    testCookie();
};
FS.SignIn.Persistent.prototype.getConnection = function (auth, data, callback) {
    var _this = this, opts = _.extend(auth, {
        playerPoolId: fsConnectionParams.playerPoolId,
        gameId: fsConnectionParams.gameId,
        httpUrl: fsConnectionParams.httpUrl
    }), connMaker = new FS.Utils.ConnectionMaker("player", opts);
    connMaker.getConnection(function (conn) {
        if (conn) {
            if (_this.gamePlayOptions) {
                var options = _this.gamePlayOptions;
                conn.options.roomid = options.roomId;
                conn.options.roomId = options.roomId;
                conn.options.table = options.table;
                conn.options.seat = options.seat;
                conn.options.own = options.own;
                conn.options.ready = true;
                conn.options.tableSettings = options.tableSettings;
                _this.gamePlayOptions = null;
            }
            conn.setOptions({playerId: conn.connInfo.playerId});
            _this.conn = conn;
            if (callback) {
                callback(conn, data);
            }
        } else {
            if (callback) {
                callback(null, {});
            }
        }
    });
};
FS.SignIn.Persistent.prototype.signIn = function (auth, callback) {
    var _this = this, connInfo = new FS.ConnectionInfo(fsConnectionParams.httpUrl, {
        playerPoolId: fsConnectionParams.playerPoolId,
        gameId: fsConnectionParams.gameId
    }), conn = _this.conn;
    if (_this.onBeforeSignIn) {
        _this.onBeforeSignIn();
    }
    try {
        if (typeof conn !== "undefined" && conn && conn.hasOwnProperty('msgConnection') && conn.msgConnection instanceof FS.MessageHmacConnection) {
            conn.close();
        }
        connInfo.loginPlayer(auth, function (resp) {
            if (resp.data.code === 0) {
                _this.storeCookie(connInfo);
                _this.waitForCookie(auth, connInfo, resp.data, callback);
            } else {
                if (callback) {
                    callback(null, resp.data);
                }
            }
        });
    } catch (err) {
        if (callback) {
            callback(null, {});
        }
    }
};
FS.SignIn.Persistent.prototype.oauthAuthenticate = function (social, callback) {
    var _this = this, conn = _this.conn;
    if (_this.onBeforeSignIn) {
        _this.onBeforeSignIn();
    }
    FS.Utils.requestOAuthAuthorization(fsConnectionParams.oauthGateway, social, fsConnectionParams.oauthPopupDocumentDomain, function (opts) {
        var myOpts = FS.Utils.shallowCopy(opts);
        var connInfo = new FS.ConnectionInfo(fsConnectionParams.httpUrl, {
            playerPoolId: fsConnectionParams.playerPoolId,
            gameId: fsConnectionParams.gameId
        });
        try {
            if (typeof conn !== "undefined" && conn && conn.hasOwnProperty('msgConnection') && conn.msgConnection instanceof FS.MessageHmacConnection) {
                conn.close();
            }
            connInfo.loginPlayer(myOpts, function (resp) {
                if (resp.data.code === 0) {
                    _this.storeCookie(connInfo);
                    _this.waitForCookie(myOpts, connInfo, resp.data, callback);
                } else {
                    if (callback) {
                        callback(null, resp.data);
                    }
                }
            });
        } catch (err) {
            if (callback) {
                callback(null, {});
            }
        }
    });
};
FS.SignIn.RULES = {
    EMAIL: [function (email) {
        if ($.trim(email).length === 0) {
            return 'Invalid email address.';
        }
    }, function (email) {
        var rule = /^[a-zA-Z0-9,!#\$%&'\*\+/=\?\^_`\{\|}~-]+(\.[a-zA-Z0-9,!#\$%&'\*\+/=\?\^_`\{\|}~-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*\.([a-z]{2,})$/;
        if (!rule.test(email)) {
            return 'Invalid email address.';
        }
    }], PASSWORD: [function (password) {
        if ($.trim(password).length == 0) {
            return 'Password is required.';
        }
    }]
};
FS.SignIn.View.ValidationMessage = Backbone.View.extend({
    tagName: 'div',
    className: 'fs-signin-error-container',
    template: _.template('<span><img class="fs-signin-error-left" width="19" height="28" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAeCAYAAADOziUSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAkJJREFUeNqslT1s00AUx99d7LiukyZqmiIFtsDOWjEzsLKwIKAgRGFAfKkziC8xVKKqyhKJhQGxITEWpgjxKbYwIFCQaIXdpE5o2vji+Hw8B1eKSkLjMydZts53P733/997R4QQ8ObeHVCNFOjT0wDCh9WVl0ASCRDcA+66QAgAoQnwmAPcYfiPAk6Bh9/drZaSzGYvura9oEC8oYMQ845p3sQ3yMMImRCc3+KMXdmZUuQ4JO+77oNOozHbPx8ZRig94DG2yOr144G+0jAEHfLa7eXOxsbRHihwRgaG7h7utlqPOnZ9Jsz1rzV0JJCiHOnY9hPHsmbAF0PXKSNEdAwhS6xWKwLnAyMaKTKM6ASzrBI+e4L+CUPQufba2jKrre8fptGeMKqqQWrXt75XFxzLzEVxW9mlD/wsl2+3qtVrbsMeH2T/aDDcVHv3drFRqcx1NzeTWPGRQP2wZO3D+xIzzZPuryYF35cq1x3NXLfZ+MLdDg+qX3b0G3A3XSzOJ3R9+3/AUCbxMFM8eBWbXRMojQkLeL5fGi8ULmnZ7HpsWAh8Opbfd0HNZFdFBDOG5iJ8/lzP588mJzLfQgnkYb39nK/ohcKslst9BjzQsWA9oOeVtcnJ02NTU59iw8IIP6rp9Cl0+bUIugcIeVhoSkU1jDOY8qvetgEaRjpMCPyqGEag4QtsUfFgIfBHQtPO4zl8trsRUKm6EcIiqjqnpFKP+9Ol0lUtRBOvvsuY9hIJS08e9mdsY6o3UMP72CC6vwUYAN327T5yRM17AAAAAElFTkSuQmCC"' + '></span><span class="fs-signin-error-info"><%=message%></span>'),
    initialize: function (options) {
        var _this = this;
        _this.options = options;
        _.bindAll(_this, 'build');
        _this.build();
    },
    build: function () {
        var _this = this, _thisEl = $(_this.el), _element = _this.options.element, _elHeight = _element.outerHeight(), _errorHeight = _thisEl.outerHeight(), _errorOffset = _element.offset(), _top, _left;
        _thisEl.html(_this.template({message: _this.options.message}));
        if ($.browser['mozilla']) {
            _top = _errorOffset.top + Math.floor((_errorHeight - _elHeight) / 2) + 2;
        } else {
            _top = _errorOffset.top + Math.floor((_errorHeight - _elHeight) / 2) + 15;
        }
        _left = _errorOffset.left + _element.innerWidth();
        if ($(_element).hasClass("captcha-pos") && $(_element).is(":visible")) {
            _top += 96;
            _left -= 340;
        } else {
            if (_element.get(0).tagName === 'SELECT') {
                if ($.browser['mozilla']) {
                    _top -= 5;
                }
                else if ((navigator.userAgent.toLowerCase().indexOf('chrome') > -1)) {
                    _top -= 8;
                }
                else {
                    _top -= 13;
                }
            }
        }
        _thisEl.css({'left': _left + 'px', 'top': _top + 'px'});
        $(window).resize(function () {
            setTimeout(function () {
                var offset = _element.offset(), offsetTop = offset.top + 4, offsetLeft = offset.left + _element.innerWidth();
                if ($(_element).hasClass("captcha-pos") && $(_element).is(":visible")) {
                    _thisEl.css({'left': offsetLeft - 340 + 'px', 'top': offsetTop + 50 + 'px'});
                } else {
                    _thisEl.css({'left': offsetLeft + 'px', 'top': offsetTop + 'px'});
                }
            }, 1);
        });
        if ($('#wrapper').length > 0) {
            $('#wrapper').append(_thisEl);
        } else {
            var div = document.createElement('div');
            div.setAttribute('id', 'wrapper');
            $('body').append(div);
            $('#wrapper').append(_thisEl);
        }
    }
});
FS.SignIn.ValidationManager = function (view) {
    var _this = this;
    _this.view = view;
    _this.model = new Backbone.Model();
    _this.rules = {};
    _this._onChanged = function () {
        var _model = _this.model, _changes = _model.attributes, _rules = _this.rules, __rules, _message;
        for (var attr in _changes) {
            __rules = _rules[attr];
            if (__rules) {
                _message = _.detect(__rules['functions'], function (__rule) {
                    return __rule(_changes[attr], _model) !== undefined;
                });
                if (_message) {
                    __rules['message'] = _message(_changes[attr], _model);
                } else {
                    __rules['message'] = null;
                }
            }
        }
    };
    _this.model.bind('change', _this._onChanged);
};
FS.SignIn.ValidationManager.prototype.addRule = function (attr, functions) {
    var _this = this, _attr = _this.rules[attr];
    if (_attr === undefined) {
        _attr = {attr: attr, functions: []};
    }
    _.each(functions, function (func) {
        _attr['functions'].push(func);
    });
    _this.rules[attr] = _attr;
};
FS.SignIn.ValidationManager.prototype.validate = function () {
    var _this = this, _rules, _isValid = true, _error;
    _rules = _this.rules;
    _.each(_rules, function (_rule) {
        if (_rule['message']) {
            if (_isValid) {
                _isValid = false;
            }
            _error = new FS.SignIn.View.ValidationMessage({
                message: _rule['message'],
                element: _rule['element'],
                view: _this.view
            });
            _rule['view'] = _error;
        }
    });
    return _isValid;
};
FS.SignIn.ValidationManager.prototype.mapElement = function (attr, element) {
    var _this = this, _attr = _this.rules[attr];
    if (_attr === undefined) {
        _attr = {attr: attr, functions: []};
    }
    _attr['element'] = element;
    _this.rules[attr] = _attr;
};
FS.SignIn.ValidationManager.prototype.reset = function () {
    this.model.clear({silent: true});
    var _rules = this.rules;
    _.each(_rules, function (_rule) {
        if (_rule['message']) {
            _rule['message'] = null;
        }
        if (_rule['view']) {
            _rule['view'].remove();
            _rule['view'] = null;
        }
    });
    this.model.clear();
};
FS.SignIn.ValidationManager.prototype.push = function (attr, value) {
    var _obj = {};
    _obj[attr] = value;
    this.model.set(_obj);
};
FS.SignIn.View.Main = Backbone.View.extend({
    tagName: 'section',
    className: 'fs-popup-sign-in-container',
    initialize: function (opts) {
        var _this = this;
        _.bindAll(_this, '_init', '_loadSocialImages', '_addForgotPasswordLink', '_oauthAuthenticate', '_reset', '_signIn', '_signInOnReturnPress', '_switchToForgotPassword', '_triggerForgotHandler', '_goBackEmailFocus', '_setEmailFocus');
        _.bindAll(_this, 'hide', 'show', 'setForgotPasswordClickHandler', 'setSignInSuccessCallback', 'setHideCallBack');
        _this.opts = _this['opts'] || {};
        _this.container = opts['opts']['container'];
    },
    events: {
        'click div.fs-popup-button': '_signIn',
        'keypress div.fs-popup-button': '_signInOnReturnPress',
        'keypress input': '_signInOnReturnPress',
        'keypress email': '_signInOnReturnPress',
        'click ul.oauth-container li a': '_oauthAuthenticate',
        'click a.fs-signin-close-button': '_reset',
        'click a.forgot': '_switchToForgotPassword',
        'keydown a.fs-signin-close-button': '_goBackEmailFocus'
    },
    _addForgotPasswordLink: function () {
        var _this = this, _$el = $('a.forgot').eq(0);
    },
    _loadSocialImages: function () {
        var _this = this, _pxLoader = new PxLoader(), _facebook = _pxLoader.addImage(_this.options['opts']['facebook']), _google = _pxLoader.addImage(_this.options['opts']['google']), _twitter = _pxLoader.addImage(_this.options['opts']['twitter']);
        _pxLoader.addCompletionListener(function () {
            _this.$el.html(FS.Templates.SignIn.MAIN);
            _this.$el.find('a.facebook').append(_facebook);
            _this.$el.find('a.google').append(_google);
            _this.$el.find('a.twitter').append(_twitter);
            _this._init();
        });
        _pxLoader.start();
    },
    _init: function () {
        var _this = this, _vManager;
        _this.elEmail = _this.$el.find('input.email');
        _this.elPassword = _this.$el.find('input.password');
        _this.elIndicator = _this.$el.find('div.indicator');
        $('#' + _this.container).append(_this.$el);
        _this.$el.reveal({
            animation: 'fade',
            animationspeed: 200,
            closeonbackgroundclick: false,
            dismissmodalclass: 'fs-signin-close-button'
        });
        _vManager = _this.vManager = new FS.SignIn.ValidationManager(_this);
        _vManager.addRule('email', FS.SignIn.RULES.EMAIL);
        _vManager.addRule('password', FS.SignIn.RULES.PASSWORD);
        _vManager.addRule('status', [function (status) {
            if (status === true) {
                return;
            }
            switch (status) {
                case 86:
                    return 'Email or password incorrect';
                case 20:
                    return 'Failed to connect to server';
                case 84:
                    return 'Your account has not been activated';
                case undefined:
                    alert('Unable to connect to WebSockets. Connection status was "undefined"');
                    return 'Unable to connect to WebSockets. Connection status was "undefined"';
                default:
                    console.log(status);
                    alert('Something went wrong. Connection status is: ' + status);
            }
        }]);
        _vManager.mapElement('email', _this.elEmail);
        _vManager.mapElement('password', _this.elPassword);
        _vManager.mapElement('status', _this.elEmail);
        _this.elIndicator.append((new Spinner({
            lines: 13,
            length: 7,
            width: 4,
            radius: 10,
            rotate: 0,
            color: '#000',
            speed: 1,
            trail: 60,
            shadow: false,
            hwaccel: false,
            className: 'spinner',
            zIndex: 2e9,
            top: '24',
            left: '24'
        }).spin()).el);
        _this._addForgotPasswordLink();
        _this._isLoaded = true;
        _this.elEmail.focus();
    },
    _reset: function () {
        var _this = this;
        if (_this.vManager) {
            _this.vManager.reset();
        }
        _this.elEmail.val('');
        _this.elPassword.val('');
        _this.elIndicator.hide();
    },
    _signInOnReturnPress: function (e) {
        if (e.keyCode === 13) {
            this._signIn();
        }
    },
    _signIn: function () {
        var _this = this, _vManager = _this.vManager;
        if (!_this._isProcessing) {
            _vManager.reset();
            _vManager.push('email', _this.elEmail.val());
            _vManager.push('password', _this.elPassword.val());
            _vManager.push('status', true);
            if (_vManager.validate()) {
                var auth = {agent: 'Local', uniqueId: _this.elEmail.val(), password: _this.elPassword.val()};
                _this._isProcessing = true;
                _this.elIndicator.show();
                _this.options['container'].persistent.signIn(auth, function (conn, player) {
                    _this.elIndicator.hide();
                    if (conn) {
                        _this.hide();
                        if (_this.onSignInSuccess) {
                            _this.onSignInSuccess(conn, player);
                        }
                    } else {
                        if (player.code === 84) {
                            _vManager.push('status', player.code);
                        } else {
                            _vManager.push('status', player.code);
                        }
                        if (player.code) {
                            console.log(player);
                        }
                        _vManager.validate();
                    }
                    _this._isProcessing = false;
                });
            }
        }
    },
    _switchToForgotPassword: function () {
        var _this = this;
        if (_this.onForgotPasswordClick) {
            _this.hide();
            setTimeout(function () {
                _this.onForgotPasswordClick();
            }, 250);
        }
    },
    _oauthAuthenticate: function (e) {
        var _target = $(e.target).closest('a'), _this = this;
        FS.SignIn.Persistent.getInstance({}).oauthAuthenticate(_target.attr('class'), function (conn, data) {
            if (_this.onSignInSuccess) {
                _this.hide();
                _this.onSignInSuccess(conn, data);
            }
        });
    },
    _triggerForgotHandler: function () {
        var _this = this;
        if (_this.onForgotPasswordClicked) {
            _this.hide();
            setTimeout(function () {
                _this.onForgotPasswordClicked();
            }, 300);
        }
    },
    hide: function () {
        if (this._onHideCallBack) {
            this._onHideCallBack();
        }
        this.$el.find('a.fs-signin-close-button').trigger('click');
    },
    setHideCallBack: function (func) {
        this._onHideCallBack = func;
    },
    show: function () {
        var _this = this;
        if (!_this._isLoaded) {
            _this._loadSocialImages();
        } else {
            _this._reset();
            _this.$el.reveal({
                animation: 'fade',
                animationspeed: 200,
                closeonbackgroundclick: false,
                dismissmodalclass: 'fs-signin-close-button'
            });
            _this.elEmail.focus();
        }
    },
    setForgotPasswordClickHandler: function (func) {
        if (typeof func === 'function') {
            this.onForgotPasswordClick = func;
        }
    },
    setSignInSuccessCallback: function (func) {
        if (typeof func === 'function') {
            this.onSignInSuccess = func;
        }
    },
    _goBackEmailFocus: function (e) {
        var _this = this;
        if (e.keyCode === 9) {
            _this._setEmailFocus();
        }
    },
    _setEmailFocus: function () {
        var _this = this;
        setTimeout(function () {
            _this.elEmail.focus();
        }, 500);
    }
});
FS.SignIn.Main = function (opts) {
    var _this = this;
    _this.opts = opts;
    _this.persistent = FS.SignIn.Persistent.getInstance(_this.opts);
    _this.view = new FS.SignIn.View.Main({opts: opts, container: _this});
    if (_this.opts['forgotPasswordClickHandler']) {
        _this.view.setForgotPasswordClickHandler(_this.opts['forgotPasswordClickHandler']);
    }
    if (_this.opts['signInCallback']) {
        _this.view.setSignInSuccessCallback(_this.opts['signInCallback']);
    }
    if (_this.opts['onBeforeSignIn']) {
        _this.persistent.onBeforeSignIn = _this.opts['onBeforeSignIn'];
    }
    if (this.hideClickCallBack) {
        _this.view.setHideCallBack(this.hideClickCallBack);
    }
};
FS.SignIn.getInstance = function (opts) {
    var _instance = FS.SignIn._instance;
    if (!_instance) {
        _instance = FS.SignIn._instance = new FS.SignIn.Main(opts);
    }
    return _instance;
};
FS.SignIn.Main.prototype.show = function () {
    if (this.view) {
        this.view.show();
    }
};
FS.SignIn.Main.prototype.hide = function () {
    if (this.view) {
        this.view.hide();
    }
};
FS.SignIn.Main.prototype.setSignInSuccessCallback = function (func) {
    if (this.view) {
        this.view.setSignInSuccessCallback(func);
    }
};
FS.SignIn.Main.prototype.setForgotPasswordClickHandler = function (func) {
    if (this.view) {
        this.view.setForgotPasswordClickHandler(func);
    }
};
FS.SignIn.Main.prototype.setGamePlayOptions = function (opts) {
    if (this.persistent) {
        this.persistent.gamePlayOptions = opts;
    }
};
FS.SignIn.Main.prototype.setOnBeforeSignIn = function (func) {
    if (this.persistent) {
        this.persistent.onBeforeSignIn = func;
    }
};
FS.SignIn.Main.prototype.setHideCallBack = function (func) {
    if (this.view) {
        this.view.setHideCallBack(func);
    } else {
        this.hideClickCallBack = func;
    }
};
