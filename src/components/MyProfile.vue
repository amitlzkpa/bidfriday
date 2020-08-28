<template>
  <div>

    <div class="md-layout">
      <div class="md-layout-item" style="padding: 12px;">

        <p>Email: {{ $auth.bfUser.email }}</p>
        <p>Name: {{ $auth.bfUser.name }}</p>

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
  }
}
</script>

<style scoped>

</style>