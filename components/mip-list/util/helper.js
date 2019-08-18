/**
 * @file helper.js
 * @author clark-t (clarktanglei@163.com)
 */

export function timeout (time, shouldResolve = false) {
  return new Promise((resolve, reject) => {
    let resolver = shouldResolve ? /* istanbul ignore next */ resolve : reject
    setTimeout(() => resolver(new Error('timeout')), time)
  })
}

export function getRandomId () {
  return '_miplist_' + (Math.random() + '').slice(2) + '_'
}

export function append (arr, newArr) {
  return (Array.isArray(arr) ? arr : []).concat(newArr)
}

export function sameData (oldItem, newItem) {
  return oldItem.data === newItem.data
}

export function sameText (oldItem, newItem) {
  return oldItem.text === newItem.text
}

export function createMap (arr, key, start, end) {
  let map = new Map()

  for (let i = start; i <= end; i++) {
    map.set(arr[i][key], i)
  }

  return map
}

export function createFindIndex (key) {
  let map
  return (arr, node, start, end) => {
    if (!map) {
      map = createMap(arr, key, start, end)
    }
    let index = map.get(node[key])
    if (index != null) {
      map.delete(node[key])
    }
    return index
  }
}
// export function create
