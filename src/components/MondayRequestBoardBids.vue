<template>
  
  <div class="md-layout">
    <div class="md-layout-item" style="padding: 12px;">

      <md-card v-for="bid in bids" :key="bid._id" style="margin-bottom: 8px;">
        <md-card-header>
          <div class="md-title">{{ bid.tender.name }}</div>
        </md-card-header>

        <md-card-content>
          <p>Total items on tender: {{ bid.tender.slots.length }}</p>
          <p>Total items bid for: {{ bid.slots.length }}</p>
        </md-card-content>

        <md-card-actions>
          <md-button>
            <router-link :to="'/bid-edit/' + bid.tender._id + '/' + bid._id">Edit</router-link>
          </md-button>

          <md-button>
            <router-link :to="'/bid-view/' + bid._id">View</router-link>
          </md-button>
        </md-card-actions>
      </md-card>

    </div>
  </div>

</template>

<script>
export default {
  props: ['bids']
}
</script>

<style scoped>

</style>