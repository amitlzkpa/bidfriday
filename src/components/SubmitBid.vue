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
            <h1 class="md-title">{{ name }}</h1>
            <p class="md-caption" style="height: 4vh;">{{ description }}</p>
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
      <md-button @click="submitBid" class="md-primary">Submit</md-button>
    </md-card-actions>

  </div>
</template>

<script>
export default {
  props: ['tenderId'],
  data () {
    return {
      bidId: "5f3e9ebc9becc53164b53ea9",
      name: null,
      description: null,
      priceRevealType: null,
      mustBidOnAll: false,
      slots: [],
      tenderItems: [],
      tenderCreatedBy: null,
      bidDescription: "",
      
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
      this.tenderCreatedBy = tData.data.createdBy;
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
        // slotData.bid = {
        //   name: "",
        //   rate: "",
        //   specifications: "",
        //   description: ""
        // };
        slotData.bid = {
          name: `${idx}${idx}`,
          rate: `${(idx+1) * 10}`,
          specifications: String.fromCharCode(78 + idx),
          description: String.fromCharCode(65 + idx)
        };
        return slotData;
      });
    },
    async submitBid() {
      let slotData = this.slots.map(s => {
        let slotBidData = {};
        slotBidData.slotId = s.slot._id;
        slotBidData.tenderLineItemId = s.tenderLineItem._id;
        slotBidData.name = s.bid.name;
        slotBidData.rate = parseFloat(s.bid.rate);
        slotBidData.specifications = s.bid.specifications;
        slotBidData.description = s.bid.description;
        return slotBidData;
      });
      let bidData = {
        slotData: slotData,
        bidId: this.bidId,
        bidDescription: this.bidDescription,
        tenderId: this.tenderId
      };
      let postData = { bidData: bidData }
      console.log(postData);
      let r = await this.$api.post('/api/create-bid', postData);
      console.log(r.data);
      this.bidId = r.data._id;
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