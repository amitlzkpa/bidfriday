<template>
  <div>

    <h1>TenderView</h1>

  </div>
</template>

<script>

export default {
  props: ['tenderId'],
  data () {
    return {
    };
  },
  async mounted () {

    console.log(this.tenderId);

    this.refresh();

  },
  methods: {
    async refresh() {
    }
  }
}
</script>

<style scoped>
</style>
