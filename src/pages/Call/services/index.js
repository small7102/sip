import request from '@/utils/request';
import { stringify } from 'qs';
import hex_md5 from 'js-md5';
import moment from 'moment';

const baseUrl = 'http://183.47.46.242:8008'
const options = {
	credentials: 'omit',
}

function getParams (params = {}) {
	let {usernumber, pwd} = params
	let timestamp = moment().format('YYYY-MM-DD, hh:mm:ss');
	let sign = hex_md5(`${usernumber}${timestamp}${pwd}`)
	return stringify({usernumber, timestamp, sign})
}

export async function queryUsers(params) {
  return request(`${baseUrl}/api/h5/departments.php?${getParams(params)}`, options);
}

export async function getOnlineUsers(params) {
	return request(`${baseUrl}/api/h5/get_online_user.php?${getParams(params)}`, options);
}