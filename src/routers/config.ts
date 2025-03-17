import { IconApps, IconBug, IconBulb } from '@arco-design/web-react/icon'

export interface MenuItemConfig {
  key: string
  title: string
  icon?: React.ComponentType
  disabled?: boolean
  type?: 'group'
  children?: MenuItemConfig[]
  routeInfo?: {
    path: string
  }
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
          {
            key: '0_0_0',
            title: 'useContext',
            routeInfo: { path: 'data_drive_ui/useContext' },
          },
          {
            key: '0_0_1',
            title: 'redux',
            routeInfo: { path: 'data_drive_ui/redux' },
          },
          {
            key: '0_0_2',
            title: 'rx_react',
            routeInfo: { path: 'data_drive_ui/rx_react' },
          },
        ],
      },
    ],
  },
  {
    key: '1',
    title: 'Video Track',
    icon: IconBug,
    children: [
      {
        key: '1_0',
        title: 'DrawFrame',
        routeInfo: { path: 'video_track/draw_frame' },
      },
      {
        key: '1_1',
        title: 'BaseRealize',
        routeInfo: { path: 'video_track/base_realize' },
      },
      {
        key: '1_2',
        title: 'MultiBaseRealize',
        routeInfo: { path: 'video_track/multi_base_realize' },
      },
      {
        key: '1_3',
        title: 'SingleBaseRealize',
        routeInfo: { path: 'video_track/single_base_realize' },
      },
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
