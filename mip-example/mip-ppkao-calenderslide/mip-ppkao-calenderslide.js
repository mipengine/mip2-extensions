/**
 * @file mip-ppkao-calenderslide 组件
 * @author
 */

define(function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();

    /**
     * 第一次进入可视区回调，只会执行一次
     */
    customElement.prototype.firstInviewCallback = function () {
        var ele = this.element;
        var showmore = $(ele);
        var button = showmore.parents('.kaoshi-fenlei').find('.title');
        $('mip-ppkao-calenderslide').hide();
        button.on('click', function () {
            showmore.toggle(400);
        });
        var calenderContainer = showmore.parents('.kaoshi-fenlei').find('.calender-container');
        var xscs = true;
        var url = '//api.ppkao.com/Interface/PageAPI.ashx?action=Get_ksTimeInfo';
        showmore.find('.kemulist li').on('click', function () {
            button.find('b').text($(this).text());
            var CategoryID = $(this).data('categoryid');
            var ChannelID = $(this).data('channelid');
            getInfoClick(CategoryID, ChannelID);
            function getInfoClick(CategoryID, ChannelID) {
                if (xscs) {
                    calenderContainer.html(
                        '<div class=\'loading\'>'
                    +        '<mip-img src=\'http://static.ppkao.com/phone/new/image/sx.gif\'></mip-img> 正在加载...'
                    +    '</div>'
                    );
                    viewMore(CategoryID, ChannelID);
                }
            }
            function viewMore(CategoryID, ChannelID) {
                xscs = false;
                $.ajax({
                    url: url + '&CategoryID=' + CategoryID + '&ChannelID=' + ChannelID,
                    type: 'POST',
                    dataType: 'json',
                    cache: false,
                    success: function (data) {
                        xscs = true;
                        var list = data;
                        if (list.List === '') {
                            return;
                        }
                        calenderContainer.html(list.List);
                    }
                });
            }
        });
    };

    return customElement;
});
