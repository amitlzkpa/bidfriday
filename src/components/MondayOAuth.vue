<template>
  <div>
    Successfully connected!
    <br />
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
      let r = await this.$api.post('/api/connect-monday-user', { code: code });
      console.log(r);
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
