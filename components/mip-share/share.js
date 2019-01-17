/**
 * @file 分享类
 * @author mj(zoumiaojiang@gmail.com)
 */

import PMDShare from './share/share'

/**
 * 默认的分享配置
 *
 * @type {Object}
 */
const DEFAULT_OPTTIONS = {
  iconUrl: '//m.baidu.com/se/static/pmd/pmd/share/images/bdu.jpg'
}

export default class Share extends PMDShare {
  constructor (opts, container) {
    opts = Object.assign({}, DEFAULT_OPTTIONS, opts)

    super(opts)
    this.render(container)
  }
}
