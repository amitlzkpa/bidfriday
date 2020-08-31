import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/components/Home.vue';
import MondayRequestBoardView from '@/components/MondayRequestBoardView.vue';
import MondaySetup from '@/components/MondaySetup.vue';
import MondayOAuth from '@/components/MondayOAuth.vue';
import TenderView from '@/components/TenderView.vue';
import BidView from '@/components/BidView.vue';
import BidEdit from '@/components/BidEdit.vue';
import MyBids from '@/components/MyBids.vue';
import MyProfile from '@/components/MyProfile.vue';

import { auth0Guard } from "@/auth/auth0Guard";
import { mondayGuard } from "@/auth/mondayGuard";

Vue.use(VueRouter);

const routes = 
[
  {
    meta: {
      title: 'BidFriday',
    },
    path: '/',
    name: 'home',
    component: Home
  },
  
  {
    meta: {
      title: 'My Profile',
    },
    path: '/my-profile',
    name: 'my-profile',
    component: MyProfile,
    props: true,
    beforeEnter: auth0Guard
  },
  {
    meta: {
      title: 'My Bids',
    },
    path: '/my-bids',
    name: 'my-bids',
    component: MyBids,
    props: true,
    beforeEnter: auth0Guard
  },
  {
    meta: {
      title: 'View Tender Details',
    },
    path: '/tender-view/:tenderId',
    name: 'tender-view',
    component: TenderView,
    props: true
  },
  {
    meta: {
      title: 'Update Bid',
    },
    path: '/bid-edit/:tenderId/:bidId?',
    name: 'bid-edit',
    component: BidEdit,
    props: true,
    beforeEnter: auth0Guard
  },
  {
    meta: {
      title: 'Submit Bid',
    },
    path: '/bid-submit/:tenderId',
    name: 'bid-submit',
    component: BidEdit,
    props: true,
    beforeEnter: auth0Guard
  },
  {
    meta: {
      title: 'View Bid',
    },
    path: '/bid-view/:bidId',
    name: 'bid-view',
    component: BidView,
    props: true,
    beforeEnter: auth0Guard
  },

  {
    path: '/monday/boardview/request',
    name: 'MondayRequestBoardView',
    component: MondayRequestBoardView,
    beforeEnter: mondayGuard
  },
  {
    path: '/monday/setup-your-board',
    name: 'MondaySetup',
    component: MondaySetup,
  },
  {
    path: '/monday/connect',
    name: 'MondayOAuth',
    component: MondayOAuth
  }
];

const router = new VueRouter({
  routes,
  base: '/',
  mode: 'history'
});


router.beforeEach((to, from, next) => {
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // eg. if we have /some/deep/nested/route and /some, /deep, and /nested have titles, nested's will be chosen.
  const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);

  // If a route with a title was found, set the document (page) title to that value.
  if(nearestWithTitle) document.title = nearestWithTitle.meta.title;

  next();
});


export default router;