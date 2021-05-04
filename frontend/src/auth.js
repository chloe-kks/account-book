import axios from 'axios';
import crypto from 'crypto';

const loginapi = "http://aria.sparcs.org:32783/api/info/users";

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
            "userId": id,
            "userPw": pw
        }
        let date = new Date();
        date = getFormatDate(date);
        axios.post(loginapi+"/1", data)
        .then(response => {
            const user = response.data;
            const main_login = JSON.stringify(user.lastLogin).slice(1,20);
            const new_data = {
            	"userId" : user.userId,
                "companyName": user.companyName,
                "companyEmail": user.companyEmail,
                "companyNumber": user.companyNumber,
                "lastLogin": date
            }
            // console.log(new_date)
            if (user != null){
                const auth = (user.userPw === pw);
                if(auth){
                    window.sessionStorage.setItem('id', user.userId);
                    window.sessionStorage.setItem('lastlogin', main_login);
                    // console.log(new_data)
                    axios.post('http://aria.sparcs.org:32783/api/info/users/1', new_data)
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
