import { STORY_PREFIX } from './constants'
const storage = window.sessionStorage

function get (key) {
  const prefixKey = STORY_PREFIX + key
  let localValue = {}
  try {
    localValue = storage.getItem(prefixKey)
    return JSON.parse(localValue)
  } catch (e) {
    return localValue
  }
}

function set (key, value) {
  const prefixKey = STORY_PREFIX + key
  let localValue
  try {
    localValue = JSON.stringify(value)
    storage.setItem(prefixKey, localValue)
  } catch (e) {
    localValue = value
  }
}

function remove (key) {
  const prefixKey = STORY_PREFIX + key
  storage.removeItem(prefixKey)
}

export default {
  get,
  set,
  remove
}
