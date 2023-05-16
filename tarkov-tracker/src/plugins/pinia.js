// Pinia store
import { createPinia } from "pinia";
import { PiniaFireswap } from "./pinia-firestore";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
const pinia = createPinia();
pinia.use(PiniaFireswap);
pinia.use(piniaPluginPersistedstate);

export default pinia;
