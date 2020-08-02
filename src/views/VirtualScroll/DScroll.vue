<template>
  <div ref="wrapper" class="d-scroll" :style="wrapperStyle" @scroll="onScroll">
    <div class="phantom" :style="phantomStyle">
      <div ref="itemsWrapper">
        <div
          ref="item"
          v-for="(item, index) in showData"
          :key="index"
          class="d-scroll__item"
          :style="itemStyle"
        >
            <slot v-bind="{ data: item }"></slot>
          </div>
      </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'DScroll',
  props: {
    data: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 30
    },
    height: {
      type: [Number, String],
      default: '100%'
    },
    paddingNumber: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      wrapperHeight: 0,
      startIndex: 0,
      endIndex: 0
    }
  },
  computed: {
    wrapperStyle() {
      const { height } = this;
      const numberedHeight = Number(height);
      const computedHeight = Number.isNaN(numberedHeight) ? height : `${numberedHeight}px`;

      return { height: computedHeight };
    },
    itemStyle() {
      return { height: `${this.itemHeight}px` }
    },
    phantomStyle() {
      const totalHeight = this.itemHeight * this.data.length;
      return { height: `${totalHeight}px` };
    },
    showData() {
      return this.data.slice(this.startIndex, this.endIndex);
    }
  },
  mounted() {
    this.wrapperHeight = this.$refs.wrapper.clientHeight;
    this.visibleCount = Math.ceil(this.wrapperHeight / this.itemHeight);
    this.onScroll();
  },
  methods: {
    onScroll() {
      const { $refs: { wrapper: { scrollTop } }, data: { length }, itemHeight, wrapperHeight, paddingNumber } = this;
      const shouldStartIndex = Math.floor(scrollTop / itemHeight);
      const realStartIndex = Math.max(0, shouldStartIndex - paddingNumber);
      const shouldEndIndex = Math.ceil((scrollTop + wrapperHeight) / itemHeight);
      const realEndIndex = Math.min(length, shouldEndIndex + paddingNumber);

      this.startIndex = realStartIndex;
      this.endIndex = realEndIndex;
      
      this.$refs.itemsWrapper.style.transform = `translateY(${realStartIndex * itemHeight}px)`;
    }
  }
};
</script>

<style lang="scss" scoped>
.d-scroll {
  overflow: auto;
}

.d-scroll__item {
  box-sizing: border-box;
  border-bottom: 1px solid #ddd;
}
</style>

