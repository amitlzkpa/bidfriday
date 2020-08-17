import Vue from 'vue';
import VueRouter from 'vue-router';
import About from '@/components/About.vue';
import MondayRequestBoardView from '@/components/MondayRequestBoardView.vue';
import MondayRequestDashboardView from '@/components/MondayRequestDashboardView.vue';
import MondayBidsBoardView from '@/components/MondayBidsBoardView.vue';
import MondayOAuth from '@/components/MondayOAuth.vue';
import TenderView from '@/components/TenderView.vue';
import SubmitBid from '@/components/SubmitBid.vue';


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
      path: '/tender-view/:tenderId',
      name: 'tender-view',
      component: TenderView,
      props: true
    },
    {
      path: '/submit-bid/:tenderId',
      name: 'submit-bid',
      component: SubmitBid,
      props: true
    },
    {
      path: '/monday/boardview/dashboard',
      name: 'MondayRequestDashboardView',
      component: MondayRequestDashboardView
    },
    {
      path: '/monday/boardview/request',
      name: 'MondayRequestBoardView',
      component: MondayRequestBoardView
    },
    {
      path: '/monday/boardview/bids',
      name: 'MondayBidsBoardView',
      component: MondayBidsBoardView
    },
    {
      path: '/monday/connect',
      name: 'MondayOAuth',
      component: MondayOAuth
    }
  ]
});
