<template>
  <default-list
    :items="userList"
    class="mb-n2"
  />
</template>

<script>
  import { get, sync } from 'vuex-pathify'
  export default {
    name: 'UserList',

    components: {
      DefaultList: () => import(
        /* webpackChunkName: "default-list" */
        '../List'
      ),
    },

    data: () => ({
    }),

    computed: {
      userList () {
        if (this.user_auth != null) {
          return [{
            title: this.shareName || this.user_auth.displayName,
            avatar: this.user_auth.photoURL,
            items: [
              {
                title: 'Profile',
                disabled: true,
                icon: 'mdi-account-box-outline',
              },
              {
                title: 'Log Out',
                method: this.logout,
                icon: 'mdi-lock-outline',
              },
            ],
          }]
        } else {
          return [{
            title: 'Log In',
            icon: 'mdi-fingerprint',
            to: '/login/',
          }]
        }
      },

      user_auth: {
        get () {
          return this.$store.get('app/user_auth')
        },
      },

      shareName: {
        get () {
          return this.$store.get('progress/shareName')
        },
      },
    },

    methods: {
      logout () {
        this.$firebase.auth().signOut().then(() => {
          // Sign-out successful.
        }).catch((error) => {
          // An error happened.
        })
      },
    },
  }
</script>
