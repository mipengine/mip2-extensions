/**
 * @file mip-ppkao-footer 组件
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
        var pcurl = window.location.href;
        pcurl = pcurl.replace('m.ppkao.com', 'www.ppkao.com');
        if (!/#m/.test(pcurl)) {
            pcurl = pcurl + '#m';
        }
        ele.find('#pcb').attr('href', pcurl);
    };

    return customElement;
});
