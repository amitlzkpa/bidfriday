<template>
  <div>

    <div class="md-layout">
      <div class="md-layout-item">
        <h1 class="md-title">{{ name }}</h1>
        <p class="md-caption" style="height: 4vh;">{{ description }}</p>
      </div>
      <div class="md-layout-item md-size-15">
        <p v-if="priceRevealType === 'concealed'">
          <md-icon>visibility_off</md-icon>
          <md-tooltip md-delay="300">Concealed: No information from other bids shown.</md-tooltip>
          Bids Reveal
        </p>
        <p v-if="priceRevealType === 'lowest'">
          <md-icon>gavel</md-icon>
          <md-tooltip md-delay="300">Lowest: Information from the lowest bids shown.</md-tooltip>
          Bids Reveal
        </p>
        <p v-if="priceRevealType === 'public'">
          <md-icon>visibility</md-icon>
          <md-tooltip md-delay="300">Public: Information from all bids shown.</md-tooltip>
          Bids Reveal
        </p>
        
        <p v-if="mustBidOnAll">
          <md-icon>check_circle</md-icon>
          <md-tooltip md-delay="300">Must bid for all items on tender.</md-tooltip>
          Complete Bids
        </p>
        <p v-else>
          <md-icon>remove_circle_outline</md-icon>
          <md-tooltip md-delay="300">Choice to submit partial bids.</md-tooltip>
          Partial Bids
        </p>
      </div>
    </div>

    <md-list>
      <md-list-item  v-for="tenderItem of tenderItems" :key="tenderItem._id">
        {{ tenderItem.name }}
      </md-list-item>
    </md-list>

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
      slots: [],
      tenderItems: []
    };
  },
  async mounted() {

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
      this.tenderItems = this.slots.map((s, idx) => {
        let ti = s.tenderLineItems[s.tenderLineItems.length - 1];
        let ret = ti;
        ret.index = idx + 1;
        ret.total = ti.quantity * ti.rate;
        ret.slot = s;
        return ret;
      });
    }
  }
}
</script>

<style>

</style>