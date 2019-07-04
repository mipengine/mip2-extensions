/**
 * @file mip-ppkao-zixun 组件
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
        var zxKinds = ele.find('.zx_kinds ul li:nth-child(4n)');
        var zxKul = ele.find('.zx_kinds ul li');
        zxKinds.css({'margin-right': '0'});
        zxKul.click(function () {
            $(this).toggleClass('zx_lis');
        });
    };

    return customElement;
});
