<template>
  <div>
    
    <LineItemDetails ref="itemDetails" />

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
import LineItemDetails from '@/components/LineItemDetails.vue';

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
    TenderSettings,
    LineItemDetails
  },
  props: ['tenderId'],
  data () {
    return {
      name: null,
      description: null,
      createdBy: null,
      priceRevealType: null,
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
      let tData = await this.$api.post('/api/get-tender', postData);
      console.log(tData.data);
      this.name = tData.data.name;
      this.createdBy = tData.data.createdBy;
      this.description = tData.data.description;
      this.priceRevealType = tData.data.priceRevealType;
      this.mustBidOnAll = tData.data.mustBidOnAll;
      this.slots = tData.data.slots || [];
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
    showDetails(item) {
      this.$refs.itemDetails.showDetails(item, this.createdBy);
    }
  }
}
</script>

<style scoped>
</style>
