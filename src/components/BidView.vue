<template>
  <div>
    
    <LineItemDetails ref="itemDetails" />

    <div class="md-layout">
      <div class="md-layout-item">

        <div class="md-layout md-gutter">

          <div class="md-layout-item">
            <h1 class="md-title">{{ tenderName }}</h1>
            <p class="md-caption" style="height: 4vh;">{{ tenderDescription }}</p>
            <md-button @click="toggleAll">Toggle All</md-button>
          </div>

          <div class="md-layout-item">
            <p class="md-caption" style="height: 4vh;">{{ bidDescription }}</p>
          </div>

        </div>

      </div>
      <div class="md-layout-item md-size-15">
        <TenderSettings
          :priceRevealType="priceRevealType"
          :mustBidOnAll="mustBidOnAll"
        />
      </div>
    </div>


    <md-card v-for="slotData of slots" :key="slotData.index">
      <md-card-header>

        <md-button class="md-icon-button" @click="showDetails(slotData.tenderLineItem)">
          <md-icon>info</md-icon>
        </md-button>

        <md-card-expand-trigger :ref="'tglBtn-' + slotData.index">
          <md-button class="md-icon-button">
            <md-icon>keyboard_arrow_down</md-icon>
          </md-button>
        </md-card-expand-trigger>
        
        {{ slotData.index }}.
        <span class="md-title">{{ slotData.tenderLineItem.name }}</span>
        &nbsp;&nbsp;
        <span class="md-subhead">{{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }}</span>
        
      </md-card-header>

      <md-card-expand>

        <md-card-expand-content>
          <md-card-content>
            
            <div class="md-layout md-gutter">

              <div class="md-layout-item">

                <p class="md-title">
                  {{ slotData.bidLineItem.name }}
                </p>
                <p>Specifications</p>
                <p class="md-body-1">
                  {{ slotData.bidLineItem.specifications }}
                </p>
                
              </div>

              <div class="md-layout-item">

                <p>Quote</p>
                <p class="md-display-1">
                  {{ slotData.bidLineItem.rate }}
                </p>

              </div>

              <div class="md-layout-item">
                <p>Total</p>
                <p class="md-display-2">{{ slotData.bidLineItem.rate * slotData.tenderLineItem.quantity }}</p>
              </div>

            </div>

          </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>


    <md-card-actions>
      <md-button @click="refresh">Refresh</md-button>
    </md-card-actions>

  </div>
</template>

<script>
import TenderSettings from '@/components/TenderSettings.vue';
import LineItemDetails from '@/components/LineItemDetails.vue';

export default {
  components: {
    TenderSettings,
    LineItemDetails
  },
  props: ['bidId'],
  data () {
    return {
      tenderName: null,
      tenderDescription: null,
      priceRevealType: null,
      mustBidOnAll: false,
      slots: [],
      tenderCreatedBy: null,

      bidDescription: "",
      bidCreatedBy: null,
      
      showDetailsDialog: false,
      detailsItem: {},
      sampleImgURLS: []
    };
  },
  async mounted() {

    this.refresh();

  },
  methods: {
    async refresh() {
      let bId = this.bidId;
      let postData = {
        bId: bId,
      };
      // console.log(postData);
      let res = await this.$api.post('/api/get-bid', postData);
      let bData = res.data;
      console.log(bData);

      this.tenderName = bData.tender.name;
      this.tenderDescription = bData.tender.description;
      this.priceRevealType = bData.tender.priceRevealType;
      this.mustBidOnAll = bData.tender.mustBidOnAll;
      this.tenderCreatedBy = bData.tender.createdBy;

      this.bidDescription = bData.description;
      this.bidCreatedBy = bData.createdBy;

      this.slots = bData.slots.map((s, idx) => {
        let slotData = {};
        slotData.index = idx + 1;
        let tis = s.tenderSlot.tenderLineItems;
        let bis = s.bidLineItems;
        slotData.tenderLineItem = tis[tis.length - 1];
        slotData.bidLineItem = bis[bis.length - 1];
        slotData.tenderLineItem.total = slotData.tenderLineItem.quantity * slotData.bidLineItem.rate;
        return slotData;
      });
    },
    toggleAll() {
      let rs = this.$refs;
      Object.keys(rs).filter(k => k.startsWith('tglBtn-')).forEach(k => {
        rs[k][0].$el.click();
      })
    },
    showDetails(item) {
      this.$refs.itemDetails.showDetails(item, this.tenderCreatedBy);
    }
  }
}
</script>

<style scoped>
</style>