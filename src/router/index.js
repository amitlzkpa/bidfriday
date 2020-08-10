import Vue from 'vue';
import VueRouter from 'vue-router';
import About from '@/components/About.vue';
import Body from '@/components/Body.vue';


Vue.use(VueRouter);


export default new VueRouter({
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/monday/request',
      name: 'MondayRequest',
      component: Body
    }
  ]
});
