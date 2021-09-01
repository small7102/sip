import request from '@/utils/request';
import { stringify } from 'qs';

// const baseUrl = 'http://47.102.143.50'

export async function queryUsers(params) {
  return request(`/api/client/departments.php?${stringify(params)}`);
}