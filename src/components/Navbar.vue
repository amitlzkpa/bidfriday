<template>
  <div>
    <md-toolbar md-elevation="0">
      <span style="flex: 1">
        <a href="https://bidfriday.herokuapp.com" target="_blank">
          <img :src="require('@/assets/static/images/icon_128x128.png')" style="margin-right: 0px; margin-left: auto; width: 48px; height: 48px;" />
        </a>
      </span>

      <span v-if="isInMonday">
        {{ mdUser.email }}
      </span>

      <span v-else>
        <span v-if="!$auth.loading">
          
          <md-button v-if="!$auth.isAuthenticated" @click="login">Log in</md-button>
            
          <md-menu v-if="$auth.isAuthenticated" md-direction="bottom-start" md-align-trigger>
            <md-button md-menu-trigger>{{ $auth.dbUser.username }}</md-button>
            <md-menu-content>
              <md-menu-item target="_blank" :href="'https://auth.monday.com/oauth2/authorize?client_id=74f5d4a266dec72194a44f947d25ce70&redirect_uri=' + redirect_uri + '/monday/connect'">LINK</md-menu-item>
              <md-menu-item @click="logout">LOG OUT</md-menu-item>
            </md-menu-content>
          </md-menu>

        </span>
      </span>

    </md-toolbar>
  </div>
</template>

<script>
export default {
  computed: {
    redirect_uri() {
      // return window.location.origin;
      return "http://localhost:4001"
    }
  },
  methods: {
    login() {
      this.$auth.loginWithRedirect();
    },
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      });
    }
  }
}
</script>

<style scoped>
</style>
