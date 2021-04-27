import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DaumPostcode from "react-daum-postcode";
import '../App.css';
import 'antd/dist/antd.css';
import {
  Layout,
  Menu,
  Form,
  Input,
  Select,
  Button,
  Modal,
  Space,
} from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;
const { Option } = Select;
const { Search } = Input;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const Postcode = () => {
  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = ''; 
    
    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    console.log(fullAddress);  // e.g. '서울 성동구 왕십리로2길 20 (성수동1가)'
  }

  return (
    <DaumPostcode
      onComplete={handleComplete}
    />
  );
}

const ModalContainer = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Space direction="vertical" onClick={showModal} style={{ width: '100%' }}>
        <Search placeholder="우편번호 검색" />
      </Space>
      <Modal visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Postcode/>
      </Modal>
    </>
  );
};

const RegistrationForm = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{
          width: 70,
        }}
      >
        <Option value="82">+82</Option>
        <Option value="1">+1</Option>
      </Select>
    </Form.Item>
  );

  return (
    <Form style={{margin: 'auto', maxWidth: '40%', paddingRight: '10%'}}
      {...formItemLayout}
      form={form}
      name="register"
      onFinish={onFinish}
      scrollToFirstError
    >
      <Form.Item
        name="comp_nm"
        label="법인명"
        rules={[
          {
            whitespace: true,
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="address"
        label="주소"
        rules={[
          {
            type: 'array',
          },
        ]}
      >
        <ModalContainer/>
      </Form.Item>

      <Form.Item
        name="ceo_nm"
        label="대표자 이름"
      >
        <Input/>
      </Form.Item>

      <Form.Item
        name="phone"
        label="대표 번호"
      >
        <Input
          addonBefore={prefixSelector}
          style={{
            width: '100%',
          }}
        />
      </Form.Item>

      <Form.Item
        name="email"
        label="대표 이메일"
        rules={[
          {
            type: 'email',
            message: '유효한 이메일이 아닙니다!',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="birth"
        label="생년월일"
      >
        <Input/>
      </Form.Item>

      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          수정
        </Button>
      </Form.Item>
    </Form>
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
    window.location.href = "http://localhost:3000";
    window.sessionStorage.clear();
    window.location.reload();
  }

  render() {
    const { collapsed } = this.state;
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          <div className="logo" />
          <Menu theme="dark" defaultOpenKeys={['sub1']} defaultSelectedKeys={['5']} mode="inline">
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
          <Content style={{ margin: '150px' }}>
              <RegistrationForm />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

function UserInfoChange() {
  return (
    <SiderDemo />
  );
}

export default UserInfoChange;

