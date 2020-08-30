<template>
  <div>


    <md-progress-bar v-if="isProcessing" md-mode="query"></md-progress-bar>


    <!-- Navbar -->
    <div>

      <span v-if="hasMondayConnected">
        <md-button @click="sync" class="md-primary md-raised" style="border-radius: 18px;">SYNC</md-button>
      </span>
      <span v-else>
        <md-tooltip md-delay="300">Connect your accounts to sync and share your requests and bids.</md-tooltip>
        <md-button target="_blank" :href="'https://auth.monday.com/oauth2/authorize?client_id=74f5d4a266dec72194a44f947d25ce70&redirect_uri=' + redirect_uri + '/monday/connect'">CONNECT</md-button>
      </span>

      <md-button style="margi-top: 8px" @click="activeTab = 'tender'">Items</md-button>
      <md-button style="margi-top: 8px" @click="activeTab = 'bids'">Bids</md-button>
      <md-button style="margi-top: 8px" @click="activeTab = 'settings'">Settings</md-button>
      
    </div>


    <LineItemDetails ref="itemDetails" />
    <BidSlotDetails ref="bidSlotDetails" />


    <div style="padding: 8px;">
      <!-- Tender Items -->
      <div v-if="activeTab === 'tender'">
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

          <md-table-row v-for="tli in tenderLineItems" :key="tli.id" @click="showBidSlotDetails(tli.bids, tli.tenderLineItem)">
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


      <!-- Bids -->
      <div v-if="activeTab === 'bids'">

        <div class="md-layout">
          <div class="md-layout-item">

            <p>
              Bids received: {{ bids.length }}
            </p>
            
            <md-menu md-size="small">
              <md-button md-menu-trigger>{{ (Object.keys(activeBid).length !== 0) ? activeBid.createdBy.name : 'none' }}</md-button>

              <md-menu-content>
                <md-menu-item v-for="bid in bids" :key="bid._id" @click="setActiveBid(bid)">
                  {{ bid.createdBy.name }}
                </md-menu-item>
              </md-menu-content>
            </md-menu>

          </div>
        </div>

        <BidView v-show="Object.keys(activeBid).length !== 0" :bidId="activeBid._id" ref="bidView" />

      </div>


      <!-- Settings -->
      <div v-if="activeTab === 'settings'">

        <div class="md-layout">
          
          <div class="md-layout-item">
            <p class="md-title">Public Link</p>
            <md-button @click="copyToClipboard(tenderUrl)" class="md-icon-button">
            <md-icon>content_copy</md-icon>
            </md-button>
            <span style="display: inline-block; margin-top: 10px;">
              <a :href="tenderUrl" target="_blank">
                {{ tenderUrl }}
              </a>
            </span>
          </div>

        </div>

        <div class="md-layout">

          <div class="md-layout-item">

            <p class="md-title">Settings</p>

            <span class="md-size-70">
              <md-field>
                <label>Description</label>
                <md-textarea v-model="description"></md-textarea>
              </md-field>
            </span>

            <span class="md-size-30">
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
            </span>

          </div>

        </div>
        
      </div>
    </div>


  </div>
</template>

<script>
import BidView from '@/components/BidView.vue';
import TenderSettings from '@/components/TenderSettings.vue';
import LineItemDetails from '@/components/LineItemDetails.vue';
import BidSlotDetails from '@/components/BidSlotDetails.vue';

let ctx;
let key_linkedBidBoard = "test3";
let key_linkedTenderId = "test_tenderId4";

export default {
  components: {
    BidView,
    TenderSettings,
    LineItemDetails,
    BidSlotDetails
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

      tender: null,
      bids: [],
      activeBid: {},

      activeTab: 'tender',
      isProcessing: false
    };
  },
  computed: {
    redirect_uri() {
      // return window.location.origin;
      return "http://localhost:4001"
    },
    tenderUrl() {
      return `${window.location.origin}/tender-view/${this.linkedTenderId}`;
    }
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

    await this.updateFromTender();
    await this.sync();

  },
  methods: {
    copyToClipboard(content) {
      navigator.clipboard.writeText(content);
    },
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

      let res, postData;

      res = await this.monday.storage.instance.getItem(key_linkedTenderId);
      this.linkedTenderId = res.data.value;
      postData = {
        tId: this.linkedTenderId,
      };
      res = await this.$api.post('/api/get-tender', postData);
      let tData = res.data.tender;
      this.tender = tData;
      this.description = this.tender.description;
      this.priceRevealType = this.tender.priceRevealType;
      this.mustBidOnAll = this.tender.mustBidOnAll;

      for(let tSlot of this.tender.slots) {
        let tli = this.tenderLineItems.filter(t => {
          return t.id.toString() === tSlot.mondayItemId.toString();
        })[0];
        if (tli) tli.tenderLineItem = tSlot.tenderLineItems[tSlot.tenderLineItems.length - 1];
      }
      
      postData = {
        tId: this.linkedTenderId,
      };
      res = await this.$api.post('/api/get-bids-on-tender', postData);
      this.bids = res.data;

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
      for(let bidStat of bidStats) {
        let mdId = bidStat.mondayItemId;
        let tli = this.tenderLineItems.filter(t => {
          return t.id.toString() === mdId.toString()
        })[0];
        tli = (tli) ? tli : {};
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
      this.linkedTenderId = res.data._id;
      this.description = res.data.description;
      this.priceRevealType = res.data.priceRevealType;
      this.mustBidOnAll = res.data.mustBidOnAll;

      res = await this.monday.storage.instance.setItem(key_linkedTenderId, this.linkedTenderId);

    },
    async openItemCard(itemId) {
      this.monday.execute('openItemCard', { itemId: itemId });
    },
    showDetails(item) {
      this.$refs.itemDetails.showDetails(item, this.tender.createdBy);
    },
    showBidSlotDetails(bids, tenderLineItem) {
      this.$refs.bidSlotDetails.showBidSlotDetails(bids, tenderLineItem);
    },
    async setActiveBid(activeBid) {
      this.isProcessing = true;
      this.activeBid = activeBid;
      await this.$refs.bidView.refresh(this.activeBid._id);
      this.isProcessing = false;
    }
  }
}
</script>

<style scoped>
</style>
