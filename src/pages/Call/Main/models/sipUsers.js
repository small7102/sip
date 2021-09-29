import {queryUsers, getOnlineUsers, getCallRecords} from '../../services/index'


// function getTree (list, result = [], i = 1) {
//   let branch = []
//   list = list.filter((item, index) => {
//     let bool = item.dep_level.length / 3 === i
//     if (bool) branch.push(item)
//     return !bool
//   })

//   console.log(branch, list, result)
//   if (!branch.length && !list.length) return result

//   if (result.length) {
//     branch.forEach(item => {
//       getTree(list, result, i++)
//     })
//   } else {
//     result = branch
//     getTree(list, result, i++)
//   }
// }

function getTrees (list, parentId) {
  let items = {}
  // 获取每个节点的直属子节点，*记住是直属，不是所有子节点
  for (let i = 0; i < list.length; i++) {
    let deep = list[i].dep_level.length / 3, key
    key  = deep === 1 ? '0' : list[i].dep_level.substr(0, (deep-1) * 3)
    if (items[key]) {
      items[key].push(list[i])
    } else {
      items[key] = []
      items[key].push(list[i])
    }
  }
  return formatTree(items, parentId)
}

/**
* 利用递归格式化每个节点
*/
function formatTree (items, parentId = '0', deep = 0) {
  let result = []
  if (!items[parentId]) {
    return result
  }
  for (let t of items[parentId]) {
    let value = {...t}
    value.children = formatTree(items, value.dep_level) || []
    value.children = value.children.concat(value.users)
    result.push(value)
  }
  return result
}

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
        const {users, departments} = response.data
        let userKeys = response.fields['user-fields']
        const departmentsKeys = response.fields['department-fields']
        userKeys.push('level')

        
        
        
        // key,value形式的数据
        const _users = users.map(item => {
          let user = {}
          userKeys.forEach((key, index) =>{
            user[key] = item[index]
          })
          return user
        })

        const _departments = departments.map(item => {
          let department = {}
          departmentsKeys.forEach((key, index) =>{
            department[key] = item[index]
          })
          department.users = _users.filter(userItem => {
            return userItem.usr_dep_uuid === department.dep_uuid
          })
          return department
        })
        console.log(_departments, getTrees(_departments))

        yield put({
          type: 'saveSipUsers',
          payload: _users
        })
        yield put({
          type: 'saveDepartments',
          payload: getTrees(_departments)
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
    saveDepartments (state, {payload}) {
      return {
        ...state,
        departments: payload
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
