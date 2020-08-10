import Vue from 'vue';
import VueRouter from 'vue-router';
import About from '@/components/About.vue';
import MondayRequestBoardView from '@/components/MondayRequestBoardView.vue';


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
      path: '/monday/boardview/request',
      name: 'MondayRequestBoardView',
      component: MondayRequestBoardView
    }
  ]
});
