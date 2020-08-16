import Vue from 'vue';
import App from './App.vue';
import router from '@/router';
import mondaySdk from 'monday-sdk-js';
import axios from 'axios';

Vue.prototype.wait = async function(ms) {
	return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

Vue.prototype.isInMonday = false;

async function main() {

  let $api = axios.create();
  Vue.prototype.$api = $api;
  
  try {
    let monday = mondaySdk();
    let res = await monday.api('query { me { id name email country_code location url account { id name } } }');
    let user = res.data.me;
    $api.defaults.headers.common['email'] = user.email;
    Vue.prototype.isInMonday = true;
    Vue.prototype.monday = monday;
    Vue.prototype.user = user;
  } catch(excp) {
    console.log('Not monday');
  }
  
  Vue.config.productionTip = false;
  
  new Vue({
    el: '#app',
    router,
    render: h => h(App),
  });

}

main();