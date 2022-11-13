// Pinia store
import { createPinia } from 'pinia'
import { PiniaFirestore } from './pinia-firestore'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(PiniaFirestore)
pinia.use(piniaPluginPersistedstate)

export default pinia