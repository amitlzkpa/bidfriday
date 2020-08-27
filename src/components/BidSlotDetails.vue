<template>
  <div v-if="bids !== null">
    <md-dialog :md-active.sync="showDetailsDialog">
      <md-dialog-title>
        
        <div style="display: flex;">
          <span class="md-title" style="flex: 1">{{ tenderLineItem.name }}</span>
          <span>Qty: {{ tenderLineItem.quantity }}</span>
        </div>

      </md-dialog-title>

      <md-dialog-content class="dialog-size">

        <p class="md-body-2">
          Latest Bids:
        </p>

        <br />

        <md-card v-for="bli in bids.latestBids" :key="bli._id" style="margin-bottom: 8px;">
          <md-card-header>

            <div style="display: flex;">
              <span style="flex: 1">
                <md-card-expand-trigger>
                  <md-button class="md-icon-button">
                    <md-icon>keyboard_arrow_down</md-icon>
                  </md-button>
                </md-card-expand-trigger>
                <span class="md-subheading">
                  {{ bli.name }}
                </span>
              </span>
              &nbsp;
              <span class="md-subhead">{{ bli.rate | currency }}</span>
            </div>

          </md-card-header>

          <md-card-expand>
            <md-card-expand-content>
              <md-card-content>

                <div class="md-layout">
                  <div class="md-layout-item">
                    <span class="md-caption">Specifications</span><br />
                    {{ bli.specifications }}
                  </div>
                  <div class="md-layout-item">
                    <span class="md-caption">Description</span><br />
                    {{ bli.description }}
                  </div>
                </div>

                <div class="md-layout">
                  <div class="md-layout-item">
                    <span class="md-caption">Last updated: {{ bli.updatedAt | moment("calendar") }}</span><br />
                    <span class="md-caption">Submitted by: {{ bli.createdBy.name }}</span><br />
                  </div>
                </div>

              </md-card-content>
            </md-card-expand-content>
          </md-card-expand>
        </md-card>


        

        <p class="md-body-2">
          Bids Price History:
        </p>

        <div>
        </div>


        <div v-for="histItem in bids.bidwiseBidsHistory" :key="histItem._id">
          <span class="md-caption">Submitted by: {{ histItem.bid.createdBy.name }}</span><br />

          <div style="max-width: 2000px; overflow-x: auto; overflow-x: hidden; padding: 12px 0px 12px 0px;">
            <div v-for="(hi, hiIdx) in histItem.history" :key="hiIdx" style="display: inline-block;">
              {{ hi.rate | currency }}
              <span style="margin: 0px 3px 0px 3px;" v-if="hiIdx !== histItem.history.length - 1">
                <md-icon>keyboard_arrow_right</md-icon>
              </span>
              <md-tooltip md-direction="bottom">{{ hi.name }}</md-tooltip>
            </div>
          </div>
          
        </div>

        
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="showDetailsDialog = false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      bids: null,
      tenderLineItem: null,
      showDetailsDialog: false
    }
  },
  methods: {
    async showBidSlotDetails(bids, tenderLineItem) {
      this.showDetailsDialog = true;
      this.bids = bids;
      this.tenderLineItem = tenderLineItem;
      console.log(this.tenderLineItem);
      console.log(this.bids);
    }
  }
}
</script>

<style scoped>
.dialog-size {
  width: 60vw;
  height: 70vh;
}
</style>