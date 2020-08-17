<template>
  <div>

    <h1>TenderView</h1>

    <button @click="refresh">Refresh</button>

    <h2>{{ name }}</h2>
    <p>{{ description }}</p>
    <p>{{ priceRevealType }}</p>
    <p>{{ mustBidOnAll }}</p>

    <hr />

    <p v-for="slot in slots" :key="slot._id">
      {{ slot.tenderLineItems[slot.tenderLineItems.length - 1].name }}
    </p>

  </div>
</template>

<script>

export default {
  props: ['tenderId'],
  data () {
    return {
      name: null,
      description: null,
      priceRevealType: null,
      mustBidOnAll: false,
      slots: []
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
      this.name = tData.data.name;
      this.description = tData.data.description;
      this.priceRevealType = tData.data.priceRevealType;
      this.mustBidOnAll = tData.data.mustBidOnAll;
      this.slots = tData.data.slots;
    }
  }
}
</script>

<style scoped>
</style>
