<template>
  <div>
    <md-toolbar>
      <h3 class="md-title" style="flex: 1">BidFriday</h3>
      <md-button target="_blank" :href="'https://auth.monday.com/oauth2/authorize?client_id=74f5d4a266dec72194a44f947d25ce70&redirect_uri=' + redirect_uri + '/monday/connect'" class="md-primary">Link</md-button>
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
  }
}
</script>

<style scoped>
</style>
