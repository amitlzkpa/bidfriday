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

    this.refresh();

  },
  methods: {
    async refresh() {
      let tId = this.tenderId;
      let postData = {
        tId: tId,
      };
      let tData = await this.$api.post('/api/get-tender', postData);
      console.log(tData.data);
    }
  }
}
</script>

<style scoped>
</style>
