<template>
  <div v-if="detailsItem !== null">
    <md-dialog :md-active.sync="showDetailsDialog">
      <md-dialog-title>{{ detailsItem.name }}</md-dialog-title>

      <md-dialog-content class="dialog-size">

        <div class="md-layout">
          <div class="md-layout-item">
            <p>{{ detailsItem.description }}</p>
          </div>
          
          <div class="md-layout-item md-size-40">

            <md-table>
              <md-table-row>
                <md-table-cell>Units</md-table-cell>
                <md-table-cell>{{ detailsItem.units }}</md-table-cell>
              </md-table-row>
              
              <md-table-row>
                <md-table-cell>Qty</md-table-cell>
                <md-table-cell>{{ detailsItem.quantity }}</md-table-cell>
              </md-table-row>
              
              <md-table-row>
                <md-table-cell>Rate</md-table-cell>
                <md-table-cell>{{ detailsItem.rate }}</md-table-cell>
              </md-table-row>
              
              <md-table-row>
                <md-table-cell>Total</md-table-cell>
                <md-table-cell>{{ detailsItem.total }}</md-table-cell>
              </md-table-row>
            </md-table>

          </div>
        </div>

        <div class="md-layout">
          <div class="md-layout-item">

            <b>Specifications:</b>
            <div>
              {{ detailsItem.specifications }}
            </div>

          </div>
        </div>

        <br />

        <div class="md-layout">
          <div class="md-layout-item">

            <b>Sample Images:</b>
            <div>
              <a target="_blank" :href="url" v-for="(url, idx) in sampleImgURLS" :key="idx">
                <img :src="url" class="sample-image">
              </a>
            </div>
          
          </div>
        </div>

        <br />

        <div class="md-layout">
          <div class="md-layout-item">

            <b>Attached Files:</b>
            <div>

              <span v-if="detailsItem.attachmentFiles">
                <span v-for="file in detailsItem.attachmentFiles.files" :key="file.assetId">
                  <md-chip @click="dlFile(file.assetId)" style="margin-right: 2px;" md-clickable>{{ file.name }}</md-chip>
                </span>
              </span>
              
            </div>

          </div>
        </div>

      </md-dialog-content>

      <md-dialog-actions>
        <span class="md-caption" style="flex: 1">{{ detailsItem.updatedAt }}</span>
        <md-button class="md-primary" @click="showDetailsDialog = false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      detailsItem: null,
      assetOwner: null,
      showDetailsDialog: false,
      sampleImgURLS: []
    }
  },
  methods: {
    async showDetails(item, assetOwner) {
      this.showDetailsDialog = true;
      this.detailsItem = item;
      this.assetOwner = assetOwner;
      let att = JSON.parse(this.detailsItem.attachments);
      this.detailsItem.attachmentFiles = JSON.parse(att.value);
      this.sampleImgURLS = [];
      let smp = JSON.parse(this.detailsItem.sampleImages);
      let fileData = JSON.parse(smp.value);
      if (!fileData) return;
      for(let fd of fileData.files) {
        let d = await this.getAssetData(fd.assetId);
        this.sampleImgURLS.push(d.assets[0].public_url);
      }
    },
    async dlFile(asssetId) {
      let res = await this.getAssetData(asssetId);
      let dlURL = res.assets[0].public_url;
      window.location = dlURL;
    },
    async getAssetData(asssetId) {
      let postData = {
        assetId: asssetId,
        creatorEmail: this.assetOwner.email
      }
      let postURL = `/api/asset`;
      let res = await this.$api.post(postURL, postData);
      return res.data;
    }
  }
}
</script>

<style scoped>
.dialog-size {
  width: 60vw;
  height: 70vh;
}

.sample-image {
  margin: 4px;
  height: 200px;
  width: 200px;
  object-fit: cover;
}
</style>