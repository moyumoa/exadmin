<template>
  <div style="border: 1px solid #ccc">
    <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor :style="styles" v-model="content" :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated"
      @onChange="(e) => $emit('update:modelValue', content)" />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { upload } from '@/api'

const props = defineProps({
  /* 编辑器的内容 */
  modelValue: {
    type: String,
  },
  /* 高度 */
  height: {
    type: Number,
    default: 0,
  },
  /* 最小高度 */
  minHeight: {
    type: Number,
    default: null,
  },
  /* 只读 */
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const mode = ref('default')

const styles = computed(() => {
  let style = {};

  // if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  // }
  // if (props.height) {
    style.height = `${props.height}px`;
  // }
  return style;
})

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const content = ref("");
watch(() => props.modelValue, (v) => {
  if (v !== content.value) {
    content.value = v === undefined ? "<p></p>" : v;
  }
}, { immediate: true });

const toolbarConfig = {}
const editorConfig = {
  placeholder: '请输入内容',
  readOnly: props.readOnly,
  mode: 'simple',
  hoverbarKeys: {
    'image': {
      menuKeys: [],
    }
  },
  MENU_CONF: {
    uploadImage: {  // 配置图片上传服务器
      // server: 'https://127.0.0.1/api/common/upload',
      maxFileSize: 50 * 1024 * 1024, // 50M
      maxNumberOfFiles: 100, // 最多上传 100 张图片
      // 自定义上传
      async customUpload (file, insertFn) {
        const myFile = file
        const formData = new FormData()
        formData.append('file', myFile)
        upload(formData).then(r => {
          if (r.code === 200) {
            insertFn(r.data.url, r.data.name,r.data.url)
          }
        }).catch(err => { })
      },
    },
    // 上传视频
    uploadVideo: {
      async customUpload (file, insertFn) {
        const myFile = file
        const formData = new FormData()
        formData.append('file', myFile)
        upload(formData).then(r => {
          if (r.code === 200) {
            insertFn(r.data.url, r.data.name,r.data.url)
          }
        }).catch(err => { })
      },  
    }
  },
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  console.log('组件销毁了')
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

</script>

<style lang="scss" scoped>
/* 修改行间距 */
:deep(.w-e-text-container [data-slate-editor] p) {
  margin: 5px 0 !important;
}

:deep(.w-e-text-placeholder) {
  top: 0 !important;
}
</style>