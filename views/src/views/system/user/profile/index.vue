<template>
   <div class="app-container">
      <el-row :gutter="20" style="height: calc(100vh - 128px)">
         <!-- <el-col :span="8" :xs="24"> -->
         <el-col :xs="24" :md="6">
            <el-card class="box-card" style="margin-bottom: 20px;">
               <template v-slot:header>
                  <div class="clearfix">
                     <span>个人信息</span>
                  </div>
               </template>
               <div>
                  <div class="text-center">
                     <userAvatar :user="state.user" />
                  </div>
                  <ul class="list-group list-group-striped">
                     <li class="list-group-item">
                        <svg-icon icon-class="user" />
                        <!-- <span>用户名称</span> -->
                        <el-text class="mx-1">用户名称</el-text>
                        <div class="pull-right">{{ state.user.userName }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="phone" />
                        <el-text class="mx-1">手机号码</el-text>
                        <div class="pull-right">{{ state.user.phonenumber }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="email" />
                        <el-text class="mx-1">用户邮箱</el-text>
                        <div class="pull-right">{{ state.user.email }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="tree" />
                        <el-text class="mx-1">所属部门</el-text>
                        <div class="pull-right" v-if="state.user.dept">{{ state.user.dept.deptName }} / {{ state.postGroup
                        }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="peoples" />
                        <el-text class="mx-1">所属角色</el-text>
                        <div class="pull-right">{{ state.roleGroup }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="date" />
                        <el-text class="mx-1">创建日期</el-text>
                        <div class="pull-right">{{ state.user.createTime }}</div>
                     </li>
                  </ul>
               </div>
            </el-card>
         </el-col>
         <!-- <el-col :span="16" :xs="24"> -->
         <el-col :xs="24" :md="18">
            <el-card class="box-card">
               <template v-slot:header>
                  <div class="clearfix">
                     <span>基本资料</span>
                  </div>
               </template>
               <el-tabs v-model="activeTab" style="max-width: 600px;">
                  <el-tab-pane label="基本资料" name="userinfo">
                     <userInfo :user="state.user" />
                  </el-tab-pane>
                  <el-tab-pane label="修改密码" name="resetPwd">
                     <resetPwd />
                  </el-tab-pane>
               </el-tabs>
            </el-card>
         </el-col>
      </el-row>
   </div>
</template>

<script setup name="Profile">
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";
import { onMounted } from "vue";
import { ElMessage } from "element-plus";

const activeTab = ref("userinfo");
const state = reactive({
   user: {},
   roleGroup: {},
   postGroup: {}
});

onMounted(() => {
   getUser()
});

function getUser () {
   getUserProfile().then(response => {
      state.user = response.data;
      state.roleGroup = response.roleGroup;
      state.postGroup = response.postGroup;
   });
};

</script>

<style lang="scss" scoped>
.box-card{
   height: 100%;
   // width: 500px;
}
</style>
