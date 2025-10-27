//user authentication token storage
import { storage } from "./storage";

const KEY = 'token';

export const authStore = {
  //retrieve stored token
  get() {
    return storage.get(KEY)
  },
   //save or update token
  set(token) {
    return storage.set(KEY, token)
  },
  //remove token
  clear() {
    return storage.remove(KEY)
  }
}
