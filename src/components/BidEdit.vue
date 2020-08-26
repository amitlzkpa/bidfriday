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
            <md-field>
              <label>Description</label>
              <md-textarea v-model="bidDescription" md-autogrow></md-textarea>
            </md-field>
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
        <span class="md-subhead">{{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }} @ {{ slotData.tenderLineItem.rate }}</span>
        
      </md-card-header>

      <md-card-expand>

        <md-card-expand-content>
          <md-card-content>
            
            <div class="md-layout md-gutter">

              <div class="md-layout-item">

                <md-field>
                  <label>Name</label>
                  <md-input v-model="slotData.bidLineItem.name"></md-input>
                </md-field>
                <md-field>
                  <label>Specifications</label>
                  <md-textarea v-model="slotData.bidLineItem.specifications" md-autogrow></md-textarea>
                </md-field>
                
              </div>

              <div class="md-layout-item">

                <md-field>
                  <label>Rate</label>
                  <md-input v-model="slotData.bidLineItem.rate" type="number"></md-input>
                </md-field>
                <md-field>
                  <label>Description</label>
                  <md-textarea v-model="slotData.bidLineItem.description" md-autogrow></md-textarea>
                </md-field>

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
      <md-button @click="submitBid" class="md-primary">Submit</md-button>
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
  props: ['tenderId', 'bidId'],
  data () {
    return {
      bId: null,
      bidDescription: null,
      bidCreatedBy: null,

      tenderName: null,
      tenderDescription: null,
      priceRevealType: null,
      mustBidOnAll: false,
      slots: [],
      tenderCreatedBy: null,
      
      showDetailsDialog: false,
      detailsItem: {},
      sampleImgURLS: []
    };
  },
  created() {
    if (this.bidId) {
      this.bId = this.bidId;
    }
  },
  async mounted() {

    this.refresh();

  },
  methods: {
    async refresh() {
      let postData;
      let res;
      let bData;
      let tData;
      
      let isNewBid = !(this.bidId);
      if (isNewBid) {
        postData = { tId: this.tenderId };
        res = await this.$api.post('/api/get-tender', postData);
        tData = res.data;
      } else {
        postData = { bId: this.bId };
        res = await this.$api.post('/api/get-bid', postData);
        bData = res.data;
        tData = bData.tender;
      }
      console.log(tData);
      console.log(bData);

      this.tenderName = tData.name;
      this.tenderDescription = tData.description;
      this.priceRevealType = tData.priceRevealType;
      this.mustBidOnAll = tData.mustBidOnAll;
      this.tenderCreatedBy = tData.createdBy;

      this.bidDescription = (isNewBid) ? null : bData.description;
      this.bidCreatedBy = (isNewBid) ? null : bData.createdBy;

      if (isNewBid) {
        this.slots = tData.slots.map((s, idx) => {
          let slotData = {};
          slotData.index = idx + 1;
          let tis = s.tenderLineItems;
          slotData.tenderLineItem = tis[tis.length - 1];
          let bidLineItem = {
            name: null,
            specifications: null,
            description: null,
            rate: 0
          };
          slotData.bidLineItem = bidLineItem;
          return slotData;
        });
      } else {
        this.slots = bData.slots.map((s, idx) => {
          let slotData = {};
          slotData.index = idx + 1;
          let tis = s.tenderSlot.tenderLineItems;
          slotData.tenderLineItem = tis[tis.length - 1];
          let bis = s.bidLineItems;
          slotData.bidLineItem = bis[bis.length - 1];
          slotData.tenderLineItem.total = slotData.tenderLineItem.quantity * slotData.bidLineItem.rate;
          return slotData;
        });
      }
      
    },
    async submitBid() {
      let slotData = this.slots.map(s => {
        let slotBidData = {};
        slotBidData.tenderSlotId = s.tenderLineItem.slot;
        slotBidData.tenderLineItemId = s.tenderLineItem._id;
        slotBidData.name = s.bidLineItem.name;
        slotBidData.rate = parseFloat(s.bidLineItem.rate);
        slotBidData.specifications = s.bidLineItem.specifications;
        slotBidData.description = s.bidLineItem.description;
        return slotBidData;
      });
      let bidData = {
        slotData: slotData,
        bidId: this.bId,
        bidDescription: this.bidDescription,
        tenderId: this.tenderId
      };
      let postData = { bidData: bidData };
      let r = await this.$api.post('/api/create-or-update-bid', postData);
      console.log(r.data);
      this.bId = r.data._id;
      this.refresh();
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