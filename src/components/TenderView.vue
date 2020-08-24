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
                  <md-chip @click="dlFile(file.assetId, createdBy.email)" style="margin-right: 2px;" md-clickable>{{ file.name }}</md-chip>
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
        <h1 class="md-title">{{ name }}</h1>
        <p class="md-caption" style="height: 4vh;">{{ description }}</p>
      </div>
      <div class="md-layout-item md-size-15">
        <TenderSettings
          :priceRevealType="priceRevealType"
          :mustBidOnAll="mustBidOnAll"
        />
      </div>
    </div>


    <md-table v-model="searched" md-sort="index" md-sort-order="asc" md-card md-fixed-header>
      <md-table-toolbar>
        <md-field md-clearable class="md-toolbar-section-start">
          <md-input placeholder="Search by name..." v-model="search" @input="searchOnTable" />
        </md-field>
      </md-table-toolbar>

      <md-table-empty-state
        md-label="No item found"
        :md-description="`No item found for '${search}'.`">
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }" @click="showDetails(item)">
        <md-table-cell md-label="No" md-sort-by="index">{{ item.index }}</md-table-cell>
        <md-table-cell md-label="Name" md-sort-by="name">{{ item.name }}</md-table-cell>
        <md-table-cell md-label="Unit" md-sort-by="units">{{ item.units }}</md-table-cell>
        <md-table-cell md-label="Quantity" md-sort-by="quantity">{{ item.quantity }}</md-table-cell>
        <md-table-cell md-label="Rate" md-sort-by="rate">{{ item.rate }}</md-table-cell>
        <md-table-cell md-label="Total" md-sort-by="total">{{ item.total }}</md-table-cell>
      </md-table-row>
    </md-table>

    
    <md-table>
      <md-table-row>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell></md-table-cell>
        <md-table-cell>Total:</md-table-cell>
        <md-table-cell><span class="md-headline">{{ totalAmount }}</span></md-table-cell>
      </md-table-row>
    </md-table>

    <md-card-actions>
      <md-button @click="refresh">Refresh</md-button>
      <md-button :to="'/bid-edit/' + tenderId" class="md-primary">Submit Bid</md-button>
    </md-card-actions>

  </div>
</template>

<script>
import TenderSettings from '@/components/TenderSettings.vue';

const toLower = text => {
  return text.toString().toLowerCase();
}

const searchByName = (items, term) => {
  if (term) {
    return items.filter(item => toLower(item).includes(toLower(term)));
  }
  return items
}

export default {
  components: {
    TenderSettings
  },
  props: ['tenderId'],
  data () {
    return {
      name: null,
      description: null,
      priceRevealType: null,
      mustBidOnAll: false,
      slots: [],
      tenderItems: [],
      totalAmount: null,
      
      search: null,
      searched: [],

      showDetailsDialog: false,
      detailsItem: {},
      sampleImgURLS: []
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
      this.createdBy = tData.data.createdBy;
      this.description = tData.data.description;
      this.priceRevealType = tData.data.priceRevealType;
      this.mustBidOnAll = tData.data.mustBidOnAll;
      this.slots = tData.data.slots;
      this.tenderItems = this.slots.map((s, idx) => {
        let ti = s.tenderLineItems[s.tenderLineItems.length - 1];
        let ret = ti;
        ret.index = idx + 1;
        ret.total = ti.quantity * ti.rate;
        this.totalAmount += ret.total;
        ret.slot = s;
        return ret;
      });
      this.searched = this.tenderItems;
    },
    searchOnTable () {
      this.searched = searchByName(this.tenderItems, this.search);
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
        let d = await this.getAssetData(fd.assetId, this.createdBy.email);
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
