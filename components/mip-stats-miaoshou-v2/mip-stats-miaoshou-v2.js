/**
 * @file mip-stats-miaoshou-v2 组件
 * @author
 */
const { CustomElement } = MIP
const { fetchJsonp } = window

export default class MIPStatsMiaoshouV2 extends CustomElement {
    build () {
        let e = this.element;
        let url = e.getAttribute('url');
        let tid = e.getAttribute('tid');
        let type = e.getAttribute('type');
        let selectName = e.getAttribute('selectName') ? e.getAttribute('selectName') : '#view_num';

        url = url + '?id=' + tid + '&type=' + type;

        fetchJsonp(url, {
            jsonpCallback: 'cb',
            timeout: 5000
        }).then(function (res) {
            return res.json();
        }).then(function (data) {
            if (data.views) {
                let dom = e.querySelector(selectName);
                dom.innerHTML = data.views + '人阅读';
            }
        });

    }
}