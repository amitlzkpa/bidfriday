import Vue from "vue";

export const mondayGuard = (to, from, next) => {

  if (Vue.prototype.isInMonday) {
    return next();
  }

  return next('/about')

};

