/**
 * @file Mustache template
 * @author chenyongle(chenyongle@baidu.com)
 */
import sanitizer from './sanitizer'
import mustache from 'mustache'
const {templates} = MIP
let Inheritor = templates.inheritTemplate()
// 继承自 Template，必须暴露两个方法
class Mustache extends Inheritor {
  cache (templateHTML) {
    mustache.parse(templateHTML)
  }
  render (templateHTML, data) {
    return sanitizer(mustache.render(templateHTML, data))
  }
}

MIP.registerTemplate('mip-mustache', Mustache)
