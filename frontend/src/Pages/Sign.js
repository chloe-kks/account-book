import '../App.css';
import axios from 'axios';
import tmax from '../tmax.gif';
import React, { useState } from 'react';
import DaumPostcode from "react-daum-postcode";
import 'antd/dist/antd.css';
import crypto from 'crypto';
import moment from 'moment';

import {
  Form,
  Input,
  Tooltip,
  Select,
  Checkbox,
  Button,
  Modal,
  Space,
  message,
  DatePicker
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
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

const Postcode = (props) => {
  // const [fullAddress, setFullAddress] = useState('');

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
    props.changeAddress(fullAddress);
  }

  return (
    <DaumPostcode
      onComplete={handleComplete}
    />
  );
}

const ModalContainer = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [address, setAddress] = useState('');
  const [reqInProgress, setReqInProgress] = useState({...props.reqInProgress});
  React.useEffect(() => {
      setReqInProgress(props.reqInProgress);
  }, [props.reqInProgress])
    
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const changeAddress = (e) => {
    setAddress(e);
    props.changeAddr(e);
  }

  return (
    <>
      <Space direction="vertical" onClick={showModal} style={{ width: '100%' }}>
        <Search placeholder={address} disabled={props.reqInProgress}/>
      </Space>
      <Modal visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Postcode changeAddress={e => changeAddress(e)} />
      </Modal>
    </>
  );
};

function getFormatDate(date){
  var year = date.getFullYear();              //yyyy
  var month = (1 + date.getMonth());          //M
  month = month >= 10 ? month : '0' + month;  //month 두자리로 저장
  var day = date.getDate();                   //d
  day = day >= 10 ? day : '0' + day;          //day 두자리로 저장
  var hour = date.getHours();
  hour = hour >= 10 ? hour : '0' + hour;
  var minute = date.getMinutes();
  minute = minute >= 10 ? minute : '0' + minute;
  var seconds = date.getSeconds();
  seconds = seconds >= 10 ? seconds : '0' + seconds;
  return  year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + seconds;       //'-' 추가하여 yyyy-mm-dd 형태 생성 가능
}

const RegistrationForm = () => {
  const [form] = Form.useForm();
  const [addr, setAddr] = useState('');
  const [reqInProgress, setReqInProgress] = useState(false);

  const onFinish = (values) => {
    setReqInProgress(true);
    // console.log('Received values of form: ', values);
    // console.log({addr});
    let big_addr = JSON.stringify({addr}).slice(9, -2);
    let date = new Date();
    date = getFormatDate(date);
    const pw = crypto.createHash('sha512').update(values.password).digest('base64');
    const data = {
      "header": {
          "DATA_TYPE": "3"
      },
      "dto": {
        "USER_ID": values.id,
        "USER_PW": pw,
        "COMP_NM": values.comp_nm,
        "COMP_ADDR": big_addr+' '+values.detail_address,
        "COMP_CONTACT": values.ceo_phone,
        "COMP_EMAIL": values.email,
        "COMP_NUM": values.comp_reg,
        "COMP_CEO_NM": values.ceo_nm,
        "COMP_CEO_BIRTH": moment(values.birth).format('YYYY-MM-DD'),
        "LAST_LOGIN": date
      }
    }
    console.log(data);
    axios.post('http://192.1.4.246:14000/AB3-5/OJTWEB/InsertUserAccount?action=SO', data).then(response => {
      message.success('회원가입이 완료되었습니다.')
      setReqInProgress(false)
      setTimeout(() => {
        window.location.href = '../';
      }, 1500);
      
    }).catch(error => {
      message.error('회원가입에 실패하였습니다. 잠시 후 다시 시도해주세요.')
      setReqInProgress(false)
    });
  };

  const changeAddr = (e) => {
    setAddr(e);
  }

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select disabled={reqInProgress}
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
    <Form style={{ margin: 'auto', maxWidth: '35%', paddingRight: '60px' }}
      {...formItemLayout}
      form={form}
      name="register"
      onFinish={onFinish}
      scrollToFirstError
    >
      <Form.Item
        name="id"
        label="ID"
        rules={[
          {
            required: true,
            message: '아이디를 입력해주세요!',
          },
        ]}
      >
        <Input disabled={reqInProgress}/>
      </Form.Item>

      <Form.Item
        name="password"
        label="비밀번호"
        rules={[
          {
            required: true,
            message: '비밀번호를 입력해주세요!',
          },
        ]}
        hasFeedback
      >
        <Input.Password disabled={reqInProgress}/>
      </Form.Item>

      <Form.Item
        name="confirm"
        label="비밀번호 확인"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: '비밀번호를 다시 입력해주세요!',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }

              return Promise.reject('비밀번호가 일치하지 않습니다!');
            },
          }),
        ]}
      >
        <Input.Password disabled={reqInProgress}/>
      </Form.Item>

      <Form.Item
        name="comp_nm"
        label="법인명"
        rules={[
          {
            required: true,
            message: '법인 이름을 입력하세요!',
            whitespace: true,
          },
        ]}
      >
        <Input disabled={reqInProgress}/>
      </Form.Item>

      <Form.Item
        name="comp_reg"
        label={
          <span>
            사업자등록번호&nbsp;
            <Tooltip title="하이픈(-)을 제외한 숫자만 입력하세요.">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
        rules={[
          {
            required: true,
            message: '사업자등록번호를 입력하세요!',
          },
        ]}
      >
        <Input disabled={reqInProgress}/>
      </Form.Item>

      <Form.Item
        name="address"
        label="주소"
      >
        <ModalContainer changeAddr={e => changeAddr(e)} reqInProgress={reqInProgress}/>
      </Form.Item>

      <Form.Item
        name="detail_address"
        label="상세 주소"
      >
        <Input disabled={reqInProgress}/>
      </Form.Item>

      <Form.Item
        name="ceo_nm"
        label="대표자 이름"
      >
        <Input disabled={reqInProgress}/>
      </Form.Item>

      <Form.Item
        name="ceo_phone"
        label="대표 번호"
      >
        <Input
          addonBefore={prefixSelector}
          style={{
            width: '100%',
          }}
          disabled={reqInProgress}
        />
      </Form.Item>

      <Form.Item
        name="email"
        label="대표 이메일"
        rules={[
          {
            type: 'email',
            message: '유효한 이메일이 아닙니다.',
          },
        ]}
      >
        <Input disabled={reqInProgress}/>
      </Form.Item>

      <Form.Item
        name="birth"
        label="대표 생년월일"
      >
        <DatePicker disabled={reqInProgress}
          placeholder='YYYY-MM-DD'
          style={{
            width: '100%',
          }}/>
      </Form.Item>

      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject('Should accept agreement'),
          },
        ]}
        {...tailFormItemLayout}
      >
        <Checkbox disabled={reqInProgress}>
          나는 <a href="https://kr.tmaxsoft.com/bbs.do?cms_cd=ETC_90">개인정보 처리방침</a>를 읽었으며, 이에 동의합니다.
        </Checkbox>
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit" loading={reqInProgress}>
          회원가입
        </Button>
      </Form.Item>
    </Form>
  );
};

function Sign() {
    return (
      <div className="App">
        <header className="App-header">
          <a href="http://aria.sparcs.org:32785" style={{ display: 'inline-block' }}>
            <img src={tmax} className="App-logo" alt="logo" />
          </a>
          <RegistrationForm/>
        </header>
      </div>
    );
}

export default Sign;

