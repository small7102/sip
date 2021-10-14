import {queryUsers, getOnlineUsers, getCallRecords} from '../../services/index'

function getParentIdMap (list) {
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
  return items
}
/**
* 利用递归格式化每个节点
*/
function formatTree (items, parentId = '0', flatMap={}) {
  let result = []
  if (!items[parentId]) {
    return {tree: result, flatMap}
  }
  for (let t of items[parentId]) {
    let value = {...t,parentId}
    let _result = formatTree(items, value.dep_level, flatMap)
    value.children = _result && _result.tree || []
    value.children = value.children.concat(value.users)
    result.push(value)
    flatMap[parentId] = value.children
  }
  return {tree: result, flatMap}
}


function getMapByList (list, key='dep_uuid', pid=true) {
  let map = {}
  list.forEach(item => {
    map[item[key]] = {...item}
    if (pid) {
      let deep = item.dep_level.length / 3, parentId
      parentId  = deep === 1 ? '0' : item.dep_level.substr(0, (deep-1) * 3)
      map[item[key]].parentId = parentId
    }
  })
  return map
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

        
        yield put({
          type: 'saveOriginDepartments',
          payload: _departments
        })
        let items = getParentIdMap(_departments)
        let formatResult = formatTree(items)

        console.log(formatResult.flatMap, 7777)
        yield put({
          type: 'saveDepartments',
          payload: formatResult.tree
        })

        yield put({
          type: 'saveSipUsers',
          payload: _users
        })
        yield put({
          type: 'saveParentIdMap',
          payload: items
        })
        yield put({
          type: 'saveFlatParentIdMap',
          payload: formatResult.flatMap
        })
        yield put({
          type: 'saveDepartmentsMap',
          payload: getMapByList(_departments)
        })
        yield put({
          type: 'saveUsersMap',
          payload: getMapByList(_users, 'usr_number', false)
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
    saveUsersMap (state, {payload}) {
      return {
        ...state,
        usersMap: payload
      }
    },
    saveDepartments (state, {payload}) {
      return {
        ...state,
        departments: payload
      }
    },
    saveDepartmentsMap (state, {payload}) {
      return {
        ...state,
        departmentsMap: payload
      }
    },
    saveOriginDepartments (state, {payload}) {
      return {
        ...state,
        originDepartments: payload
      }
    },
    saveParentIdMap (state, {payload}) {
      return {
        ...state,
        parentIdMap: payload
      }
    },
    saveFlatParentIdMap (state, {payload}) {
      return {
        ...state,
        flatParentIdMap: payload
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
