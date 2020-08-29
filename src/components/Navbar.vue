<template>
  <div v-if="!isInMonday">
    <md-toolbar md-elevation="0">
      <span style="flex: 1">
        <a href="/" style="text-decoration: none !important;">
          <img :src="require('@/assets/static/images/icon_64x64.png')" style="margin-right: 0px; margin-left: auto; width: 27px; height: 27px;" />
          <span class="md-title">BidFriday</span>
        </a>
      </span>

      <span v-if="!$auth.loading">
        
        <md-button v-if="!$auth.isAuthenticated" @click="login">LOG IN</md-button>
        <span v-else>
          <md-menu md-size="medium" md-align-trigger>
            <md-button md-menu-trigger>{{ $auth.bfUser.email }}</md-button>

            <md-menu-content>
              <md-menu-item><router-link to="/my-profile">MY PROFILE</router-link></md-menu-item>
              <md-menu-item><router-link to="/my-bids">MY BIDS</router-link></md-menu-item>
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
