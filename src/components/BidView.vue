<template>
  <div>
    
    <md-dialog :md-active.sync="showDetailsDialog">
      <md-dialog-title>{{ detailsItem.name }}</md-dialog-title>

      <md-dialog-content class="dialog-size">

        <div class="md-layout">
          <div class="md-layout-item">
            <p>{{ detailsItem.description }}</p>
          </div>
          
          <div class="md-layout-item md-size-40">

            <md-table>
              <md-table-row>
                <md-table-cell>Units</md-table-cell>
                <md-table-cell>{{ detailsItem.units }}</md-table-cell>
              </md-table-row>
              
              <md-table-row>
                <md-table-cell>Qty</md-table-cell>
                <md-table-cell>{{ detailsItem.quantity }}</md-table-cell>
              </md-table-row>
              
              <md-table-row>
                <md-table-cell>Rate</md-table-cell>
                <md-table-cell>{{ detailsItem.rate }}</md-table-cell>
              </md-table-row>
              
              <md-table-row>
                <md-table-cell>Total</md-table-cell>
                <md-table-cell>{{ detailsItem.total }}</md-table-cell>
              </md-table-row>
            </md-table>

          </div>
        </div>

        <div class="md-layout">
          <div class="md-layout-item">

            <b>Specifications:</b>
            <div>
              {{ detailsItem.specifications }}
            </div>

          </div>
        </div>

        <br />

        <div class="md-layout">
          <div class="md-layout-item">

            <b>Sample Images:</b>
            <div>
              <a target="_blank" :href="url" v-for="(url, idx) in sampleImgURLS" :key="idx">
                <img :src="url" class="sample-image">
              </a>
            </div>
          
          </div>
        </div>

        <br />

        <div class="md-layout">
          <div class="md-layout-item">

            <b>Attached Files:</b>
            <div>

              <span v-if="detailsItem.attachmentFiles">
                <span v-for="file in detailsItem.attachmentFiles.files" :key="file.assetId">
                  <md-chip @click="dlFile(file.assetId, tenderCreatedBy.email)" style="margin-right: 2px;" md-clickable>{{ file.name }}</md-chip>
                </span>
              </span>
              
            </div>

          </div>
        </div>
        
      </md-dialog-content>

      <md-dialog-actions>
        <span class="md-caption" style="flex: 1">{{ detailsItem.updatedAt }}</span>
        <md-button class="md-primary" @click="showDetailsDialog = false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>


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
export default {
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
    async showDetails(item) {
      this.showDetailsDialog = true;
      this.detailsItem = item;
      let att = JSON.parse(this.detailsItem.attachments);
      this.detailsItem.attachmentFiles = JSON.parse(att.value);
      this.sampleImgURLS = [];
      let smp = JSON.parse(this.detailsItem.sampleImages);
      let fileData = JSON.parse(smp.value);
      if (!fileData) return;
      for(let fd of fileData.files) {
        let d = await this.getAssetData(fd.assetId, this.tenderCreatedBy.email);
        this.sampleImgURLS.push(d.assets[0].public_url);
      }
    },
    async dlFile(asssetId, creatorEmail) {
      let res = await this.getAssetData(asssetId, creatorEmail);
      let dlURL = res.assets[0].public_url;
      window.location = dlURL;
    },
    async getAssetData(asssetId, creatorEmail) {
      let postData = {
        assetId: asssetId,
        creatorEmail: creatorEmail
      }
      let postURL = `/api/asset`;
      let res = await this.$api.post(postURL, postData);
      return res.data;
    }
  }
}
</script>

<style scoped>
.dialog-size {
  width: 60vw;
  height: 70vh;
}

.sample-image {
  margin: 4px;
  height: 200px;
  width: 200px;
  object-fit: cover;
}

</style>