<template>
  <div v-if="bids !== null">
    <md-dialog :md-active.sync="showDetailsDialog">
      <md-dialog-title>{{ tenderLineItem.name }}</md-dialog-title>

      <md-dialog-content class="dialog-size">

        <span class="md-body-2">
          Latest Bids:
        </span>

        <br />

        <md-card v-for="bli in bids.latestBids" :key="bli._id" style="margin-bottom: 8px;">
          <md-card-header>
            <span style="display: inline-block;">
              <md-card-expand-trigger>
                <md-button class="md-icon-button">
                  <md-icon>keyboard_arrow_down</md-icon>
                </md-button>
              </md-card-expand-trigger>
              <span class="md-subheading" style="margin-top: 20px;">
                {{ bli.name }}
              </span>
            </span>
            <span class="md-subhead" style="display: inline-block; margin-right: 0px;">{{ bli.rate | currency }}</span>
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