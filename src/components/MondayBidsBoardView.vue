<template>
  <div>
    <button @click="test">Test</button>
    <button @click="refresh">Refresh</button>
    <button @click="enableBidding">Enable Bidding</button>
    <p v-for="row in rows" :key="row.name">
      {{ row.name }}
    </p>
  </div>
</template>

<script>

let ctx;
let key_linkedBidBoard = "test3";
let key_linkedTenderId = "test_tenderId4";

export default {
  data () {
    return {
      currBoardData: null,
      rows: [],
      cols: [],
      linkedBoardId: null,
      linkedTenderId: null
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

    this.refresh();

  },
  methods: {
    async refresh() {
      while(!ctx) await this.wait(200);

      let boardId = ctx.boardId;
      let queryStr = `query { boards (ids: ${boardId}) { id name columns { id title } items { id name } } }`;
      let res = await this.monday.api(queryStr);
      this.currBoardData = res.data.boards[0];
      this.rows = this.currBoardData.items;
      this.cols = this.currBoardData.columns;

      await this.updateFromReqBoard();
    },
    async updateFromReqBoard() {
      while(!ctx) await this.wait(200);

      let res;
      
      res = await this.monday.storage.instance.getItem(key_linkedBidBoard);
      this.linkedBoardId = res.data.value;

      // if linkedBoardId is not set, fetch from db
      if (!this.linkedBoardId) {
        res = await this.$api.get(`/api/boardpair-from-bidsboard/${this.currBoardData.id}`);
        this.linkedBoardId = res.data.requestBoard;
      }

      await this.monday.storage.instance.setItem(key_linkedBidBoard, this.linkedBoardId);
      
      let queryStr = `query { boards (ids: ${this.linkedBoardId}) { id name items { name } } }`;
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
    async enableBidding() {

      let res;
      
      res = await this.monday.storage.instance.getItem(key_linkedTenderId);
      this.linkedTenderId = res.data.value;

      let postData = {
        requestBoardId: this.linkedBoardId,
        tenderId: this.linkedTenderId
      };

      res = await this.$api.post('/api/create-or-update-tender', postData);

      this.linkedTenderId = res.data._id;
      res = await this.monday.storage.instance.setItem(key_linkedTenderId, this.linkedTenderId);

    },
    async test() {
      
      let res = await this.$api.post('/api/test');
      console.log(res.data);

    }
  }
}
</script>

<style scoped>
</style>
