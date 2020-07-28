<template>
  <div ref="wrapper" class="d-tree" :style="treeWrapperStyle" @scroll="onScroll">
    <div ref="phantom" class="d-tree-phantom"></div>
    <div ref="nodesWrapper" class="d-tree-nodes">
      <div
        v-for="node in showData"
        :key="node.key || node.label"
        class="d-tree-node"
        :class="{ selected: node.selected }"
        :style="treeNodeStyle"
        @click="handleNodeClick(node)"
      >
        <!-- indent -->
        <span class="d-tree-node__indent" :style="{ width: `${node.level * indent}px` }"></span>

        <!-- expand-icon -->
        <span
          class="d-tree-node__expand-icon"
          :class="{ 'is-leaf': node.isLeaf }"
          @click.stop="handleProcessNodeExpandOrCollapse(node)"
        >
          <i v-if="node.expanded" class="el-icon-caret-bottom"></i>
          <i v-else class="el-icon-caret-right"></i>
        </span>

        <el-checkbox
          v-if="showCheckbox"
          v-model="node.checked"
          :indeterminate="node.indeterminate"
          class="mr10"
          @change="handleNodeCheckChange(node, $event)"
        />

        <!-- lazy loading -->
        <span v-if="node.loading" class="d-tree-node__loading-icon el-icon-loading"></span>

        <!-- content -->
        <span class="d-tree-node__content">
          {{ node.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
function throttle(fn, interval = 30, context) {
  let timer = null;
  let lastTime = 0;
  return function(...args) {
    timer && clearTimeout(timer);

    const diffTime = Date.now() - lastTime;

    if (diffTime >= interval) {
      timer = null;
      return fn.apply(context || this, args);
    }

    // 最后一次不足 interval 间隔的事件最后也触发一次
    timer = setTimeout(() => {
      timer = null;
      fn.apply(context || this, args);
    }, interval - diffTime);
  }
}

// 根据当前的 scrollTop 与 最大 scrollTop 对比，计算出正确的 scrollTop 值
function alignScrollTop(scrollTop, scrollRange) {
  if (scrollTop < 0) {
    return 0;
  }

  if (scrollTop >= scrollRange) {
    return scrollRange;
  }

  return scrollTop;
}

// eslint-disable-next-line
function getScrollPercentage(scrollTop, clientHeight, scrollHeight) {
  if (scrollHeight <= clientHeight) {
    return 0;
  }

  const scrollRange = scrollHeight - clientHeight;
  const alignedScrollTop = alignScrollTop(scrollTop, scrollRange);
  return alignedScrollTop / scrollRange;
}

function getLocationItem(scrollPtg, total) {
  const itemIndex = Math.floor(scrollPtg * total);
  const itemTopPtg = itemIndex / total;
  const itemBottomPtg = (itemIndex + 1) / total;
  const itemOffsetPtg = (scrollPtg - itemTopPtg) / (itemBottomPtg - itemTopPtg);

  return {
    index: itemIndex,
    offsetPtg: itemOffsetPtg
  };
}

// eslint-disable-next-line
function getRangeIndex(scrollPtg, total, visibleCount) {
  const { index, offsetPtg } = getLocationItem(scrollPtg, total);

  const beforeCount = Math.ceil(scrollPtg * visibleCount);
  const afterCount = Math.ceil((1 - scrollPtg) * visibleCount);

  return {
    itemIndex: index,
    itemOffsetPtg: offsetPtg,
    startIndex: Math.max(0, index - beforeCount),
    endIndex: Math.min(total - 1, index + afterCount)
  };
}

export default {
  name: 'DTree',
  props: {
    data: {
      type: Array,
      required: true
    },
    height: {
      type: [Number, String],
    },
    nodeHeight: {
      type: Number,
      default: 26
    },
    nodeKey: {
      type: String
    },
    props: {
      type: Object,
      default: () => ({
        label: 'label',
        children: 'children'
      })
    },
    load: {
      type: Function
    },
    lazy: {
      type: Boolean,
      default: false
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    expandOnClickNode: {
      type: Boolean,
      default: true
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    defaultCheckedKeys: {
      type: Array
    },
    defaultExpandedKeys: {
      type: Array
    },
    accordion: {
      type: Boolean,
      default: false
    },
    indent: {
      type: Number,
      default: 16
    }
  },
  data() {
    return {
      flattenedNodes: [],
      filteredNodes: [],
      scrollTop: 0,
      treeWrapperHeight: 0,
      startIndex: 0,
      endIndex: 0,
      visibleCount: 0,
      selectedNode: null
    }
  },
  computed: {
    isLazyLoad() {
      return this.lazy && this.load && typeof this.load === 'function';
    },
    treeWrapperStyle() {
      const { height } = this;
      let computedHeight = '';

      if (typeof height === 'number') {
        computedHeight = `${height}px`;
      } else {
        // '200' => '200px'，'100%' => '100%，'calc(100% - 20px)' => 'calc(100% - 20px)'
        computedHeight = Number.isNaN(Number(height)) ? height : `${height}px`;
      }

      return { height: computedHeight };
    },
    treeNodeStyle() {
      const { nodeHeight } = this;

      if (!nodeHeight) {
        return {};
      }

      return { height: `${nodeHeight}px` };
    },
    showData() {
      return this.filteredNodes.slice(this.startIndex, this.endIndex);
    }
  },
  mounted() {
    const data = this.flatten(this.data);
    console.log(data.length);
    this.flattenedNodes = data;
    this.filterFlattenedNodes();

    this.treeWrapperHeight = this.$refs.wrapper.clientHeight;
    this.scrollTop = this.$refs.wrapper.scrollTop;
    this.visibleCount = Math.ceil(this.treeWrapperHeight / this.nodeHeight);
    this.setDOMRelated();
    this.onScroll();
  },
  methods: {
    onScroll: throttle(function onScroll() {
      const { $refs: { wrapper: { scrollTop: originScrollTop, scrollHeight } }, treeWrapperHeight } = this;
      const scrollTop = alignScrollTop(originScrollTop, scrollHeight - treeWrapperHeight);
      this.$refs.nodesWrapper.style.transform = `translateY(${scrollTop}px)`;
      this.changeIndex();
    }),

    changeIndex() {
      // const { $refs: { wrapper: { scrollTop: originScrollTop, scrollHeight } }, flattenedNodes: { length }, visibleCount, treeWrapperHeight } = this;
      const { $refs: { wrapper: { scrollTop: originScrollTop } }, visibleCount } = this;

      // const scrollPtg = getScrollPercentage(originScrollTop, treeWrapperHeight, scrollHeight);
      // const { startIndex, endIndex } = getRangeIndex(scrollPtg, length, visibleCount);
      const startIndex = Math.floor(originScrollTop / this.nodeHeight);
      const endIndex = startIndex + visibleCount;
      this.startIndex = startIndex;
      this.endIndex = endIndex;
    },

    setDOMRelated() {
      const { nodeHeight, filteredNodes } = this;
      const scrollHeight = nodeHeight * filteredNodes.length;
      this.$refs.phantom.style.height = `${scrollHeight}px`;
    },

    /* events */
    // node-click
    handleNodeClick(flattenedNode) {
      const { isLeaf, originNode } = flattenedNode;
      flattenedNode.selected = true;

      if (this.selectedNode && this.selectedNode !== flattenedNode) {
        this.selectedNode.selected = false;
      }

      this.selectedNode = flattenedNode;

      this.$emit('node-click', originNode, flattenedNode);

      if (isLeaf || !this.expandOnClickNode) {
        return;
      }

      // 没有子节点的时候才触发懒加载
      if (this.isLazyLoad && (!flattenedNode.children || !flattenedNode.children.length)) {
        this.handleLazyLoad(flattenedNode);
        return;
      }

      this.handleProcessNodeExpandOrCollapse(flattenedNode);
    },

    handleLazyLoad(flattenedNode) {
      flattenedNode.loading = true;

      const resolve = data => {
        flattenedNode.loading = false;
        flattenedNode.loaded = true;

        // 没加载到数据则表明是叶子节点
        !data.length && (flattenedNode.isLeaf = true);

        // 将数据变为 node
        const flattenedNodes = this.flatten(data);

        // TODO: 优化代码
        // 加载的数据是可见的
        flattenedNodes.forEach(node => {
          node.visible = true;
          node.level = flattenedNode.level + 1;
        });

        // 建立和当前 node 的联系，并且添加到组件的节点数组中
        flattenedNode.children = flattenedNodes;
        const index = this.flattenedNodes.findIndex(node => node === flattenedNode) + 1;
        this.flattenedNodes.splice(index, 0, ...flattenedNodes);

        // 处理节点的展开收缩
        this.handleProcessNodeExpandOrCollapse(flattenedNode);
      };

      this.load(flattenedNode.originNode, resolve);
    },

    // expand-icon click
    handleProcessNodeExpandOrCollapse(flattenedNode) {
      const { expanded, children, originNode } = flattenedNode;
      const targetExpanded = !expanded;
      flattenedNode.expanded = targetExpanded;
      if (children) {
        targetExpanded ? this.handleNodeExpand(flattenedNode) : this.handleNodeCollapse(flattenedNode) ;
      }

      this.$emit(targetExpanded ? 'node-expand' : 'node-collapse', originNode, flattenedNode);

      this.filterFlattenedNodes();
      this.setDOMRelated();
    },

    handleNodeExpand(flattenedNode) {
      const { children } = flattenedNode;

      if (children) {
        children.forEach(node => node.visible = true);
      }
    },

    handleNodeCollapse(flattenedNode) {
      this.traverseChildren(flattenedNode, childNode => childNode.visible = false);
    },

    handleNodeCheckChange(flattenedNode, checked) {
      const { isLeaf } = flattenedNode;

      if (isLeaf) {
        return;
      }

      this.traverseChildren(
        flattenedNode,
        childNode => {
          childNode.checked = checked;
          childNode.indeterminate = false;
        }
      );

      this.traverseParent(
        flattenedNode,
        parentNode => {
          const isAllChecked = parentNode.children.every(({ checked }) => checked);
          const hasChecked = parentNode.children.some(({ checked }) => checked);

          parentNode.checked = isAllChecked;
          parentNode.indeterminate = hasChecked && !isAllChecked;
        }
      );
    },

    traverseChildren(flattenedNode, fn) {
      if (!flattenedNode.children) {
        return;
      }

      flattenedNode.children.forEach(childNode => {
        fn(childNode);
        this.traverseChildren(childNode, fn)
      });
    },

    traverseParent(flattenedNode, fn) {
      if (!flattenedNode.parent) {
        return;
      }

      fn(flattenedNode.parent);

      this.traverseParent(flattenedNode.parent, fn);
    },

    // filter nodes
    filterFlattenedNodes() {
      const { flattenedNodes } = this;
      const filteredNodes = [];
      const len = flattenedNodes.length;

      for (let i = 0; i < len; i++) {
        const node = flattenedNodes[i];

        if (node.visible) {
          filteredNodes.push(node);
        }
      }

      this.filteredNodes = filteredNodes;
    },

    /* flat tree to array */
    flatten(tree) {
      const stack = tree.map(node => {
        return { originNode: node, parent: null, level: 0 }
      });

      const { props: { children } } = this;
      const flattenedNodes = [];

      // 深度优先遍历
      while (stack.length) {
        const curNode = stack.shift();
        const { originNode, parent, level } = curNode;
        const flattenedNode = this.getFlattenedNode(curNode);

        parent && parent.children.push(flattenedNode);
        flattenedNodes.push(flattenedNode);

        const computedChildren =  typeof children === 'function' ? children(originNode, flattenedNode) : originNode[children];

        if (computedChildren) {
          const mappedChildren = computedChildren.map(childNode => {
            return {
              originNode: childNode,
              parent: flattenedNode,
              level: level + 1
            };
          });

          stack.unshift(...mappedChildren);
        }
      }

      return flattenedNodes;
    },

    getFlattenedNode({ originNode, parent, level }) {
      const {
        defaultExpandAll,
        nodeKey,
        defaultCheckedKeys,
        defaultExpandedKeys,
        props: {
          label,
          disabled,
          children,
          isLeaf
        },

        isLazyLoad
      } = this;

      const expanded = defaultExpandAll ? true : (nodeKey && defaultExpandedKeys ? defaultExpandedKeys.includes(originNode[nodeKey]) : false);
      const visible = level === 0 ? true : parent.expanded;
      const checked = nodeKey ? (defaultCheckedKeys ? defaultCheckedKeys.includes(originNode[nodeKey]) : false) : false;
      const key = nodeKey ? originNode[nodeKey] : null;

      const flattenedNode = {
        key,
        originNode,
        parent,
        level,
        expanded,
        visible,
        checked,
        indeterminate: false,
        filtered: false,
        selected: false,
        loading: false,
        loaded: false
      };

      const computedLabel = typeof label === 'function' ? label(originNode, flattenedNode) : originNode[label];
      const computedChildren =  typeof children === 'function' ? children(originNode, flattenedNode) : originNode[children];

      let isDisabled = false;
      if (disabled !== undefined) {
        if (typeof disabled === 'boolean') {
          isDisabled = disabled;
        } else if (typeof disabled === 'function') {
          isDisabled = disabled(originNode, flattenedNode);
        }
      }

      let isLeafInner = false;
      if (isLeaf !== undefined) {
        if (typeof isLeaf === 'boolean') {
          isLeafInner = isLeaf;
        } else if (typeof isLeaf === 'function') {
          isLeafInner = isLeaf(originNode, flattenedNode);
        }
      }

      computedChildren && computedChildren.length && (flattenedNode.children = []);
      flattenedNode.label = computedLabel;
      flattenedNode.disabled = isDisabled;

      // 如果有 children ，则不是叶子节点，否则如果是懒加载，则是根据计算的值表示是否为叶子节点，否则表示为叶子节点
      flattenedNode.isLeaf = computedChildren && computedChildren.length ? false : (isLazyLoad ? isLeafInner : true);

      return flattenedNode;
    },

    /* methods to expose */
    setCheckedKeys(keys, leafonly = false) {
      if (!keys || !Array.isArray(keys) || !this.nodeKey) {
        return;
      }

      const keyMap = keys.reduce((map, key) => {
        map[key] = 1;
        return map;
      }, {});
      const { flattenedNodes } = this;
      const len = flattenedNodes.length;

      for (let i = 0; i < len; i++) {
        const flattenedNode = flattenedNodes[i];
        const canSet = leafonly ? flattenedNode.isLeaf : true;

        if (canSet && keyMap[flattenedNode.key]) {
          flattenedNode.checked = true;
          flattenedNode.indeterminate = false;
          this.handleNodeCheckChange(flattenedNode, true);
        }
      }
    },

    setCheckedNodes(nodes) { 
      if (!nodes || !Array.isArray(nodes) || !this.nodeKey) {
        return;
      }

      const keys = nodes.map(node => node[this.nodeKey]);

      this.setCheckedKeys(keys);
    },

    getCheckedKeys(leafonly = false) {
      if (!this.nodeKey) {
        return [];
      }

      const { flattenedNodes } = this;
      const len = flattenedNodes.length;
      const checkedKeys = [];

      for (let i = 0; i < len; i++) {
        const { key, checked, isLeaf } = flattenedNodes[i];
        const canGet = leafonly ? isLeaf : true;

        canGet && checked && checkedKeys.push(key);
      }

      return checkedKeys;
    },

    getCheckedNodes(leafonly = false) {
      if (!this.nodeKey) {
        return [];
      }

      const { flattenedNodes } = this;
      const len = flattenedNodes.length;
      const checkedNodes = [];

      for (let i = 0; i < len; i++) {
        const { originNode, checked, isLeaf } = flattenedNodes[i];
        const canGet = leafonly ? isLeaf : true;

        canGet && checked && checkedNodes.push(originNode);
      }

      return checkedNodes;
    },

    setChecked(keyOrData, checked, deep = false) {
      if (!keyOrData || !this.nodeKey) {
        return;
      }

      const isData = typeof keyOrData === 'object';
      const key = isData ? keyOrData[this.nodeKey] : keyOrData;
      const { flattenedNodes } = this;
      const len = flattenedNodes.length;

      for (let i = 0; i < len; i++) {
        const flattenedNode = flattenedNodes[i];

        if (flattenedNode.key === key) {
          flattenedNode.checked = checked;
          flattenedNode.indeterminate = false;
  
          deep && this.handleNodeCheckChange(flattenedNode, checked);
          break;
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mr10 {
  margin-right: 10px;
}

.d-tree {
  overflow: auto;
  position: relative;
  height: 100%;
}

.d-tree-nodes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.d-tree-node {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 26px;

  &:hover, &.selected {
    background-color: #f5f7fa;
  }
}

.d-tree-node__indent {
  display: inline-block;
}

.d-tree-node__expand-icon {
  padding: 6px;
  font-size: 12px;
  color: #c0c4cc;
  cursor: pointer;

  &.is-leaf {
    color: transparent;
    cursor: default;
  }
}

.d-tree-node__loading-icon {
  margin-right: 8px;
  font-size: 14px;
  color: #c0c4cc;
}

.d-tree-node__content {
  flex: 1;
  font-size: 14px;
  text-align: left;
  color: #606266;
  cursor: pointer;
}
</style>

