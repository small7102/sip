import React, { Component } from 'react';
import baseStyles from '../assets/base.less'
import iconfont from '../assets/iconfont.less'
import styles from '../Users/Users.less'
import {getGroups} from '../services'
import { Tree, Avatar,Spin } from 'antd';
import Search from '../Search';
const { TreeNode } = Tree;

export default
class Groups extends Component {
  constructor (props) {
    super(props)
  }

  state = {
    groupList: [],
    expandedKeys: [],
    selectedUserIds: [],
    loading: false
  }

  getGroups (roomid='') {
    const {usernumber, pwd, realm, dataUrl} = this.props
    this.setState({loading: true})
    getGroups({
      usernumber: `${usernumber}@${realm}`,
      pwd,
      data_url: dataUrl,
      moreParams: {roomid}
    }).then(res => {
      if (res && res.code === '1') {
        let list = res.value
        this.setState({groupList: list, loading: false}, () => {
          if (list.length) this.setState({expandedKeys: [list[list.length-1].group_uuid]})
        })
      }
    }).catch(err => {
      this.setState({loading: false})
    })
  }

  getUsersByGroups () {
    const {groupList} = this.state
    let _users = []
    groupList.forEach(group => {
      let {users, group_name, group_uuid, call_grouptype, level, ishave_poc, is_level_on, group_hostextension} = group
      let groupUsers = users.map(item => {
        return {...item, groupInfo: {group_name, group_uuid, call_grouptype, level, ishave_poc, is_level_on, group_hostextension}}
      })

      _users = _users.concat(groupUsers)
    })

    return _users
  }

  onCheck = (data, isSearch = false) => {
    let {expandedKeys} = this.state
    let users = [], expandKey, userId
    if (data.length) {
      
      data.forEach(item => {
        if (item.includes('+')) {
          let arr = item.split('+')
          expandKey = arr[0]
          userId = arr[1]
          !users.includes(userId) && users.push(userId) 
          !expandedKeys.includes(expandKey) && expandedKeys.push(expandKey)
        } else {
          if (!expandedKeys.includes(item)) {
            expandedKeys.push(item)
          }
        }
      })
    }
    this.props.getSelectedUserIds(users)
    this.setState({expandedKeys, selectedUserIds: data}, () => {
      if (isSearch) this.handleScroll(expandKey, userId)
    })
  }

  handleScroll (expandKey, userId) {
    let {expandedKeys, groupList} = this.state
    let groupIndex = groupList.findIndex(item => item.group_uuid === expandKey), scrollTop,
        groupsRefHeight = this.props.height - 160

    scrollTop = (groupIndex + 1) * 42
    
    groupList.forEach((item, index) => {
      if (expandedKeys.includes(item.group_uuid)) {
        let users = this.upOnlineUsers(item.users)
        let selectedIndex = users.findIndex(user => user.usr_mapnum === userId)
        // 选择的成员就在这个组
        if (selectedIndex>-1 && item.group_uuid === expandKey) {
          scrollTop += (selectedIndex+1) * 53
        } else {
          if (index < groupIndex) scrollTop += (item.users.length) * 53
        }
      }
    })

    
    let groupRef = document.getElementById('groupRef')
    setTimeout(() => {
      groupRef.scrollTop = groupsRefHeight > scrollTop ? 0 : scrollTop - groupsRefHeight
    }, 200)
  }

  removeUserById (id) {
    let {selectedUserIds} = this.state
    let _selectedUserIds = id ? selectedUserIds.filter(item => !item.includes(id)) : []
    this.setState({selectedUserIds: _selectedUserIds})
  }
  
  handleSelectSearchItem = (user) => {
    let {selectedUserIds} = this.state
    
    if (!selectedUserIds.includes(`${user.groupInfo.group_uuid}+${user.usr_mapnum}`)) selectedUserIds.push(`${user.groupInfo.group_uuid}+${user.usr_mapnum}`)
    this.onCheck(selectedUserIds, true)
  }

  upOnlineUsers (users) {
    const {onlineIds=[], usernumber} = this.props
    let onlineUsers = [], offlineUsers = []

    users.forEach(item => {
      onlineIds.includes(item.usr_mapnum) ? item.usr_mapnum === usernumber ? onlineUsers.unshift(item) : onlineUsers.push(item) : offlineUsers.push(item)
    })

    onlineUsers = onlineUsers.sort((prev, next) => {
      return parseInt(prev.usr_mapnum) - parseInt(next.usr_mapnum) 
    })
    offlineUsers = offlineUsers.sort((prev, next) => {
      return parseInt(prev.usr_mapnum) - parseInt(next.usr_mapnum) 
    })

    return onlineUsers.concat(offlineUsers)
  }

  handleGroupCall = (item) => {
    this.props.handleGroupCall(item)
  }


  onExpand = (e) => {
    this.setState({expandedKeys: e})
  }

  onSelect = (e) => {
    let {selectedUserIds} = this.state
    console.log(e,1233)
    if (e && e.length === 1) {
			if (!e[0].includes('+')) {
				this.setState({
					expandedKeys: e
				})
			} else {
				selectedUserIds.includes(e[0]) ? selectedUserIds.filter(item => item !== e[0]) : selectedUserIds.push(e[0])
				this.setState({
					selectedUserIds
				})
        this.onCheck(selectedUserIds)
			}
		}
  }

  renderTreeNodes = (data, group_uuid) => {
    const {usernumber, onlineIds=[]} = this.props
    return data.map((item) => {
      return item.users ? 
      <TreeNode
        title={
          <div className={`${baseStyles['flex']} ${baseStyles['align-center']}`}>
            <i
              className={`${iconfont['m-icon']} ${iconfont['icon-bumen']}`}
              style={{fontSize: `16px`}}
            ></i>
            <span className={baseStyles['text-overflow']}
             style={{width: '162px'}}>{item.group_name}</span>
            <i title="群组通话" 
               className={`${iconfont['m-icon']} ${iconfont['icon-dianhua']} ${baseStyles['ft16']}`}
               onClick={
                 (e)=>{
                  e.persist()
                  e.stopPropagation()
                  this.handleGroupCall(item)
                 }
               }
            ></i>
          </div>
        }
        key={item.group_uuid}
        dataRef={item}
        className={styles['tree-parent']}
        checkable={!!item.users.length}
        disableCheckbox={!item.users.length}
      >
        {this.renderTreeNodes(this.upOnlineUsers(item.users), item.group_uuid)}
      </TreeNode>
      :
      <TreeNode
        key={`${group_uuid}+${item.usr_mapnum}`}
        className={styles['tree-child']}
        disableCheckbox={item.usr_mapnum === usernumber}
        title ={
            <div
              className={`${onlineIds.includes(item.usr_mapnum) ? styles['online'] : styles['offline']} ${baseStyles['flex']} ${baseStyles['align-center']}`}
            >
                <Avatar
                  style={{marginTop: '-2px', marginRight: '8px', backgroundColor:  `${item.usr_type === 'dispatch' ? '#4e86c7' : item.usr_type === 'poc_term' ? '#17c6bf' :'#87d068'}`}}
                  shape="square"
                  size={32}
                >
                  <i
                    className={`${iconfont['m-icon']} ${iconfont[item.usr_type === 'dispatch' ? 'icon-diannao' : item.usr_type === 'poc_term' ? 'icon-duijiangji' : 'icon-chengyuan']}`}
                    style={{fontSize: `${item.usr_type === 'dispatch' ? '18px' : item.usr_type === 'poc_term' ? '26px' : '22px'}`}}
                  ></i>
                </Avatar>
              <div
                className={`${styles['item-name']} ${baseStyles['text-overflow']} ${baseStyles['flex-item']}`}
                style={{width: `${130}px`}}
              >
                <div className={`${baseStyles['text-overflow']}`} title={item.usr_name}>
                  {item.usr_name} {item.usr_mapnum === usernumber ? '(自己)' : ''}
                </div>
                <div className={`${baseStyles.ft12}`} style={{color: 'rgba(255,255,255,.5)'}}>{item.usr_mapnum}</div>
              </div>
            <div className={`${baseStyles['flex']} ${baseStyles['align-center']}`}>
              <span className={`${baseStyles.ft12} ${styles['state']}`}>
                {onlineIds.includes(item.usr_mapnum) ? '在线' : '离线'}
              </span>
            </div>
          </div>
        }
        {...item}
      />;
    })
  }
  
  componentDidMount () {
    this.getGroups()
    this.props.onGroupsRef(this)
  }

  render () {
    const {expandedKeys, loading, groupList, selectedUserIds} = this.state
    const {height, width, usernumber} = this.props
    return(
      <div className={baseStyles['scroll-bar']}>
        <Search 
          usernumber={usernumber}
          users={this.getUsersByGroups()} 
          width={width}
          handleSelectSearchItem={this.handleSelectSearchItem}
        />
        <div 
          style={{height: `${height-160}px`}}
          className={`${styles['list-wrap']} ${baseStyles['scroll-bar']} ${baseStyles['mt10']}`}
          id="groupRef"
        >
        {loading ? (
          <div
            className={`${baseStyles['w100']} ${baseStyles.flex} ${baseStyles['align-center']}  ${baseStyles['justify-center']}`}
            style={{height: `${height-200}px`}}
          >
            <Spin />
          </div>
        ) :
          <Tree
            checkable
            className={styles.tree}
            onCheck={this.onCheck}
            onExpand={this.onExpand}
            onSelect={this.onSelect}
            checkedKeys={selectedUserIds}
            expandedKeys={expandedKeys}
          >
            {this.renderTreeNodes(groupList)}
          </Tree>}
        </div>
      </div>
    )
  }
}