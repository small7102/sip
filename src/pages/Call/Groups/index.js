import React, { Component } from 'react';
import baseStyles from '../assets/base.less'
import iconfont from '../assets/iconfont.less'
import styles from '../Users/Users.less'
import {getGroups} from '../services'
import { Tree, Avatar } from 'antd';
import classNames from 'classnames';
const { TreeNode } = Tree;

export default
class Groups extends Component {
  constructor (props) {
    super(props)
    this.handleMore = this.handleMore.bind(this)
  }

  state = {
    groupList: [],
    expandedKeys: [],
    selectedUserIds: []
  }

  getGroups (roomid='') {
    const {usernumber, pwd, realm, dataUrl} = this.props
    
    getGroups({
      usernumber: `${usernumber}@${realm}`,
      pwd,
      data_url: dataUrl,
      moreParams: {roomid}
    }).then(res => {
      console.log(res,6767)
      if (res && res.code === '1') {
        this.setState({groupList: res.value})
      }
    }).catch(err => {
      console.log(err, 9999)
    })
  }

  handleMore () {

  }

  onCheck = (data) => {
    let {expandedKeys} = this.state
    let users = []
    if (data.length) {
      
      data.forEach(item => {
        if (item.includes('+')) {
          let arr = item.split('+')
          !users.includes(arr[1]) && users.push(arr[1])
        } else {
          
          if (!expandedKeys.includes(item)) {
            expandedKeys.push(item)
          }
        }
      })
      console.log(users, expandedKeys)
    }
    this.props.getSelectedUserIds(users)
    this.setState({expandedKeys, selectedUserIds: data})
  }

  removeUserById (id) {
    let {selectedUserIds} = this.state
    let _selectedUserIds = id ? selectedUserIds.filter(item => !item.includes(id)) : []
    this.setState({selectedUserIds: _selectedUserIds})
  }
  
  onExpand = (e) => {
    console.log(e)
    this.setState({expandedKeys: e})
  }

  renderTreeNodes = (data, group_uuid) => {
    const {usernumber, onlineIds=[]} = this.props
    return data.map((item) => {
      return item.users ? 
      <TreeNode
        title={
          <div>
              <i
                className={`${iconfont['m-icon']} ${iconfont['icon-bumen']}`}
                style={{fontSize: `16px`}}
              ></i>
            <span>{item.group_name}</span>
          </div>
        }
        key={item.group_uuid}
        dataRef={item}
        className={styles['tree-parent']}
        checkable={!!item.users.length}
        disableCheckbox={!item.users.length}
      >
        {this.renderTreeNodes(item.users, item.group_uuid)}
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
                style={{marginTop: '-2px', marginRight: '8px', backgroundColor:  `${item.usr_type === 'dispatch' ? '#4e86c7' : '#87d068'}`}}
                shape="square"
                size={32}
              >
                <i
                  className={`${iconfont['m-icon']} ${iconfont[item.usr_type === 'dispatch' ? 'icon-diannao' : 'icon-chengyuan']}`}
                  style={{fontSize: `${item.usr_type === 'dispatch' ? 18 : 22}px`}}
                ></i>
              </Avatar>
            <div
              className={`${styles['item-name']} ${baseStyles['text-overflow']} ${baseStyles['flex-item']}`}
              style={{width: `${280}px`}}
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
            <i
              className={`${iconfont['icon-gengduo']} ${iconfont['m-icon']} ${styles['more-btn']}`}
              onClick={(e)=> {
                e.persist()
                e.stopPropagation()
                this.handleMore(e, item)
              }}
            >
              </i>
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
    const {expandedKeys, groupList, selectedUserIds} = this.state
    return(
      <div className={baseStyles['scroll-bar']} style={{height: `${this.props.height}px`}}>
        <Tree
          checkable
          className={styles.tree}
          onCheck={this.onCheck}
          onExpand={this.onExpand}
          checkedKeys={selectedUserIds}
          expandedKeys={expandedKeys}
        >
          {this.renderTreeNodes(groupList)}
        </Tree>
      </div>
    )
  }
}