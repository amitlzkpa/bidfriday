<template>
  <div>


    <input type="text" v-model="newBoardName" />
    <button @click="onNewBoardClk">Create</button>
    <a :href="BIDSERVER_URL + '/monday-connect'" target="_blank">Link</a>

    <hr />

    <h4>Active Requests</h4>

    <table style="width:100%">

      <tr>
        <th>Name</th>
        <th>Total Budget</th>
        <th>Best Budget</th>
        <th>Total Items</th>
        <th>Items totalOrdered</th>
        <th>Items Delivered</th>
        <th>Bid Received</th>
        <th>Vendor Pool</th>
      </tr>

      <tr v-for="row in rows" :key="row.name">
        <td>{{ row.name }}</td>
        <td>${{ row.totalBudget }}</td>
        <td>$32</td>
        <td>{{ row.totalItems }}</td>
        <td>{{ row.totalOrdered }}</td>
        <td>{{ row.totalDelivered }}</td>
        <td>6</td>
        <td>+</td>
      </tr>
      
    </table>


    <br /><br />

  </div>
</template>

<script>

let ctx;
let bidfridayDataKey = 'test1';
let reqToBid = new Map();
let bidToReq = new Map();

export default {
  data () {
    return {
      user: null,
      newBoardName: "My new request",
      rows: []
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
    async syncBoardPairs() {
      let v;
      v = await this.monday.storage.instance.getItem(bidfridayDataKey);

      let storedData = JSON.parse(v.data.value);
      for(let d of storedData) {
        reqToBid.set(d.requestBoard.toString(), d.bidsBoard.toString());
        bidToReq.set(d.bidsBoard.toString(), d.requestBoard.toString());
      }

      await this.$api.post('/api/sync-boardpairs', storedData);
    },
    async refresh() {
      while(!ctx) await this.wait(200);


      await this.syncBoardPairs();
      

      let q, r;


      // get all boards
      q = `query {
        boards {
          id
          name
          views {
            id
            name
          }
        }
      }`;
      r = await this.monday.api(q);

      // filter relevant bidfriday request boardss
      let requestBoards = r.data.boards.filter(b => reqToBid.has(b.id));

      // parse overall board info and stats
      let bsInDBData = [];

      for(let board of requestBoards) {

        q = `query {
          boards (ids: ${board.id}) {
            id
            name
            items {
              name
              column_values {
                title
                value
                text
              }
            }
          }
        }`;
        r = await this.monday.api(q);
        let bData = r.data.boards[0];
        
        let d = {};
        d.name = bData.name;
        d.id = bData.id;
        d.totalItems = bData.items.length;

        let totalBudget = 0;
        let totalOrdered = 0;
        let totalDelivered = 0;
        for(let i of bData.items) {
          let rateCol = i.column_values.filter(c => c.title === "Rate")[0];
          let qtyCol = i.column_values.filter(c => c.title === "Quantity")[0];
          let statusCol = i.column_values.filter(c => c.title === "Status")[0];
          totalBudget += parseFloat(rateCol.text) * parseFloat(qtyCol.text);
          if (statusCol.text === "Ordered") totalOrdered++;
          if (statusCol.text === "Delivered") totalDelivered++;
        }
        d.totalOrdered = totalOrdered;
        d.totalDelivered = totalDelivered;
        d.totalBudget = totalBudget;
        
        bsInDBData.push(d);

      }


      // get info from loaded board
      q = `query {
        boards (ids: ${ctx.boardId}) {
          name
          items {
            id
            name
            column_values {
              id
              title
              text
            }
          }
        }
      }`;
      r = await this.monday.api(q);
      let contextBoards = r.data.boards[0].items;

      // parse in-context board info
      let bsInCtxtData = [];
      
      for(let board of contextBoards) {
        let d = {};
        d.name = board.name;
        d.rowId = board.id;
        let idCol = board.column_values.filter(c => c.title === "ID")[0];
        d.id = idCol.text;
        bsInCtxtData.push(d);
      }
      

      let m;
      let correctCtxtBIds = [];   // list of boards which have correct info about the board in the db

      for(let bInCtxt of bsInCtxtData) {
        // find an exact matching record for the board in db based on what's in context
        let corrBInDB = bsInDBData.filter(b => b.id === bInCtxt.id && b.name === bInCtxt.name);
        // delete row if not found
        if (corrBInDB.length === 0) {
          m = `mutation {
            delete_item (item_id: ${bInCtxt.rowId}) {
              id
            }
          }`;
          r = await this.monday.api(m);
        } else {
          // mark it so that we don't need to recreate it again
          correctCtxtBIds.push(corrBInDB[0].id);
        }
      }


      // create dummy empty item for empty boards to get col ref ids
      if (!contextBoards[0]) {
        m = `mutation {
            create_item (board_id: ${ctx.boardId}, item_name: "temp") {
                id
          }
        }`;
        r = await this.monday.api(m);
        let tempItemId = r.data.create_item.id;

        q = `query {
          boards (ids: ${ctx.boardId}) {
            items {
              column_values {
                id
              }
            }
          }
        }`;
        r = await this.monday.api(q);
        contextBoards = r.data.boards[0].items;
        
        m = `mutation {
          delete_item (item_id: ${tempItemId}) {
            id
          }
        }`;
        r = await this.monday.api(m);
      }
      // get ref ids for columns
      let boardNoColId = contextBoards[0].column_values[0].id;

      for(let bInDB of bsInDBData) {
        // check for board in context based on if its in db and not already in context
        let corrBInCtxt = bsInCtxtData.filter(b => bInDB.id === b.id && correctCtxtBIds.includes(bInDB.id));
        if (corrBInCtxt.length === 0) {
          // if its not create a row and populate it
          m = `mutation {
              create_item (board_id: ${ctx.boardId}, item_name: "${bInDB.name}") {
                  id
            }
          }`;
          r = await this.monday.api(m);

          let newItemId = r.data.create_item.id;

          let v = JSON.stringify(`"${bInDB.id}"`);
          m = `mutation {
                change_column_value (board_id: ${ctx.boardId},
                                      item_id: ${newItemId},
                                      column_id: "${boardNoColId}",
                                      value: ${v} ) {
                id
              }
            }`;
          r = await this.monday.api(m);
        }
      }


      // show info in UI
      this.rows = Object.values(bsInDBData);
    },
    async onNewBoardClk() {
      if(!this.newBoardName || this.newBoardName === "") return;
      while(!ctx) await this.wait(200);

      let mutStr;
      let res;

      // new request board
      mutStr = `mutation { create_board (board_name: "${this.newBoardName}", board_kind: private) { id } }`;
      res = await this.monday.api(mutStr);

      let newReqBoardId = res.data.create_board.id;

      mutStr = `mutation { create_column (board_id: ${newReqBoardId}, title: "Specifications", column_type: long_text) { id } }`;
      res = await this.monday.api(mutStr);

      mutStr = `mutation { create_column (board_id: ${newReqBoardId}, title: "Units", column_type: dropdown) { id } }`;
      res = await this.monday.api(mutStr);

      mutStr = `mutation { create_column (board_id: ${newReqBoardId}, title: "Quantity", column_type: numbers) { id } }`;
      res = await this.monday.api(mutStr);

      mutStr = `mutation { create_column (board_id: ${newReqBoardId}, title: "Rate", column_type: numbers) { id } }`;
      res = await this.monday.api(mutStr);

      mutStr = `mutation { create_column (board_id: ${newReqBoardId}, title: "Budget", column_type: numbers) { id } }`;
      res = await this.monday.api(mutStr);

      mutStr = `mutation { create_column (board_id: ${newReqBoardId}, title: "People", column_type: people) { id } }`;
      res = await this.monday.api(mutStr);

      mutStr = `mutation { create_column (board_id: ${newReqBoardId}, title: "Sample Images", column_type: integration) { id } }`;
      res = await this.monday.api(mutStr);

      mutStr = `mutation { create_column (board_id: ${newReqBoardId}, title: "Attachments", column_type: integration) { id } }`;
      res = await this.monday.api(mutStr);

      mutStr = `mutation { create_column (board_id: ${newReqBoardId}, title: "Status", column_type: status) { id } }`;
      res = await this.monday.api(mutStr);


      // new bids board
      mutStr = `mutation { create_board (board_name: "${this.newBoardName}(Bids)", board_kind: private) { id } }`;
      res = await this.monday.api(mutStr);

      let newBidsBoardId = res.data.create_board.id;

      mutStr = `mutation { create_column (board_id: ${newBidsBoardId}, title: "Last Updated", column_type: last_updated) { id } }`;
      res = await this.monday.api(mutStr);

      // save the new board pair to dbs
      let v;
      v = await this.monday.storage.instance.getItem(bidfridayDataKey);
      let storedData = JSON.parse(v.data.value);
      storedData.push({
        requestBoard: newReqBoardId,
        bidsBoard: newBidsBoardId
      });
      v = await this.monday.storage.instance.setItem(bidfridayDataKey, JSON.stringify(storedData));

      // sync will be performed on refresh
      await this.refresh();

      await this.monday.execute("notice", { 
        message: "Setup boards for a new request and bids. Jump over to the boards to add board views and update details.",
        type: "success",
        timeout: 10000,
      });

    }
  }
}
</script>

<style scoped>
</style>
