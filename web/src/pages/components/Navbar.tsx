import { CrownOutlined, DashboardOutlined, LoginOutlined, LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Modal, Popover, Progress, Tag, Tooltip, Typography } from 'antd'
import Avatar from 'antd/lib/avatar/avatar'
import moment from 'moment'
import prettyBytes from 'pretty-bytes'
import React, { useState } from 'react'
import { useThemeSwitcher } from 'react-css-theme-switcher'
import { useHistory } from 'react-router'
import { Link, useLocation } from 'react-router-dom'
import useSWR from 'swr'
import { apiUrl, fetcher, req } from '../../utils/Fetcher'

interface Props {
  user?: any
}


const Navbar: React.FC<Props> = ({ user }) => {
  const history = useHistory()
  const { pathname } = useLocation()
  const { currentTheme } = useThemeSwitcher()
  const [logoutConfirmation, setLogoutConfirmation] = useState<boolean>(false)
  const [popoverVisibility, setPopoverVisibility] = useState<boolean>(false)
  const { data: usage } = useSWR('/users/me/usage', fetcher)

  const logout = async () => {
    await req.post('/auth/logout')
    return window.location.replace('/')
  }

  return <>
    <Layout.Header style={{ background: currentTheme === 'dark' ? '#1f1f1f' : '#0088CC', padding: '0 20px' }}>
      <div key="logo" className="logo" style={{ marginRight: '30px' }}>
        <Link to="/" style={{ color: '#fff' }}>
          <img src="https://www.onlypacks.club/wp-content/uploads/2020/04/cropped-logo-onlypacks-2.png" style={{ height: '24px' }} /> {user?.plan === 'premium' && <Popover placement="bottom" content={<Layout style={{ padding: '7px 13px' }}>Premium</Layout>}>
            <CrownOutlined />
          </Popover>}
        </Link>
        {/* <span>
          &nbsp;
          {location.host.match(/localhost/gi)
            ? <Tag color="green">Preview</Tag> : location.host.match(/^teledrive.*\.vercel\.app$/gi)
              ? <Tag color="blue">Staging</Tag> : !/^(\w*\.)?nube.onlypacks\.club$/.test(location.host) && <Tag color="red"></Tag>}
        </span> */}
      </div>
      {user ? <>{/\/dashboard/.test(pathname) ? <>
        <Popover visible={popoverVisibility} onVisibleChange={setPopoverVisibility} placement="bottomRight" trigger={['click']} content={<div>
          <div style={{ padding: '10px' }}>
            Bandwidth: { }
            {user?.plan === 'premium' ? <Tag color="green">Unlimited</Tag> : <Tooltip placement="left" title={<>You can download up to {prettyBytes(Math.max(0, 1_500_000_000 - Number(usage?.usage.usage) || 0))} until {moment(usage?.usage.expire).local().format('lll')}</>}>
              <Progress status="exception" percent={Number((Number(usage?.usage.usage || 0) / 1_500_000_000 * 1000).toFixed(1))} />
            </Tooltip>}
          </div>
          <Menu selectable={false} triggerSubMenuAction="click" onClick={({ key }) => {
            setPopoverVisibility(false)
            if (key === 'settings') {
              history.push('/settings')
            } else if (key === 'logout') {
              setLogoutConfirmation(true)
            }
          }}>
            <Menu.Item key="settings" icon={<SettingOutlined />}>Settings</Menu.Item>
            <Menu.Item danger key="logout" icon={<LogoutOutlined />}>Logout</Menu.Item>
          </Menu>
        </div>}>
          <Button type="link" style={{ color: '#ffff', float: 'right', top: '12px' }} icon={<Avatar src={`${apiUrl}/users/me/photo`} icon={<UserOutlined />} />} />
        </Popover>
      </> : <Button type="link" style={{ color: '#ffff', float: 'right', top: '16px' }} icon={<DashboardOutlined />} onClick={() => history.push('/dashboard')}>{window.innerWidth > 359 && 'Dashboard'}</Button>}</> :
        <Button onClick={() => history.push('/login')} type="link" style={{ color: '#ffff', float: 'right', top: '16px' }} icon={<LoginOutlined />}>LOGIN</Button>}
      <Menu selectable={false} overflowedIndicator={<MenuOutlined />} mode="horizontal" triggerSubMenuAction="click" theme={currentTheme === 'dark' ? 'light' : 'dark'}
        style={{ background: currentTheme === 'dark' ? '#1f1f1f' : '#0088CC', position: 'relative', display: 'flex', justifyContent: 'right' }}>
        {/* <Menu.Item onClick={() => history.push('/pricing')} key="pricing">Pricing</Menu.Item> */}
        <Menu.Item onClick={() => history.push('/faq')} key="faq">FAQ</Menu.Item>
        <Menu.Item onClick={() => history.push('/contact')} key="contact">CONTACTO</Menu.Item>
        {/* <Menu.Item onClick={() => history.push('/privacy')} key="privacy">Privacy Policy</Menu.Item> */}
        {/* <Menu.Item onClick={() => history.push('/terms')} key="terms">Terms</Menu.Item> */}
        {/* <Menu.Item onClick={() => history.push('/refund')} key="refund">Refund Policy</Menu.Item> */}
        <Menu.Item onClick={() => window.open('https://www.onlypacks.club', '_blank')} key="blog">BLOG</Menu.Item>
        <Menu.Item onClick={() => window.open('https://analytics.teledriveapp.com/share/4RhiPDRP/TeleDrive', '_blank')} key="analytics">ANALITYCS</Menu.Item>
      </Menu>
    </Layout.Header>

    <Modal title={<Typography.Text>
      <Typography.Text type="warning"><WarningOutlined /></Typography.Text> Confirmation
    </Typography.Text>}
    visible={logoutConfirmation}
    onCancel={() => setLogoutConfirmation(false)}
    onOk={logout}
    cancelButtonProps={{ shape: 'round' }}
    okButtonProps={{ danger: true, type: 'primary', shape: 'round' }}>
      <Typography.Paragraph>
        All the files you share will not be able to download once you sign out. Continue?
      </Typography.Paragraph>
    </Modal>
  </>
}

export default Navbar
