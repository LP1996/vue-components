<template>
  <section style="height: 100%;">
    <el-input v-model="filterText" />

    <d-tree
      ref="tree"
      :data="treeData"
      height="90%"
      :props="props"
      node-key="id"
      :load="handleLazyLoad"
      :filter-node-method="filterMethod"
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

// eslint-disable-next-line
import data from './treeData';

// eslint-disable-next-line
const smallTreeData = [
  {
    id: 1,
    name: '一级 1',
    children: [
      {
        id: 2,
        name: '二级 1-1',
        disabled: true,
        children: [
          {
            id: 3,
            name: '三级 1-1-1',
            disabled: true
          },
          {
            id: 15,
            name: '三级 1-1-2'
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: '一级 2',
    children: [
      {
        id: 5,
        name: '二级 2-1',
        children: [
          {
            id: 6,
            name: '三级 2-1-1'
          }
        ]
      },
      {
        id: 7,
        name: '二级 2-2',
        children: [
          {
            id: 8,
            name: '三级 2-2-1'
          }
        ]
      }
    ]
  },
  {
    id: 9,
    name: '一级 3',
    children: [
      {
        id: 10,
        name: '二级 3-1',
        children: [
          {
            id: 11,
            name: '三级 3-1-1'
          }
        ]
      },
      {
        id: 12,
        name: '二级 3-2',
        children: [
          {
            id: 13,
            name: '三级 3-2-1'
          },
          {
            id: 14,
            name: '三级 3-2-2'
          }
        ]
      }
    ]
  }
];

export default {
  name: 'DTreeTest',
  components: { DTree },
  data() {
    return {
      treeData: [],
      filterText: '',
      props: {
        label: 'name',
        children: 'children',
        disabled(data) {
          return data.id > 100 && data.id < 1000;
        }
      }
    }
  },
  watch: {
    filterText(newVal) {
      this.$refs.tree.filter(newVal);
    }
  },
  mounted() {
    setTimeout(() => {
      this.treeData = data;
      // this.treeData = smallTreeData;
    }, 1000);
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
    handleCheckNode() {
      console.log('check event---------');
      // console.log(data, checkedData);
    },
    handleCheckChange(data, checked) {
      console.log('check change event---------------', data, checked);
      // console.log(data, chcked, hasChildrenChecked);
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

