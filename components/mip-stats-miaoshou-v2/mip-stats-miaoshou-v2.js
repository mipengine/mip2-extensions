/**
 * @file mip-stats-miaoshou-v2 组件
 * @author
 */

define(function (require) {
    'use strict';

    var customElement = require('customElement').create();
    var fetchJsonp = require('fetch-jsonp');


    customElement.prototype.createdCallback = function () {
        var e = this.element;
        var url = e.getAttribute('url');
        var tid = e.getAttribute('tid');
        var type = e.getAttribute('type');
        var selectName = e.getAttribute('selectName') ? e.getAttribute('selectName') : '#view_num';

        url = url + '?id=' + tid + '&type=' + type;

        fetchJsonp(url, {
            jsonpCallback: 'cb',
            timeout: 5000
        }).then(function (res) {
            return res.json();
        }).then(function (data) {
            if (data.views) {
                var dom = e.querySelector(selectName);
                dom.innerHTML = data.views + '人阅读';
            }
        });
    };

    return customElement;
});
