<template>
  <div v-if="tenderName">
    
    <LineItemDetails ref="itemDetails" />

    <div class="md-layout" style="padding: 8px;">

      <div class="md-layout-item md-large-size-60 md-small-size-100">
        <h1 class="md-title">{{ tenderName }}</h1>
        <span class="md-caption">Last updated: &nbsp; {{ tenderLastUpdatedAt | moment("calendar") }}</span>
        <p class="md-caption" style="min-height: 4vh;">{{ tenderDescription }}</p>
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

      <md-table-row slot="md-table-row" slot-scope="{ item }" @click="showDetails(item)" style='cursor:pointer'>
        <md-table-cell md-label="No" md-sort-by="index">{{ item.index }}</md-table-cell>
        <md-table-cell md-label="Name" md-sort-by="name">{{ item.name }}</md-table-cell>
        <md-table-cell md-label="Unit" md-sort-by="units">{{ item.units }}</md-table-cell>
        <md-table-cell md-label="Quantity" md-sort-by="quantity">{{ item.quantity }}</md-table-cell>
        <md-table-cell md-label="Rate" md-sort-by="rate"><span>{{ item.rate | currency }}</span></md-table-cell>
        <md-table-cell md-label="Total" md-sort-by="total"><span>{{ item.total | currency }}</span></md-table-cell>
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
        <md-table-cell><span class="md-headline">{{ totalAmount | currency }}</span></md-table-cell>
      </md-table-row>
    </md-table>

    <md-card-actions v-if="$auth.bfUser">
      <span v-if="!!$auth.bfUser.phone && !!$auth.bfUser.location">
        <md-button :to="'/bid-submit/' + tenderId" class="md-primary">Submit Bid</md-button>
      </span>
      <span v-else>
        <span style="display:inline-block; margin-top: 10px;" class="md-caption">
          Please complete your full profile to start submitting bids.
        </span>
        <md-button :to="'/my-profile/'" class="md-primary">Complete Profile</md-button>
      </span>
    </md-card-actions>

  </div>
</template>

<script>
import LineItemDetails from '@/components/LineItemDetails.vue';

const toLower = text => {
  return text.toString().toLowerCase();
}

const searchByName = (items, term) => {
  if (term) {
    return items.filter(item => toLower(item.name).includes(toLower(term)));
  }
  return items
}

export default {
  components: {
    LineItemDetails
  },
  props: ['tenderId'],
  data () {
    return {
      tenderName: null,
      tenderDescription: null,
      tenderCreatedBy: null,
      tenderLastUpdatedAt: null,
      priceRevealSettings: null,
      mustBidOnAll: false,
      slots: [],
      tenderItems: [],
      totalAmount: null,
      
      search: null,
      searched: [],
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
      let res = await this.$api.post('/api/get-tender', postData);
      // let postData = {
      //   tId: tId,
      //   // includeStaleBids: false
      // };
      // let res = await this.$api.post('/api/get-tender-and-bids', postData);
      let tData = res.data.tender;
      this.tenderName = tData.name;
      this.tenderDescription = tData.description;
      this.tenderCreatedBy = tData.createdBy;
      this.tenderLastUpdatedAt = tData.updatedAt;
      this.priceRevealSettings = (tData.priceRevealSettings) ? JSON.parse(tData.priceRevealSettings) : {};
      this.mustBidOnAll = tData.mustBidOnAll;
      this.slots = tData.slots || [];
      this.tenderItems = this.slots.map((s, idx) => {
        let ti = s.tenderLineItems[s.tenderLineItems.length - 1];
        let ret = ti;
        ret.index = idx + 1;
        ret.total = ti.quantity * (ti.rate === -1 ? 0 : ti.rate);
        this.totalAmount += ret.total;
        ret.slot = s;
        return ret;
      });
      this.searched = this.tenderItems;

      // let bidStats = res.data.bidStats;
      // for(let bidStat of bidStats) {
      //   let tSlotId = bidStat.tenderSlot;
      //   let tli = this.tenderItems.filter(t => {
      //     return t.slot._id.toString() === tSlotId.toString()
      //   })[0];
      //   tli = (tli) ? tli : {};
      //   tli.bids = bidStat;
      // }
      
    },
    searchOnTable () {
      this.searched = searchByName(this.tenderItems, this.search);
      this.totalAmount = 0;
      this.searched.forEach(i => this.totalAmount += i.total);
    },
    showDetails(item) {
      this.$refs.itemDetails.showDetails(item, this.tenderCreatedBy);
    }
  }
}
</script>

<style scoped>
</style>
