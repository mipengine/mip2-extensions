/**
 * @file Mustache template
 * @author chenyongle(chenyongle@baidu.com)
 */
import sanitizer from './sanitizer'
import mustache from 'mustache'

const {templates} = MIP

let Inheritor = templates.inheritTemplate()

/**
 * Mustache 封装后的内容，继承自 Template，必须暴露两个方法 cache 和 render
 *
 * @class {Mustache}
 */
class Mustache extends Inheritor {
  cache (templateHTML) {
    mustache.parse(templateHTML)
  }
  render (templateHTML, data) {
    return sanitizer(mustache.render(templateHTML, data))
  }
}

MIP.registerTemplate('mip-mustache', Mustache)
