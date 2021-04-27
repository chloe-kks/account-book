import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import 'antd/dist/antd.css';
import {
  Layout, Menu, Table, Button, Input,
  Pagination, Modal, Form, Radio, DatePicker,
  Select, message, Space } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  DownOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;
const { Search } = Input;
const { Option } = Select;

// config
const reqBaseUrl = 'http://192.1.4.246:14000/AB3-5/OJT/';
const pageSizeDefault = 10;
const modanFormLayout = {
  labelCol: {
    span: 6,
  },
};

// table columns
const columns = [
  {
    title: '카드명',
    dataIndex: 'cardName',
    width: '13%',
  },
  {
    title: '카드사',
    dataIndex: 'cardCompany',
    width: '13%',
  },
  {
    title: '카드번호',
    dataIndex: 'cardNum',
    width: '20%',
  },
  {
    title: '결제계좌은행',
    dataIndex: 'bank',
    width: '13%',
  },
  {
    title: '결제계좌번호',
    dataIndex: 'bankAccount',
    width: '20%',
  },
  {
    title: '유효기간',
    dataIndex: 'cardExpirationDate',
    width: '13%',
  },
  {
    title: '상태',
    dataIndex: 'cardStatus',
    width: '8%',
  },
];




class CardTable extends React.Component {

  state = {
    username: window.sessionStorage.getItem("id"),
    selectedRowKeys: [], // Check here to configure the default column
    loading: true,
    requestInProgress: false,
    
    cardcoList: [],
    bankList: [],
    cardData: [],
    selectedCardData: [],
    maxDataCount: -1,
    pageSize: pageSizeDefault,
    pageIdx: 1,
    searchString: null,
    
    isAddCardDiagVisible: false,
    isModCardDiagVisible: false,
    isDelCardDiagVisible: false,
    
    formInputCardNum: "",
    formInputBankAcc: "",
  };

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
    //console.log(selectedRowKeys);
  };

  setPageStates = (page, pageSize) => {
    this.setState({ pageSize: pageSize, pageIdx: page });
  }
    


  //////////////////// force input ////////////////////

  // initializeInputValues: initialize all states in arg list to empty string
  initializeInputValues = (inputValueStateNameList) => {
    let resultObj = {};
    if (inputValueStateNameList != null
      && Array.isArray(inputValueStateNameList)) {
      inputValueStateNameList.forEach(name => resultObj[name] = "");
    }
    this.setState(resultObj);
  }


  // forceInputInPattern: if new value does not match pattern in input,
  //                      then it cancels the change
  //
  //                      - Prerequisites: need to set values of input as state
  //
  //                      Ex) <Input onInput={(e) => this.forceInputInPattern(e, 'stateName')}
  //                            value={stateName} ... />
  //
  forceInputInPattern = (e, inputValueStateName) => {
    console.log('forceInputInPattern', e, inputValueStateName);
    let resultObj = {};
    resultObj[inputValueStateName] =
      (e.target.validity.valid)
      ? e.target.value
      : this.state[inputValueStateName];
    
    this.setState(resultObj);
  }

  // forceFormInputInPattern: if new value of a form does not match the pattern
  //                          of the given field_info_regex, then it cancels the change
  //
  //                          - Prerequisites: - states for each input, refs for each form
  //                                           - no need to set values of input as state
  //
  //                          * formRef: a reference which is created by React.createRef(),
  //                                     and assigned by <Form ... ref={this.createdRef} ...>
  //                          * fieldInfoMap: { formItemName1: [ stateName1, regExp1, stringProcFunc1 ]
  //                                            formItemName2: [ stateName2, regExp2, stringProcFunc2 ],
  //                                            ... }
  //
  //                      Ex) <Form onValuesChange={(changedValues) => {
  //                              this.forceFormInputInPattern(formRef, changedValues, fieldInfoMap);
  //                            }}
  //                            ref={formRef} ...>
  //
  forceFormInputInPattern = (formRef, changedValues, fieldInfoMap) => {
    
    Object.keys(changedValues).forEach((k) => {
      
      if (fieldInfoMap[k] != null) {
        let newValue = changedValues[k];
        const stateName = fieldInfoMap[k][0];
        const regExp = fieldInfoMap[k][1];
        const stringProcFunc = fieldInfoMap[k][2];
          
        // if string process function exists, execute
        if (stringProcFunc != null) {
          newValue = stringProcFunc(newValue);
        }
        
        let fieldValue = {};
        if (newValue.match(regExp)) {
          fieldValue[k] = newValue;
          this.state[stateName] = newValue;
        } else {
          fieldValue[k] = this.state[stateName];
        }
      
        formRef.current.setFieldsValue(fieldValue);
      }
    });

  }


  cardNumSetDash = (input) => {
    return (input.slice(0,4) + '-' + input.slice(4,8)
            + '-' + input.slice(8,12) + '-' + input.slice(12,16)).replace(/-+$/, '');
  }
  
  cardNumAppendDash = (input) => {
    let returnVal = input;
    if (input.match(/^\d+$/)) {
      returnVal = this.cardNumSetDash(input);
    }
    if (returnVal.length <= 19 && returnVal.match(/\d{5}$/)) {
      const valLen = returnVal.length;
      returnVal = input.slice(0, valLen - 1) + '-' + input.substr(valLen - 1);
    }
    return returnVal;
  }

  cardNumRemoveDash = (input) => {
    return input.replace(/-/g, '');
  }

    
  fieldInfoMap = {
    cardNum: ['formInputCardNum',
              /^(\d(\d(\d(\d(-(\d(\d(\d(\d(-(\d(\d(\d(\d(-(\d(\d(\d(\d)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?)?$/,
              this.cardNumAppendDash],
    bankAccount: ['formInputBankAcc', /^\d*$/],
  }



  
  //////////////////// data fetch ////////////////////

  // getCodeList: get available codename list
  getCodeList = () => {
    
    // POST request
    const reqOpt = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        header: {
          DATA_TYPE: 'J'
        }
      })
    };

    // send request & get response (card company list)
    let response = fetch(reqBaseUrl + 'GetCardcoList?action=SO', reqOpt)
        .then(res => res.json());
    
    // response handling
    response.then(
      (responseJson) => {
        let newState = {cardcoList: null};
        
        // received data successfully
        if ('dto' in responseJson && 'STR_VAL' in responseJson.dto) {
          
          // map data from json & compose dropdown menu
          newState.cardcoList = responseJson.dto.STR_VAL.map(
            (obj, idx) =>
              <Option key={idx} value={obj.STR_VAL}>
              {obj.STR_VAL}
            </Option>
          );
        }

        // no data received
        else {
          if ('exception' in responseJson) { 
            message.error('카드사 목록 요청이 실패하였습니다.');
          } else {
            message.error('카드사 목록이 존재하지 않습니다.');
          }
        }
        
        this.setState(newState);
      },
      
      // connection fail
      () => {
        //message.error('서버와 연결할 수 없습니다.');
        this.setState({cardcoList: null});
      }
    );

    // send request & get response (bank list)
    response = fetch(reqBaseUrl + 'GetBankList?action=SO', reqOpt)
      .then(res => res.json());
    
    // response handling
    response.then(
      (responseJson) => {
        let newState = {bankList: null};
        
        // received data successfully
        if ('dto' in responseJson && 'STR_VAL' in responseJson.dto) {

          // map data from json & compose dropdown menu
          newState.bankList = responseJson.dto.STR_VAL.map(
            (obj, idx) =>
              <Option key={idx} value={obj.STR_VAL}>
              {obj.STR_VAL}
            </Option>
          );
        }
        
        // no data received
        else {
          if ('exception' in responseJson) { 
            message.error('은행 목록 요청이 실패하였습니다.');
          } else {
            message.error('은행 목록이 존재하지 않습니다.');
          }
        }
        this.setState(newState);
      },
      
      // connection fail
      () => {
        //message.error('서버와 연결할 수 없습니다.');
        this.setState({bankList: null});
      }
    );
  }



  
  // fetchCardData: get cardinfo data
  fetchCardData = (pagination, filters, sorter) => {
    this.setState({loading: true});

    // set searchString
    const {
      searchString,
      username
    } = this.state;
    let searchCardName = searchString;
    let searchCardNum = searchString;

    // if filters has input, then use searchString from filter
    // as searchString from state is not updated yet
    if (filters != null) {
      if (filters.cardName != null) {
        searchCardName = filters.cardName[0];
      }
      if (filters.cardNum != null) {
        searchCardNum = filters.cardNum[0];
      }
    }

    let errStrPrefix;
    if (searchCardName == null) {
      errStrPrefix = '회원 \'' + username + '\' 의 ';
    } else {
      errStrPrefix = '검색어 \'' + searchCardName + '\' 에 해당하는 '
    }
    
    // POST request
    const reqOpt = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        header: {
          DATA_TYPE: 'J'
        },
        dto: {
          USER_ID: username,
          CARD_NM: searchCardName,
          CARD_NUM: searchCardNum,
          REQ_PAGESIZE: pagination.pageSize,
          REQ_PAGEIDX: pagination.current
        }
      })
    };
    
    // send request & get response
    let response = fetch(reqBaseUrl + 'ReadCardInfo?action=SO', reqOpt)
        .then(res => res.json());

    // response handling
    response.then(
      (responseJson) => {
        let newState = {loading: false};

        // received data successfully
        if ('dto' in responseJson && 'CardInfo' in responseJson.dto
            && responseJson.dto.CardInfo.length > 0) {

          newState.selectedRowKeys = [];
          
          let mappedCardData = responseJson.dto.CardInfo.map((cardinfo, idx) => ({
            key: idx,
            cardName: cardinfo.CARD_NM,
            cardCompany: cardinfo.CARDCO_NM,
            cardNum: this.cardNumSetDash(cardinfo.CARD_NUM),
            bankAccount: cardinfo.BANK_ACC,
            bank: cardinfo.BANK_NM,
            cardExpirationDate: moment(new Date(cardinfo.CARD_EXPIRED)).format('MM/YY'),
            cardStatus: cardinfo.CARD_STATUS
          }));
          newState.cardData = mappedCardData;
          newState.pageIdx = pagination.current;

          if (!(pagination.current > 0)) {
            newState.maxDataCount = responseJson.dto.CardInfo[0].REQ_PAGEIDX;
            newState.pageIdx = 1;
          }
        }
        
        // no data received
        else {
          if ('exception' in responseJson) { 
            message.error('서버와 연결할 수 없습니다.');
          } else {
            message.error(errStrPrefix + '카드가 존재하지 않습니다.');
          }
          newState.cardData = [];
        }
        this.setState(newState);
      },
      
      // connection fail
      () => {
        message.error('서버와 연결할 수 없습니다.');
        this.setState({cardData: null, loading: false});
      }
    );
  }



  
  //////////////////// modal ////////////////////

  
  // showAddCardDiag: show add modal
  showAddCardDiag = () => {
    this.setState({
      isModCardDiagVisible: false,
      isDelCardDiagVisible: false,
      isAddCardDiagVisible: true
    });
  };

  
  // hideAddCardDiag: hide add modal
  hideAddCardDiag = () => {
    this.setState({ isAddCardDiagVisible: false });
  };
  

  // showModCardDiag: show mod modal
  showModCardDiag = () => {

    // set card data to show on mod modal
    const {
      selectedRowKeys,
      cardData,
      selectedCardData
    } = this.state;

    let targetData = cardData[selectedRowKeys[0]];
    
    this.setState({
      isAddCardDiagVisible: false,
      isDelCardDiagVisible: false,
      isModCardDiagVisible: true,
      selectedCardData: {
        cardNum: targetData.cardNum,
        cardName: targetData.cardName,
        cardCompany: targetData.cardCompany,
        bank: targetData.bank,
        bankAccount: targetData.bankAccount,
        cardExpirationDate: moment(targetData.cardExpirationDate, 'MM/YY'),
        cardStatus: targetData.cardStatus
      }
    });
  };

  
  // hideModCardDiag: hide mod modal
  hideModCardDiag = () => {
    this.setState({ isModCardDiagVisible: false });
  };


  // showDelCardDiag: show del modal
  showDelCardDiag = () => {

    // set card data to process on del modal
    const {
      selectedRowKeys,
      cardData
    } = this.state;

    
    let targetData = selectedRowKeys.map(selectedIdx => cardData[selectedIdx].cardNum);
;
    
    this.setState({
      isAddCardDiagVisible: false,
      isModCardDiagVisible: false,
      isDelCardDiagVisible: true,
      selectedCardData: targetData
    });
  };

  
  // hideDelCardDiag: hide del modal
  hideDelCardDiag = () => {
    this.setState({ isDelCardDiagVisible: false });
  };



    
  // createCardinfoModalForm: returns add/mod cardinfo modal form, which can be inserted in render()
  createCardinfoModalForm = (formId, titleText, submitText, cancelText, visibleState, hideFunc, submitFunc, initValues, itemDisabledStates) => {
    
    const {
      requestInProgress,
      cardcoList, bankList
    } = this.state;
    
    if (initValues == null) {
      initValues = {cardStatus: '사용'};
    }

    // reset forced inputs when hide modal
    const hideFuncInitValues = (e) => {
      // list of value states to initialize when closed
      this.initializeInputValues(
        [
          'formInputCardNum',
          'formInputBankAcc',
        ]
      );
      // execute hideFunc
      hideFunc(e);
    }


    //const forceInputInPattern = (e, inputValueStateName) => {
    //  (this.forceInputValidity.bind(this))(e, inputValueStateName);
    //}
  
    return (
        <Modal title={titleText} visible={visibleState}
        onCancel={hideFuncInitValues}
      destroyOnClose={true}
      footer={[
          <Button type="default" disabled={requestInProgress} onClick={hideFuncInitValues}>
          {cancelText}
        </Button>,
          <Button form={formId} type="primary"
        key="submit" htmlType="submit" loading={requestInProgress}>
          {submitText}
        </Button>
      ]}
        >
        <Form id={formId} onFinish={submitFunc}
        onValuesChange={(changedValues) => {
            this.forceFormInputInPattern(this[formId], changedValues, this.fieldInfoMap);
        }}
        ref={this[formId]}
      initialValues={initValues}
      {...modanFormLayout} >
        
        
        <Form.Item name='cardName' label='카드명'
        rules={[
          {
            required: true,
            message: '필수 입력 항목입니다.',
          },
        ]}>
        <Input
        disabled={itemDisabledStates ? itemDisabledStates.cardName : null} />
        </Form.Item>
        
        <Form.Item name='cardCompany' label='카드사'
        rules={[
          {
            required: true,
            message: '필수 선택 항목입니다.',
          },
        ]}>
        <Select placeholder='카드사 선택' onChange={this.onCardcoSelectClick}
        disabled={itemDisabledStates ? itemDisabledStates.cardCompany : null} 
        style={{ width: 200 }} >
        {cardcoList}
        </Select>
        </Form.Item>
        
        <Form.Item name='cardNum' label='카드번호'
        rules={[
          {
            required: true,
            message: '필수 입력 항목입니다.',
          },
          {
            len: 19,
            message: '유효한 카드번호가 아닙니다.',
          }
        ]}>
        <Input placeholder="####-####-####-####"
        disabled={itemDisabledStates ? itemDisabledStates.cardNum : null} 
        style={{ width: 200 }}/>
        </Form.Item>
        
        <Form.Item name='bank' label='결제계좌은행'
        rules={[
          {
            required: true,
            message: '필수 선택 항목입니다.',
          },
        ]}>
        <Select placeholder='은행 선택' onChange={this.onBankSelectClick}
      disabled={itemDisabledStates ? itemDisabledStates.bank : null} 
        style={{ width: 200 }}>
        {bankList}
        </Select>
        </Form.Item>
            
        <Form.Item name='bankAccount' label='결제계좌번호'
        rules={[
          {
            required: true,
            message: '필수 입력 항목입니다.',
          }
        ]}
        >
        <Input type="text" placeholder="'-' 없이 숫자만 입력"
        disabled={itemDisabledStates ? itemDisabledStates.bankAccount : null} 
        style={{ width: 200 }} />
        </Form.Item>

        
        <Form.Item name='cardExpirationDate' label='유효기간'
        rules={[
          {
            required: true,
            message: '필수 선택 항목입니다.',
          },
        ]}>
        <DatePicker placeholder='MM/YY' picker='month' format='MM/YY'
        disabled={itemDisabledStates ? itemDisabledStates.cardExpirationDate : null}
        style={{ width: 145 }} />
        </Form.Item>
        
        <Form.Item name='cardStatus' label='상태'
        rules={[
          {
            required: true,
            message: '필수 선택 항목입니다.',
          },
        ]}>
        <Radio.Group value='cardStatus'
      disabled={itemDisabledStates ? itemDisabledStates.cardStatus : null}>
        <Radio.Button value='사용'>사용</Radio.Button>
        <Radio.Button value='사용중지'>사용중지</Radio.Button>
        </Radio.Group>
        </Form.Item>
            
        </Form>
        </Modal>
    );
  };




  // createConfirmModalForm: create modal for confirm
  createConfirmModalForm = (formId, titleText, confirmText, visibleState, hideFunc, submitFunc) => {

    const { requestInProgress } = this.state;

    return (
        <Modal title={titleText} visible={visibleState}
      onCancel={hideFunc}
      destroyOnClose={true}
      footer={[
          <Button type="default" onClick={hideFunc}>
          취소
        </Button>,
          <Button form={formId} type="primary"
        key="submit" htmlType="submit" loading={requestInProgress}>
          확인
        </Button>
        ]}
        >
        <Form id={formId} onFinish={submitFunc}>
        
      {confirmText}
        
        </Form>
        </Modal>
    );
  }
  

    
  
  //////////////////// add & mod & del card info ////////////////////
  
  // setCardInfo: send insert/update request
  setCardInfo = (cardinfo) => {
    
    const {
      pageSize,
      isAddCardDiagVisible,
      username
    } = this.state;
    
    this.setState({requestInProgress: true});
    
    const workName = isAddCardDiagVisible ? '추가' : '수정';
    
    var expirationDate = new Date(cardinfo.cardExpirationDate);
    // POST request
    const reqOpt = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        header: {
          DATA_TYPE: 'J'
        },
        dto: {
          USER_ID: username,
          CARD_NM: cardinfo.cardName,
          CARDCO_NM: cardinfo.cardCompany,
          CARD_NUM: this.cardNumRemoveDash(cardinfo.cardNum),
          BANK_NM: cardinfo.bank,
          BANK_ACC: cardinfo.bankAccount,
          CARD_EXPIRED: [expirationDate.getFullYear(),
                         expirationDate.getMonth() + 1].join('-'),
          CARD_STATUS: cardinfo.cardStatus
        }
      })
    };

    // send request & set response data to state
    let response = fetch(reqBaseUrl +
                         (isAddCardDiagVisible ?
                          'InsertCardInfo' : 'UpdateCardInfo') + '?action=SO',
                         reqOpt)
        .then(res => res.json());

    // response handling
    response.then(
      (responseJson) => {
        if (!('exception' in responseJson)) {
          message.success('카드가 ' + workName + '되었습니다.');
          setTimeout(() => {
            this.setState({
              isAddCardDiagVisible: false,
              isModCardDiagVisible: false,
              requestInProgress: false});
            this.fetchCardData({pageSize: pageSize, current: -1});
          }, 1000);
        } else {
          message.error('카드를 ' + workName + '하는 도중 오류가 발생하였습니다.');
          this.setState({requestInProgress: false});
          //console.log(responseJson);
        }
      },
      () => {
        message.error('서버와 연결할 수 없습니다.');
        this.setState({requestInProgress: false});
      }
    );
  }


  // delCardInfo: send delete requests
  delCardInfo = (cardinfo) => {
    
    const {
      pageSize,
      selectedCardData
    } = this.state;
    
    this.setState({requestInProgress: true});

    const totalCount = selectedCardData.length;
    let finishedCount = 0;
    let succeededCount = 0;

    
    selectedCardData.forEach((cardNum) => {
      
      const reqOpt = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header: {
            DATA_TYPE: 'J'
          },
          dto: {
            CARD_NUM: this.cardNumRemoveDash(cardNum)
          }
        })
      };
      
      let response = fetch(reqBaseUrl + 'DeleteCardInfo?action=SO', reqOpt)
          .then(res => res.json());

      response.then(
        (responseJson) => {
          
          if (!('exception' in responseJson)) {
            succeededCount++;
            finishedCount++;
          } else {
            finishedCount++;
            //console.log(responseJson);
          }

          if (finishedCount == totalCount) {
            if (succeededCount == totalCount) {
              message.success('카드가 삭제되었습니다.');
              this.fetchCardData({pageSize: pageSize, current: -1});
            } else {
              message.error('카드를 삭제하는 도중 오류가 발생하였습니다.');
            }
            this.setState({requestInProgress: false, isDelCardDiagVisible: false});
          }
          
        },
        () => {
          
          finishedCount++;
          
          if (finishedCount == totalCount) {
            message.error('카드를 삭제하는 도중 오류가 발생하였습니다.');
            this.setState({requestInProgress: false, isDelCardDiagVisible: false});
          }
        }
      );
    });
    
  }

  

  //////////////////// search data ////////////////////

  // onSearch: set search string before fetching data
  onSearch = (searchStringInput) => {
    const { pageSize } = this.state;

    if (!searchStringInput) {
      searchStringInput = null;
    } 

    this.setState({ searchString: searchStringInput });
    this.fetchCardData({pageSize: pageSize, current: -1},
                       {cardName: [searchStringInput], cardNum: [searchStringInput]});
  };
  

  
  //////////////////// initial fetch ////////////////////


  constructor(props) {
    super(props);
    this.addForm = React.createRef();
    this.modForm = React.createRef();
  }
  
  componentDidMount() {
    this.fetchCardData({pageSize: pageSizeDefault, current: -1});
    this.getCodeList();
  }


  //////////////////// render ////////////////////
  
  render() {
    
    const {
      loading, selectedRowKeys, selectedCardData,
      cardData, pageSize, pageIdx, maxDataCount,
      isAddCardDiagVisible, isModCardDiagVisible, isDelCardDiagVisible,
      requestInProgress,
      cardcoList, bankList
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const pagination = {
      defaultPageSize: pageSize,
      current: pageIdx,
      total: maxDataCount,
      onChange: this.setPageStates
    }
    const itemSelected = selectedRowKeys.length > 0;
    const oneItemSelected = selectedRowKeys.length == 1;
    
    return (
        <div>
        <div style={{ marginTop: 10, marginBottom: 10, display: 'flex'}}>


      
        <Space align='start' style={{ float: 'left' }}>
        <Search placeholder="카드명 또는 카드번호" onSearch={this.onSearch} style={{ width: 200 }} />
        </Space>


      
        <Button onClick={this.showAddCardDiag}
        style={{ marginLeft: 'auto', marginRight: '2px' }} >
        추가
      </Button>
        
      {this.createCardinfoModalForm("addForm", "카드 추가", "추가", "취소",
                                    isAddCardDiagVisible,
                                    this.hideAddCardDiag,
                                    this.setCardInfo,
                                    null)}
      
        <Button onClick={this.showModCardDiag} disabled={!oneItemSelected}
        style={{ marginRight: '2px' }}>
        수정
      </Button>
        
      {this.createCardinfoModalForm("modForm", "카드 수정", "수정", "취소",
                                    isModCardDiagVisible,
                                    this.hideModCardDiag,
                                    this.setCardInfo,
                                    selectedCardData,
                                    {
                                      cardNum: true,
                                      cardCompany: true,
                                      cardExpirationDate: true
                                    })}
      
        <Button danger onClick={this.showDelCardDiag} disabled={!itemSelected}
        style={{ marginRight: '2px' }}>
        삭제
      </Button>


      {this.createConfirmModalForm("delForm", "카드 삭제",
                                   "선택된 카드를 모두 삭제하시겠습니까?",
                                   isDelCardDiagVisible,
                                   this.hideDelCardDiag,
                                   this.delCardInfo)}

      

      
      </div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={cardData} onChange={this.fetchCardData} pagination={pagination} loading={loading} />
        </div>
    );
  }
}

class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    //console.log(collapsed);
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
        <Menu theme="dark" defaultSelectedKeys={['2']} mode="inline">
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
        <CardTable/>
        </Content>
        </Layout>
        </Layout>
    );
  }
}

function Card() {
  return (
      <SiderDemo />
  );
}

export default Card;

