import React, { Component } from 'react';
import styles from './Main.less';
import baseStyles from '../assets/base.less'
import Users from '../Users/Users'
import Call from '../Session/Call'
import History from '../History/History'
import VoiceRecords from '../VoiceRecords'
import Tempgroups from '../Tempgroups/tempgroups';
import {getParentIdMap,formatTree,getMapByList} from '../utils'
import { connect } from 'dva';
import {queryUsers, getOnlineUsers, getCallRecords} from '../services'
const QUERY_ONLINE_DURATION = 12000
let loadedAsset = false
let loadTimer = null

export default
@connect(({ sipUsers, loading }) => {
	return {
		sipUsers,
		loading: loading.effects['sipUsers/queryUsers']
	}
})

class SipCall extends Component {
	constructor (props) {
		super(props)
		this.getSelectedUsers = this.getSelectedUsers.bind(this)
    this.saveTempgroup = this.saveTempgroup.bind(this)
    this.tempCallByRecords = this.tempCallByRecords.bind(this)
    this.saveRecords = this.saveRecords.bind(this)
	}

  componentWillMount(){
    this.loadSipAssets()
  }

	state = {
		height: 1080,
		width: 1920,
		// usernumber: '10010129',
		// pwd: '021832',
        // realm: 'kinet',
		// socket_url: 'wss://183.47.46.242:7443/',
        // data_url: 'http://183.47.46.242:8008',
    // data_url: 'https://183.47.46.242:5443',
		selectedUserIds: [],
		selectedUsers: [],
		userRef: null,
		callRef: null,
		tempgroupRef: null,
		recordsRef: null,
		loadedAsset: false,
		hasPoCDevice: false,
		originDepartments: [],
		departments: [],
		users: [],
		parentIdMap: {},
		flatParentIdMap: {},
		departmentsMap: {},
		usersMap: {},
		onlineUserIds: [],
		recordsVisible: false,
		voicesRef: null
	}

	loadSipAssets() {
		const rawHeadAppendChild = HTMLHeadElement.prototype.appendChild

		HTMLHeadElement.prototype.appendChild = function (child) {
				if(child && child.src && child.src.indexOf('tmedia_session_ghost')> -1) {
					console.log('资源加载le')
					child.addEventListener('load', () => {
						setTimeout(()=> {
							loadedAsset = true
						},1000)
					})
				}
		return rawHeadAppendChild.call(this, child)
		}

		let tag_hdr = document.getElementsByTagName('head')[0];
		['/SIPml.js', '/src/tinySIP/src/tsip_api.js'].forEach(src => {
			let tag_script = document.createElement('script');
			tag_script.setAttribute('type', 'text/javascript');
			tag_script.setAttribute('src', src + "?svn=252");
			tag_hdr.appendChild(tag_script);
		})
	}

	toQueryUsers() {
		const {userRef} = this.state
		const { usernumber,realm,pwd,data_url } = this.props
		
		this.setState({loading: true})
		queryUsers({
			usernumber: `${usernumber}@${realm}`,
			pwd,
			data_url
		}).then(res => {
			if (res && res.header && res.header.code === '1') {
				const { users,departments } = res.data
				let userKeys = res.fields['user-fields']
				const departmentsKeys = res.fields['department-fields']
				userKeys.push('level')

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

				let items = getParentIdMap(_departments),
					formatResult = formatTree(items)
				
				this.setState({
					originDepartments: _departments,
					departments: formatResult.tree,
					users: _users,
					parentIdMap: items,
					flatParentIdMap: formatResult.flatMap,
					departmentsMap: getMapByList(_departments),
					usersMap: getMapByList(_users,'usr_number',false),
					loading: false
				})

				this.state.userRef && this.state.userRef.setDefaultKeys()
			}
		}).catch(err => {
			console.log(err)
			this.setState({loading: false})
		})
	}

	toQueryOnlineUsers() {
		const {usernumber, realm, pwd, data_url} = this.props
		getOnlineUsers({
			usernumber: `${usernumber}@${realm}`,
			pwd,
			data_url
		}).then((response) => {
			if (response && response.header && response.header.code == '0') {
				this.setState({onlineUserIds: response.users})
			  }
		})
	}

	getSelectedUsers =(data)=> {
		let {users} = this.state,hasPoCDevice = false
		const selectedUsers = data.map(id => {
			return users.find(item => {
        if (item.usr_number === id && (item.usr_type.includes('poc')||item.usr_type.includes('dmr') || item.usr_type.includes('t3'))) hasPoCDevice = true
        return item.usr_number === id
      })
		})

		this.setState({selectedUsers, hasPoCDevice})

	}

  removeSelectedUser = (usr_number) => {
    const {selectedUsers, userRef} = this.state
    const _selectedUsers = usr_number ? selectedUsers.filter(user => {
			return user.usr_number != usr_number
		}) : []

    this.setState({selectedUsers: _selectedUsers})
    userRef && userRef.removeUserById(usr_number)

    if (!_selectedUsers.length) {
      this.setState({hasPoCDevice: false})
    }
  }

	usersOfUpMyself () {
		const {usernumber} = this.props
		const { users} = this.state
		// let users = [...sipUsers.users], myself  toFixed
		let myself,
			_users = users.filter(user => {
				if (user.usr_number !== usernumber) {
					return true
				} else {
					myself = user
					// console.log(user)
					return false
				}
			})

		myself && _users.unshift(myself)
		return _users || []
	}

  saveTempgroup () {
    const {tempgroupRef} = this.state
    tempgroupRef && tempgroupRef.getLocalData()
  }

  saveRecords () {
    const {recordsRef} = this.state
    recordsRef && recordsRef.getLocalData()
  }

  onRef= (ref)=> {
    this.setState({userRef: ref})
  }
  onTempGroupRef= (ref)=> {
    this.setState({tempgroupRef: ref})
  }

  onCallRef = (ref) => {
    this.setState({callRef: ref})
  }

  onRecordsRef = (ref) => {
    this.setState({recordsRef: ref})
  }
	
  onVoicesRef = (ref) => {
	this.setState({voicesRef: ref})
  }
	
	onVoicesData = (usr_number) => {
	  this.setState({recordsVisible: true})
	this.state.voicesRef && this.state.voicesRef.initData(usr_number)
  }

  callByOne = (user) => {
    const {callRef} = this.state
		this.setState({
			selectedUsers: [user]
		}, () => {
			callRef.sipCall([user])
		})
  }

	tempCallByRecords (data) {
		const {callRef} = this.state
    if (data.type === 2) { // 固定群组呼叫
      callRef.handleGroupCall(JSON.parse(data.groupData))
    } else {
      this.setState({
        selectedUsers: data.users
      }, () => {
        callRef.sipCall()
      })
    }
	}

	handleFresh = () => {
		this.toQueryUsers()
		this.toQueryOnlineUsers()
   		this.state.userRef && this.state.userRef.getGroups()
	}

	getOnlineUpUsers() {
		return this.state.userRef ? this.state.userRef.getOnlineUpUsers() : []
	}

	onVoiceClose = () => {
		this.setState({recordsVisible: false})
	}

	handleGroupCall = (data) => {
		let users = data.users || []
		let hasPoC = users.find(item => item.usr_type === 'poc_term')
		this.setState({hasPoCDevice: hasPoC ? true : false}, () => {
		this.state.callRef.handleGroupCall(data)
		})
	}

	componentDidMount () {

		this.handleFresh()
		setInterval(() => {
			this.toQueryOnlineUsers()
		}, QUERY_ONLINE_DURATION)


		this.setState({
			height: document.body.clientHeight,
			width: document.body.clientWidth
		})

    	console.log(document.body.clientHeight, document.body.clientWidth)
		window.addEventListener('resize', () => {
			this.setState({
				height: document.body.clientHeight,
				width: document.body.clientWidth
			})
		})

    loadTimer = setInterval(() => {
      if (loadedAsset && this.state.callRef) {
        this.state.callRef.newSip()
        clearInterval(loadTimer)
        loadTimer=null
      }
    }, 1000)
	}

	render () {
		const { recordsVisible, loading,usersMap,departments,originDepartments,parentIdMap,departmentsMap,flatParentIdMap,onlineUserIds,height,width,selectedUsers,hasPoCDevice} = this.state,
			  {usernumber,pwd,socket_url,realm,data_url} = this.props
		return(
			<div
				className={`${styles.sipcall} ${baseStyles['flex']}`}
				style={{height: `${height-68}px`, padding: '24px', overflow: 'hidden'}}
			>
				<Users
					ref="users"
               		height={height-112}
					width={width > 1500 ? 400 : 300}
					users={this.usersOfUpMyself()}
               		usersMap= {usersMap}
					departments={departments}
					originDepartments={originDepartments}
					parentIdMap={parentIdMap}
					departmentsMap={departmentsMap}
					flatParentIdMap={flatParentIdMap}
					loading={loading}
					onlineIds={onlineUserIds}
					getSelectedUserIds={this.getSelectedUsers}
               		onRef={this.onRef}
					usernumber={usernumber}
               		realm={realm}
					pwd={pwd}
					dataUrl={data_url}
					callByOne={this.callByOne}
					handleFresh={this.handleFresh}
					handleGroupCall={this.handleGroupCall}
					onData={this.onVoicesData}
				/>
				<Call
					height={height - 112}
					selectedUsers={selectedUsers}
					hasPoCDevice={hasPoCDevice}
					users={this.usersOfUpMyself()}
					removeSelectedUser={this.removeSelectedUser}
					saveTempgroup={this.saveTempgroup}
					saveRecords={this.saveRecords}
					account={{usernumber, pwd, socket_url, myself: this.usersOfUpMyself()[0]}}
              		onRef={this.onCallRef}
				/>
				<div
					className={`${styles['right-wrap']}`}
				>
					<History
						height={height - 332}
						width={width > 1500 ? 400 : 300}
						onRecordsRef={this.onRecordsRef}
						usernumber={usernumber}
						tempCallByRecords={this.tempCallByRecords}
					/>
					<Tempgroups
						height={200}
						width={width > 1500 ? 400 : 300}
						onTempGroupRef={this.onTempGroupRef}
						usernumber={usernumber}
						tempCallByRecords={this.tempCallByRecords}
					/>
				</div>

				<VoiceRecords
                    visible={recordsVisible}
                    usernumber={usernumber}
                    pwd = {pwd}
                    realm = {realm}
                    height={height}
                    dataUrl={data_url}
                    users={this.getOnlineUpUsers()}
                    usersMap={usersMap}
                    onVoiceClose={this.onVoiceClose}
					onRef={this.onVoicesRef}
                  />
			</div>
		)
	}
}



