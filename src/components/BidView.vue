<template>
  <div>
    
    <LineItemDetails ref="itemDetails" />

    <div class="md-layout" style="padding: 8px;">

      <div class="md-layout-item md-large-size-20 md-xsmall-size-0">
      </div>

      <div class="md-layout-item md-large-size-60 md-xsmall-size-100">
        <h1 class="md-title">{{ tenderName }}</h1>
        <p class="md-caption">Last updated: &nbsp; {{ bidLastUpdatedAt | moment("calendar") }}</p>
        <p class="md-caption" v-if="bidCreatedBy">Submitted by: &nbsp; {{ bidCreatedBy.name }}</p>
        <p class="md-caption" style="min-height: 4vh;">{{ bidDescription }}</p>
      </div>

      <div class="md-layout-item md-large-size-20 md-xsmall-size-0">
      </div>

    </div>


    <md-card style="padding: 8px;">
      <div class="md-layout" style="padding: 10px 0px 10px 0px;">

        <div class="md-layout-item md-large-size-25 md-xsmall-size-30" style="text-align: center;">
          <span style="cursor: pointer;" @click="toggleAll">Open All</span>
        </div>
        
        <div class="md-layout-item md-large-size-30 md-xsmall-size-70">
          <span class="md-subtitle">Item</span>
        </div>
        
        <div class="md-layout-item md-large-size-10 md-xsmall-size-20" style="text-align: center;">
          <span class="md-subtitle">Quantity</span>
        </div>
        
        <div class="md-layout-item md-large-size-10 md-xsmall-size-20" style="text-align: center;">
          <span class="md-subtitle">Reference</span>
        </div>
        
        <div class="md-layout-item md-large-size-10 md-xsmall-size-30" style="text-align: right;">
          <span class="md-subtitle">Quote</span>
        </div>
        
        <div class="md-layout-item md-large-size-15 md-xsmall-size-30" style="text-align: right;">
          <span class="md-subtitle">Total</span>
        </div>

      </div>
    </md-card>

    <md-card v-for="slotData of slots" :key="slotData.index">
      <md-card-header>
        
        <div class="md-layout">

          <div class="md-layout-item md-large-size-25 md-xsmall-size-30" style="text-align: right;">

            <md-button class="md-icon-button" v-if="slotData.updateState !== 'unchanged'">
              
              <span v-if="slotData.updateState === 'updated'">
                <md-icon style="color: lightsalmon;">published_with_changes</md-icon>
                <md-tooltip md-direction="right">The item has changed since the bid was submitted.</md-tooltip>
              </span>
              
              <span v-if="slotData.updateState === 'new'">
                <md-icon style="color: lightgreen;">published_with_changes</md-icon>
                <md-tooltip md-direction="right">The item was added new after the bid was submitted.</md-tooltip>
              </span>

              <span v-if="slotData.updateState === 'removed'">
                <md-icon style="color: lightcoral;">published_with_changes</md-icon>
                <md-tooltip md-direction="right">The item has been removed since the bid was submitted.</md-tooltip>
              </span>

            </md-button>
            
            <md-button class="md-icon-button" @click="showDetails(slotData.tenderLineItem)">
              <md-icon>info</md-icon>
            </md-button>

            <md-card-expand-trigger :ref="'tglBtn-' + slotData.index">
              <md-button class="md-icon-button">
                <md-icon>keyboard_arrow_down</md-icon>
              </md-button>
            </md-card-expand-trigger>
          </div>

          <div class="md-layout-item md-large-size-30 md-xsmall-size-70">
            {{ slotData.index }}.
            <span :style="slotData.updateState !== 'removed' ? 'color: #000000' : 'color: #BBBBBB'"
                  :class="(slotData.tenderLineItem.name !== slotData.latestTenderItem.name) ? 'highlightUpdatedField' : '' "
                  class="md-headline"
            >
              {{ slotData.tenderLineItem.name }}
              <md-tooltip v-if="slotData.tenderLineItem.name !== slotData.latestTenderItem.name">
                Updated from {{ slotData.tenderLineItem.name }} to {{ slotData.latestTenderItem.name }}.
              </md-tooltip>
            </span>
          </div>

          <div class="md-layout-item md-large-size-10 md-xsmall-size-20" style="padding-top: 6px; text-align: center;">
            <span class="md-subhead" :class="(slotData.tenderLineItem.quantity !== slotData.latestTenderItem.quantity)
                                          || (slotData.tenderLineItem.units !== slotData.latestTenderItem.units) ? 'highlightUpdatedField' : '' "
            >
              {{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }}
              <md-tooltip v-if="(slotData.tenderLineItem.quantity !== slotData.latestTenderItem.quantity)
                             || (slotData.tenderLineItem.units !== slotData.latestTenderItem.units)">
                Updated from {{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }} to {{ slotData.latestTenderItem.quantity }} {{ slotData.latestTenderItem.units }}.
              </md-tooltip>
            </span>
          </div>

          <div class="md-layout-item md-large-size-10 md-xsmall-size-20" style="padding-top: 6px; text-align: center;">
            <span class="md-subhead">
              <span :class="(slotData.tenderLineItem.rate !== slotData.latestTenderItem.rate) ? 'highlightUpdatedField' : '' ">
                {{ slotData.tenderLineItem.rate | currency }}
                <md-tooltip v-if="slotData.tenderLineItem.rate !== slotData.latestTenderItem.rate">
                  Updated from {{ slotData.tenderLineItem.rate | currency }} to {{ slotData.latestTenderItem.rate | currency }}.
                </md-tooltip>
              </span>
            </span>
          </div>

          <div class="md-layout-item md-large-size-10 md-xsmall-size-30" style="text-align: right;">
            <span class="md-body-2" :style="(slotData.updateState !== 'removed') ? 'color: #000000;' : 'color: #BBBBBB;'">
              {{ slotData.bidLineItem.rate | currency }}
            </span>
          </div>

          <div class="md-layout-item md-large-size-15 md-xsmall-size-30" style="text-align: right;">
            <span class="md-body-2" :style="(slotData.updateState !== 'removed') ? 'color: #000000;' : 'color: #BBBBBB;'">
              {{ (slotData.bidLineItem.rate * slotData.tenderLineItem.quantity) | currency }}
            </span>
          </div>
        </div>
        
      </md-card-header>

      <md-card-expand>

        <md-card-expand-content>
          <md-card-content>
            
            <div class="md-layout md-gutter" style="margin-bottom: 8px;">

              <div class="md-layout-item">
                <p class="md-subheading">
                  {{ slotData.bidLineItem.name }}
                </p>
              </div>

            </div>
            
            
            <div class="md-layout md-gutter">

              <div class="md-layout-item">
                <p class="md-subhead">Specifications</p>
                <p class="md-body-1">
                  {{ slotData.bidLineItem.specifications }}
                </p>
              </div>

              <div class="md-layout-item">
                <p class="md-subhead">Description</p>
                <p class="md-body-1">
                  {{ slotData.bidLineItem.description }}
                </p>
              </div>

            </div>

          </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>

    <md-card style="padding: 8px;">
      <div class="md-layout" style="padding: 10px 0px 10px 0px;">

        <div class="md-layout-item md-size-70">
        </div>
        
        <div class="md-layout-item md-size-30" style="text-align: right;">
          <span class="md-subtitle">Total:</span>
          &nbsp;&nbsp;
          <span class="md-title">{{ bidTotal | currency }}</span>
        </div>

      </div>
    </md-card>

    <md-card-actions>
      <span class="md-caption" v-if="tenderHasUpdates">
        Shows details as it was when the bid was submitted.
      </span>
      <md-button :to="`/tender-view/${tenderId}`">View Tender</md-button>
      <md-button v-if="$auth.bfUser && bidCreatedBy && $auth.bfUser.email === bidCreatedBy.email" :to="`/bid-edit/${tenderId}/${bidId}`" class="md-primary">Update Bid</md-button>
    </md-card-actions>

  </div>
</template>

<script>
import LineItemDetails from '@/components/LineItemDetails.vue';

export default {
  components: {
    LineItemDetails
  },
  props: ['bidId'],
  data () {
    return {
      tenderId: null,
      tenderName: null,
      tenderDescription: null,
      priceRevealType: null,
      mustBidOnAll: false,
      slots: [],
      tenderCreatedBy: null,
      tenderLastUpdatedAt: null,

      bidDescription: "",
      bidCreatedBy: null,
      bidTotal: 0,
      bidLastUpdatedAt: null,
      tenderHasUpdates: false,
      
      showDetailsDialog: false,
      detailsItem: {},
      sampleImgURLS: []
    };
  },
  async mounted() {

    this.refresh();

  },
  methods: {
    async refresh(bId) {
      this.bidId = (bId) ? bId : this.bidId;
      this.updateState = 'unchanged';
      let postData = { bidId: this.bidId };
      let res = await this.$api.post('/api/get-bid', postData);
      let bData = res.data;
      let tData = bData.tender;

      if (!bData._id || !tData._id) return;

      this.tenderId = tData._id;
      this.tenderName = tData.name;
      this.tenderDescription = tData.description;
      this.priceRevealType = tData.priceRevealType;
      this.mustBidOnAll = tData.mustBidOnAll;
      this.tenderCreatedBy = tData.createdBy;
      this.tenderLastUpdatedAt = tData.updatedAt;

      this.bidDescription = bData.description;
      this.bidCreatedBy = bData.createdBy;
      this.bidLastUpdatedAt = bData.updatedAt;

      let newSlots = tData.slots.map(s => s);
      this.slots = bData.slots.map((s, idx) => {
        newSlots = newSlots.filter(ns => ns._id !== s.tenderSlot._id);
        let slotData = {};
        slotData.index = idx + 1;
        let tis = s.tenderSlot.tenderLineItems;
        let bis = s.bidLineItems;
        slotData.latestTenderItem = (tis.length > 0) ? tis[tis.length - 1] : {};
        slotData.bidLineItem = bis[bis.length - 1];
        slotData.tenderLineItem = tis.filter(t => t._id === slotData.bidLineItem.tenderLineItem)[0];
        slotData.updateState = (s.tenderSlot.status === "inactive") ? 'removed'
                              : (slotData.tenderLineItem._id === slotData.latestTenderItem._id) ? 'unchanged' : 'updated';
        if (slotData.updateState !== 'unchanged') this.tenderHasUpdates = true;
        slotData.tenderLineItem.total = slotData.tenderLineItem.quantity * slotData.bidLineItem.rate;
        return slotData;
      });
      let runningIdx = this.slots.length;
      newSlots.forEach((ns, idx) => {
        let slotData = {};
        slotData.index = idx + runningIdx + 1;
        let tis = ns.tenderLineItems;
        slotData.tenderLineItem = tis[tis.length - 1];
        slotData.latestTenderItem = (tis.length > 0) ? tis[tis.length - 1] : {};
        let bidLineItem = {
          name: null,
          specifications: null,
          description: null,
          rate: 0
        };
        slotData.bidLineItem = bidLineItem;
        slotData.updateState = 'new';
        this.slots.push(slotData);
      });
      this.updateBidTotal();
    },
    toggleAll() {
      let rs = this.$refs;
      Object.keys(rs).filter(k => k.startsWith('tglBtn-')).forEach(k => {
        rs[k][0].$el.click();
      })
    },
    showDetails(item) {
      this.$refs.itemDetails.showDetails(item, this.tenderCreatedBy);
    },
    updateBidTotal() {
      this.bidTotal = 0;
      this.slots.forEach(slotData => {
        if (!slotData.deselected && slotData.updateState !== 'removed') this.bidTotal += slotData.tenderLineItem.quantity * slotData.bidLineItem.rate;
      });
    }
  }
}
</script>

<style scoped>
.highlightUpdatedField {
  background-color: #CCCCFF;
  padding: 2px 6px 2px 6px;
  border-radius: 4px;
}
</style>