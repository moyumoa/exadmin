<template>
  <div>
    <el-dropdown trigger="click" @command="handleSetStyle">
      <div class="size-icon--style">
        <svg-icon class-name="size-icon" icon-class="swagger" />
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item of styleOptions" :key="item.value" :disabled="types === item.value"
            :command="item.value">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import useAppStore from "@/store/modules/app";

const appStore = useAppStore();
const types = computed(() => appStore.menuStyle);
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();
const styleOptions = ref([
  { label: "常规", value: "one" },
  { label: "个性", value: "uginx" },
]);

function handleSetStyle (style) {
  if (style === 'uginx') {
    window.location.href = '/index'
    sessionStorage.removeItem('lastMenuTabs')
  }
  appStore.setMenuStyle(style);
}
</script>

<style lang='scss' scoped>
.size-icon--style {
  font-size: 18px;
  line-height: 50px;
  padding-right: 7px;
}
</style>