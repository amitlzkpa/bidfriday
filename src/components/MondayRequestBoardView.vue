<template>
  <div>

    <md-progress-bar v-if="isProcessing" md-mode="query"></md-progress-bar>

    <p style="display: flex; justify-content: space-between;">
      <span>
        <md-button class="primary" @click="refresh">Refresh</md-button>
      </span>
      <span>
        <md-field>
          <md-select v-model="priceRevealType" placeholder="Price Reveal" name="priceRevealType" id="priceRevealType" md-dense>
            <md-option value="concealed">
              <span @click="refresh">Concealed</span>
            </md-option>
            <md-option value="lowest">
              <span @click="refresh">Lowest</span>
            </md-option>
            <md-option value="public">
              <span @click="refresh">Public</span>
            </md-option>
          </md-select>
        </md-field>
      </span>
    </p>

    <md-table>
      <md-table-row>
        <md-table-head>Status</md-table-head>
        <md-table-head>Name</md-table-head>
        <md-table-head>Quantity</md-table-head>
        <md-table-head>Rate</md-table-head>
        <md-table-head>Total</md-table-head>
        <md-table-head>Bids</md-table-head>
        <md-table-head>Lowest Bid</md-table-head>
        <md-table-head>Highest Bid</md-table-head>
        <md-table-head>Lowest Lead Time</md-table-head>
        <md-table-head>Highest Lead Time</md-table-head>
      </md-table-row>

      <md-table-row v-for="row in rows" :key="row.name" @click="openItemCard(row.id)">
        <md-table-cell>{{ row.column_values[8].text }}</md-table-cell>
        <md-table-cell>{{ row.name }}</md-table-cell>
        <md-table-cell>{{ row.column_values[2].text }} {{ row.column_values[1].text }}</md-table-cell>
        <md-table-cell>{{ row.column_values[3].text }}</md-table-cell>
        <md-table-cell>{{ parseFloat(row.column_values[2].text) * parseFloat(row.column_values[3].text) }}</md-table-cell>
        <md-table-cell>-</md-table-cell>
        <md-table-cell>-</md-table-cell>
        <md-table-cell>-</md-table-cell>
        <md-table-cell>-</md-table-cell>
        <md-table-cell>-</md-table-cell>
      </md-table-row>
    </md-table>

  </div>
</template>

<script>

let ctx;
let key_linkedBidBoard = "test3";
let key_linkedTenderId = "test_tenderId4";
let key_priceRevealType = "test_priceRevealType";

export default {
  data () {
    return {
      currBoardData: null,
      rows: [],
      cols: [],
      linkedBoardId: null,
      linkedTenderId: null,

      priceRevealType: 'concealed',

      isProcessing: false
    };
  },
  async mounted () {

    if (!this.isInMonday) {
      this.$destroy();
      this.$el.parentNode.removeChild(this.$el);
      return;
    }

    this.monday.listen("context", async (res) => {
      ctx = res.data;
    });

    let res = await this.monday.storage.instance.getItem(key_priceRevealType);
    this.priceRevealType = res.data.value || this.priceRevealType;

    this.refresh();

  },
  methods: {
    async refresh() {
      while(!ctx) await this.wait(200);

      this.isProcessing = true;

      let boardId = ctx.boardId;
      let queryStr = `query { boards (ids: ${boardId}) { id name columns { id title } items { id name column_values { text value } } } }`;
      let res = await this.monday.api(queryStr);
      this.currBoardData = res.data.boards[0];
      this.rows = this.currBoardData.items;
      this.cols = this.currBoardData.columns;

      res = await this.monday.storage.instance.setItem(key_priceRevealType, this.priceRevealType);

      await this.updateLinkedBidsBoard();
      await this.updateToBidsBoard();
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
      }
      await this.monday.storage.instance.setItem(key_linkedBidBoard, this.linkedBoardId);

    },
    async updateToBidsBoard() {
      while(!ctx) await this.wait(200);

      let res;
      
      let queryStr = `query { boards (ids: ${this.linkedBoardId}) { id name columns { title id } items { name } } }`;
      res = await this.monday.api(queryStr);

      let colsInBidsBoard = res.data.boards[0].columns.map(c => c.title).filter(c => !["Name", "Last Updated"].includes(c));
      let rowsInReqBoard = this.rows.map(r => r.name);

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
    async updateToTender() {

      let res;

      res = await this.monday.storage.instance.getItem(key_linkedTenderId);
      this.linkedTenderId = res.data.value;
      let postData = {
        requestBoardId: this.currBoardData.id,
        tenderId: this.linkedTenderId,
        priceRevealType: this.priceRevealType
      };
      res = await this.$api.post('/api/create-or-update-tender', postData);
      this.linkedTenderId = res.data._id;
      res = await this.monday.storage.instance.setItem(key_linkedTenderId, this.linkedTenderId);

    },
    async openItemCard(itemId) {
      this.monday.execute('openItemCard', { itemId: itemId });
    }
  }
}
</script>

<style scoped>
</style>
