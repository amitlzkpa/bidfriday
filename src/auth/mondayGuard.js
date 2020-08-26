import Vue from "vue";

export const mondayGuard = (to, from, next) => {

  console.log(Vue.prototype.isInMonday);

  if (Vue.prototype.isInMonday) {
    return next();
  }

  return next('/about')

};

