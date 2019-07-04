/**
 * @file mip-ppkao-tikuqiehuan 组件
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
        var tkLi = ele.find('.tk_kinds li');
        var tkLiall = ele.find('.all_lis');
        var tkLizj = ele.find('.zj_lis');
        var tkLimr = ele.find('.mr_lis');
        var zjBox = ele.find('#zhangjielianxi');
        var mrBox = ele.find('#meiriyilian');
        tkLi.on('click', function () {
            $(this).addClass('tk_ons').siblings().removeClass('tk_ons');
        });
        tkLiall.on('click', function () {
            zjBox.show();
            mrBox.show();
        });
        tkLizj.on('click', function () {
            zjBox.show();
            mrBox.hide();
        });
        tkLimr.on('click', function () {
            mrBox.show();
            zjBox.hide();
        });
    };

    return customElement;
});
