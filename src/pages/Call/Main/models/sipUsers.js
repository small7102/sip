import {queryUsers, getOnlineUsers, getCallRecords} from '../../services/index'

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
    *getCallRecords({ payload }, {call, put}) {
      const response = yield call(getCallRecords, payload);
      if (response && response.header && response.header.code == '0') {
        yield put({
          type: 'saveCallRecords',
          payload: response
        })
      }
    },
    *queryUsers({ payload }, {call, put}) {
      const response = yield call(queryUsers, payload);

      if (response && response.header && response.header.code == '1') {
        const users = response.data.users
        let userKeys = response.fields['user-fields']
        userKeys.push('level')

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
    },
    saveCallRecords (state, {payload}) {
      return {
        ...state,
        callRecords: payload
      }
    }
  },
};
