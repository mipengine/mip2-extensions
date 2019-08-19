/**
 * @file diff.js
 * @author clark-t (clarktanglei@163.com)
 * @description diff 两个列表实现最小代价的列表节点操作
 *    参考自 vuejs：https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L404
 */
/* eslint-disable */
export function diff ({
  oldArr,
  newArr,
  compare,
  findIndex
}) {
  let oldStartIndex = 0
  let oldEndIndex = oldArr.length - 1
  let oldStartNode = oldArr[0]
  let oldEndNode = oldArr[oldEndIndex]

  let newStartIndex = 0
  let newEndIndex = newArr.length - 1
  let newStartNode = newArr[0]
  let newEndNode = newArr[newEndIndex]

  let oldIndexFound = {}
  let patches = []

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldIndexFound[oldStartIndex]) {
      oldStartNode = oldArr[++oldStartIndex]
    } else if (oldIndexFound[oldEndIndex]) {
      oldEndNode = oldArr[--oldEndIndex]
    } else if (compare(oldStartNode, newStartNode)) {
      patches.push({
        node: oldStartNode,
        type: 'move',
        oldIndex: oldStartIndex,
        newIndex: newStartIndex
      })
      oldStartNode = oldArr[++oldStartIndex]
      newStartNode = newArr[++newStartIndex]
    } else if (compare(oldEndNode, newEndNode)) {
      patches.push({
        node: oldEndNode,
        type: 'move',
        oldIndex: oldEndIndex,
        newIndex: newEndIndex
      })
      oldEndNode = oldArr[--oldEndIndex]
      newEndNode = newArr[--newEndIndex]
    } else if (compare(oldStartNode, newEndNode)) {
      patches.push({
        node: oldStartNode,
        type: 'move',
        oldIndex: oldStartIndex,
        newIndex: newEndIndex
      })
      oldStartNode = oldArr[++oldStartIndex]
      newEndNode = newArr[--newEndIndex]
    } else if (compare(oldEndNode, newStartNode)) {
      patches.push({
        node: oldEndNode,
        type: 'move',
        oldIndex: oldEndIndex,
        newIndex: newStartIndex
      })
      oldEndNode = oldArr[--oldEndIndex]
      newStartNode = newArr[++newStartIndex]

    } else {
      let oldIndex = findIndex(
        oldArr,
        newStartNode,
        oldStartIndex,
        oldEndIndex
      )

      if (oldIndex == null) {
        patches.push({
          type: 'add',
          newIndex: newStartIndex,
          node: newStartNode
        })
      } else {
        patches.push({
          node: oldArr[oldIndex],
          type: 'move',
          oldIndex: oldIndex,
          newIndex: newStartIndex
        })
        oldIndexFound[oldIndex] = true
      }
      newStartNode = newArr[++newStartIndex]
    }
  }
  if (oldStartIndex > oldEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      patches.push({
        type: 'add',
        newIndex: i,
        node: newArr[i]
      })
    }
  } else if (newStartIndex > newEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      patches.push({
        type: 'remove',
        oldIndex: i,
        node: oldArr[i]
      })
    }
  }
  return patches
}

