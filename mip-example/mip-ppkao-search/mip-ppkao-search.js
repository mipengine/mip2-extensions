/**
 * @file mip-ppkao-search 组件
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
        var lengThi = ele.find('.sub_list ul');
        var nowCho = ele.find('.nowchoice p');
        var subLi = ele.find('.sub_list ul li a');
        var searchInput = ele.find('.searchText');
        var searchButton = ele.find('.searchBtn');
        searchButton.click(function () {
            nowCho.siblings().hide();
            nowCho.show();
            var value = $('.searchText').val();
            if (value !== '') {
                var abc = $('.sub_list ul li a[name*=' + value + ']');
                nowCho.text('您搜索的关键字是：' + value);
                lengThi.find('a').removeClass('flagcolor');
                abc.addClass('flagcolor');
                for (var j = 0; j < abc.length; j++) {
                    var aText = abc[j].innerHTML;
                    var aHref = abc[j].href;
                    nowCho.after('<a id="' + j + '"></a>');
                    $('#' + j).text(aText);
                    $('#' + j).attr('href', aHref);
                }
                if ($('.sub_list ul li a[name*=' + value + ']').hasClass('flagcolor') === false) {
                    nowCho.text('没有找到与' + value + '相关的科目');
                } else {}
            } else {
                nowCho.text('您没有填写关键字');
            }
        });
        searchInput.click(function () {
            nowCho.siblings().hide();
            subLi.removeClass('flagcolor');
            nowCho.hide();
            $('.searchText').val('');
        });
    };

    return customElement;
});
