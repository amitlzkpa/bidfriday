<template>
  <div v-if="detailsItem !== null">
    <md-dialog :md-active.sync="showDetailsDialog">
      <md-dialog-title>Foo</md-dialog-title>

      <md-dialog-content class="dialog-size">
        {{  detailsItem}}
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
      detailsItem: null,
      showDetailsDialog: false,
    }
  },
  methods: {
    async showBidSlotDetails(item) {
      this.showDetailsDialog = true;
      this.detailsItem = item;
      console.log(this.detailsItem);
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