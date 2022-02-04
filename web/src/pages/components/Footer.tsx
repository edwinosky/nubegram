import { GithubOutlined, TwitterOutlined } from '@ant-design/icons'
import { Button, Col, Divider, Layout, Row, Space, Typography } from 'antd'
import React from 'react'
import { useThemeSwitcher } from 'react-css-theme-switcher'
import { Link } from 'react-router-dom'

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
            <Col md={6} sm={12} span={24} style={{ marginBottom: '30px' }}>
              <Typography.Paragraph>
                <Button type="link" href="/" style={{ fontSize: '20px', fontWeight: 'bolder' }}
                  icon={<img src={currentTheme === 'dark' ? 'https://www.onlypacks.club/wp-content/uploads/2020/04/cropped-logo-onlypacks-2.png' : 'https://www.onlypacks.club/wp-content/uploads/2020/04/cropped-logo-onlypacks-2.png'} style={{ height: '24px' }} />}>
                </Button>
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary">
                Your free unlimited cloud storage service using the Telegram API.
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary">
                Made with &hearts; from Venezuela &#127470;&#127465;
              </Typography.Paragraph>
            </Col>
            <Col md={6} sm={12} span={24} style={{ marginBottom: '30px' }}>
              <Typography.Title level={5}>SOPORTE</Typography.Title>
              <Typography.Paragraph>
                <a href="https://opencollective.com/teledrive/contribute" target="_blank">
                  <img src="https://opencollective.com/teledrive/contribute/button@2x.png?color=blue" style={{ width: '100%', maxWidth: '240px' }} />
                </a>
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary">
                Or, become <a href="https://onlypacks.club/contact">a sponsor</a>.
              </Typography.Paragraph>
            </Col>
            <Col md={6} sm={12} span={24} style={{ marginBottom: '30px' }}>
              <Typography.Title level={5}>LINKS</Typography.Title>
              <Row>
                <Col span={12}>
                  <Space direction="vertical">
                    {/* <Link to="/pricing">Pricing</Link> */}
                    <Link to="/contact">CONTACTO</Link>
                    <Link to="/terms">TERMINOS</Link>
                    <Link target="_blank" to={{ pathname: 'https://www.onlypacks.club' }}>BLOG</Link>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical">
                    <Link to="/faq">FAQ</Link>
                    <Link to="/privacy">PRIVACIDAD</Link>
                    {/* <Link to="/refund">Refund Policy</Link> */}
                    <Link target="_blank" to={{ pathname: 'https://analitycs.onlypacks.club/share/LJKpC9hd/nubegram' }}>ANALITYCS</Link>
                  </Space>
                </Col>
              </Row>
            </Col>
            <Col md={6} sm={12} span={24} style={{ marginBottom: '30px' }}>
              <Typography.Title level={5}>SOCIAL</Typography.Title>
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