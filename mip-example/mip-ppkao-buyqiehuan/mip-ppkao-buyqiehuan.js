/**
 * @file mip-ppkao-buyqiehuan 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        var ele = $(this.element);
        var chooseLi = ele.find('.choose-vip ul li');
        chooseLi.click(function () {
            $(this).addClass('check').siblings().removeClass('check');
        });
    };
    return customElement;
});
