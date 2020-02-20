<template>
  <div class="triangle">
    <div ref="triangle_chart" class="triangle__div--container">
    </div>
  </div>
</template>
<script>
  import Triangle from "js/charts/triangle";

  export default {
    name : "triangle",
    data() {
      return {
        svg : null,
        dataList : [
          {
            name : "苹果",
            value : 40
          },
          {
            name : "香蕉",
            value : 30
          },
          {
            name : "橘子",
            value : 20
          },
          {
            name : "葡萄",
            value : 40
          },
          {
            name : "芒果",
            value : 20
          }
        ]
      };
    },
    mounted() {
      this.chart = new Triangle({
        el : this.$refs[ "triangle_chart" ],
        hasAnimatetion : true,
        hasSort: 'ascending',
        hasHoverEvent : true,
        data : this.dataList
      });
    }
  };
</script>
