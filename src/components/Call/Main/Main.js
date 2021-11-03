import React, { Component } from 'react';
import styles from './Main.less';
import baseStyles from '../assets/base.less'
import Users from '../Users/Users'
import Call from '../Session/Call'
import History from '../History/History'
import Tempgroups from '../Tempgroups/tempgroups';
import {queryOnlineUsers, queryData} from './Apis/sipUsers'
const QUERY_ONLINE_DURATION = 12000
let loadedAsset = false
let loadTimer = null

export default
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
		selectedUserIds: [],
		selectedUsers: [],
    userRef: null,
    callRef: null,
    tempgroupRef: null,
    recordsRef: null,
    loadedAsset: false,
    hasPoCDevice: false,
    onlineUserIds: [],
    originDepartments: [],
    departments: [],
    users: [],
    parentIdMap: {},
    flatParentIdMap: {},
    departmentsMap: {},
    usersMap: {},
    loading: false
	}

	loadSipAssets() {
    let scripts = [].slice.call(document.getElementsByTagName('script'))
    let loaded = scripts.find(script => script.src.indexOf('tmedia_session_ghost')> -1)
    if (loaded) return

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
		['/sipConst.js', '/SIPml.js', '/src/tinySIP/src/tsip_api.js'].forEach(src => {
			let tag_script = document.createElement('script');
			tag_script.setAttribute('type', 'text/javascript');
			tag_script.setAttribute('src', src + "?svn=252");
			tag_hdr.appendChild(tag_script);
		})
	}

	getSelectedUsers =(data)=> {
		let {users} = this.state
    let hasPoCDevice = false
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
		const {users} = this.state
		let _users = [], myself

		_users = users.filter(user => {
			if (user.usr_number !== usernumber) {
				return true
			} else {
				myself = user
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

  callingFn () {
    
  }

	handleFresh = () => {

		const {usernumber, realm, pwd, data_url} = this.props
    this.setState({loading: true})
    this.queryOnlineUsers()
    queryData({
      	usernumber: `${usernumber}@${realm}`,
				pwd,
				data_url
    }).then(res => {
      this.setState({...this.state, ...res, loading: false})
      this.state.userRef && this.state.userRef.setDefaultKeys()
    }).catch(err => {
      this.setState({loading: false})
    })
    this.state.userRef && this.state.userRef.getGroups()
	}

  handleGroupCall = (data) => {
    let users = data.users || []
    let hasPoC = users.find(item => item.usr_type === 'poc_term')
    this.setState({hasPoCDevice: hasPoC ? true : false}, () => {
      this.state.callRef.handleGroupCall(data)
    })
  }

  queryOnlineUsers () {
    const {usernumber, realm, pwd, data_url} = this.props
    queryOnlineUsers(
      {
        usernumber: `${usernumber}@${realm}`,
        pwd,
        data_url
      }
    ).then(ids => {
      this.setState({onlineUserIds: ids})
    })
  }

	componentDidMount () {
		this.handleFresh()
		setInterval(() => {
			this.queryOnlineUsers()
		}, QUERY_ONLINE_DURATION)

    const {height, width} = this.props
		this.setState({
			height: height || document.body.clientHeight,
			width: width || document.body.clientWidth
		})

		window.addEventListener('resize', () => {
			this.setState({
				height: height || document.body.clientHeight,
				width: width || document.body.clientWidth
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
    const {usernumber, pwd, socket_url, realm, data_url, visible} = this.props
		let {height, width, loading, selectedUsers, hasPoCDevice, onlineUserIds, usersMap, originDepartments, departments, parentIdMap, flatParentIdMap, departmentsMap} = this.state
    return(
			<div
				className={`${styles.sipcall} ${baseStyles['flex']}`}
				style={{height: `${visible ? (height-68) : 0}px`, width: `${visible ? width < 1200 ? 1280 : width : 0}px`, padding: `${visible ? 24 : 0}px`, overflow: 'hidden'}}
			>
				{visible && <Users ref="users"
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
               callingFn={this.callingFn}
				/>}
				<Call
          height={height-112}
          visible={visible}
          selectedUsers={selectedUsers}
          hasPoCDevice={hasPoCDevice}
          users={this.usersOfUpMyself()}
          removeSelectedUser={this.removeSelectedUser}
          saveTempgroup={this.saveTempgroup}
          saveRecords={this.saveRecords}
          account={{usernumber, pwd, socket_url, myself: this.usersOfUpMyself()[0]}}
          onRef={this.onCallRef}
				/>
				{visible && (<div
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
				</div>)}
			</div>
		)
	}
}



