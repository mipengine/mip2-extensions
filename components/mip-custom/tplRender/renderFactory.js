/**
 * @file 搜索合作页 render factory
 * @author liujing
 *
 */
// import modules
import MustacheRender from './mustacheRender'

const classes = {
  'mustache': MustacheRender
}

export default function renderFactory (args) {
  if (args && args.renderItem && args.renderItem.tplData) {
    let renderType = args.renderItem.tplData.renderType ? args.renderItem.tplData.renderType : 'mustache'
    Object.assign(args.renderItem.tplData, {renderType})
    let render = new classes[renderType](args)
    render.build()
  }
}
