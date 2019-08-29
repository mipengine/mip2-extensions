/**
 * @file patch.js
 * @author clark-t (clarktanglei@163.com)
 */

const map = {
  add: addNode,
  remove: removeNode,
  move: moveNode
}

export function update ({
  patches,
  parent,
  oldArr,
  createElement
}) {
  let len = patches.length
  patches.sort((a, b) => {
    if (a.type === 'removed' && b.type === 'removed') {
      return a.oldIndex - b.oldIndex
    }

    if (a.type === 'removed') {
      return 1
    }

    if (b.type === 'removed') {
      return -1
    }

    return a.newIndex - b.newIndex
  })

  for (let i = 0; i < len; i++) {
    map[patches[i].type]({
      patch: patches[i],
      patches,
      index: i,
      oldArr,
      parent,
      createElement
    })
  }
}

function addNode ({
  patch,
  index,
  patches,
  parent,
  oldArr,
  createElement
}) {
  let element = createElement(patch.node.text)
  patch.node.element = element
  insert(parent, patch.newIndex, element)
  oldArr.splice(patch.newIndex, 0, patch.node)

  for (let j = index + 1; j < patches.length; j++) {
    let p = patches[j]
    if (p.oldIndex != null && p.oldIndex >= patch.newIndex) {
      p.oldIndex += 1
    }
  }
}

function removeNode ({
  patch,
  index,
  patches,
  parent,
  oldArr
}) {
  parent.removeChild(patch.node.element)
  oldArr.splice(patch.oldIndex, 1)

  for (let j = index + 1; j < patches.length; j++) {
    let p = patches[j]
    if (p.oldIndex != null && p.oldIndex >= patch.oldIndex) {
      p.oldIndex -= 1
    }
  }
}

function moveNode ({
  patch,
  index,
  patches,
  parent,
  oldArr
}) {
  if (patch.oldIndex === patch.newIndex) {
    return
  }

  parent.removeChild(patch.node.element)
  insert(parent, patch.newIndex, patch.node.element, true)
  oldArr.splice(patch.oldIndex, 1)
  oldArr.splice(patch.newIndex, 0, patch.node)

  let flag
  let min
  let max

  if (patch.oldIndex > patch.newIndex) {
    flag = 1
    min = patch.newIndex
    max = patch.oldIndex - 1
  } else {
    flag = -1
    min = patch.oldIndex + 1
    max = patch.newIndex
  }

  for (let j = index + 1; j < patches.length; j++) {
    let p = patches[j]
    if (p.oldIndex != null && p.oldIndex >= min && p.oldIndex <= max) {
      p.oldIndex += flag
    }
  }
}

function insert (parent, index, element, isMove) {
  let len = parent.childNodes.length + (isMove ? 1 : 0)

  if (index === len) {
    parent.appendChild(element)
  } else {
    parent.insertBefore(element, parent.childNodes[index])
  }
}

export function isAddPatch (patch) {
  return patch.type === 'add'
}

export function isRemovedPatch (patch) {
  return patch.type === 'removed'
}
