import React, { useState } from 'react';
import tmax from '../tmax.gif';
import 'antd/dist/antd.css';
import '../App.css';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, Redirect } from 'react-router-dom';


function NormalLoginForm ({authenticated, login, location, loginInProgress}) {
  // const [id, setId] = useState('');
  // const [password, setPassword] = useState('');

  // const handleClick = () => {
  //   try{
  //     login({ id, password })
  //   } catch (e) {
  //     alert('로그인에 실패하였습니다.')
  //     setId('')
  //     setPassword('')
  //   }
  // }

  const onFinish = (values) => {
    // console.log('Received values of form: ', values);
    let id = values.id;
    let password = values.password;
    try{
      login({ id, password })
    } catch (e) {
      alert('로그인에 실패하였습니다.')

    }
  };

  const { from } = location.state || { from: { pathname: "/main" } }
  
  if (authenticated) return <Redirect to={from} />

  return (
    <Form style={{margin: 'auto', maxWidth: '20%'}}
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="id"
        rules={[
          {
            required: true,
            message: '아이디를 입력하세요.',
          },
        ]}
      >
        <Input 
          type='text'
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="ID" 
          disabled={loginInProgress}
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: '비밀번호를 입력하세요.',
          },
        ]}
      >
        <Input
          type="password"
          placeholder="비밀번호"
          disabled={loginInProgress}
        />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox disabled={loginInProgress}>ID 기억하기</Checkbox>
        </Form.Item>

      </Form.Item>

      <Form.Item>
        <Button style={{ margin: '10px' }} type="primary" htmlType="submit" className="login-form-button" loading={loginInProgress}>
          로그인
        </Button>
        <br/>
        또는 <Link to='/sign'>새로 가입하기</Link>
      </Form.Item>
    </Form>
  );
};

  function Login({authenticated, login, location, loginInProgress}) {
    return (
      <div className="App">
        <header className="App-header">
          <a href="http://aria.sparcs.org:32785" style={{ display: 'inline-block' }}>
            <img src={tmax} className="App-logo" alt="logo" />
          </a>
          <NormalLoginForm authenticated={authenticated} login={login} location={location} loginInProgress={loginInProgress}/>
        </header>
      </div>
    );
}

export default Login;
