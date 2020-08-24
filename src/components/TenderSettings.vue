<template>
  <div>
    <p v-if="priceRevealType === 'concealed'">
      <md-icon>visibility_off</md-icon>
      <md-tooltip md-delay="300">Concealed: No information from other bids shown.</md-tooltip>
      Bids Reveal
    </p>
    <p v-if="priceRevealType === 'lowest'">
      <md-icon>gavel</md-icon>
      <md-tooltip md-delay="300">Lowest: Information from the lowest bids shown.</md-tooltip>
      Bids Reveal
    </p>
    <p v-if="priceRevealType === 'public'">
      <md-icon>visibility</md-icon>
      <md-tooltip md-delay="300">Public: Information from all bids shown.</md-tooltip>
      Bids Reveal
    </p>
    
    <p v-if="mustBidOnAll">
      <md-icon>check_circle</md-icon>
      <md-tooltip md-delay="300">Must bid for all items on tender.</md-tooltip>
      Complete Bids
    </p>
    <p v-else>
      <md-icon>remove_circle_outline</md-icon>
      <md-tooltip md-delay="300">Choice to submit partial bids.</md-tooltip>
      Partial Bids
    </p>
  </div>
</template>

<script>
export default {
  props: ['priceRevealType', 'mustBidOnAll']
}
</script>