import React, { useState } from 'react';
import crypto from 'crypto';

import { Link } from 'react-router-dom';
import '../App.css';
import 'antd/dist/antd.css';
import { Layout, Menu, Form, Input, Button, message } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

const FormLayoutDemo = () => {
  const [form] = Form.useForm();
  const [formLayout, setFormLayout] = useState('horizontal');
  const [reqInProgress, setReqInProgress] = useState(false);

  const onFormLayoutChange = ({ layout }) => {
    setFormLayout(layout);
  };

  const formItemLayout =
    formLayout === 'horizontal'
      ? {
          labelCol: {
            span: 4,
          },
          wrapperCol: {
            span: 14,
          },
        }
      : null;
  const buttonItemLayout =
    formLayout === 'horizontal'
      ? {
          wrapperCol: {
            span: 14,
            offset: 4,
          },
        }
      : null;


  const updatePw = (values) => {
    setReqInProgress(true);
    const id = window.sessionStorage.getItem('id');
    const oldpw = crypto.createHash('sha512').update(values.oldpw).digest('base64');
    const newpw = crypto.createHash('sha512').update(values.newpw).digest('base64');
    let p;
    let auth = false;
    const old_data = {
      "header": {
          "DATA_TYPE": "3"
      },
      "dto": {
          "USER_ID": id
      }
    }

    axios.post('http://192.1.4.246:14000/AB3-5/OJTWEB/ReadUserAccount?action=SO', old_data).then(response => {
      // console.log('old post data: '+JSON.stringify(old_data))
      // console.log(response)
      p = response.data.dto.USER_PW;
      if (oldpw != p){
        message.error('잘못된 비밀번호입니다.')
        setReqInProgress(false)
      } else {
        const new_data = {
          "header": {
              "DATA_TYPE": "3"
          },
          "dto": {
              "USER_ID": id,
              "USER_PW": newpw,
          }
        }
          // console.log('auth true!')
        axios.post('http://192.1.4.246:14000/AB3-5/OJTWEB/UpdatePWUserAccount?action=SO', new_data).then(response => {
          // console.log('new post data: '+JSON.stringify(new_data))
          // console.log('update')
          setTimeout(() => {
            message.success('비밀번호가 변경되었습니다.')
            setReqInProgress(false)
          }, 1000);
        }).catch(error => {
          message.error('비밀번호 변경에 실패하였습니다.')
          setReqInProgress(false)
        });
      }
      // alert('비밀번호를 변경하였습니다.')
    }).catch(error => {
      message.error('서버와의 통신에 실패하였습니다.')
      setReqInProgress(false)
    });
  }

  return (
    <>
      <Form style = {{margin: 'auto', maxWidth: '40vw', paddingRight: '30px'}}
        {...formItemLayout}
        layout={formLayout}
        form={form}
        initialValues={{
          layout: formLayout,
        }}
        onValuesChange={onFormLayoutChange}
        onFinish={updatePw}
      >
        <Form.Item name="oldpw" label="현재 비밀번호"
          rules={[
            {
              required: true,
              message: '현재 비밀번호를 입력해주세요.',
            },
          ]}
          >
          <Input.Password disabled={reqInProgress}/>
        </Form.Item>
        <Form.Item name="newpw" label="새로운 비밀번호"
            rules={[
              {
                required: true,
                message: '변경할 비밀번호를 입력해주세요.',
              },
            ]}
            >
          <Input.Password disabled={reqInProgress}/>
        </Form.Item>

        <Form.Item {...buttonItemLayout}>
          <Button type="primary" htmlType="submit" loading={reqInProgress}>변경</Button>
        </Form.Item>

      </Form>
    </>
  );
};

class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  handleClick(){
    window.location.href = "http://aria.sparcs.org:32785";
    window.sessionStorage.clear();
    window.location.reload();
  }

  render() {
    const { collapsed } = this.state;
    return (
      <Layout style={{ minHeight: '100vh' }}>
 <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          <div className="logo" />
          <Menu theme="dark" defaultOpenKeys={['sub1']} defaultSelectedKeys={['4']} mode="inline">
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
          <Content style={{ paddingTop: '10vw', paddingLeft: '5vw' }}>
            <FormLayoutDemo />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

function UserInfoPw() {
  return (
    <SiderDemo />
  );
}

export default UserInfoPw;
