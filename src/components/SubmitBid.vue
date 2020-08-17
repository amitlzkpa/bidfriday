<template>
  <div>

    <div class="md-layout">
      <div class="md-layout-item">
        <h1 class="md-title">{{ name }}</h1>
        <p>{{ description }}</p>
      </div>
      <div class="md-layout-item md-size-10">
        <p>{{ priceRevealType }}</p>
        <p>{{ mustBidOnAll }}</p>
      </div>
    </div>

    <md-table v-model="tenderItems" md-sort="index" md-sort-order="asc" md-card md-fixed-header>
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="No" md-sort-by="index">{{ item.index }}</md-table-cell>
        <md-table-cell md-label="Name" md-sort-by="name">{{ item.name }}</md-table-cell>
        <md-table-cell md-label="Unit" md-sort-by="units">{{ item.units }}</md-table-cell>
        <md-table-cell md-label="Quantity" md-sort-by="quantity">{{ item.quantity }}</md-table-cell>
        <md-table-cell md-label="Rate" md-sort-by="rate">{{ item.rate }}</md-table-cell>
        <md-table-cell md-label="Total" md-sort-by="total">{{ item.total }}</md-table-cell>
      </md-table-row>
    </md-table>


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