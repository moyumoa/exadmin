<template>
  <div :class="{ 'has-logo': showLogo }" :style="{ backgroundColor: sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <div class="menu-warp" v-if="appStore.menuStyle === 'uginx'">
      <el-tabs class="menu-box" tab-position="left" v-model="tabsIndex" :before-leave="tabBeforeLeave" @tab-click="tapTabs">
        <!-- <el-tab-pane name="">
          <template #label>
            <div class="custom-tooltip">
              <svg-icon icon-class="control" />
            </div>
          </template>
        </el-tab-pane> -->
        <template v-for="(node, index) in sidebarRouters">
          <template v-if="node.meta && node.meta.title && !node.hidden">
            <el-tab-pane :key="node.path + index" :name="node.path" :disabled="!node.children && !node.path.includes(('://'))">
              <template #label>
                <el-tooltip
                  :enterable="false"
                  effect="dark"
                  :content="node.meta.title"
                  placement="right"
                  :hide-after="0"
                >
                  <div class="custom-tooltip">
                    <svg-icon :icon-class="node.meta.icon" />
                  </div>
                </el-tooltip>
              </template>

              <el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper" v-show="node && node.children">
                <el-menu
                  :default-active="activeMenu"
                  :collapse="isCollapse"
                  :background-color="sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground"
                  :text-color="sideTheme === 'theme-dark' ? variables.menuColor : variables.menuLightColor"
                  :unique-opened="true"
                  :active-text-color="theme"
                  :collapse-transition="false"
                  mode="vertical"
                >
                  <sidebar-item
                    v-for="(route, index) in node.children"
                    :key="route.path + index"
                    :item="route"
                    :parentPath="node.path+'/' || '/'"
                    :base-path="route.path"
                  />
                </el-menu>
              </el-scrollbar>
            </el-tab-pane>
          </template>
        </template>
      </el-tabs>
      <div class="other-container">
        <el-popover
          placement="right"
          :width="100"
          trigger="click"
          :hide-after="0"
        >
          <template #reference>
            <el-avatar :size="38" :src="userStore.avatar">
              <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </el-avatar>
          </template>
          <el-button text :icon="User" @click="toProfile">个人中心</el-button>
          <el-button link type="danger" :icon="SwitchButton" style="margin-top: 10px" @click="logout">退出登录</el-button>
        </el-popover>
      </div>
    </div>

    <el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper" v-if="appStore.menuStyle === 'one'">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :background-color="sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground"
          :text-color="sideTheme === 'theme-dark' ? variables.menuColor : variables.menuLightColor"
          :unique-opened="true"
          :active-text-color="theme"
          :collapse-transition="false"
          mode="vertical"
          :style="isCollapse ? 'width: 52px !important' : 'width: 206px !important'"
        >
          <sidebar-item
            v-for="(route, index) in sidebarRouters"
            :key="route.path + index"
            :item="route"
            :base-path="route.path"
          />
        </el-menu>
      </el-scrollbar>
    
  </div>
</template>

<script setup>
import { SwitchButton,User } from '@element-plus/icons-vue'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/assets/styles/variables.module.scss'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { computed, onMounted, toRaw, watch } from 'vue'
import {ElMessageBox} from 'element-plus'

const route = useRoute();
const router = useRouter();
const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters =  computed(() => permissionStore.sidebarRouters);
const showLogo = computed(() => settingsStore.sidebarLogo);
const sideTheme = computed(() => settingsStore.sideTheme);
const theme = computed(() => settingsStore.theme);
const isCollapse = computed(() => !appStore.sidebar.opened);

// console.log('菜单', toRaw(sidebarRouters.value))
// console.log('路由', toRaw(route.name))

// 数组转成object
// const sidebarRoutersToMap = computed(() => (
//   permissionStore.sidebarRouters
//     .filter(item => item.name)
//     .reduce((obj, item) => {
//     obj[item.path] = item
//     return obj
//   }, {})
// ))


const tabsIndex = ref('')

// 递归查找顶层节点
const findTopLevelNodeByName = (name, treeList)=> {
  for (const node of treeList) {
    if (node.name === name) {
      return node.path; // 当前节点匹配，返回节点对象
    }

    if (node.children && node.children.length > 0) {
      const childResult = findTopLevelNodeByName(name, node.children);
      if (childResult) {
        return node.path; // 子节点中找到匹配，返回当前节点作为最顶层节点
      }
    }
  }

  return ''; // 没有找到匹配的节点
}

onMounted(() => {
  // const index = sessionStorage.getItem('MenuTabsIndex') || findTopLevelNodeByName(route.name, sidebarRouters.value)
  const index = findTopLevelNodeByName(route.name, sidebarRouters.value)
  if (index) {
    tabsIndex.value = index
    // sessionStorage.setItem('MenuTabsIndex', index)
  }
})

const currentMenuTabs = computed(() => tabsIndex.value)

const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (!path || path === '' || path === '/index') {
    tabsIndex.value = ''
    // sessionStorage.removeItem('MenuTabsIndex')
  }
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
})

const tabBeforeLeave = (activeName, oldActiveName) => {
  // console.log('离开', oldActiveName, '进入', activeName, '是否折叠', isCollapse.value)
  if (activeName.includes('://')) {
    window.open(activeName)
    return false
  }
  if (!activeName) {
    !isCollapse.value && appStore.toggleSideBar(false)
    return router.push(activeName || '/index')
  }
  isCollapse.value && appStore.toggleSideBar(false)
}

const tapTabs = (el) => {
  sessionStorage.setItem('lastMenuTabs', el.props.name)
  el.props.name && el.props.name === currentMenuTabs.value && appStore.toggleSideBar(false)
}

const toProfile = () => {
  router.push('/user/profile')
}

const logout = ()=> {
  ElMessageBox.confirm('确定要退出系统吗？', '提出提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index';
    })
  }).catch(() => { });
}

</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.menu-warp{
  display: flex;
  flex-direction: column;
}

.other-container{
  position: absolute;
  z-index: 1;
  left: 0;
  bottom: 20px;
  width: 52px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  :deep(.el-avatar){
    background-color: transparent;
    cursor: pointer;
    margin-top: 20px;
  }

  .svg-icon{
    margin: 0 !important;
    width: 1.4em;
    height: 1.4em;
    color: $base-menu-color;
  }
  .logout{
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #181a1c;
    cursor: pointer;
  }
}
.menu-box{
  display: flex;
  flex-direction: row;
  overflow: hidden;
  :deep(.el-tabs__item){
    height: 54px;
    padding: 0 18px 0 16px;
    margin-bottom: 2px;
    color: $base-menu-color;
  }
  :deep(.el-tabs__active-bar){
    left: 0 !important;
    transition-duration: 0.1s !important;
  }
  :deep(.is-active){
    // color: $light-blue;
    // background-color: aqua;
  }
  :deep(.el-tabs__active-bar){
    height: 34px !important;
  }
  :deep(.el-tabs__header){
    margin: 0 !important;
    height: calc(100vh - 50px) !important;
    background-color: #181a1c;
    padding: 10px 0;
    box-sizing: border-box;
    border-radius: 0 30px 0 0;
    // x轴加阴影
    box-shadow: 0 0 4px rgba(255,255,255,.03);
    z-index: 1;
  }
  :deep(.el-tabs__content){
    width: 146px;
  }
  :deep(.is-left){
    text-align: left !important;
  }
  :deep(.el-tabs__nav-wrap::after){
    display: none;
  }
}

.tab-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.custom-tooltip{
  .svg-icon{
    margin: 0 !important;
    width: 1.5em;
    height: 1.5em;
  }
}

// :deep(.el-menu){
//   background-color: #fff;
//   border-right: 1px solid #ebeef5;
//   border-bottom: 1px solid #ebeef5;
//   border-top: 1px solid #ebeef5;
//   border-left: 1px solid #ebeef5;
//   box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
//   border-radius: 4px;
//   padding: 10px 0;
//   margin: 10px 0;
// }
</style>
