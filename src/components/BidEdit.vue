<template>
  <div>
    
    <LineItemDetails ref="itemDetails" />

    <div class="md-layout" style="padding: 8px;">
      <div class="md-layout-item">

        <div class="md-layout">

          <div class="md-layout-item">
            <h1 class="md-title">{{ tenderName }}</h1>
            <p class="md-caption" style="min-height: 4vh;">{{ tenderDescription }}</p>
          </div>

          <div class="md-layout-item">
            <md-field>
              <label>Description</label>
              <md-textarea v-model="bidDescription" md-autogrow></md-textarea>
            </md-field>
          </div>

        </div>

      </div>
      <div class="md-layout-item md-size-15">
        <TenderSettings
          :priceRevealType="priceRevealType"
          :mustBidOnAll="mustBidOnAll"
        />
      </div>
    </div>


    <md-card style="padding: 8px;">
      <div class="md-layout" style="padding: 10px 0px 10px 0px;">

        <div class="md-layout-item md-size-10" style="text-align: center;">
          <span style="cursor: pointer;" @click="toggleAll">Open All</span>
        </div>
        
        <div class="md-layout-item md-size-40">
          <span class="md-subtitle">Item</span>
        </div>
        
        <div class="md-layout-item md-size-10" style="text-align: center;">
          <span class="md-subtitle">Quantity</span>
        </div>
        
        <div class="md-layout-item md-size-10" style="text-align: center;">
          <span class="md-subtitle">Reference</span>
        </div>
        
        <div class="md-layout-item md-size-15" style="text-align: right;">
          <span class="md-subtitle">Quote</span>
        </div>
        
        <div class="md-layout-item md-size-15" style="text-align: right;">
          <span class="md-subtitle">Total</span>
        </div>

      </div>
    </md-card>

    <md-card v-for="slotData of slots" :key="slotData.index">
      <md-card-header>
        
        <div class="md-layout">

          <div class="md-layout-item md-size-10" style="text-align: center;">
            <md-button class="md-icon-button" @click="showDetails(slotData.tenderLineItem)">
              <md-icon>info</md-icon>
            </md-button>

            <md-card-expand-trigger :ref="'tglBtn-' + slotData.index">
              <md-button class="md-icon-button">
                <md-icon>keyboard_arrow_down</md-icon>
              </md-button>
            </md-card-expand-trigger>
          </div>

          <div class="md-layout-item md-size-40">
            {{ slotData.index }}.
            <span class="md-headline">{{ slotData.tenderLineItem.name }}</span>
          </div>

          <div class="md-layout-item md-size-10" style="padding-top: 6px; text-align: center;">
            <span class="md-subhead">{{ slotData.tenderLineItem.quantity }} {{ slotData.tenderLineItem.units }}</span>
          </div>

          <div class="md-layout-item md-size-10" style="padding-top: 6px; text-align: center;">
            <span class="md-subhead">
              <span>{{ slotData.tenderLineItem.rate | currency }}</span>
            </span>
          </div>

          <div class="md-layout-item md-size-15" style="text-align: right;">
            <span class="md-body-2">$</span>
            &nbsp;
            <span contenteditable
            @focus="selectText"
            style="width: 70%;"
            @input="ev => contentUpdate(ev, slotData.bidLineItem, 'rate', true)"
            class="md-subheading content-editable">{{ slotData.bidLineItem.rate }}</span>
          </div>

          <div class="md-layout-item md-size-15" style="text-align: right;">
            <span class="md-body-1">{{ (slotData.bidLineItem.rate * slotData.tenderLineItem.quantity) | currency }}</span>
          </div>
        </div>
        
      </md-card-header>

      <md-card-expand>

        <md-card-expand-content>
          <md-card-content>
            
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
      <md-button @click="submitBid" class="md-primary">Submit</md-button>
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

      bId: null,
      bidDescription: null,
      bidCreatedBy: null,
      bidTotal: 0,
      
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
  methods: {
    async refresh() {
      let postData;
      let res;
      let bData;
      let tData;
      
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

      this.bidDescription = (isNewBid) ? null : bData.description;
      this.bidCreatedBy = (isNewBid) ? null : bData.createdBy;

      if (isNewBid) {
        this.slots = tData.slots.map((s, idx) => {
          let slotData = {};
          slotData.index = idx + 1;
          let tis = s.tenderLineItems;
          slotData.tenderLineItem = tis[tis.length - 1];
          let bidLineItem = {
            name: null,
            specifications: null,
            description: null,
            rate: 0
          };
          slotData.bidLineItem = bidLineItem;
          return slotData;
        });
      } else {
        this.slots = bData.slots.map((s, idx) => {
          let slotData = {};
          slotData.index = idx + 1;
          let tis = s.tenderSlot.tenderLineItems;
          slotData.tenderLineItem = tis[tis.length - 1];
          let bis = s.bidLineItems;
          slotData.bidLineItem = bis[bis.length - 1];
          slotData.tenderLineItem.total = slotData.tenderLineItem.quantity * slotData.bidLineItem.rate;
          return slotData;
        });
      }
      this.updateBidTotal();
    },
    async submitBid() {
      let slotData = this.slots.map(s => {
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
      this.refresh();
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
        this.bidTotal += slotData.tenderLineItem.quantity * slotData.bidLineItem.rate;
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
</style>