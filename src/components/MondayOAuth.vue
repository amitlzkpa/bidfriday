<template>
  <div>
    <div class="md-layout md-gutter">
      <div class="md-layout-item">
        Successfully connected!
        <br />
        You can close this tab now.
      </div>
    </div>

  </div>
</template>

<script>

export default {
  data() {
    return {
    }
  },
  async mounted() {
    let code = this.$route.query.code;
    if (code) {
      let resp = await this.$api.post('/api/connect-monday-user', { code: code });
      this.$auth.bfUser = resp.data.user;
      this.$auth.bftoken = resp.data.bftoken;
      this.$api.defaults.headers.common["email"] = this.$auth.bfUser.email;
      this.$api.defaults.headers.common["bftoken"] = this.$auth.bftoken;
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
