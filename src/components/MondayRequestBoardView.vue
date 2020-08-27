<template>
  <div>

    <md-progress-bar v-if="isProcessing" md-mode="query"></md-progress-bar>

    <LineItemDetails ref="itemDetails" />

    <md-button @click="clickyy">Clickyy</md-button>

    <div class="md-layout md-gutter">
      
      <div class="md-layout-item md-size-70">
        <md-field>
          <label>Description</label>
          <md-textarea v-model="description"></md-textarea>
        </md-field>
      </div>
      
      <div class="md-layout-item md-size-30">
        <span class="md-caption">Price Reveal Type</span>
        <br />
        <md-menu md-size="medium" md-align-trigger>
          <md-button md-menu-trigger>
            <TenderSettings :mustBidOnAll="mustBidOnAll" :priceRevealType="priceRevealType" />
          </md-button>
          <md-menu-content>
            <md-menu-item @click="priceRevealType = 'concealed';">
              <md-icon>visibility_off</md-icon>
              Concealed
            </md-menu-item>
            <md-menu-item @click="priceRevealType = 'lowest';">
              <md-icon>gavel</md-icon>
              Lowest
            </md-menu-item>
            <md-menu-item @click="priceRevealType = 'public';">
              <md-icon>visibility</md-icon>
              Public
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>

    </div>

    <md-table>
      <md-table-row>
        <md-table-head>Status</md-table-head>
        <md-table-head>Name</md-table-head>
        <md-table-head>Quantity</md-table-head>
        <md-table-head>Rate</md-table-head>
        <md-table-head>Total</md-table-head>
        <md-table-head>Bid Count</md-table-head>
        <md-table-head>Bid Price Range</md-table-head>
        <md-table-head>Bid Price Average/Median</md-table-head>
      </md-table-row>

      <md-table-row v-for="tli in tenderLineItems" :key="tli.id" @click="showDetails(tli.tenderLineItem)">
        <md-table-cell>{{ tli.status }}</md-table-cell>
        <md-table-cell @click="openItemCard(tli.id)">{{ tli.name }}</md-table-cell>
        <md-table-cell>{{ tli.units }} {{ tli.quantity }}</md-table-cell>
        <md-table-cell>{{ tli.rate | currency }}</md-table-cell>
        <md-table-cell>{{ tli.total | currency }}</md-table-cell>
        <md-table-cell>{{ tli.bids.latestBids ? tli.bids.latestBids.length : '-' }}</md-table-cell>
        <md-table-cell>{{ tli.bids.minBidRate | currency }} - {{ tli.bids.maxBidRate | currency }}</md-table-cell>
        <md-table-cell>{{ tli.bids.averageRate | currency }}/{{ tli.bids.medianRate | currency }}</md-table-cell>
      </md-table-row>
    </md-table>

  </div>
</template>

<script>
import TenderSettings from '@/components/TenderSettings.vue';
import LineItemDetails from '@/components/LineItemDetails.vue';

let ctx;
let key_linkedBidBoard = "test3";
let key_linkedTenderId = "test_tenderId4";

export default {
  components: {
    TenderSettings,
    LineItemDetails
  },
  data () {
    return {
      currBoardData: null,
      tenderLineItems: [],
      cols: [],
      linkedBoardId: null,
      linkedTenderId: null,

      description: null,
      priceRevealType: 'concealed',
      mustBidOnAll: false,
      tenderCreatedBy: null,

      isProcessing: false
    };
  },
  async mounted () {

    if (!this.isInMonday) {
      this.$destroy();
      this.$el.parentNode.removeChild(this.$el);
      return;
    }

    this.eventBus.$on("sync", () => {
      this.sync();
    });

    this.monday.listen("context", async (res) => {
      ctx = res.data;
    });

    await this.sync();

  },
  methods: {
    async sync() {
      while(!ctx) await this.wait(200);

      this.isProcessing = true;

      let boardId = ctx.boardId;
      let queryStr = `query { boards (ids: ${boardId}) { id name columns { id title } items { id name column_values { text value } } } }`;
      let res = await this.monday.api(queryStr);
      this.currBoardData = res.data.boards[0];
      this.tenderLineItems = this.currBoardData.items.map(row => {
        return {
          row: row,
          id: row.id,
          name: row.name,
          status: row.column_values[8].text,
          units: row.column_values[2].text,
          quantity: row.column_values[1].text,
          rate: row.column_values[3].text,
          total: parseFloat(row.column_values[2].text) * parseFloat(row.column_values[3].text),
          bids: {},
          tenderLineItem: {}
        }
      });
      this.cols = this.currBoardData.columns;

      await this.updateFromTender();
      await this.updateLinkedBidsBoard();
      await this.updateToBidsBoard();
      await this.updateFromBidsOnTender();
      await this.updateToTender();

      this.isProcessing = false;
    },
    async updateLinkedBidsBoard() {

      let res;
      res = await this.monday.storage.instance.getItem(key_linkedBidBoard);
      this.linkedBoardId = res.data.value;
      // if linkedBoardId is not set, fetch from db
      if (!this.linkedBoardId) {
        res = await this.$api.get(`/api/boardpair-from-requestboard/${this.currBoardData.id}`);
        this.linkedBoardId = res.data.bidsBoard;
      } else {
        let boardPair = [{
          requestBoard: this.currBoardData.id,
          bidsBoard: this.linkedBoardId
        }];
        await this.$api.post('/api/sync-boardpairs', boardPair);
      }
      await this.monday.storage.instance.setItem(key_linkedBidBoard, this.linkedBoardId);

    },
    async updateToBidsBoard() {
      while(!ctx) await this.wait(200);

      let res;
      
      let queryStr = `query { boards (ids: ${this.linkedBoardId}) { id name columns { title id } items { name } } }`;
      res = await this.monday.api(queryStr);

      let colsInBidsBoard = res.data.boards[0].columns.map(c => c.title).filter(c => !["Name", "Last Updated"].includes(c));
      let rowsInReqBoard = this.tenderLineItems.map(r => r.name);

      // no way in monday api to delete columns
      // let colsToDel = colsInBidsBoard.filter(c => !rowsInReqBoard.includes(c));
      let colsToAdd = rowsInReqBoard.filter(c => !colsInBidsBoard.includes(c));

      let mutStr;
      // sync data across both boards
      for(let colName of colsToAdd) {
        mutStr = `mutation { create_column (board_id: ${this.linkedBoardId}, title: "${colName}", column_type: long_text) { id } }`;
        res = await this.monday.api(mutStr);
      }

    },
    async updateFromTender() {

      let res;

      res = await this.monday.storage.instance.getItem(key_linkedTenderId);
      this.linkedTenderId = res.data.value;
      let postData = {
        tId: this.linkedTenderId,
      };
      res = await this.$api.post('/api/get-tender', postData);
      let tData = res.data.tender;
      console.log(tData);
      this.description = tData.description;
      this.priceRevealType = tData.priceRevealType;
      this.mustBidOnAll = tData.mustBidOnAll;
      this.tenderCreatedBy = tData.createdBy;

      for(let tSlot of tData.slots) {
        let tli = this.tenderLineItems.filter(t => {
          return t.id.toString() === tSlot.mondayItemId.toString();
        })[0];
        tli.tenderLineItem = tSlot.tenderLineItems[tSlot.tenderLineItems.length - 1];
      }

    },
    async updateFromBidsOnTender() {

      let res;

      res = await this.monday.storage.instance.getItem(key_linkedTenderId);
      this.linkedTenderId = res.data.value;
      let postData = {
        tId: this.linkedTenderId,
        includeStaleBids: true
      };
      res = await this.$api.post('/api/get-tender-and-bids', postData);
      
      let bidStats = res.data.bidStats;
      console.log(bidStats);
      for(let bidStat of bidStats) {
        let mdId = bidStat.mondayItemId;
        let tli = this.tenderLineItems.filter(t => {
          return t.id.toString() === mdId.toString()
        })[0];
        tli.bids = bidStat;
      }

    },
    async updateToTender() {

      let res;

      res = await this.monday.storage.instance.getItem(key_linkedTenderId);
      this.linkedTenderId = res.data.value;
      let postData = {
        requestBoardId: this.currBoardData.id,
        tenderId: this.linkedTenderId,
        priceRevealType: this.priceRevealType,
        mustBidOnAll: this.mustBidOnAll,
        description: this.description
      };
      res = await this.$api.post('/api/create-or-update-tender', postData);
      console.log(res.data);
      this.linkedTenderId = res.data._id;
      this.description = res.data.description;
      this.priceRevealType = res.data.priceRevealType;
      this.mustBidOnAll = res.data.mustBidOnAll;

      res = await this.monday.storage.instance.setItem(key_linkedTenderId, this.linkedTenderId);

    },
    async clickyy() {

      // let newNum = "684000881";
      // let res = await this.monday.storage.instance.setItem(key_linkedBidBoard, newNum);
      // console.log(res);
      // res = await this.monday.storage.instance.getItem(key_linkedBidBoard);
      // console.log(res);

    },
    async openItemCard(itemId) {
      this.monday.execute('openItemCard', { itemId: itemId });
    },
    showDetails(item) {
      this.$refs.itemDetails.showDetails(item, this.tenderCreatedBy);
    },
  }
}
</script>

<style scoped>
</style>
