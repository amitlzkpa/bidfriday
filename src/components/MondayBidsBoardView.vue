<template>
  <div>    
    <button @click="refresh">Refresh</button>
    <p v-for="row in rows" :key="row.name">
      {{ row.name }}
    </p>
  </div>
</template>

<script>

let ctx;

export default {
  data () {
    return {
      user: null,
      currBoardData: null,
      rows: []
    };
  },
  async mounted () {
    let res = await this.monday.api('query { me { id name country_code location url account { id name } } }');
    this.user = res.data.me;

    this.monday.listen("context", async (res) => {
      ctx = res.data;
    });

    this.refresh();

  },
  methods: {
    async refresh() {
      while(!ctx) await this.wait(200);

      let boardId = ctx.boardId;
      let queryStr = `query { boards (ids: ${boardId}) { id name items { name } } }`;
      let res = await this.monday.api(queryStr);
      this.currBoardData = res.data.boards[0];
      this.rows = this.currBoardData.items;
    }
  }
}
</script>

<style scoped>
</style>
