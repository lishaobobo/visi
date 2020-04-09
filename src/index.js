import "es6-promise/auto";
import Vue from "vue";
import App from "./app.vue";
import home from "./components/home.vue";
import store from "./store/store";
import VueRouter from "vue-router";
import axios from "axios";
import "./style/index.scss";
Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.use(VueRouter);
// routes
const routes = [
  {
    path: "/",
    name: "home",
    component: home
  },
  {
    path: "/dataRange",
    name: "dataRange",
    component: resolve => require(["./components/map/dataRange.vue"], resolve)
  },
  {
    path: "/flyLine",
    name: "flyLine",
    component: resolve => require(["./components/map/flyLine.vue"], resolve)
  },
  {
    path: "/progress",
    name: "progress",
    component: resolve => require(["./components/charts/progress.vue"], resolve)
  },
  {
    path: "/triangle",
    name: "triangle",
    component: resolve => require(["./components/charts/triangle.vue"], resolve)
  },
  {
    path: "/vloumeChart",
    name: "vloumeChart",
    component: resolve =>
      require(["./components/charts/vloumeChart.vue"], resolve)
  },
  {
    path: "/wave",
    name: "wave",
    component: resolve => require(["./components/charts/wave.vue"], resolve)
  },
  {
    path: "/pyramid",
    name: "pyramid",
    component: resolve => require(["./components/charts/pyramid.vue"], resolve)
  },
  {
    path: "/sphere",
    name: "sphere",
    component: resolve => require(["./components/charts/tree.vue"], resolve)
  }
];

const router = new VueRouter({
  routes: routes
});
new Vue({
  render: h => h(App),
  el: "#app",
  store,
  router
});
