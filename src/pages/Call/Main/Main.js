import React, { Component } from 'react';
import styles from './Main.less';
import baseStyles from '../assets/base.less'
import Users from '../Users/Users'
import Call from '../Session/Call'
import History from '../History/History'
import Tempgroups from '../Tempgroups/tempgroups';
import { connect } from 'dva';
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
		usernumber: '10010129',
		pwd: '021832',
    realm: 'kinet',
		socket_url: 'wss://183.47.46.242:7443/',
    data_url: 'http://183.47.46.242:8008',
    // data_url: 'https://183.47.46.242:5443',
		selectedUserIds: [],
		selectedUsers: [],
    userRef: null,
    callRef: null,
    tempgroupRef: null,
    recordsRef: null,
    loadedAsset: false,
    hasPoCDevice: false
	}

	loadSipAssets() {
    const rawHeadAppendChild = HTMLHeadElement.prototype.appendChild

    HTMLHeadElement.prototype.appendChild = function (child) {
			if (child && child.src && child.src.indexOf('tsip_header_WWW_Authenticate')> -1) {
				console.log('tsip_header_WWW_Authenticate:加载了')
			}
			if (child && child.src && child.src.indexOf('tsip_parser_header.js')> -1) {
				console.log('tsip_parser_header.js:加载了')
				// console.log(tsip_header_WWW_Authenticate)
			}
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

	getSelectedUsers =(data)=> {
		let {sipUsers} = this.props
    let hasPoCDevice = false
		const selectedUsers = data.map(id => {
			return sipUsers.users.find(item => {
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

  getUsersMap () {
    let map = {}
    let users = this.props.sipUsers.users
    if (users) {
      users.forEach(item => {
        map[item.usr_number] = item
      })
    }
    return map
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

	handleFresh = () => {

		const { dispatch } = this.props;
		const {usernumber, realm, pwd, data_url} = this.state
		dispatch({
			type: 'sipUsers/queryUsers',
			payload: {
				usernumber: `${usernumber}@${realm}`,
				pwd,
				data_url
			}
		});
		dispatch({
			type: 'sipUsers/getOnlineUsers',
			payload: {
				usernumber: `${usernumber}@${realm}`,
				pwd,
				data_url
			}
		});
	}

	componentDidMount () {
		const { dispatch } = this.props;
    const {usernumber, realm, pwd, data_url} = this.state
		this.handleFresh()
		setInterval(() => {
			dispatch({
				type: 'sipUsers/getOnlineUsers',
				payload: {
					usernumber: `${usernumber}@${realm}`,
					pwd,
          data_url
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
        clearInterval(loadTimer)
        loadTimer=null
      }
    }, 1000)
	}

	render () {
		let {sipUsers, loading} = this.props
		let {height, width, selectedUsers, hasPoCDevice, usernumber, pwd, socket_url, realm, data_url} = this.state

		return(
			<div
				className={`${styles.sipcall} ${baseStyles['flex']}`}
				style={{height: `${height-68}px`, padding: '24px', overflow: 'hidden'}}
			>
				<Users ref="users"
               height={height-112}
							 width={width > 1500 ? 400 : 300}
							 users={this.usersOfUpMyself()}
               usersMap= {this.getUsersMap()}
							 departments={sipUsers.departments}
							 loading={loading}
							 onlineIds={sipUsers.onlineUserIds}
							 getSelectedUserIds={this.getSelectedUsers}
               onRef={this.onRef}
							 usernumber={usernumber}
               realm={realm}
							 pwd={pwd}
               dataUrl={data_url}
               callByOne={this.callByOne}
               handleFresh={this.handleFresh}
				/>
				<Call height={height-112}
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
          >
            </Tempgroups>
				</div>
			</div>
		)
	}
}



