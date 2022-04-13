import { GithubOutlined, TwitterOutlined } from '@ant-design/icons'
import { Button, Col, Divider, Layout, Row, Space, Typography } from 'antd'
import React from 'react'
import { useThemeSwitcher } from 'react-css-theme-switcher'
import { DiscordIcon } from './Discord'

interface Props {
  me?: any
}

const Footer: React.FC<Props> = () => {
  const { currentTheme } = useThemeSwitcher()
  return <>
    <Layout.Footer style={{ background: '#f0f2f5', paddingTop: '50px' }}>
      <Row>
        <Col lg={{ span: 18, offset: 3 }} md={{ span: 24, offset: 1 }} span={24}>
          <Row gutter={48}>
            <Col md={8} sm={12} span={24} style={{ marginBottom: '30px' }}>
              <Typography.Paragraph>
                <Button type="link" href="/" style={{ fontSize: '20px', fontWeight: 'bolder' }}
                  icon={<img src={currentTheme === 'dark' ? 'https://www.onlypacks.club/wp-content/uploads/2020/04/cropped-logo-onlypacks-2.png' : 'https://www.onlypacks.club/wp-content/uploads/2020/04/cropped-logo-onlypacks-2.png'} style={{ height: '24px' }} />}>
                </Button>
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary">
                Your free unlimited cloud storage service using the Telegram API.
              </Typography.Paragraph>
              {/* <Typography.Paragraph type="secondary">
                Made with &hearts; from Venezuela &#127470;&#127465;
              </Typography.Paragraph> */}
            </Col>
            <Col md={8} sm={12} span={24} style={{ marginBottom: '30px' }}>
              <Typography.Title level={5}>Support Us</Typography.Title>
              <Typography.Paragraph>
                <a href="https://onlypacks.club" target="_blank">
                  <img src="https://www.onlypacks.club/wp-content/uploads/2020/04/cropped-logo-onlypacks-2.png" style={{ width: '50%', maxWidth: '140px' }} />
                </a>
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary">
                <a href=""></a>.
              </Typography.Paragraph>
            </Col>
            <Col md={8} sm={12} span={24} style={{ marginBottom: '30px' }}>
              <Typography.Title level={5}>Social Media</Typography.Title>
              <Space direction="vertical">
                <Button type="link" size="small" href="https://github.com/edwinosky/nubegram" target="_blank" icon={<GithubOutlined />}>GITHUB</Button>
                <Button type="link" size="small" href="https://twitter.com/dulcehardcore" target="_blank" icon={<TwitterOutlined />}>TWITTER</Button>
                <Button type="link" size="small" href="https://www.facebook.com/onlypacksfree" target="_blank" icon={<GithubOutlined />}>FACEBOOK</Button>
                <Button type="link" size="small" href="https://t.me/onlypacksfree" target="_blank" icon={<GithubOutlined />}>TELEGRAM</Button>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider />
      <Typography.Paragraph style={{ textAlign: 'center' }}>
        Copyright &copy; {new Date().getFullYear()}
      </Typography.Paragraph>
    </Layout.Footer>
  </>
}

export default Footer
