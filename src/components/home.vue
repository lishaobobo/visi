<template>
  <div id="main">
    <router-link
      class="design__div--chart"
      v-for="item in list"
      :key="item.name"
      :to="{name:item.router}"
    >
      <img :src="item.img" alt />
      <p>{{item.name}}</p>
    </router-link>
  </div>
</template>
<script>
export default {
  name: "home",
  data() {
    return {
      list: [
        {
          name: "dataRange",
          router: "dataRange",
          img: require("../assets/images/dataRange.png")
        },
        {
          name: "tree",
          router: "tree",
          img: require("../assets/images/tree.png")
        },
        {
          name: "flyLine",
          router: "flyLine",
          img: require("../assets/images/flyLine.png")
        },
        {
          name: "progress",
          router: "progress",
          img: require("../assets/images/progress.png")
        },
        {
          name: "triangle",
          router: "triangle",
          img: require("../assets/images/triangle.png")
        },
        {
          name: "wave",
          router: "wave",
          img: require("../assets/images/wave.png")
        },
        {
          name: "pyramid",
          router: "pyramid",
          img: require("../assets/images/pyramid.png")
        },
        {
          name: "timeline",
          router: "timeline",
          img: require("../assets/images/timeline.png")
        }
      ]
    };
  }
};
</script>

