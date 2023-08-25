import Cookies from 'js-cookie'

const useAppStore = defineStore(
  'app',
  {
    state: () => ({
      sidebar: {
        opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
        withoutAnimation: false, // 无动画
        hide: false // 隐藏
      },
      menuStyle: localStorage.getItem('menuStyle') || 'uginx', // 菜单风格
      device: 'desktop',
      size: Cookies.get('size') || 'default'
      // size="large" / "medium" / "small" / "mini" / "default"
    }),
    actions: {
      toggleSideBar (withoutAnimation) {
        if (this.sidebar.hide) {
          return false;
        }
        this.sidebar.opened = !this.sidebar.opened

        this.sidebar.withoutAnimation = withoutAnimation
        if (this.sidebar.opened) {
          Cookies.set('sidebarStatus', 1)
        } else {
          Cookies.set('sidebarStatus', 0)
        }
      },
      closeSideBar({ withoutAnimation }) {
        Cookies.set('sidebarStatus', 0)
        this.sidebar.opened = false
        this.sidebar.withoutAnimation = withoutAnimation
      },
      toggleDevice(device) {
        this.device = device
      },
      setSize(size) {
        this.size = size;
        Cookies.set('size', size)
      },
      toggleSideBarHide(status) {
        this.sidebar.hide = status
      },

      setMenuStyle(style) { 
        this.menuStyle = style
        localStorage.setItem('menuStyle', style)
      }
    }
  })

export default useAppStore
