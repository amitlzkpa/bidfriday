<template>
  <div>    
    <button @click="refresh">Refresh</button>

    <table>
      <tr>
        <td>Status</td>
        <th>Name</th>
        <th>Quantity</th>
        <th>Rate</th>
        <th>Total</th>
        <th>Bids</th>
        <th>Lowest Bid</th>
        <th>Highest Bid</th>
        <th>Lowest Lead Time</th>
        <th>Highest Lead Time</th>
      </tr>

      <tr v-for="row in rows" :key="row.name" @click="openItemCard(row.id)">
        <td>{{ row.column_values[8].text }}</td>
        <td>{{ row.name }}</td>
        <td>{{ row.column_values[2].text }} {{ row.column_values[1].text }}</td>
        <td>{{ row.column_values[3].text }}</td>
        <td>{{ parseFloat(row.column_values[2].text) * parseFloat(row.column_values[3].text) }}</td>
        <td>-</td>
        <td>-</td><td>-</td> <td>-</td><td>-</td>
      </tr>
    </table>

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
      linkedBoardId: null,
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
      let queryStr = `query { boards (ids: ${boardId}) { id name columns { id title } items { id name column_values { text value } } } }`;
      let res = await this.monday.api(queryStr);
      this.currBoardData = res.data.boards[0];
      this.rows = this.currBoardData.items;
      this.cols = this.currBoardData.columns;

      console.log(this.rows);
      console.log(this.cols);

      await this.updateToBidsBoard();
    },
    async updateToBidsBoard() {
      while(!ctx) await this.wait(200);

      let res;
      
      res = await this.monday.storage.instance.getItem(key_linkedBidBoard);
      this.linkedBoardId = res.data.value;

      // if linkedBoardId is not set, fetch from db
      if (!this.linkedBoardId) {
        res = await this.$api.get(`/api/boardpair-from-requestboard/${this.currBoardData.id}`);
        this.linkedBoardId = res.data.bidsBoard;
      }

      await this.monday.storage.instance.setItem(key_linkedBidBoard, this.linkedBoardId);
      
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
    async openItemCard(itemId) {
      this.monday.execute('openItemCard', { itemId: itemId });
    }
  }
}
</script>

<style scoped>
</style>
