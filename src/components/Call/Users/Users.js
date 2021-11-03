import React, { Component } from 'react';
import iconfont from '../assets/iconfont.less'
import styles from './Users.less'
import baseStyles from '../assets/base.less'
import Box from '../Box/Box'
import VoiceRecords from '../VoiceRecords';
import Groups from '../Groups'
import { Input, Checkbox, Avatar, Icon, Popover, Spin, Button, Tree, Tabs } from 'antd';
import Search from '../Search'

const { TreeNode } = Tree;
const { TabPane } = Tabs
let scrollTop = 0
export default
class Users extends Component {
	constructor (props) {
		super(props)
		this.onSelectedUsersChange = this.onSelectedUsersChange.bind(this)
		this.handleSelectSearchItem = this.handleSelectSearchItem.bind(this)
		this.handleMore = this.handleMore.bind(this)
		this.callByOne = this.callByOne.bind(this)
		this.queryVoice = this.queryVoice.bind(this)
	}
	state = {
		selectedUserIds: [],
		inpVal: '',
		searchList: [],
    arrowTop: 200,
    arrowLeft: 240,
    dropItem: null,
    users: [],
		visible: false,
    currentItem: null,
    drawerRef: null,
    groupsRef: null,
    arrowUp: true,
    usersMap: {},
		expandedKeys: [],
    autoExpandParent: true
	}

  getOnlineUpUsers () {
    const {usernumber, users, onlineIds=[]} = this.props
		onlineIds.unshift(usernumber)
		let _users = []

		if (onlineIds.length) {
			const onlineUsers = []
			const offlineUsers = users.filter(item => {
				let isOnline = onlineIds.includes(item.usr_number)
				if (isOnline) onlineUsers.push(item)
				return !isOnline
			})

			_users = onlineUsers.concat(offlineUsers)
		}
    return _users
  }

	getOnlines (list) {
		const {usernumber, users, onlineIds=[]} = this.props
		onlineIds.unshift(usernumber)
		let _users = []

		if (list.length) {
			let onlineUsers = [], departments=[]
			let offlineUsers = list.filter(item => {
				let isOnline = onlineIds.includes(item.usr_number)
				if (!item.usr_number) departments.push(item)
				if (isOnline) item.usr_number === usernumber ? onlineUsers.unshift(item) : onlineUsers.push(item)
				return !isOnline && item.usr_number
			})

      onlineUsers = onlineUsers.sort((prev, next) => {
        return parseInt(prev.usr_number) - parseInt(next.usr_number)
      })
      offlineUsers = offlineUsers.sort((prev, next) => {
        return parseInt(prev.usr_number) - parseInt(next.usr_number)
      })

			_users = departments.concat(onlineUsers.concat(offlineUsers))
			return _users
		}
		return []
	}

	onSelectedUsersChange (data) {
		data = data.filter(item => !item.includes('-'))
		this.props.getSelectedUserIds(data)
    this.setState({selectedUserIds: data})
	}

  removeUserById (id) {
    const {selectedUserIds, groupsRef} = this.state
    const _selectedUserIds = id ? selectedUserIds.filter(item => item != id) : []
    this.setState({selectedUserIds: _selectedUserIds})
    groupsRef && groupsRef.removeUserById(id)
  }

	handleSearch (e) {
		const {users} = this.props
		let val = e.target.value.toLowerCase()
		this.setState({inpVal: val})

		if (!val) {
			this.setState({
				searchList: []
			})
			return
		}
		const searchRes = users.filter(item => {
			return item.usr_name.toLowerCase().indexOf(val) > -1
		})

		this.setState({
			searchList: searchRes
		})
	}

	handleSelectSearchItem (user) {
		const {selectedUserIds} = this.state
    const {departmentsMap, height} = this.props
		let ids = [...selectedUserIds]
    scrollTop = 0

		if (!ids.includes(user.usr_number)) ids.unshift(user.usr_number)
		this.onSelectedUsersChange(ids)


		// 找出当前成员在列表中的位置
		this.setState({
      inpVal: '',
      searchList: [],
      expandedKeys: this.getExpandedKeys(user.usr_dep_uuid),
      autoExpandParent: false
    }, () => {
      let department = departmentsMap[user.usr_dep_uuid],
          userIndex = this.getOnlines(department.users||[]).findIndex(item => item.usr_number === user.usr_number),
          userDom = document.getElementsByClassName('antd-pro-pages-call-users-users-tree-child')[0],
          userClinetHeight = userDom && userDom.clientHeight || 52
					scrollTop += (userIndex+1)*userClinetHeight

      let userRef = document.getElementById('userRef')
			setTimeout(() => {
				userRef.scrollTop = (height-160) > scrollTop ? 0 : scrollTop - (height-160)
			}, 200)
    })
	}

  getExpandedKeys (uuid, result=[], i = 0) {
    const {departmentsMap, originDepartments, parentIdMap, flatParentIdMap} = this.props
    let department = departmentsMap[uuid]
		let parentItemDom = document.getElementsByClassName('ant-tree-treenode-switcher-close')[0],
				parentItemHeight = 42

    result.unshift(uuid)

    if (i === 0) { // 找到了他的上级部门
      let deep = department.dep_level.length / 3, parentId
      parentId  = deep === 1 ? '0' : department.dep_level.substr(0, (deep-1) * 3)
      let arr = flatParentIdMap[parentId] || []
      let sameLevelDepartments = arr.filter(item => item.dep_uuid)

      scrollTop = parentItemHeight * (sameLevelDepartments.length)
    }

    if (department.parentId=='0') {
      scrollTop += parentItemHeight * (i+1)
      return result
    }

    let _uuid = ''
    originDepartments.forEach(item => {
      if (item.dep_level ===department.parentId) _uuid = item.dep_uuid
    })
    i++
    this.getExpandedKeys(_uuid, result, i)
    return result
  }

  handleMore (e, item) {
    const {clientX, clientY} = e
    const {height} = this.props

    let top = 0, arrowUp
    if (clientY+72 > 112+height){
      top = clientY-90
      arrowUp = false
    } else {
      top = clientY+10
      arrowUp = true
    }
    this.setState({
      arrowTop: top,
      arrowLeft: clientX-110,
      dropItem: item,
      arrowUp
    })

    this.state.drawerRef.initData(item.usr_number)
  }

	queryVoice () {
		this.setState({visible: true})
	}

	onVoiceClose = () => {
		this.setState({visible: false})
	}

  onSelectTree = (e) => {
		let {selectedUserIds} = this.state
    if (e && e.length === 1) {
			if (e[0].includes('-')) {
				this.setState({
					expandedKeys: e
				})
			} else {
				selectedUserIds.includes(e[0]) ? selectedUserIds.filter(item => item !== e[0]) : selectedUserIds.push(e[0])
				this.setState({
					selectedUserIds
				})
        this.onSelectedUsersChange(selectedUserIds)
			}
		}
  }

  onExpand = (e) => {
    this.setState({
      expandedKeys: e
    })
  }

  componentDidMount(){
      this.props.onRef(this)
      this.setDefaultKeys()
      window.addEventListener('click', (event)=> {
        this.setState({dropItem: null})
      })
  }

  callByOne () {
    const {dropItem} = this.state
    this.props.callByOne(dropItem)
  }

	handleFresh = () => {
		this.props.handleFresh()
	}

	arrowDom () {
    const {usernumber} = this.props
    const {arrowLeft, arrowTop, dropItem, arrowUp} = this.state
		return (
			<div
        className={`${styles['arrow-wrap']} ${styles[arrowUp? 'arrow-up': 'arrow-down']}`}
        style={{left: `${arrowLeft}px`, top: `${arrowTop}px`}}
      >
				<ul style={{marginBlockEnd: 0,padding: '5px'}}>
					{ dropItem.usr_number !== usernumber &&
          (<li className={baseStyles['m-item']} onClick={this.callByOne}>
            <i className={`${iconfont['m-icon']} ${iconfont['icon-dianhua1']}`}></i>
            单呼
          </li>)
          }
					<li
						className={baseStyles['m-item']}
						style={{border: 'none'}}
						onClick={this.queryVoice}
					>
            <i className={`${iconfont['m-icon']} ${iconfont['icon-lishijilu']}`}></i>
            语音记录
          </li>
				</ul>
			</div>
		)
	}

  onRef =(ref) => {
    this.setState({drawerRef: ref})
  }

  onGroupsRef =(ref) => {
    this.setState({groupsRef: ref})
  }

	onGroupsScroll (scrollTop) {
		let userRef = document.getElementById('userRef')
    userRef.scrollTop = scrollTop
	}

  handleGroupCall = (data) => {
    this.props.handleGroupCall(data)
  }

  getGroups () {
    this.state.groupsRef && this.state.groupsRef.getGroups()
  }

	renderTreeNodes = (data, level = 1) => {
		const {usernumber, onlineIds=[], departmentsMap} = this.props
		data = this.getOnlines(data)

		return data.map((item, index) => {
      if (item.children) {
        return (
          <TreeNode
						title={
							<div>
									<i
										className={`${iconfont['m-icon']} ${iconfont['icon-bumen']}`}
										style={{fontSize: `16px`}}
									></i>
								<span>{item.dep_name}</span>
							</div>
						}
						key={item.dep_uuid}
						dataRef={item}
						className={styles['tree-parent']}
						checkable={!!item.children.length}
						disableCheckbox={!item.children.length}
					>
            {this.renderTreeNodes(item.children||[], item.dep_level.length/3)}
          </TreeNode>
        );
      }
      return <TreeNode
								key={item.usr_number}
								className={styles['tree-child']}
								disableCheckbox={item.usr_number === usernumber}
								title ={
									<div
										className={`${onlineIds.includes(item.usr_number) ? styles['online'] : styles['offline']} ${baseStyles['flex']} ${baseStyles['align-center']}`}
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
											style={{width: `${105-(level-1)*16}px`}}
										>
											<div className={`${baseStyles['text-overflow']}`} title={item.usr_name}>
												{item.usr_name} {item.usr_number === usernumber ? '(自己)' : ''}
											</div>
											<div className={`${baseStyles.ft12}`} style={{color: 'rgba(255,255,255,.5)'}}>{item.usr_number}</div>
										</div>
									<div className={`${baseStyles['flex']} ${baseStyles['align-center']}`}>
										<span className={`${baseStyles.ft12} ${styles['state']}`}>
											{onlineIds.includes(item.usr_number) ? '在线' : '离线'}
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


	treeDom () {
		const {departments=[]} = this.props

    const {autoExpandParent, expandedKeys, selectedUserIds}= this.state
		return (
      <Tree
				checkable
				showIcon={true}
				className={styles.tree}
				onCheck={this.onSelectedUsersChange}
				checkedKeys={selectedUserIds}
        onSelect={this.onSelectTree}
        autoExpandParent= {autoExpandParent}
        onExpand={this.onExpand}
        expandedKeys={expandedKeys}
      >
				{this.renderTreeNodes(departments || [])}
      </Tree>
    );
	}

	setDefaultKeys () {
		const {departments} = this.props
		this.setState({
			expandedKeys: departments && departments[0] && [departments[0].dep_uuid] || []
		})
	}

	render () {
		let {height, width = 360, loading, usernumber, pwd, realm, dataUrl, usersMap, onlineIds, users} = this.props
    const {selectedUserIds, dropItem, visible} = this.state

		return(
			<Box
				title={
					<div className={`${baseStyles.flex}  ${baseStyles['align-center']}`}>
						<span className={`${baseStyles['flex-item']}`}>通讯录</span>
						<Button
							type="link"
							size="small"
							style={{marginLeft: 'auto',marginTop: '2px'}}
							onClick={this.handleFresh}
						>
							刷新
						</Button>
					</div>
				}
				height={(height)}
				width={width}
				content={
          <Tabs className={styles['tab-wrap']} defaultActiveKey="1" type="card">
            <TabPane tab="通讯录" key="1">
                <div className="m-users-wrap">
                  {dropItem && this.arrowDom()}
									<Search
										usernumber={usernumber}
										users={users}
										width={width}
										handleSelectSearchItem={this.handleSelectSearchItem}
									/>
                  {/* {this.searchDom()} */}
                  {loading ?
                    (
                      <div
                        className={`${baseStyles['w100']} ${baseStyles.flex} ${baseStyles['align-center']}  ${baseStyles['justify-center']}`}
                        style={{height: `${height-200}px`}}
                      >
                        <Spin />
                      </div>
                    )
                  : (<Checkbox.Group
                    className={`${baseStyles['w100']}  ${styles['m-inp']}`}
                    value={selectedUserIds}
                    onChange={this.onSelectedUsersChange}
                  >
                    <ul
                      className={`${styles['list-wrap']} ${baseStyles['scroll-bar']} ${baseStyles['mt10']}`}
                      style={{height: `${height-160}px`}}
                      id="userRef"
                    >
                      {/* {this.listDom()} */}
                      {this.treeDom()}
                    </ul>
                  </Checkbox.Group>)
                  }
                  <VoiceRecords
                    visible={visible}
                    usernumber={usernumber}
                    pwd = {pwd}
                    realm = {realm}
                    height={height}
                    dataUrl={dataUrl}
                    users={this.getOnlineUpUsers()}
                    usersMap={usersMap}
                    onVoiceClose={this.onVoiceClose}
                    onRef={this.onRef}
                  />
                </div>

            </TabPane>
            <TabPane tab="固定群组" key="2">
              <Groups
                usernumber={usernumber}
                dataUrl={dataUrl}
								users={users}
								width={width}
                pwd={pwd}
                realm = {realm}
                onlineIds={onlineIds}
                height={height}
								onScroll={this.onGroupsScroll}
                onGroupsRef={this.onGroupsRef}
                getSelectedUserIds={this.onSelectedUsersChange}
                handleGroupCall={this.handleGroupCall}
              />
            </TabPane>
          </Tabs>
				}>
			</Box>
		)
	}
}

