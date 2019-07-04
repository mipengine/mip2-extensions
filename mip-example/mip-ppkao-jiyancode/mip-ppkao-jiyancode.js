/**
 * @file mip-ppkao-jiyancode 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    // 由于用到了第三方【极验】的功能，现在并没有这个服务的组件，所以添加了外链js
    customElement.prototype.firstInviewCallback = function () {
        var ele = this.element;
        ele.addEventListener('click', function () {
            var url = ele.dataset.url;
            jiYanCode(url);
        });

        function jiYanCode(openUrl) {
            $.ajax({
                type: 'POST',
                async: false,
                cache: false,
                url: '//newapi.ppkao.com/api/UserPowerApi/GetUserIP?Source=3g',
                dataType: 'jsonp',
                crossDomain: true,
                contentType: 'application/x-www-form-urlencoded;charset=utf-8',
                jsonp: 'callback',
                jsonpCallback: 'callback',
                success: function (data) {
                    if (data.name === '1' || data.name === '4') {
                        window.top.location.href = openUrl;
                        return false;
                    } else {
                        window.top.location.href = 'https://api.ppkao.com/user/login/index_upvip.html';
                        return false;
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    var result = openUrl.replace('//user.ppkao.com/', '//api.ppkao.com/');
                    window.top.location.href = result;
                    return false;
                }
            });
           /* var num = window.sessionStorage.getItem('JR_NUM');
            if (num === null || num === '') {
                num = 1;
            }
            if (num === null || num === '' || num < 20) {
                window.sessionStorage.setItem('JR_NUM', ++num / 1);
                window.top.location.href = openUrl;
            } else {
                var handlerEmbed = function (captchaObj) {
                    captchaObj.getValidate();
                    captchaObj.appendTo('#embed-captcha');
                    captchaObj.onReady(function () {
                        captchaObj.verify();
                    });
                    captchaObj.onSuccess(function () {
                        window.sessionStorage.setItem('JR_NUM', 1);
                        window.top.location = openUrl;
                    });
                };
                $.ajax({
                    url: '//data.api.ppkao.com/Interface/GeetestSDK/GeetestSDK.ashx?action=getCaptcha&t='
                    + (new Date()).getTime(),
                    type: 'get',
                    dataType: 'json',
                    success: function (data) {
                        window.initGeetest({
                            gt: data.gt,
                            challenge: data.challenge,
                            product: 'bind',
                            offline: !data.success,
                            newCaptcha: data.new_captcha
                        }, handlerEmbed);
                    }
                });
            }*/

        }

        (function (global, factory) {
            if (typeof module === 'object' && typeof module.exports === 'object') {
                // CommonJS
                module.exports = global.document ? factory(global, true)
                    : function (w) {
                        if (!w.document) {
                            throw new Error('Geetest requires a window with a document');
                        }
                        return factory(w);
                    };
            } else {
                factory(global);
            }
        }(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
            if (typeof window === 'undefined') {
                throw new Error('Geetest requires browser environment');
            }
            var document = window.document;
            var Math = window.Math;
            var head = document.getElementsByTagName('head')[0];
            function Jobject(obj) {
                this.jObj = obj;
            }
            Jobject.prototype = {
                oEach: function (process) {
                    var jObj = this.jObj;
                    for (var k in jObj) {
                        if (jObj.hasOwnProperty(k)) {
                            process(k, jObj[k]);
                        }
                    }
                    return this;
                }
            };
            function Config(config) {
                var self = this;
                new Jobject(config).oEach(function (key, value) {
                    self[key] = value;
                });
            }
            var isString = function (value) {
                return (typeof value === 'string');
            };
            Config.prototype = {
                apiServer: 'api.geetest.com',
                protocol: 'http://',
                typePath: '/gettype.php',
               // 由于用到了第三方【极验】的功能，现在并没有这个服务的组件，所以添加了外链js
                fallbackConfig: {
                    slide: {
                        staticServers: ['static.geetest.com', 'dn-staticdown.qbox.me'],
                        type: 'slide',
                        slide: '/static/js/geetest.0.0.0.js'
                    },
                    fullpage: {
                        staticServers: ['static.geetest.com', 'dn-staticdown.qbox.me'],
                        type: 'fullpage',
                        fullpage: '/static/js/fullpage.0.0.0.js'
                    }
                },
                getFallbackConfig: function () {
                    var self = this;
                    if (isString(self.type)) {
                        return self.fallbackConfig[self.type];
                    } else if (self.newCaptcha) {
                        return self.fallbackConfig.fullpage;
                    } else {
                        return self.fallbackConfig.slide;
                    }
                },
                extend: function (obj) {
                    var self = this;
                    new Jobject(obj).oEach(function (key, value) {
                        self[key] = value;
                    });
                }
            };
            var isNumber = function (value) {
                return (typeof value === 'number');
            };
            var isBoolean = function (value) {
                return (typeof value === 'boolean');
            };
            var isObject = function (value) {
                return (typeof value === 'object' && value !== null);
            };
            var isFunction = function (value) {
                return (typeof value === 'function');
            };
            var callbacks = {};
            var status = {};
            var random = function () {
                return parseInt(Math.random() * 10000, 0) + (new Date()).valueOf();
            };
            var loadScript = function (url, cb) {
                var script = document.createElement('script');
                script.charset = 'UTF-8';
                script.async = true;
                script.onerror = function () {
                    cb(true);
                };
                var loaded = false;
                script.onload = script.onreadystatechange = function () {
                    if (!loaded && (!script.readyState
                        || 'loaded' === script.readyState
                        || 'complete' === script.readyState)) {
                        loaded = true;
                        setTimeout(function () {
                            cb(false);
                        }, 0);
                    }
                };
                script.src = url;
                head.appendChild(script);
            };
            var normalizeDomain = function (domain) {
                return domain.replace(/^https?:\/\/|\/$/g, '');
            };
            var normalizePath = function (path) {
                path = path.replace(/\/+/g, '/');
                if (path.indexOf('/') !== 0) {
                    path = '/' + path;
                }
                return path;
            };
            var normalizeQuery = function (query) {
                if (!query) {
                    return '';
                }
                var q = '?';
                new Jobject(query).oEach(function (key, value) {
                    if (isString(value) || isNumber(value) || isBoolean(value)) {
                        q = q + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
                    }
                });
                if (q === '?') {
                    q = '';
                }
                return q.replace(/&$/, '');
            };
            var makeURL = function (protocol, domain, path, query) {
                domain = normalizeDomain(domain);
                var url = normalizePath(path) + normalizeQuery(query);
                if (domain) {
                    url = protocol + domain + url;
                }
                return url;
            };
            var load = function (protocol, domains, path, query, cb) {
                var tryRequest = function (at) {

                    var url = makeURL(protocol, domains[at], path, query);
                    loadScript(url, function (err) {
                        if (err) {
                            if (at >= domains.length - 1) {
                                cb(true);
                            } else {
                                tryRequest(at + 1);
                            }
                        } else {
                            cb(false);
                        }
                    });
                };
                tryRequest(0);
            };
            var jsonp = function (domains, path, config, callback) {
                if (isObject(config.getLib)) {
                    config.extend(config.getLib);
                    callback(config);
                    return;
                }
                if (config.offline) {
                    callback(config.getFallbackConfig());
                    return;
                }
                var cb = 'geetest_' + random();
                window[cb] = function (data) {
                    if (data.status === 'success') {
                        callback(data.data);
                    } else if (!data.status) {
                        callback(data);
                    } else {
                        callback(config.getFallbackConfig());
                    }
                    window[cb] = undefined;
                    try {
                        delete window[cb];
                    } catch (e) {
                    }
                };
                load(config.protocol, domains, path, {
                    gt: config.gt,
                    callback: cb
                }, function (err) {
                    if (err) {
                        callback(config.getFallbackConfig());
                    }
                });
            };
            var throwError = function (errorType, config) {
                var errors = {
                    networkError: '缃戠粶閿欒'
                };
                if (typeof config.onError === 'function') {
                    config.onError(errors[errorType]);
                } else {
                    throw new Error(errors[errorType]);
                }
            };
            var detect = function () {
                return !!window.Geetest;
            };
            if (detect()) {
                status.slide = 'loaded';
            }
            var initGeetest = function (userConfig, callback) {
                var config = new Config(userConfig);
                if (userConfig.https) {
                    config.protocol = 'https://';
                } else if (!userConfig.protocol) {
                    config.protocol = window.top.location.protocol + '//';
                }
                jsonp([config.apiServer || config.apiserver], config.typePath, config, function (newConfig) {
                    var type = newConfig.type;
                    var init = function () {
                        config.extend(newConfig);
                        callback(new window.Geetest(config));
                    };
                    callbacks[type] = callbacks[type] || [];
                    var s = status[type] || 'init';
                    if (s === 'init') {
                        status[type] = 'loading';
                        callbacks[type].push(init);
                        load(config.protocol, newConfig.static_servers || newConfig.domains, newConfig[type]
                            || newConfig.path, null,
                            function (err) {
                                if (err) {
                                    status[type] = 'fail';
                                    throwError('networkError', config);
                                } else {
                                    status[type] = 'loaded';
                                    var cbs = callbacks[type];
                                    for (var i = 0, len = cbs.length; i < len; i = i + 1) {
                                        var cb = cbs[i];
                                        if (isFunction(cb)) {
                                            cb();
                                        }
                                    }
                                    callbacks[type] = [];
                                }
                            }
                        );
                    } else if (s === 'loaded') {
                        init();
                    } else if (s === 'fail') {
                        throwError('networkError', config);
                    } else if (s === 'loading') {
                        callbacks[type].push(init);
                    }
                });
            };
            window.initGeetest = initGeetest;
            return initGeetest;
        }));

    };

    return customElement;
});
