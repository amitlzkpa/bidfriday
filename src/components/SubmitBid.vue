<template>
  <div>

    <div class="md-layout">
      <div class="md-layout-item">
        <h1 class="md-title">{{ name }}</h1>
        <p class="md-caption" style="height: 4vh;">{{ description }}</p>
        <md-button @click="toggleAll">Toggle All</md-button>
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


    <md-card v-for="slotData of slots" :key="slotData.index">
      <md-card-header>
        
        <md-card-expand-trigger :ref="'tglBtn-' + slotData.index">
          <md-button class="md-icon-button">
            <md-icon>keyboard_arrow_down</md-icon>
          </md-button>
        </md-card-expand-trigger>
        
        {{ slotData.index }}.
        <span class="md-title">{{ slotData.tenderLineItem.name }}</span>
        &nbsp;&nbsp;
        <span class="md-subhead">{{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }} @ {{ slotData.tenderLineItem.rate }}</span>
        
      </md-card-header>

      <md-card-expand>

        <md-card-expand-content>
          <md-card-content>
            
            <div class="md-layout md-gutter">

              <div class="md-layout-item">

                <md-field>
                  <label>Name</label>
                  <md-input v-model="slotData.bid.name"></md-input>
                </md-field>
                <md-field>
                  <label>Specifications</label>
                  <md-textarea v-model="slotData.bid.specifications" md-autogrow></md-textarea>
                </md-field>
                
              </div>

              <div class="md-layout-item">

                <md-field>
                  <label>Rate</label>
                  <md-input v-model="slotData.bid.rate" type="number"></md-input>
                </md-field>
                <md-field>
                  <label>Description</label>
                  <md-textarea v-model="slotData.bid.description" md-autogrow></md-textarea>
                </md-field>

              </div>

              <div class="md-layout-item">
                <p>Total</p>
                <p class="md-display-2">{{ slotData.bid.rate * slotData.tenderLineItem.quantity }}</p>
              </div>

            </div>

          </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>


    <md-card-actions>
      <md-button @click="refresh">Refresh</md-button>
      <md-button :to="'/submit-bid/' + tenderId" class="md-primary">Submit</md-button>
    </md-card-actions>

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
      this.slots = tData.data.slots.map((s, idx) => {
        let slotData = {};
        slotData.slot = s;
        let ti = s.tenderLineItems[s.tenderLineItems.length - 1];
        ti.total = ti.quantity * ti.rate;
        ti.slot = s;
        slotData.tenderLineItem = ti;
        slotData.index = idx + 1;
        slotData.bidLineItem = {};
        slotData.isOpen = false;
        slotData.bid = {
          name: "",
          rate: "",
          specifications: "",
          description: ""
        };
        return slotData;
      });
    },
    toggleAll() {
      let rs = this.$refs;
      Object.keys(rs).filter(k => k.startsWith('tglBtn-')).forEach(k => {
        rs[k][0].$el.click();
      })
    }
  }
}
</script>

<style>

</style>