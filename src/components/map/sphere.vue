<template>
    <div class="circle_map">
        <div style="width:100%;height:100vh" ref="map"></div>
    </div>
</template>
<script>
import sphere from "../../common/js/map/SphereMap";
export default {
    data() {
        return {};
    },
    created() {},
    mounted() {
        let o = {};
        let map = new sphere({
            el: this.$refs.map
        });
    }
};
</script>