<template>
  <div class="app-container">
    <!-- <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
      </el-col>
      <el-col :sm="24" :lg="12" style="padding-left: 50px">
      </el-col>
    </el-row> -->

    <!-- <ul v-infinite-scroll="load" :infinite-scroll-disabled="disabled">
      <li v-for="i in count" :key="i" class="list-item">{{ i }}</li>
    </ul> -->

    <div v-infinite-scroll="load" :infinite-scroll-disabled="disabled">
      <el-image
        style="width: 100px; height: 100px"
        :src="url"
        :zoom-rate="1.2"
        :preview-src-list="srcList"
        :initial-index="4"
        fit="cover"
      />
    </div>
    <p v-if="loading">Loading...</p>
    <p v-if="noMore">No more</p>
  </div>
</template>

<script setup name="ResourceList">


import { ref, reactive, onBeforeMount } from 'vue';
import useAppStore from '@/store/modules/app'
import { getInfo, getQiniuToken, getQiniuBuckets } from '@/api'

const appStore = useAppStore()

const url =
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
const srcList = [
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
  'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
  'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
  'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg',
  'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
  'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg',
  'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg',
]

const count = ref(70)
const loading = ref(false)
const noMore = computed(() => count.value >= 100)
const disabled = computed(() => loading.value || noMore.value)
const load = () => {
  loading.value = true
  setTimeout(() => {
    count.value += 2
    loading.value = false
  }, 2000)
}
const total = ref(1)
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  }
})

const { queryParams } = toRefs(data)





const getList = () => {
  // getInfo().then(res => {
  //   console.log(res)
  // })
}


onBeforeMount(async () => {
})

// 页面加载
onMounted(() => {
  // getUserInfo()
})

</script>

<style scoped lang="scss">
.infinite-list {
  height: 40px;
  padding: 0;
  margin: 0;
  list-style: none;
}
</style>

