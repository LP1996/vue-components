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
      defaultExpandAll
      empty-text="就没数据了~"
      :defaultCheckedKeys="[285]"
      @check="handleCheckNode"
      @check-change="handleCheckChange"
    >
      <template v-slot:empty>
        <span>没有数据，难受</span>
      </template>

      <template v-slot:content="{ node, data }">
        <div>
          <img class="label-icon" src="~@/assets/logo.png">
          <span>{{ data.name }}</span>
          <el-button type="text">添加</el-button>
          <el-button type="text">修改</el-button>
        </div>
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
        children: 'children',
        disabled(data) {
          return data.id > 100;
        }
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
    },
    handleCheckNode(data, checkedData) {
      console.log(data, checkedData);
    },
    handleCheckChange(data, chcked, hasChildrenChecked) {
      console.log(data, chcked, hasChildrenChecked);
    }
  }
}
</script>

<style lang="scss" scoped>
.label-icon {
  width: 15px;
  height: 15px;
  margin-right: 5px;
  vertical-align: middle;
}
</style>

