<template>
  <div>

    <md-progress-bar v-if="isProcessing" md-mode="query"></md-progress-bar>

    <md-field>
      <md-button @click="refresh">Refresh</md-button>
    </md-field>

    
    <md-table>
      <md-table-row>
        <md-table-head>No</md-table-head>
        <md-table-head>Vendor</md-table-head>
        <md-table-head>Total</md-table-head>
        <md-table-head>Benchmark</md-table-head>
      </md-table-row>

      <md-table-row v-for="(row, idx) in rows" :key="row.name">
        <md-table-cell>{{ idx }}</md-table-cell>
        <md-table-cell>{{ row.name }}</md-table-cell>
        <md-table-cell>-</md-table-cell>
        <md-table-cell>-</md-table-cell>
      </md-table-row>
    </md-table>

  </div>
</template>

<script>

let ctx;
let key_linkedReqBoard = "test3";
let key_linkedTenderId = "test_tenderId4";

export default {
  data () {
    return {
      currBoardData: null,
      rows: [],
      cols: [],
      linkedReqBoardId: null,
      linkedTenderId: null,

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
      this.refresh();
    });

    this.monday.listen("context", async (res) => {
      ctx = res.data;
    });

    this.refresh();

  },
  methods: {
    async refresh() {
      while(!ctx) await this.wait(200);

      this.isProcessing = true;

      let boardId = ctx.boardId;
      let queryStr = `query { boards (ids: ${boardId}) { id name columns { id title } items { id name } } }`;
      let res = await this.monday.api(queryStr);
      this.currBoardData = res.data.boards[0];
      this.rows = this.currBoardData.items;
      this.cols = this.currBoardData.columns;

      await this.updateLinkedReqBoard();
      await this.updateFromReqBoard();
      await this.updateToTender();

      this.isProcessing = false;

    },
    async updateLinkedReqBoard() {

      let res;
      res = await this.monday.storage.instance.getItem(key_linkedReqBoard);
      this.linkedReqBoardId = res.data.value;
      // if linkedReqBoardId is not set, fetch from db
      if (!this.linkedReqBoardId) {
        res = await this.$api.get(`/api/boardpair-from-bidsboard/${this.currBoardData.id}`);
        this.linkedReqBoardId = res.data.requestBoard;
      }
      await this.monday.storage.instance.setItem(key_linkedReqBoard, this.linkedReqBoardId);

    },
    async updateFromReqBoard() {
      while(!ctx) await this.wait(200);

      let res;
      
      let queryStr = `query { boards (ids: ${this.linkedReqBoardId}) { id name items { name } } }`;
      res = await this.monday.api(queryStr);

      let rowsInReqBoard = res.data.boards[0].items.map(c => c.name);
      let colsInBidsBoard = this.cols.map(r => r.title).filter(c => !["Name", "Last Updated"].includes(c));

      // no way in monday api to delete columns
      // let colsToDel = colsInBidsBoard.filter(c => !rowsInReqBoard.includes(c));
      let colsToAdd = rowsInReqBoard.filter(c => !colsInBidsBoard.includes(c));

      let mutStr;
      // sync data across both boards
      for(let colName of colsToAdd) {
        mutStr = `mutation { create_column (board_id: ${this.currBoardData.id}, title: "${colName}", column_type: long_text) { id } }`;
        res = await this.monday.api(mutStr);
      }

    },
    async updateToTender() {

      let res;

      res = await this.monday.storage.instance.getItem(key_linkedTenderId);
      this.linkedTenderId = res.data.value;
      let postData = {
        requestBoardId: this.linkedReqBoardId,
        tenderId: this.linkedTenderId
      };
      res = await this.$api.post('/api/create-or-update-tender', postData);
      this.linkedTenderId = res.data._id;
      res = await this.monday.storage.instance.setItem(key_linkedTenderId, this.linkedTenderId);

    }
  }
}
</script>

<style scoped>
</style>
