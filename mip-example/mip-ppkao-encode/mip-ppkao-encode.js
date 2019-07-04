/**
 * @file mip-ppkao-encode 组件
 * @author
 */

define(function (require) {
    'use strict';
    var $ = require('zepto');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        var ele = $(this.element);
        var charset = ele.attr('accept-charset') ? ele.attr('accept-charset') : 'utf-8';
        ele.find('form').attr('accept-charset', charset);
    };

    return customElement;
});
