/**
 * @file mip-ppkao-kaotilightbox 组件
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
        var showBtn = ele.find('.m_q_btn p');
        var showBox = ele.find('.analysis_box');
        var anserIcon = ele.find('.m_q_btn p i');
        // 显示
        showBtn.on('click', function () {
            showBox.show();
            var dBox = ele.find('.analysis_box').css('display');
            if (dBox === 'block') {
                $(this).addClass('answer_btn');
                anserIcon.addClass('answer_icon');
            } else if (dBox === 'none') {
                $(this).removeClass('answer_btn');
                anserIcon.removeClass('answer_icon');
            }
        });
    };

    return customElement;
});
