import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import 'antd/dist/antd.css';
import { Layout, Menu, Breadcrumb, Button } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    this.setState({ collapsed });
  };

  handleClick(){
    window.location.href = "http://aria.sparcs.org:32785";
    window.sessionStorage.clear();
    window.location.reload();
  }

  render() {
    const { collapsed } = this.state;
    const temp = window.sessionStorage.getItem('id');
    var login = '';
    if(this.props.lastlogin != null) login = this.props.lastlogin.slice(0,19);
    // console.log(this.props.lastlogin)
    // if(this.props.lastlogin.length != 0) login = this.props.lastlogin.slice(0, 19)
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<TeamOutlined />}>
              <Link to="/main">홈</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<PieChartOutlined />}>
              <Link to="/card">카드 관리</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<DesktopOutlined />}>
              <Link to="/payment">결제 내역</Link>
            </Menu.Item>
            <SubMenu key="sub1" icon={<UserOutlined />} title="회원 정보">
              <Menu.Item key="4"><Link to="/userinfo/pw">비밀번호 변경</Link></Menu.Item>
              {/* <Menu.Item key="5"><Link to="/userinfo/change">회원정보 수정</Link></Menu.Item> */}
            </SubMenu>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }}>
            <Button onClick={this.handleClick} style={{ float: 'right', margin: 15}}>
              Logout
            </Button>
          </Header>
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Admin</Breadcrumb.Item>
              <Breadcrumb.Item>User</Breadcrumb.Item>
            </Breadcrumb>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              마지막 접속: {login} <br/>
              {temp}님 어서오세요.
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

function Main({ userid, lastlogin }) {
  const userID = userid;
  const lastLogin = lastlogin;
  return (
    <SiderDemo userid={userID} lastlogin={lastLogin} />
  );
}



export default Main;

