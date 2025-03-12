import { IconApps, IconBug, IconBulb } from '@arco-design/web-react/icon'

export interface MenuItemConfig {
  key: string
  title: string
  icon?: React.ComponentType
  disabled?: boolean
  type?: 'group'
  children?: MenuItemConfig[]
}

export const routerConfig: MenuItemConfig[] = [
  {
    key: '0',
    title: 'Hooks',
    icon: IconApps,
    children: [
      {
        key: '0_0',
        title: 'data_drive_ui',
        type: 'group',
        children: [
          { key: '0_0_0', title: '未优化' },
          { key: '0_0_1', title: 'rx+react' },
        ],
      },
    ],
  },
  {
    key: '1',
    title: 'Navigation 2',
    icon: IconBug,
    children: [
      { key: '1_0', title: 'Menu 1' },
      { key: '1_1', title: 'Menu 2' },
      { key: '1_2', title: 'Menu 3' },
    ],
  },
  {
    key: '2',
    title: 'Navigation 3',
    icon: IconBulb,
    children: [
      {
        key: '2_0',
        title: 'Menu Group 1',
        type: 'group',
        children: [
          { key: '2_0_0', title: 'Menu 1' },
          { key: '2_0_1', title: 'Menu 2' },
        ],
      },
      {
        key: '2_1',
        title: 'Menu Group 1',
        type: 'group',
        children: [
          { key: '2_1_0', title: 'Menu 3' },
          { key: '2_1_1', title: 'Menu 4' },
        ],
      },
    ],
  },
]
