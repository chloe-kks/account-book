import axios from 'axios';
import crypto from 'crypto';

export function onLogin ({ id, password }) {
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

    return new Promise ((resolve, reject) => {
        const pw = crypto.createHash('sha512').update(password).digest('base64');
        const data = {
            "header": {
                "DATA_TYPE": "3"
            },
            "dto": {
                "USER_ID": id,
                "USER_PW": pw
            }
        }
        let date = new Date();
        date = getFormatDate(date);
        axios.post('http://192.1.4.246:14000/AB3-5/OJTWEB/ReadUserAccount?action=SO', data)
        .then(response => {
            const user = response.data.dto;
            const main_login = JSON.stringify(user.LAST_LOGIN).slice(1,20);
            const new_data = {
                "header": {
                    "DATA_TYPE": "3"
                },
                "dto": {
                    "USER_ID": user.USER_ID,
                    "COMP_NM": user.COMP_NM,
                    "COMP_ADDR": user.COMP_ADDR,
                    "COMP_CONTACT": user.COMP_CONTACT,
                    "COMP_EMAIL": user.COMP_EMAIL,
                    "COMP_NUM": user.COMP_NUM,
                    "COMP_CEO_NM": user.COMP_CEO_NM,
                    "COMP_CEO_BIRTH": user.COMP_CEO_BIRTH.slice(0,10),
                    "LAST_LOGIN": date
                }
            }
            // console.log(new_date)
            if (user != null){
                const auth = (user.USER_PW === pw);
                if(auth){
                    window.sessionStorage.setItem('id', user.USER_ID);
                    window.sessionStorage.setItem('lastlogin', main_login);
                    // console.log(new_data)
                    axios.post('http://192.1.4.246:14000/AB3-5/OJTWEB/UpdateUserAccount?action=SO', new_data)
                    .then(response => {
                    }).catch((e) => {
                        console.log(e);
                    });
                    resolve(user);
                }else{
                    reject('not auth');
                }
            }else{
                reject('not exist');
            }
        }).catch((e) => {
            console.log(e);
            reject(e)
        });
    })
}