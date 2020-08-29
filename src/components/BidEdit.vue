<template>
  <div>
    
    <LineItemDetails ref="itemDetails" />

    <div class="md-layout" style="padding: 8px;">

      <div class="md-layout-item md-large-size-50 md-small-size-100">
        <h1 class="md-title">{{ tenderName }}</h1>
        <p class="md-caption" style="min-height: 4vh;">{{ tenderDescription }}</p>
      </div>

      <div class="md-layout-item md-large-size-30 md-small-size-60">
        <span class="md-caption">Last updated: &nbsp; {{ tenderLastUpdatedAt | moment("calendar") }}</span>
        <md-field>
          <label>Description</label>
          <md-textarea v-model="bidDescription" md-autogrow></md-textarea>
        </md-field>
      </div>
  
      <div class="md-layout-item md-large-size-20 md-small-size-40">
        <TenderSettings
          :priceRevealType="priceRevealType"
          :mustBidOnAll="mustBidOnAll"
        />
      </div>
      
    </div>


    <md-card style="padding: 8px;">
      <div class="md-layout" style="padding: 10px 0px 10px 0px;">

        <div class="md-layout-item md-large-size-25 md-xsmall-size-30" style="text-align: center;">
          <span style="cursor: pointer;" @click="toggleAll">Open All</span>
        </div>
        
        <div class="md-layout-item md-large-size-30 md-xsmall-size-70">
          <span class="md-subtitle">Item</span>
        </div>
        
        <div class="md-layout-item md-large-size-10 md-xsmall-size-20" style="text-align: center;">
          <span class="md-subtitle">Quantity</span>
        </div>
        
        <div class="md-layout-item md-large-size-10 md-xsmall-size-20" style="text-align: center;">
          <span class="md-subtitle">Reference</span>
        </div>
        
        <div class="md-layout-item md-large-size-10 md-xsmall-size-30" style="text-align: right;">
          <span class="md-subtitle">Quote</span>
        </div>
        
        <div class="md-layout-item md-large-size-15 md-xsmall-size-30" style="text-align: right;">
          <span class="md-subtitle">Total</span>
        </div>

      </div>
    </md-card>

    <md-card v-for="slotData of slots" :key="slotData.index">
      <md-card-header>
        
        <div class="md-layout">

          <div class="md-layout-item md-large-size-25 md-xsmall-size-30" style="text-align: center;">

            <md-button class="md-icon-button" v-if="slotData.updateState === 'updated'">
              <md-icon>new_releases</md-icon>
              <md-tooltip md-direction="right">
                The item has changed since the bid was submitted.
              </md-tooltip>
            </md-button>
            <md-button class="md-icon-button" v-if="slotData.updateState === 'new'">
              <md-icon>add_circle</md-icon>
              <md-tooltip md-direction="right">
                The item was added new after the bid was submitted.
              </md-tooltip>
            </md-button>
            <md-button class="md-icon-button" v-if="slotData.updateState === 'removed'">
              <md-icon>remove_circle</md-icon>
              <md-tooltip md-direction="right">
                The item has been removed since the bid was submitted.
              </md-tooltip>
            </md-button>

            <md-button class="md-icon-button" v-if="!mustBidOnAll" @click="slotData.deselected = !slotData.deselected; updateBidTotal()">
              <md-icon v-if="!slotData.deselected">remove</md-icon>
              <md-icon v-else>add</md-icon>
            </md-button>
            
            <md-button class="md-icon-button" @click="showDetails(slotData.tenderLineItem)">
              <md-icon>info</md-icon>
            </md-button>

            <md-card-expand-trigger :ref="'tglBtn-' + slotData.index">
              <md-button class="md-icon-button">
                <md-icon>keyboard_arrow_down</md-icon>
              </md-button>
            </md-card-expand-trigger>

          </div>

          <div class="md-layout-item md-large-size-30 md-xsmall-size-70">
            {{ slotData.index }}.
            <span :style="slotData.deselected ? 'color: #BBBBBB' : 'color: #000000'"
                  :class="(slotData.tenderLineItem.name !== slotData.latestTenderItem.name) ? 'highlightUpdatedField' : '' "
                  class="md-headline"
            >
              {{ slotData.tenderLineItem.name }}
              <md-tooltip v-if="slotData.updateState === 'updated'">
                Updated from {{ slotData.tenderLineItem.name }} to {{ slotData.latestTenderItem.name }}.
              </md-tooltip>
            </span>
          </div>

          <div class="md-layout-item md-large-size-10 md-xsmall-size-20" style="padding-top: 6px; text-align: center;">
            <span class="md-subhead" :class="(slotData.tenderLineItem.quantity !== slotData.latestTenderItem.quantity)
                                          || (slotData.tenderLineItem.units !== slotData.latestTenderItem.units) ? 'highlightUpdatedField' : '' "
            >
              {{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }}
              <md-tooltip v-if="slotData.updateState === 'updated'">
                Updated from {{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }} to {{ slotData.latestTenderItem.quantity }} {{ slotData.latestTenderItem.units }}.
              </md-tooltip>
            </span>
          </div>

          <div class="md-layout-item md-large-size-10 md-xsmall-size-20" style="padding-top: 6px; text-align: center;">
            <span class="md-subhead">
              <span :class="(slotData.tenderLineItem.rate !== slotData.latestTenderItem.rate) ? 'highlightUpdatedField' : '' ">
                {{ slotData.tenderLineItem.rate | currency }}
                <md-tooltip v-if="slotData.updateState === 'updated'">
                  Updated from {{ slotData.tenderLineItem.rate | currency }} to {{ slotData.latestTenderItem.rate | currency }}.
                </md-tooltip>
              </span>
            </span>
          </div>

          <div class="md-layout-item md-large-size-10 md-xsmall-size-30" style="text-align: right;">
            <span :class="(slotData.updateState !== 'removed') ? 'md-body-2' : 'md-caption'">$</span>
            &nbsp;
            <span :contenteditable="!slotData.deselected && slotData.updateState !== 'removed'"
            :class="((slotData.updateState !== 'removed') ? 'md-subheading' : 'md-caption') + ' ' + 
                    ((!slotData.deselected && slotData.updateState !== 'removed') ? 'content-editable' : '')"
            @focus="ev => { if (!slotData.deselected && slotData.updateState !== 'removed') selectText(ev) }"
            @input="ev => { if (!slotData.deselected && slotData.updateState !== 'removed') contentUpdate(ev, slotData.bidLineItem, 'rate', true) }"
            style="width: 70%;">{{ slotData.deselected ? '-' : slotData.bidLineItem.rate }}</span>
          </div>

          <div class="md-layout-item md-large-size-15 md-xsmall-size-30" style="text-align: right;">
            <span class="md-body-1">{{ slotData.deselected ? '-' : (slotData.bidLineItem.rate * slotData.tenderLineItem.quantity) | currency }}</span>
          </div>
        </div>
        
      </md-card-header>

      <md-card-expand>

        <md-card-expand-content>
          <md-card-content v-if="!slotData.deselected">
            
            <div class="md-layout md-gutter" style="margin-bottom: 8px;">

              <div class="md-layout-item">
                <p class="md-subhead">
                  Name
                </p>
                <span contenteditable
                style="width: 100%;"
                @input="ev => contentUpdate(ev, slotData.bidLineItem, 'name')"
                class="md-subheading content-editable">{{ slotData.bidLineItem.name }}</span>
              </div>

            </div>
            
            
            <div class="md-layout md-gutter">

              <div class="md-layout-item">
                <p class="md-subhead">Specifications</p>
                <span contenteditable
                style="width: 100%; min-height: 60px;"
                @input="ev => contentUpdate(ev, slotData.bidLineItem, 'specifications')"
                class="md-subheading content-editable">{{ slotData.bidLineItem.specifications }}</span>
              </div>

              <div class="md-layout-item">
                <p class="md-subhead">Description</p>
                <span contenteditable
                style="width: 100%; min-height: 60px;"
                @input="ev => contentUpdate(ev, slotData.bidLineItem, 'description')"
                class="md-subheading content-editable">{{ slotData.bidLineItem.description }}</span>
              </div>

            </div>

          </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>

    <md-card style="padding: 8px;">
      <div class="md-layout" style="padding: 10px 0px 10px 0px;">

        <div class="md-layout-item md-size-70">
        </div>
        
        <div class="md-layout-item md-size-30" style="text-align: right;">
          <span class="md-subtitle">Total:</span>
          &nbsp;&nbsp;
          <span class="md-title">{{ bidTotal | currency }}</span>
        </div>

      </div>
    </md-card>

    <md-card-actions>
      <span v-if="bidLastUpdatedAt" class="md-caption">Last updated: &nbsp; {{ bidLastUpdatedAt | moment("calendar") }}</span>
      <md-button :disabled="!hasAllFieldsPopulated" @click="submitBid" class="md-primary">Submit</md-button>
    </md-card-actions>

  </div>
</template>

<script>
import TenderSettings from '@/components/TenderSettings.vue';
import LineItemDetails from '@/components/LineItemDetails.vue';

export default {
  components: {
    TenderSettings,
    LineItemDetails
  },
  props: ['tenderId', 'bidId'],
  data () {
    return {
      tenderName: null,
      tenderDescription: null,
      priceRevealType: null,
      mustBidOnAll: false,
      slots: [],
      tenderCreatedBy: null,
      tenderLastUpdatedAt: null,

      bId: null,
      bidDescription: null,
      bidCreatedBy: null,
      bidTotal: 0,
      bidLastUpdatedAt: null,
      bidHasUpdates: false,
      
      showDetailsDialog: false,
      detailsItem: {},
      sampleImgURLS: []
    };
  },
  created() {
    if (this.bidId) {
      this.bId = this.bidId;
    }
  },
  async mounted() {

    this.refresh();

  },
  computed:{
    hasAllFieldsPopulated() {
      for (let s of this.slots) {
        if (s.deselected) continue;
        if (!s.bidLineItem.rate || !s.bidLineItem.name || s.bidLineItem.name === "") return false;
      }
      return true;
    }
  },
  methods: {
    async refresh() {
      let postData;
      let res;
      let bData;
      let tData;
      
      this.updateState = 'unchanged';
      let isNewBid = !(this.bidId);
      if (isNewBid) {
        postData = { tId: this.tenderId };
        res = await this.$api.post('/api/get-tender', postData);
        tData = res.data.tender;
      } else {
        postData = { bId: this.bId };
        res = await this.$api.post('/api/get-bid', postData);
        bData = res.data;
        tData = bData.tender;
      }
      console.log(tData);
      console.log(bData);

      this.tenderName = tData.name;
      this.tenderDescription = tData.description;
      this.priceRevealType = tData.priceRevealType;
      this.mustBidOnAll = tData.mustBidOnAll;
      this.tenderCreatedBy = tData.createdBy;
      this.tenderLastUpdatedAt = tData.updatedAt;

      this.bidDescription = (isNewBid) ? null : bData.description;
      this.bidCreatedBy = (isNewBid) ? null : bData.createdBy;
      this.bidLastUpdatedAt = (isNewBid) ? null : bData.updatedAt;

      if (isNewBid) {
        this.slots = tData.slots.map((s, idx) => {
          let slotData = {};
          slotData.index = idx + 1;
          let tis = s.tenderLineItems;
          slotData.tenderLineItem = tis[tis.length - 1];
          slotData.latestTenderItem = (tis.length > 0) ? tis[tis.length - 1] : {};
          let bidLineItem = {
            name: null,
            specifications: null,
            description: null,
            rate: 0
          };
          slotData.bidLineItem = bidLineItem;
          slotData.deselected = false;
          return slotData;
        });
      } else {
        let newSlots = tData.slots.map(s => s);
        this.slots = bData.slots.map((s, idx) => {
          newSlots = newSlots.filter(ns => ns._id !== s.tenderSlot._id);
          let slotData = {};
          slotData.index = idx + 1;
          let tis = s.tenderSlot.tenderLineItems;
          let bis = s.bidLineItems;
          slotData.latestTenderItem = (tis.length > 0) ? tis[tis.length - 1] : {};
          slotData.bidLineItem = bis[bis.length - 1];
          slotData.tenderLineItem = tis.filter(t => t._id === slotData.bidLineItem.tenderLineItem)[0];
          slotData.updateState = (slotData.tenderLineItem._id === slotData.latestTenderItem._id) ? 'unchanged' 
                               : (s.tenderSlot.status === "inactive") ? 'removed' : 'updated';
          slotData.tenderLineItem.total = slotData.tenderLineItem.quantity * slotData.bidLineItem.rate;
          if (slotData.updateState !== 'unchanged') this.bidHasUpdates = true;
          slotData.deselected = false;
          return slotData;
        });
        let runningIdx = this.slots.length;
        newSlots.forEach((ns, idx) => {
          let slotData = {};
          slotData.index = idx + runningIdx + 1;
          let tis = ns.tenderLineItems;
          slotData.tenderLineItem = tis[tis.length - 1];
          slotData.latestTenderItem = (tis.length > 0) ? tis[tis.length - 1] : {};
          let bidLineItem = {
            name: null,
            specifications: null,
            description: null,
            rate: 0
          };
          slotData.bidLineItem = bidLineItem;
          slotData.updateState = 'new';
          slotData.deselected = false;
          this.slots.push(slotData);
        });
        // TODO: NOT WORKING YET
        // let deletedSlots = bData.slots.filter(s => !tData.slots.includes(s.tenderSlot._id));
      }
      this.updateBidTotal();
      if (this.bidCreatedBy !== null
      && this.bidCreatedBy.email !== this.$auth.bfUser.email) {
        this.$router.push({ name: 'tender-view', params: { tenderId: this.tenderId } });
      }
    },
    async submitBid() {
      let slotData = this.slots.filter(s => !s.deselected).map(s => {
        let slotBidData = {};
        slotBidData.tenderSlotId = s.tenderLineItem.slot;
        slotBidData.tenderLineItemId = s.tenderLineItem._id;
        slotBidData.name = s.bidLineItem.name;
        slotBidData.rate = parseFloat(s.bidLineItem.rate);
        slotBidData.specifications = s.bidLineItem.specifications;
        slotBidData.description = s.bidLineItem.description;
        return slotBidData;
      });
      let bidData = {
        slotData: slotData,
        bidId: this.bId,
        bidDescription: this.bidDescription,
        tenderId: this.tenderId
      };
      let postData = { bidData: bidData };
      let r = await this.$api.post('/api/create-or-update-bid', postData);
      console.log(r.data);
      this.bId = r.data._id;
      this.$router.push({ name: 'bid-edit', params: { tenderId: this.tenderId, bidId: this.bId } });
    },
    toggleAll() {
      let rs = this.$refs;
      Object.keys(rs).filter(k => k.startsWith('tglBtn-')).forEach(k => {
        rs[k][0].$el.click();
      })
    },
    showDetails(item) {
      this.$refs.itemDetails.showDetails(item, this.tenderCreatedBy);
    },
    contentUpdate(e, ref, key, isNum=false) {
      e.target.focus();
      document.execCommand('selectAll', false, null);
      document.getSelection().collapseToEnd();
      if (isNum) {
        if (e.target.innerText === '') {
          ref[key] = 0;
          e.target.innerText = 0;
          this.updateBidTotal();
          return;
        }
        ref[key] = !isNaN(e.target.innerText) ? parseFloat(e.target.innerText) : ref[key];
        this.updateBidTotal();
      } else {
        ref[key] = e.target.innerText;
      }
    },
    selectText(e) {
      let el = e.target;
      let range = document.createRange();
      range.selectNodeContents(el);
      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    },
    updateBidTotal() {
      this.bidTotal = 0;
      this.slots.forEach(slotData => {
        if (!slotData.deselected && slotData.updateState !== 'removed') this.bidTotal += slotData.tenderLineItem.quantity * slotData.bidLineItem.rate;
      });
    }
  }
}
</script>

<style scoped>
.content-editable {
  background-color: #EEEEEE;
  transition: background-color 0.3s;
  border-radius: 3px;
  border: 1px solid #BBBBBB;
  padding: 3px 2px 1px 2px;
  min-width: 20px;
  display:inline-block;
}
.content-editable:hover {
  background-color: #CCCCFF;
}

.highlightUpdatedField {
  background-color: lightsalmon;
  padding: 2px 6px 2px 6px;
  border-radius: 4px;
}
</style>