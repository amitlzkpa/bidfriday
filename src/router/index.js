import Vue from 'vue';
import VueRouter from 'vue-router';
import About from '@/components/About.vue';
import MondayRequestBoardView from '@/components/MondayRequestBoardView.vue';
import MondayRequestDashboardView from '@/components/MondayRequestDashboardView.vue';
import MondayBidsBoardView from '@/components/MondayBidsBoardView.vue';
import MondayOAuth from '@/components/MondayOAuth.vue';
import TenderView from '@/components/TenderView.vue';
import BidView from '@/components/BidView.vue';
import BidEdit from '@/components/BidEdit.vue';

import { auth0Guard } from "@/auth/auth0Guard";
import { mondayGuard } from "@/auth/mondayGuard";

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
      path: '/bid-edit/:tenderId/:bidId?',
      name: 'bid-edit',
      component: BidEdit,
      props: true,
      beforeEnter: auth0Guard
    },
    {
      path: '/bid-submit/:tenderId',
      name: 'bid-submit',
      component: BidEdit,
      props: true,
      beforeEnter: auth0Guard
    },
    {
      path: '/bid-view/:bidId',
      name: 'bid-view',
      component: BidView,
      props: true,
      beforeEnter: auth0Guard
    },

    {
      path: '/monday/boardview/dashboard',
      name: 'MondayRequestDashboardView',
      component: MondayRequestDashboardView,
      beforeEnter: mondayGuard
    },
    {
      path: '/monday/boardview/request',
      name: 'MondayRequestBoardView',
      component: MondayRequestBoardView,
      beforeEnter: mondayGuard
    },
    {
      path: '/monday/boardview/bids',
      name: 'MondayBidsBoardView',
      component: MondayBidsBoardView,
      beforeEnter: mondayGuard
    },
    {
      path: '/monday/connect',
      name: 'MondayOAuth',
      component: MondayOAuth
    }
  ]
});
