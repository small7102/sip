import React, { Component } from 'react';
import iconfont from '../assets/iconfont.less'
import styles from './Users.less'
import baseStyles from '../assets/base.less'
import Box from '../Box/Box'
import VoiceRecords from '../VoiceRecords';
import { Input, Checkbox, Avatar, Icon, Popover, Spin, Button, Tree } from 'antd';
import '../../Exception/style.less';
import { useHistory } from 'react-router';
const ITEM_HEIGHT = 50
const { TreeNode } = Tree;
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
    arrowUp: true,
    usersMap: {},
		expandedKeys: []
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
			const onlineUsers = [], departments=[]
			const offlineUsers = list.filter(item => {
				let isOnline = onlineIds.includes(item.usr_number)
				if (!item.usr_number) departments.push(item)
				if (isOnline) item.usr_number === usernumber ? onlineUsers.unshift(item) : onlineUsers.push(item)
				return !isOnline && item.usr_number
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
    const {selectedUserIds} = this.state
    const _selectedUserIds = id ? selectedUserIds.filter(item => item != id) : []
    this.setState({selectedUserIds: _selectedUserIds})
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
		const users = this.getOnlineUpUsers()
		const {selectedUserIds} = this.state
    const {height} = this.props
		let ids = [...selectedUserIds]

		if (!ids.includes(user.usr_number)) ids.unshift(user.usr_number)
		this.onSelectedUsersChange(ids)

		// 找出当前成员在列表中的位置
		let index = users.findIndex(item => item.usr_number == user.usr_number)
    let userRef = document.getElementById('userRef')
    userRef.scrollTop = (index+1)*ITEM_HEIGHT - height + 300
		console.log(index, (index+1)*ITEM_HEIGHT, selectedUserIds)
		this.setState({inpVal: '',searchList: []})
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

  componentDidMount(){
      this.props.onRef(this)

      window.addEventListener('click', (event)=> {
        // event.stopImmediatePropagation()
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

	seachResultDom () {
		const {searchList} = this.state

		return searchList.map((item, index) => {
			return (
				<div
					key={index}
					className={`${baseStyles['m-item']} ${styles['search-item']}`}
					onClick={() => {
						this.handleSelectSearchItem(item)
					}}
				>
					{item.usr_name}
				</div>
			)
		})
	}

	searchDom () {
		const {inpVal} = this.state
		const {width} = this.props
		return(
			<Popover
				placement="bottom"
				trigger="focus"
				overlayClassName={styles.pop}
				style={{width: `${width}px`, backgroundColor: '#16255b'}}
				content={
					<div
              className={baseStyles['scroll-bar']}
							style={{ width: `${width-40}px`, maxHeight: '400px'}}>
              <div className={styles['result-title']}>搜索结果：</div>
              {	this.seachResultDom() }
					</div>
				}
			>
				<Input
					placeholder="输入名称"
					prefix={<Icon type="search" style={{ color: 'rgba(255,255,255,.8)' }} />}
					value={inpVal}
          className={`${baseStyles['mt10']} ${styles['m-inp']}`}
					onChange={
						(e) => this.handleSearch(e)
					}
				/>
			</Popover>
		)
	}

  onRef =(ref) => {
    this.setState({drawerRef: ref})
  }


	renderTreeNodes = (data, level = 1) => {
		const {usernumber, onlineIds=[]} = this.props
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
		return (
      <Tree
				checkable
				switcherIcon={<Icon type="down" />}
				showIcon={true}
				className={styles.tree}
				onCheck={this.onSelectedUsersChange}
				checkedKeys={this.state.selectedUserIds}
				defaultExpandedKeys={departments[0] && [departments[0].dep_uuid] || []}
      >
				{this.renderTreeNodes(departments || [])}
      </Tree>
    );
	}

	componentWillUnmount () {
		const {departments} = this.props
		this.setState({
			expandedKeys: departments[0] && [departments[0].dep_uuid] || []
		})
	}

	render () {
		let {height, width = 360, loading, usernumber, pwd, realm, dataUrl, usersMap} = this.props
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
					<div className="m-users-wrap">
						{dropItem && this.arrowDom()}
						{this.searchDom()}
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
                style={{height: `${height-100}px`}}
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
				}>
			</Box>
		)
	}
}

