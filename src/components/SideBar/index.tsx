import { useCallback } from 'react'
import { Menu } from '@arco-design/web-react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  const onClickMenuItem = useCallback(
    (key: string) => {
      const findPath = (
        config: MenuItemConfig[] | undefined,
        targetKey: string
      ): string | undefined => {
        if (!config) return undefined
        for (const item of config) {
          if (item.key === targetKey && item.routeInfo?.path) {
            return item.routeInfo.path
          }
          if (item.children) {
            const result = findPath(item.children, targetKey)
            if (result) return result
          }
        }
        return undefined
      }

      const path = findPath(routerConfig, key)
      if (path) {
        navigate(`/${path}`)
      }
    },
    [navigate]
  )

  return (
    <div className={style.sidebar}>
      <Menu
        style={{ width: 200, height: '100%' }}
        hasCollapseButton
        defaultOpenKeys={['0']}
        defaultSelectedKeys={['0_1']}
        onClickMenuItem={onClickMenuItem}
      >
        {renderMenu(routerConfig)}
      </Menu>
    </div>
  )
}

export default SideBar
