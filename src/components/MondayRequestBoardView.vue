<template>
  <div>


    <md-progress-bar v-if="isProcessing" md-mode="query"></md-progress-bar>


    <!-- Navbar -->
    <div style="display: flex;" v-if="hasMondayConnected">

      <span style="flex: 1">
        <md-button :class="(activeTab === 'tender') ? 'md-primary' : ''"
          style="margin-top: 8px" @click="activeTab = 'tender'">Items</md-button>
        <md-button :class="(activeTab === 'bids') ? 'md-primary' : ''"
          style="margin-top: 8px" @click="activeTab = 'bids'">Bids</md-button>
        <md-button :class="(activeTab === 'settings') ? 'md-primary' : ''"
          style="margin-top: 8px" @click="activeTab = 'settings'">Settings</md-button>
      </span>

      <span>
        <span>
          <md-tooltip md-delay="300">Learn how to use BidFriday.</md-tooltip>
          <md-button target="_blank" href="/monday/setup-your-board">HELP</md-button>
        </span>
        <span>
          <md-button @click="sync" class="md-primary md-raised" style="border-radius: 18px;">SYNC</md-button>
        </span>
      </span>
      
    </div>

    <div style="display: flex;" v-else>
      <span style="flex: 1">
      </span>
      <span>
        <md-tooltip md-delay="300">Connect your accounts to sync and share your requests and bids.</md-tooltip>
        <md-button target="_blank" :href="'https://auth.monday.com/oauth2/authorize?client_id=74f5d4a266dec72194a44f947d25ce70&redirect_uri=' + redirectUrl + '/monday/connect'">CONNECT</md-button>
      </span>
    </div>


    <LineItemDetails ref="itemDetails" />
    <BidSlotDetails ref="bidSlotDetails" />


    <div v-if="hasMondayConnected" style="padding: 8px;">

      <div v-if="tenderLineItems.length < 1">
        <span class="md-title" style="color: #CCCCCC">No items on your board yet.</span>
      </div>

      <div v-else>
      <!-- Tender Items -->
      <div v-if="activeTab === 'tender'">
        <md-table>
          <md-table-row>
            <md-table-head>Name</md-table-head>
            <md-table-head>Quantity</md-table-head>
            <md-table-head>Rate</md-table-head>
            <md-table-head>Total</md-table-head>
            <md-table-head>Bid Count</md-table-head>
            <md-table-head>Min</md-table-head>
            <md-table-head>Max</md-table-head>
            <md-table-head>Average</md-table-head>
          </md-table-row>

          <md-table-row v-for="tli in tenderLineItems" :key="tli.id" @click="showBidSlotDetails(tli.bids, tli.tenderLineItem)">
            <md-table-cell @click="openItemCard(tli.id)">{{ tli.name }}</md-table-cell>
            <md-table-cell>{{ tli.quantity }} {{ tli.units }}</md-table-cell>
            <md-table-cell>{{ tli.rate | currency }}</md-table-cell>
            <md-table-cell>{{ tli.total | currency }}</md-table-cell>
            <md-table-cell>{{ tli.bids.latestBids ? tli.bids.latestBids.length : '-' }}</md-table-cell>
            <md-table-cell>
              <span v-if="tli.bids.latestBids">{{ tli.bids.minBidRate | currency }}</span>
              <span v-else>-</span>
            </md-table-cell>
            <md-table-cell>
              <span v-if="tli.bids.latestBids">{{ tli.bids.maxBidRate | currency }}</span>
              <span v-else>-</span>
            </md-table-cell>
            <md-table-cell>
              <span v-if="tli.bids.latestBids">{{ tli.bids.averageRate | currency }}</span>
              <span v-else>-</span>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </div>


      <!-- Bids -->
      <div v-if="activeTab === 'bids'">

        <div class="md-layout">
          <div class="md-layout-item">

            <md-card class="md-elevation-0">

              <md-card-expand>
                <md-card-actions md-alignment="space-between">

                  <div>
                    <md-card-expand-trigger>
                      <md-button class="md-icon-button">
                        <md-icon>keyboard_arrow_down</md-icon>
                      </md-button>
                    </md-card-expand-trigger>

                    <span style="display: inline-block; margin-top: 10px">
                      Viewing Bid: 
                      {{ (Object.keys(activeBid).length !== 0) ? activeBid.createdBy.name : 'none' }}
                    </span>
                  </div>

                  <div>
                    <span style="display: inline-block; margin: 10px 10px 0px 0px;">
                      {{ bids.length }}
                    </span>
                  </div>

                </md-card-actions>

                <md-card-expand-content>
                  <md-card-content>
                    <p style="cursor: pointer;" v-for="(bid, idx) in bids" :key="bid._id" @click="setActiveBid(bid)">
                      {{ idx+1 }}. {{ bid.createdBy.name }}
                    </p>
                  </md-card-content>
                </md-card-expand-content>
              </md-card-expand>

            </md-card>

          </div>
        </div>

        <BidView v-show="Object.keys(activeBid).length !== 0" :bidId="activeBid._id" />

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

          <div class="md-layout-item" style="padding: 8px;">

            <p class="md-title">Settings</p>
            <md-field>
              <label>Description</label>
              <md-textarea v-model="description"></md-textarea>
            </md-field>

          </div>

        </div>
        
      </div>
      </div>

    </div>

    <div v-if="msgTitle !== null">
      <div class="md-layout">
        <div class="md-layout-item">
          <p class="md-title">{{ msgTitle }}</p>
          <span class="md-body-2">{{ msgText }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import BidView from '@/components/BidView.vue';
import LineItemDetails from '@/components/LineItemDetails.vue';
import BidSlotDetails from '@/components/BidSlotDetails.vue';

let ctx;
let key_linkedTenderId = "test_tenderId4";

export default {
  components: {
    BidView,
    LineItemDetails,
    BidSlotDetails
  },
  data () {
    return {
      currBoardData: null,
      tenderLineItems: [],
      cols: [],
      linkedTenderId: null,

      description: null,
      mustBidOnAll: false,
      priceRevealSettings: {
        count: false,
        range: false,
        average: false,
        median: false,
        full: false,
      },

      tender: null,
      bids: [],
      activeBid: {},

      activeTab: 'tender',
      isProcessing: false,
      msgTitle: null,
      msgText: null
    };
  },
  computed: {
    redirectUrl() {
      return (process.env.NODE_ENV === 'production') ? window.location.origin : "http://localhost:4001"
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

    if(!this.hasMondayConnected) {
      this.msgTitle = "Connect with BidFriday";
      this.msgText = "Allow BidFriday to talk to your Monday account to start syncing data. Use the 'Connect' button in the top row to link your accounts.";
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
    async sync() {
      while(!ctx) await this.wait(200);
      this.isProcessing = true;
      await this.updateToTender();
      await this.updateFromTender();
      this.isProcessing = false;
    },
    async updateFromTender() {
      while(!ctx) await this.wait(200);

      let res, postData;

      let boardId = ctx.boardId;
      let queryStr = `query { boards (ids: ${boardId}) { id name columns { id title } items { id name column_values { text value } } } }`;
      res = await this.monday.api(queryStr);
      this.currBoardData = res.data.boards[0];
      let specsColIdx = this.currBoardData.columns.findIndex(c => c.title.toLowerCase() === 'specifications') - 1;
      let unitsColIdx = this.currBoardData.columns.findIndex(c => c.title.toLowerCase() === 'units') - 1;
      let qtyColIdx = this.currBoardData.columns.findIndex(c => c.title.toLowerCase() === 'quantity') - 1;
      let rateColIdx = this.currBoardData.columns.findIndex(c => c.title.toLowerCase() === 'rate') - 1;
      this.tenderLineItems = this.currBoardData.items.map(row => {
        return {
          row: row,
          id: row.id,
          name: row.name,
          specifications: row.column_values[specsColIdx].text,
          units: row.column_values[unitsColIdx].text,
          quantity: row.column_values[qtyColIdx].text,
          rate: row.column_values[rateColIdx].text,
          total: parseFloat(row.column_values[qtyColIdx].text) * parseFloat(row.column_values[rateColIdx].text),
          bids: {},
          tenderLineItem: {}
        }
      });
      this.cols = this.currBoardData.columns;

      res = await this.monday.storage.instance.getItem(key_linkedTenderId);
      this.linkedTenderId = res.data.value;
      postData = {
        tId: this.linkedTenderId,
        includeStaleBids: true
      };
      res = await this.$api.post('/api/get-tender-and-bids', postData);

      if (!res.data) return;

      let tData = res.data.tender;
      this.tender = tData;
      this.description = this.tender.description;
      this.mustBidOnAll = this.tender.mustBidOnAll;
      this.priceRevealSettings = (this.tender.priceRevealSettings) ? JSON.parse(this.tender.priceRevealSettings) : {};

      for(let tSlot of this.tender.slots) {
        let tli = this.tenderLineItems.filter(t => {
          return t.id.toString() === tSlot.mondayItemId.toString();
        })[0];
        if (tli) tli.tenderLineItem = tSlot.tenderLineItems[tSlot.tenderLineItems.length - 1];
      }

      this.bids = res.data.bids;
      if (this.bids.length > 0) await this.setActiveBid(this.bids[0]);

      let bidStats = res.data.bidStats;
      for(let bidStat of bidStats) {
        let mdId = bidStat.mondayItemId;
        let tli = this.tenderLineItems.filter(t => {
          return t.id.toString() === mdId.toString()
        })[0];
        tli = (tli) ? tli : {};
        tli.bids = bidStat;
      }
      
      this.linkedTenderId = this.tender._id;
      res = await this.monday.storage.instance.setItem(key_linkedTenderId, this.linkedTenderId);

    },
    async updateToTender() {

      let res;

      res = await this.monday.storage.instance.getItem(key_linkedTenderId);
      this.linkedTenderId = res.data.value;
      let postData = {
        requestBoardId: this.currBoardData.id,
        tenderId: this.linkedTenderId,
        mustBidOnAll: this.mustBidOnAll,
        description: this.description,
        priceRevealSettings: JSON.stringify(this.priceRevealSettings)
      };
      res = await this.$api.post('/api/create-or-update-tender', postData);
      this.linkedTenderId = res.data._id;

      res = await this.monday.storage.instance.setItem(key_linkedTenderId, this.linkedTenderId);

    },
    async openItemCard(itemId) {
      this.monday.execute('openItemCard', { itemId: itemId });
    },
    copyToClipboard(content) {
      navigator.clipboard.writeText(content);
    },
    showDetails(item) {
      this.$refs.itemDetails.showDetails(item, this.tender.createdBy);
    },
    showBidSlotDetails(bids, tenderLineItem) {
      this.$refs.bidSlotDetails.showBidSlotDetails(bids, tenderLineItem);
    },
    async setActiveBid(activeBid) {
      this.activeBid = activeBid;
      this.eventBus.$emit('refreshBidView');
    }
  }
}
</script>

<style scoped>
</style>
