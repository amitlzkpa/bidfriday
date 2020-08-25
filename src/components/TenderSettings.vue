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
  </div>
</template>

<script>
export default {
  props: ['priceRevealType', 'mustBidOnAll']
}
</script>