import request from '../utils/request';
import { stringify } from 'qs';
import hex_md5 from 'js-md5';
import moment from 'moment';

const baseUrl = 'http://183.47.46.242:8008'
// const baseUrl = 'https://183.47.46.242:5443'
// https://183.47.46.242:5443/api/h5/departments.php?&usernumber=10010009@kinet&timestamp=353264812&sign=e1eb4df33d5d93205d52b33658ee087d
const options = {
	credentials: 'omit',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
	},
}

function getParams (params = {}, isStringify = true) {
	let {usernumber, pwd, moreParams={}} = params
	let timestamp = moment().format('YYYY-MM-DD, hh:mm:ss');
	let sign = hex_md5(`${usernumber}${timestamp}${pwd}`)
	return isStringify ? stringify({...moreParams,usernumber, timestamp, sign}) : {...moreParams,usernumber, timestamp, sign}
}

export async function queryUsers(params) {
  return request(`${baseUrl}/api/h5/departments.php?${getParams(params)}`, options);
}

export async function getOnlineUsers(params) {
	return request(`${baseUrl}/api/h5/get_online_user.php?${getParams(params)}`, options);
}

export async function getCallRecords(params) {
	params = getParams(params,false)
	const {usernumber, timestamp, sign, end_stamp, start_stamp, caller_id_number, destination_number}= params
	
	return request(`${baseUrl}/api/h5/get_cdr.php?`,
    {
       ...options,
      method: 'POST',
			requestType: 'form',
			body: `usernumber=${usernumber}&timestamp=${timestamp}&sign=${sign}&end_stamp=${end_stamp}&start_stamp=${start_stamp}&destination_number=${destination_number}&caller_id_number=${caller_id_number}`
    }
  );
}
