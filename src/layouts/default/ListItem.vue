<template>
  <v-list-item
    v-if="item.disabled !== true"
    :href="item.href"
    :rel="item.href ? 'nofollow' : undefined"
    :target="item.href ? '_blank' : undefined"
    :to="item.to"
    active-class="success white--text"
    link
    class="py-1"
    v-bind="$attrs"
    v-on="(item.method !== undefined) ? { click: () => item.method() } : {}"
  >
    <v-list-item-icon
      v-if="!item.icon"
      class="text-caption text-uppercase justify-center align-self-center"
      style="width: 5%;"
    >
      <v-img
        :src="item.image"
        :style="imgStyle"
      />
    </v-list-item-icon>

    <v-list-item-avatar v-if="item.avatar">
      <v-img :src="item.avatar" />
    </v-list-item-avatar>

    <v-list-item-icon
      v-if="item.icon"
      class="my-2 align-self-center"
    >
      <v-icon v-text="item.icon" />
    </v-list-item-icon>

    <v-list-item-content v-if="item.title">
      <v-list-item-title v-text="item.title" />
    </v-list-item-content>
  </v-list-item>
</template>

<script>
  export default {
    name: 'DefaultListItem',

    props: {
      item: {
        type: Object,
        default: () => ({})
      }
    },

    computed: {
      imgStyle () {
        if (this.item.noradius) {
          return ''
        } else {
          return 'border-radius: 50%;'
        }
      },
      title () {
        const matches = this.item.title.match(/\b(\w)/g)

        return matches.join('')
      }
    }
  }
</script>
