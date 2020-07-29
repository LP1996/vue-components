<template>
  <section>
    <el-input v-model="filterText" />

    <d-tree
      ref="tree"
      :data="treeData"
      :height="600"
      :node-height="20"
      :props="props"
      :load="handleLazyLoad"
      :filter-node-method="filterMethod"
      node-key="id"
      show-checkbox
      empty-text="就没数据了~"
    >
      <template v-slot:empty>
        <span>没有数据，难受</span>
      </template>
    </d-tree>
  </section>
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
      filterText: '',
      props: {
        label: 'name',
        children: 'children'
      }
    }
  },
  watch: {
    filterText(newVal) {
      this.$refs.tree.filter(newVal);
    }
  },
  methods: {
    handleLazyLoad(_, resolve) {
      setTimeout(() => {
        resolve([{ id: 9999999, name: 'test' }]);
      }, 1000);
    },
    filterMethod(val, data) {
      return data.name.includes(val);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

