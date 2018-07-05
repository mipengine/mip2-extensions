/**
 * @file detector.js 检测是否使用video原生播放
 * @author venyxiong
 */

let UA = navigator.userAgent.toLowerCase();
let goodUaList = ['baiduboxapp', 'safari'];

function isIPhone() {
    return UA.indexOf('iphone') > -1;
}

function isGoodUA() {
    let goodUA = false;
    goodUaList.forEach(function (val) {
        if (UA.indexOf(val) > -1) {
            goodUA = true;
        }
    });
    return goodUA;
}

const detector = {
    isRenderVideoElement () {
        return isIPhone() && isGoodUA();
    }
}

export default detector