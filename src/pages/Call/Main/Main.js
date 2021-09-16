import React, { Component } from 'react';
import styles from './Main.less';
import baseStyles from '../assets/base.less'
import Users from '../Users/Users'
import Call from '../Session/Call'
import History from '../History/History'
import Tempgroups from '../Tempgroups/tempgroups';
import { connect } from 'dva';
const QUERY_ONLINE_DURATION = 120000
let loadedAsset = false
let loadTimer = null
let a = 0

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
		usernumber: '10010022',
		pwd: '228304',
		level: 1,
		socket_url: 'wss://183.47.46.242:7443/',
		selectedUserIds: [],
		selectedUsers: [],
    userRef: null,
    callRef: null,
    tempgroupRef: null,
    recordsRef: null,
    loadedAsset: false
	}

	loadSipAssets() {
    const rawHeadAppendChild = HTMLHeadElement.prototype.appendChild

    HTMLHeadElement.prototype.appendChild = function (child) {
			if(child && child.src && child.src.indexOf('tmedia_session_ghost')> -1) {
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

	getSelectedUsers =(data)=> {
		let {sipUsers} = this.props
		const selectedUsers = data.map(id => {
			return sipUsers.users.find(item => item.usr_number === id)
		})

		this.setState({selectedUsers})

	}

  removeSelectedUser = (usr_number) => {
    const {selectedUsers, userRef} = this.state
    const _selectedUsers = usr_number ? selectedUsers.filter(user => {
			return user.usr_number != usr_number
		}) : []

    this.setState({selectedUsers: _selectedUsers})
    userRef && userRef.removeUserById(usr_number)
  }

	usersOfUpMyself () {
		const {sipUsers} = this.props
		const {usernumber} = this.state
		let users = [...sipUsers.users], myself

		users = users.filter(user => {
			if (user.usr_number !== usernumber) {
				return true
			} else {
				myself = user
				// console.log(user)
				return false
			}
		})

		myself && users.unshift(myself)
		return users || []
	}

  saveTempgroup () {
    const {tempgroupRef} = this.state
    tempgroupRef && tempgroupRef.getLocalData()
  }

  saveRecords () {
    console.log(this.state)
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
		this.setState({
			selectedUsers: data.users
		}, () => {
			callRef.sipCall(data.users)
		})
	}

	componentDidMount () {
		const { dispatch } = this.props;
		dispatch({
			type: 'sipUsers/queryUsers',
			payload: {
				usernumber: this.state.usernumber,
				pwd: this.state.pwd
			}
		});
		dispatch({
			type: 'sipUsers/getOnlineUsers',
			payload: {
				usernumber: this.state.usernumber,
				pwd: this.state.pwd
			}
		});
		// dispatch({
		// 	type: 'sipUsers/getCallRecords',
		// 	payload: {
		// 		usernumber: this.state.usernumber,
		// 		pwd: this.state.pwd,
    //     moreParams: {
    //       caller_id_number: '10010023'
    //     }
		// 	}
		// });
		setInterval(() => {
			dispatch({
				type: 'sipUsers/getOnlineUsers',
				payload: {
					usernumber: this.state.usernumber,
					pwd: this.state.pwd
				}
			})
		}, QUERY_ONLINE_DURATION)

		this.setState({
			height: document.body.clientHeight,
			width: document.body.clientWidth
		})

		window.addEventListener('resize', () => {
			this.setState({
				height: document.body.clientHeight,
				width: document.body.clientWidth
			})
		})

    loadTimer = setInterval(() => {
      if (loadedAsset && this.state.callRef) {
        this.state.callRef.newSip()
        clearInterval()
        loadTimer=null
      }
    }, 1000)
	}

	render () {
		let {sipUsers, loading} = this.props
		let {height, width, selectedUsers, usernumber, pwd, socket_url} = this.state

		return(
			<div
				className={`${styles.sipcall} ${baseStyles['flex']}`}
				style={{height: `${height-112}px`}}
			>
				<Users ref="users"
               height={height-112}
							 width={width > 1500 ? 360 : 260}
							 users={this.usersOfUpMyself()}
							 loading={loading}
							 onlineIds={sipUsers.onlineUserIds}
							 getSelectedUserIds={this.getSelectedUsers}
               onRef={this.onRef}
							 usernumber={usernumber}
							 pwd={pwd}
               callByOne={this.callByOne}
				/>
				<Call height={height-112}
							selectedUsers={selectedUsers}
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
            width={width > 1500 ? 360 : 260}
            onRecordsRef={this.onRecordsRef}
            usernumber={usernumber}
            tempCallByRecords={this.tempCallByRecords}
          />
					<Tempgroups
            height={200}
            width={width > 1500 ? 360 : 260}
            onTempGroupRef={this.onTempGroupRef}
            usernumber={usernumber}
						tempCallByRecords={this.tempCallByRecords}
          >
            </Tempgroups>
				</div>
			</div>
		)
	}
}



