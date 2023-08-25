import piniaPluginpersistedstate from 'pinia-plugin-persist'
import { createPinia } from 'pinia'
const store = createPinia()

// 把数据存到sessionStorage
store.use(piniaPluginpersistedstate, {
  storage: sessionStorage,
  key: 'pinia-state',
})

export default store