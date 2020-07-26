<template>
  <d-tree :data="treeData" :height="600" :node-height="20" :props="props" show-checkbox />
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
  }
}
</script>

<style lang="scss" scoped>

</style>

