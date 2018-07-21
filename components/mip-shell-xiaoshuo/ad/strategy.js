/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * TODO：
 * 1. catalog数据支持异步获取
 */

import * as ad from './const'

class Strategy {
  constructor (config) {
    this.state = true
  }
  doSth () {
    // 品专视频广告可关闭时间
    console.log(ad.PINZHUAN_VIDEO_TIME) // 10
  }
}

export default Strategy
