<template>
  <section class="el-tree-test">
    <el-input v-model="filterText"></el-input>
    <el-tree
      ref="tree"
      style="width: 200px;"
      :data="bigData"
      :props="treeProps"
      node-key="id"
      default-expand-all
      :filter-node-method="filterNode"
      show-checkbox
      @check="handleCheck"
      @check-change="handleCheckChange"
    />
  </section>
</template>

<script>
const treeData = [
  {
    id: 1,
    name: '0-1',
    children: [
      { id: 2, name: '0-1-1', disabled: true },
      { 
        id: 9, 
        name: '0-1-2', 
        disabled: true,
        children: [{ id: 3, name: '1-2-1' }]
      },
      { id: 4, name: '0-1-3', disabled: true },
    ]
  },
  {
    id: 5,
    name: '0-2',
    children: [
      { id: 6, name: '0-2-1', disabled: true },
      { id: 7, name: '0-2-2', disabled: true },
      { id: 8, name: '0-2-3', disabled: true }
    ]
  }
];

const bigData = [
  { id: 1, name: '0-1', children: [] }
];

for (let i = 2; i < 300; i++) {
  bigData[0].children.push({ id: i, name: `0-1-${i - 1}` });
}

export default {
  name: 'TreeFunctionTest',
  data() {
    return {
      treeData,
      bigData,
      treeProps: { label: 'name' },
      filterText: ''
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    handleCheck() {
      console.log('check event--------');
    },
    handleCheckChange(data, chcked) {
      console.log('check change event-----------', data, chcked);
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tree-test {
  display: flex;
  justify-content: center;
}
</style>
