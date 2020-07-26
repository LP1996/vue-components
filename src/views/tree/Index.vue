<template>
  <section class="tree-index">
    <div style="width: 200px">
      <d-tree />
    </div>
  </section>
</template>

<script>
import DTree from './DTree/Index.vue';
import treeData from './DTree/treeData';

export default {
  name: 'TreeIndex',
  components: { DTree },
  data() {
    return {
      treeData: treeData
    }
  }
};
</script>

<style>
.tree-index {
  display: flex;
  justify-content: center;
}
</style>
