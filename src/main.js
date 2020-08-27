import Vue from 'vue';
import App from './App.vue';
import router from '@/router';
import mondaySdk from 'monday-sdk-js';
import axios from 'axios';

import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';

Vue.use(require('vue-moment'));
import VueCurrencyFilter from 'vue-currency-filter';

import { Auth0Plugin } from "./auth";

Vue.use(VueMaterial);

Vue.use(VueCurrencyFilter,
  {
    symbol : '$',
    thousandsSeparator: ',',
    fractionCount: 2,
    fractionSeparator: '.',
    symbolPosition: 'front',
    symbolSpacing: false
  }
);

Vue.prototype.wait = async function(ms) {
	return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

Vue.prototype.eventBus = new Vue();

Vue.prototype.isInMonday = false;

async function main() {

  let $api = axios.create();
  Vue.prototype.$api = $api;

  let res;
  
  try {
    let monday = mondaySdk();
    res = await monday.api('query { me { id name email country_code location url account { id name } } }');
    let mdUser = res.data.me;
    Vue.prototype.isInMonday = true;
    Vue.prototype.monday = monday;
    Vue.prototype.mdUser = mdUser;
  } catch(excp) {
    console.log('Not monday');
  }
  
  if (Vue.prototype.isInMonday) {

    Vue.prototype.$auth = {};
    let resp = await Vue.prototype.$api.post('/api/users', Vue.prototype.mdUser);
    Vue.prototype.bfUser = resp.data.user;
    Vue.prototype.bftoken = resp.data.bftoken;
    Vue.prototype.hasMondayConnected = resp.data.hasMondayConnected;
    Vue.prototype.$api.defaults.headers.common["email"] = Vue.prototype.bfUser.email;
    Vue.prototype.$api.defaults.headers.common["bftoken"] = Vue.prototype.bftoken;
    
  } else {

    let domain = process.env.VUE_APP_AUTH0_DOMAIN;
    let clientId = process.env.VUE_APP_AUTH0_CLIENT_ID;
    Vue.use(Auth0Plugin, {
      domain,
      clientId,
      onRedirectCallback: appState => {
        router.push(
          appState && appState.targetUrl
            ? appState.targetUrl
            : window.location.pathname
        );
      }
    });

  }
  
  Vue.config.productionTip = false;
  
  new Vue({
    el: '#app',
    router,
    render: h => h(App),
  });

}

main();