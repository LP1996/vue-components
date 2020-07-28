<template>
  <d-tree
    :data="treeData"
    :height="600"
    :node-height="20"
    :props="props"
    :load="handleLazyLoad"
    node-key="id"
    show-checkbox
    lazy
  />
</template>

<script>
import DTree from './Tree.vue';
import data from './treeData';

export default {
  name: 'DTreeTest',
  components: { DTree },
  data() {
    return {
      treeData: data,
      props: {
        label: 'name',
        children: 'children'
      }
    }
  },
  methods: {
    handleLazyLoad(_, resolve) {
      setTimeout(() => {
        resolve([{ id: 9999999, name: 'test' }]);
      }, 1000);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

