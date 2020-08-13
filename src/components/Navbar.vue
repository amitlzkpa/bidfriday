<template>
  <div>
    <h1>BidFriday</h1>
    <a target="_blank" :href="'https://auth.monday.com/oauth2/authorize?client_id=74f5d4a266dec72194a44f947d25ce70&redirect_uri=' + redirect_uri + '/monday/connect'">Link</a>
    <hr />
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
