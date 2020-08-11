<template>
  <div>    
    <button @click="refresh">Refresh</button>
    <p v-for="row in rows" :key="row.name">
      {{ row.name }}
    </p>
  </div>
</template>

<script>

let ctx;
let key_linkedBidBoard = "test3";

export default {
  data () {
    return {
      user: null,
      currBoardData: null,
      rows: [],
      cols: []
    };
  },
  async mounted () {
    let res = await this.monday.api('query { me { id name country_code location url account { id name } } }');
    this.user = res.data.me;

    this.monday.listen("context", async (res) => {
      ctx = res.data;
    });

    this.refresh();

  },
  methods: {
    async refresh() {
      while(!ctx) await this.wait(200);

      let boardId = ctx.boardId;
      let queryStr = `query { boards (ids: ${boardId}) { id name columns { title id } items { name } } }`;
      let res = await this.monday.api(queryStr);
      this.currBoardData = res.data.boards[0];
      this.rows = this.currBoardData.items;
      this.cols = this.currBoardData.columns;

      await this.updateWithDataFromReqBoard();
    },
    async updateWithDataFromReqBoard() {
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
      let colsInBidsBoard = this.cols.map(r => r.title).filter(c => !["Name", "Last Updated"].includes(c));;

      // no way in monday api to delete columns
      // let colsToDel = colsInBidsBoard.filter(c => !rowsInReqBoard.includes(c));
      let colsToAdd = rowsInReqBoard.filter(c => !colsInBidsBoard.includes(c));

      let mutStr;
      // sync data across both boards
      for(let colName of colsToAdd) {
        mutStr = `mutation { create_column (board_id: ${this.currBoardData.id}, title: "${colName}", column_type: long_text) { id } }`;
        res = await this.monday.api(mutStr);
      }

    }
  }
}
</script>

<style scoped>
</style>
