<template>
  <div>
    
    <LineItemDetails ref="itemDetails" />

    <div class="md-layout" style="padding: 8px;">
      <div class="md-layout-item">

        <div class="md-layout">

          <div class="md-layout-item">
            <h1 class="md-title">{{ tenderName }}</h1>
            <span class="md-caption">Last updated: &nbsp; {{ tenderLastUpdatedAt | moment("calendar") }}</span>
            <p class="md-caption" style="min-height: 4vh;">{{ tenderDescription }}</p>
          </div>

          <div class="md-layout-item">
            <span class="md-caption">Last updated: &nbsp; {{ bidLastUpdatedAt | moment("calendar") }}</span>
            <p class="md-caption" style="min-height: 4vh;">{{ bidDescription }}</p>
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


    <md-card style="padding: 8px;">
      <div class="md-layout" style="padding: 10px 0px 10px 0px;">

        <div class="md-layout-item md-size-15" style="text-align: center;">
          <span style="cursor: pointer;" @click="toggleAll">Open All</span>
        </div>
        
        <div class="md-layout-item md-size-35">
          <span class="md-subtitle">Item</span>
        </div>
        
        <div class="md-layout-item md-size-10" style="text-align: center;">
          <span class="md-subtitle">Quantity</span>
        </div>
        
        <div class="md-layout-item md-size-10" style="text-align: center;">
          <span class="md-subtitle">Reference</span>
        </div>
        
        <div class="md-layout-item md-size-15" style="text-align: right;">
          <span class="md-subtitle">Quote</span>
        </div>
        
        <div class="md-layout-item md-size-15" style="text-align: right;">
          <span class="md-subtitle">Total</span>
        </div>

      </div>
    </md-card>

    <md-card v-for="slotData of slots" :key="slotData.index">
      <md-card-header>
        
        <div class="md-layout">

          <div class="md-layout-item md-size-15" style="text-align: right;">

            <md-button class="md-icon-button" v-if="slotData.isStale">
              <md-icon>new_releases</md-icon>
              <md-tooltip md-direction="right">The item has changed since the bid was submitted.</md-tooltip>
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

          <div class="md-layout-item md-size-35">
            {{ slotData.index }}.
            <span class="md-headline" :class="(slotData.tenderLineItem.name !== slotData.latestTenderItem.name) ? 'isStale' : '' ">
              {{ slotData.tenderLineItem.name }}
              <md-tooltip v-if="slotData.isStale">Updated from {{ slotData.tenderLineItem.name }} to {{ slotData.latestTenderItem.name }}.</md-tooltip>
            </span>
          </div>

          <div class="md-layout-item md-size-10" style="padding-top: 6px; text-align: center;">
            <span class="md-subhead" :class="(slotData.tenderLineItem.quantity !== slotData.latestTenderItem.quantity)
                                          || (slotData.tenderLineItem.units !== slotData.latestTenderItem.units) ? 'isStale' : '' ">
              {{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }}
              <md-tooltip v-if="slotData.isStale">Updated from {{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }} to {{ slotData.latestTenderItem.quantity }} {{ slotData.latestTenderItem.units }}.</md-tooltip>
            </span>
          </div>

          <div class="md-layout-item md-size-10" style="padding-top: 6px; text-align: center;">
            <span class="md-subhead">
              <span :class="(slotData.tenderLineItem.rate !== slotData.latestTenderItem.rate) ? 'isStale' : '' ">
                {{ slotData.tenderLineItem.rate | currency }}
                <md-tooltip v-if="slotData.isStale">Updated from {{ slotData.tenderLineItem.rate | currency }} to {{ slotData.latestTenderItem.rate | currency }}.</md-tooltip>
              </span>
            </span>
          </div>

          <div class="md-layout-item md-size-15" style="text-align: right;">
            <span class="md-body-2">{{ slotData.bidLineItem.rate | currency }}</span>
          </div>

          <div class="md-layout-item md-size-15" style="text-align: right;">
            <span class="md-body-1">
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
      tenderLastUpdatedAt: null,
      priceRevealType: null,
      mustBidOnAll: false,
      slots: [],
      tenderCreatedBy: null,

      bidDescription: "",
      bidCreatedBy: null,
      bidTotal: 0,
      bidLastUpdatedAt: null,
      
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
      this.tenderLastUpdatedAt = bData.tender.updatedAt;
      this.priceRevealType = bData.tender.priceRevealType;
      this.mustBidOnAll = bData.tender.mustBidOnAll;
      this.tenderCreatedBy = bData.tender.createdBy;

      this.bidDescription = bData.description;
      this.bidCreatedBy = bData.createdBy;
      this.bidLastUpdatedAt = bData.updatedAt;

      this.slots = bData.slots.map((s, idx) => {
        let slotData = {};
        slotData.index = idx + 1;
        let tis = s.tenderSlot.tenderLineItems;
        let bis = s.bidLineItems;
        slotData.latestTenderItem = tis[tis.length - 1];
        slotData.bidLineItem = bis[bis.length - 1];
        slotData.tenderLineItem = tis.filter(t => t._id === slotData.bidLineItem.tenderLineItem)[0];
        slotData.isStale = slotData.tenderLineItem._id !== slotData.latestTenderItem._id;
        slotData.tenderLineItem.total = slotData.tenderLineItem.quantity * slotData.bidLineItem.rate;
        this.bidTotal += slotData.tenderLineItem.total;
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
.isStale {
  background-color: lightsalmon;
  padding: 2px 6px 2px 6px;
  border-radius: 4px;
}
</style>