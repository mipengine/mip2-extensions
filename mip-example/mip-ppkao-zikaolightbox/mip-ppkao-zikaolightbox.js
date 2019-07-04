/**
 * @file mip-ppkao-zikaolightbox 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        // 点击选中状态
        var ele = $(this.element);
        var xlIcon = ele.find('.xia_icon');
        var adText = ele.find('.ad_text_s');
        var zikaoLis = ele.find('.ad_tkBox ul li');
        var zikaoBox = ele.find('.ad_tkBox');
        // 地区选中
        xlIcon.on('click', function () {
            zikaoBox.toggle(200);
        });
        zikaoLis.on('click', function () {
            $(this).addClass('lis_on').siblings().removeClass('lis_on');
            adText.text($(this).text());
            zikaoBox.hide();
        });
    };

    return customElement;
});
