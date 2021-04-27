import './App.css';
import React, { useState, createRef } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Button } from 'antd';

import { onLogin } from './auth';
import AuthRoute from './AuthRoute';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Main from './Pages/Main';
import Sign from './Pages/Sign';
import Card from './Pages/Card';
import Payment from './Pages/Payment';
import UserInfoPw from './Pages/UserInfoPw';
import UserInfoChange from './Pages/UserInfoChange';
import Deny from './Pages/Deny';
import 'antd/dist/antd.css';
import { Layout, message } from 'antd';
const { Footer } = Layout;

// function onLogin ({ id, password }) {
//   return new Promise ((resolve, reject) => {
//       // const user = users.find(user => user.id === id && user.password === password);
//       // console.log(user)
//       // return user;
//       const data = {
//           "header": {
//               "DATA_TYPE": "3"
//           },
//           "dto": {
//               "USER_ID": id,
//               "USER_PW": password
//           }
//       }
//       var result;
//       axios.post('http://192.1.4.246:14000/AB3-5/OJTWEB/ReadUserAccount?action=SO', data)
//       .then(response => {
//           const user = response.data.dto;
//           const auth = (user.USER_PW === password);
//           console.log('Axios return: '+JSON.stringify(user))
//           resolve(user);
//       }).catch((e) => {
//           console.log('axios error');
//           reject(e)
//       });
//     })
// }

function App() {
  const [user, setUser] = useState();
  const authenticated = window.sessionStorage.getItem('id') != null;
  const id = window.sessionStorage.getItem('id');
  const lastlogin = window.sessionStorage.getItem('lastlogin');
  // const login = ({ id, password }) => {
  //   const { data: userinfo, error, isLoading } = useAsync({
  //     promiseFn: onLogin
  //   })
  //   setUser(userinfo);
  // }
  const [loginInProgress, setLoginInProgress] = useState(false);
  const login = ({ id, password }) => {
    setLoginInProgress(true);
    onLogin({ id, password })
          .then(response => {setUser(response)
                             setLoginInProgress(false)
                             message.success('\'' + id + '\'로 로그인 되었습니다.')})
    .catch((e) => { 
      console.log(e)
      message.error('로그인에 실패하였습니다.')
      setLoginInProgress(false)
    });
    // setUser(onLogin({ id, password }));
  }
  const logout = () => setUser(null);
  // console.log('App has User: '+JSON.stringify(user));
  console.log(authenticated);

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path='/' component={ Home } />
          <Route
            path='/login'
            render={props => (
              <Login authenticated={authenticated} login={login} loginInProgress={loginInProgress} {...props} />
            )}
          />
          <Route path='/sign' component={ Sign } />
          <AuthRoute
          authenticated={authenticated}
          path='/main'
          render={props =>  (
            <Main userid={id} lastlogin={lastlogin} logout={logout} />
          )}
          />
          <AuthRoute authenticated={authenticated}
          path='/card'
          render={props =>  (
            <Card userid={id} />
          )}
          />
          <AuthRoute authenticated={authenticated}
          path='/payment'
          render={props =>  (
            <Payment userid={id} />
          )}
          />
          <AuthRoute authenticated={authenticated}
          path='/userinfo/pw'
          render={props =>  (
            <UserInfoPw userid={id} />
          )}
          />
          {/* <AuthRoute authenticated={authenticated}
          path='/userinfo/change'
          render={props =>  (
            <UserInfoChange userid={id} />
          )}
          /> */}
          <Route path='/' component={ Deny } />
        </Switch>
      </Router>
      <Footer style={{ textAlign: 'center',  borderTop: '1px solid #e4e8eb', backgroundColor: '#fafbfc'}}>TmaxBI ©2021 Created by AB3-5</Footer>
    </div>
  );
}

export default App;

{/* <AuthRoute authenticated={authenticated}
path='/card'
render={props =>  (
  <Card userid={user.USER_ID} />
)}
/>
<AuthRoute authenticated={authenticated}
path='/payment'
render={props =>  (
  <Payment userid={user.USER_ID} />
 )}
/>
<AuthRoute authenticated={authenticated}
path='/userinfo/pw'
render={props =>  (
  <UserInfoPw userid={user.USER_ID} />
)}
/>
<AuthRoute authenticated={authenticated}
path='/userinfo/change'
render={props =>  (
  <UserInfoChange userid={user.USER_ID} />
)}
/>
<AuthRoute authenticated={authenticated}
path='/file' 
render={props =>  (
  <File userid={user.USER_ID} />
)}
/>   */}