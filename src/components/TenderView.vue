<template>
  <div>
    
    <md-dialog :md-active.sync="showDetailsDialog">
      <md-dialog-title>Details</md-dialog-title>

      <md-dialog-content class="dialog-size">

        <div class="md-layout">
          <div class="md-layout-item">
            <h3>{{ detailsItem.name }}</h3>
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

            <p>Specifications:</p>
            <div style="height: 10vh; overflow-x: auto; overflow-y: hidden;">
              <div style="width: 100%">
                {{ detailsItem.specifications }}
              </div>
            </div>

          </div>
        </div>

        <div class="md-layout">
          <div class="md-layout-item">

            <p>Sample Images:</p>
            <div style="height: 10vh; overflow-x: auto; overflow-y: hidden;">
              <div style="width: 100%">
              
              </div>
            </div>
          
          </div>
        </div>

        <div class="md-layout">
          <div class="md-layout-item">

            <p>Attached Files:</p>
            <div style="height: 3vh; overflow-x: auto; overflow-y: hidden;">
              <div style="width: 100%">
              
              </div>
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
        <p v-if="priceRevealType === 'concealed'">
          <md-icon>visibility_off</md-icon>
          <md-tooltip md-delay="300">Concealed: No information from other bids shown.</md-tooltip>
          Bids Reveal
        </p>
        <p v-if="priceRevealType === 'lowest'">
          <md-icon>visibility_off</md-icon>
          <md-tooltip md-delay="300">Lowest: Information from the lowest bids shown.</md-tooltip>
          Bids Reveal
        </p>
        <p v-if="priceRevealType === 'public'">
          <md-icon>visibility_off</md-icon>
          <md-tooltip md-delay="300">Public: Information from all bids shown.</md-tooltip>
          Bids Reveal
        </p>
        
        <p v-if="mustBidOnAll">
          <md-icon>check_circle</md-icon>
          <md-tooltip md-delay="300">All: Must bid for all items on tender.</md-tooltip>
          Complete Bids
        </p>
        <p v-else>
          <md-icon>remove_circle_outline</md-icon>
          <md-tooltip md-delay="300">Choice: Bid on only interested items on tender.</md-tooltip>
          Complete Bids
        </p>
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


    <md-card-actions>
      <md-button @click="refresh">Refresh</md-button>
      <md-button :to="'/submit-bid/' + tenderId" class="md-primary">Submit Bid</md-button>
    </md-card-actions>

  </div>
</template>

<script>

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
  props: ['tenderId'],
  data () {
    return {
      name: null,
      description: null,
      priceRevealType: null,
      mustBidOnAll: false,
      slots: [],
      tenderItems: [],
      
      search: null,
      searched: [],

      showDetailsDialog: false,
      detailsItem: {}
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
      this.searched = this.tenderItems;
    },
    searchOnTable () {
      this.searched = searchByName(this.tenderItems, this.search);
    },
    showDetails(item) {
      console.log(item);
      this.detailsItem = item;
      this.showDetailsDialog = true;
    }
  }
}
</script>

<style scoped>
.dialog-size {
  width: 60vw;
  height: 70vh;
}
</style>
