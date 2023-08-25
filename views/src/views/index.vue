<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        {{ datas.name }}
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 50px">
      </el-col>
    </el-row>
    <!-- <el-divider /> -->
  </div>
</template>

<script setup name="Index">
import { reactive } from 'vue';
import useAppStore from '@/store/modules/app'
import { getInfo } from '@/api'

const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebar.opened);

if (appStore.menuStyle === 'uginx') {
  isCollapse.value && appStore.toggleSideBar(false)
}



const version = ref('3.8.6')

const datas = reactive({
  // 项目信息
  name: 'vue3-admin',
  version: '1.0.0',
})

// 页面加载
onMounted(() => {
  datas.name = 'vue3-'
  // getUserInfo()
})

// const getUserInfo = async () => {
//   const res = await getInfo()
//   console.log('res===', res)
// }

function goTarget (url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {}
</style>

