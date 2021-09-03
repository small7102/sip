import queryError from '@/services/error';
import {queryUsers, getOnlineUsers} from '../../services/index'

export default {
  namespace: 'sipUsers',

  state: {
    users: [],
    onlineUserIds: []
  },

  effects: {
    *getOnlineUsers({ payload }, {call, put}) {
      const response = yield call(getOnlineUsers, payload);
      if (response && response.header && response.header.code == '0') {
        yield put({
          type: 'saveOnlineUsers',
          payload: response.users
        })
      }
    },
    *queryUsers({ payload }, {call, put}) {
      const response = yield call(queryUsers, payload);

      if (response && response.header && response.header.code == '1') {
        const users = response.data.users
        const userKeys = response.fields['user-fields']

        // key,value形式的数据
        const _users = users.map(item => {
          let user = {}
          userKeys.forEach((key, index) =>{
            user[key] = item[index]
          })

          return user
        })

        yield put({
          type: 'saveSipUsers',
          payload: _users
        })
      }
    }
  },

  reducers: {
    saveSipUsers (state, {payload}) {
      return {
        ...state,
        users: payload
      }
    },
    saveOnlineUsers (state, {payload}) {
      return {
        ...state,
        onlineUserIds: payload
      }
    }
  },
};
