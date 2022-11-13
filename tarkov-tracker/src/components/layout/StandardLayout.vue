<template>
    <!-- Navigation Drawer -->
    <nav-drawer />

    <!-- Application Bar-->
    <app-bar />
    <div id="tracker-page-background">
      <div id="tracker-page-background-blur">
        <!-- Main View -->
        <v-main class="ma-3 fill-height">
          <router-view />
        </v-main>
        <app-footer />
      </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const backgroundImage = computed(() => {
  if (route.meta.background) {
    return `url(/img/background/${route.meta.background}.webp)`
  }else{
    return ''
  }
})

const NavDrawer = defineAsyncComponent(() =>
  import("@/components/layout/NavDrawer.vue")
)
const AppFooter = defineAsyncComponent(() =>
  import("@/components/layout/AppFooter.vue")
)
const AppBar = defineAsyncComponent(() =>
  import("@/components/layout/AppBar.vue")
)
</script>
<style lang="scss" scoped>
#tracker-page-background {
  background-image: v-bind(backgroundImage);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 100%;
}

#tracker-page-background-blur {
  background: rgba(255, 255, 255, 0.01); // Make sure this color has an opacity of less than 1
  backdrop-filter: blur(5px) brightness(30%);
  height: 100vh;
  width: 100%;
  position:fixed;
  top: 0;
  left: 0;
}
</style>