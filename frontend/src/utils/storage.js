//localstorage management utility
export const storage = {
  //retrieve item from localstorage
  //catch empty
  get(key) {
    try {
      const getStorage = localStorage.getItem(key)
      return getStorage ? JSON.parse(getStorage) : null
    } catch { return null }
  },
   //save item to localstorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  },
  //remove item from localstorage
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch {} 
  },
  //clear all localstorage
  clear() {
    try {
      localStorage.clear()
    } catch {}
  }
}