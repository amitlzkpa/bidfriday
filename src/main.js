import Vue from 'vue';
import App from './App.vue';
import router from '@/router';
import mondaySdk from 'monday-sdk-js';
import axios from 'axios';

Vue.prototype.wait = async function(ms) {
	return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

Vue.prototype.$api = axios.create();

Vue.prototype.monday = mondaySdk();

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  router,
  render: h => h(App),
});
