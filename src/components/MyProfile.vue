<template>
  <div>

    <div class="md-layout">
      <div class="md-layout-item" style="padding: 12px;">

        <p>Email: {{ $auth.bfUser.email }}</p>
        
        <md-field>
          <label>Name</label>
          <md-input v-model="name"></md-input>
        </md-field>

        <md-field>
          <label>Phone No</label>
          <md-input v-model="phone"></md-input>
        </md-field>

        <md-field>
          <label>Address</label>
          <md-input v-model="location"></md-input>
        </md-field>

        <md-button class="md-primary md-raised" @click="updateUser()">Update</md-button>

      </div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      name: null,
      phone: null,
      location: null
    }
  },
  async mounted() {
    this.name = this.$auth.bfUser.name;
    this.phone = this.$auth.bfUser.phone;
    this.location = this.$auth.bfUser.location;
  },
  methods: {
    async updateUser() {
      let postData = {
        name: this.name,
        phone: this.phone,
        location: this.location
      }
      let res = await this.$api.post('/api/update-user', postData);
      this.name = res.data.name;
      this.phone = res.data.phone;
      this.location = res.data.location;
    }
  }
}
</script>

<style scoped>

</style>