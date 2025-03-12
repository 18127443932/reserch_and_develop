import { Menu } from '@arco-design/web-react'
import style from './index.module.less'
import { routerConfig, MenuItemConfig } from '../../routers/config'
const MenuItem = Menu.Item
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

const renderMenu = (config: MenuItemConfig[] | undefined) => {
  if (!config) {
    return null
  }
  return config.map((item) => {
    if (item.type === 'group') {
      return (
        <MenuItemGroup key={item.key} title={item.title}>
          {renderMenu(item.children)}
        </MenuItemGroup>
      )
    }
    if (item.children) {
      return (
        <SubMenu
          key={item.key}
          title={
            <>
              {item.icon && <item.icon />}
              {item.title}
            </>
          }
        >
          {renderMenu(item.children)}
        </SubMenu>
      )
    }
    return (
      <MenuItem key={item.key} disabled={item.disabled}>
        {item.title}
      </MenuItem>
    )
  })
}

const SideBar = () => {
  return (
    <div className={style.sidebar}>
      <Menu
        style={{ width: 200, height: '100%' }}
        hasCollapseButton
        defaultOpenKeys={['0']}
        defaultSelectedKeys={['0_1']}
      >
        {renderMenu(routerConfig)}
      </Menu>
    </div>
  )
}

export default SideBar
