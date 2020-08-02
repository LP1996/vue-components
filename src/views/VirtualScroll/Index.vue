<template>
  <section>
    <d-scroll class="border" :data="listData" height="600">
        <template v-slot="{ data }">
          <span style="white-space: nowrap;">{{ data.name + 'ashdiohzxcnasndoiqwheiuhxcnajsoidhqwioehiqoweasdasd' }}</span>
        </template>
    </d-scroll>
  </section>
</template>

<script>
import DScroll from './DScroll.vue';

const listData = Array.from(new Array(1000), (_, i) => {
  return { id: i, name: 'list item - ' + i };
});

export default {
  name: 'VirtualScrollIndex',
  components: { DScroll },
  data() {
    return {
      listData
    }
  }
};
</script>

<style lang="scss" scoped>
.border {
  width: 500px;
  border: 1px solid #999;
}
</style>

