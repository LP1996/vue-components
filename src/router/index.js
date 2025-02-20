import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  // {
  //   path: "/about",
  //   name: "About",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/About.vue")
  // },
  {
    path: '/el-tree',
    name: 'el-tree',
    component: () => import('../views/TreeFunctionTest/Index.vue')
  },
  {
    path: '/d-tree',
    name: 'd-tree',
    component: () => import('../views/tree/Index.vue')
  },
  {
    path: '/d-scroll',
    name: 'virtual-scroll',
    component: () => import('../views/VirtualScroll/Index.vue')
  }
];

const router = new VueRouter({
  routes
});

export default router;
