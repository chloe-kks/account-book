import React, { useState } from 'react';
import tmax from '../tmax.gif';
import 'antd/dist/antd.css';
import '../App.css';
import { Form, Input, Button, Checkbox } from 'antd';
import { Link } from 'react-router-dom';

const HomeForm = () => {

  return (
    <Form style={{margin: 'auto', maxWidth: '10%', paddingBottom: '10px', paddingTop: 30}}
      name="normal_home"
      className="login-form"
    >
      <Form.Item name="username">
        <Button style={{ width: '100%'}}><Link to="/login">로그인</Link></Button>
      </Form.Item>

      <Form.Item name="password">
        <Button style={{ width: '100%'}}><Link to="/sign">회원가입</Link></Button>
      </Form.Item>

    </Form>
  );
};

function Home() {
    return (
      <div className="App">
        <header className="App-header">
          <a href="http://aria.sparcs.org:32785" style={{ display: 'inline-block' }}>
            <img src={tmax} className="App-logo" alt="logo" />
          </a>
          <HomeForm/>
        </header>
      </div>
    );
}

export default Home;
