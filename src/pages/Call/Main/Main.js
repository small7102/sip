import React, { Component } from 'react';
import styles from './Main.less';
import baseStyles from '../assets/base.less'
import Users from '../Users/Users'
import Call from '../Session/Call'
import History from '../History/History'
import Tempgroups from '../Tempgroups/tempgroups';
import { connect } from 'dva';
const QUERY_ONLINE_DURATION = 120000

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
	}
  componentWillMount(){
    this.loadSipAssets()
  }
	state = {
		height: 1080,
		width: 1920,
		usernumber: '10010007',
		pwd: '460490',
		socket_url: 'wss://183.47.46.242:7443',
		selectedUserIds: [],
		selectedUsers: [],
    userRef: null
	}

	loadSipAssets() {
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
    const _selectedUsers = selectedUsers.filter(user => {
			return user.usr_number != usr_number
		})

    this.setState({selectedUsers: _selectedUsers})
    userRef.removeUserById(usr_number)
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
				return false
			}
		})
		
		myself && users.unshift(myself)
		return users
	}

  onRef= (ref)=> {
    this.setState({userRef: ref})
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
		setInterval(() => {
			dispatch({
				type: 'sipUsers/getOnlineUsers',
				payload: {
					usernumber: this.state.usernumber,
					pwd: this.state.pwd
				}
			});
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
	}

	render () {
		let {sipUsers, loading} = this.props
		let {height, width, selectedUsers, usernumber, pwd, socket_url} = this.state

		return(
			<div
				className={`${styles.sipcall} ${baseStyles['flex']}`}
				style={{height: `${height-48}px`}}
			>
				<Users ref="users"
               height={height-140}
							 width={width > 1500 ? 360 : 300}
							 users={this.usersOfUpMyself()}
							 loading={loading}
							 onlineIds={sipUsers.onlineUserIds}
							 getSelectedUserIds={this.getSelectedUsers}
               onRef={this.onRef}
							 usernumber={usernumber}
				/>
				<Call height={height-140}
							selectedUsers={selectedUsers}
              removeSelectedUser={this.removeSelectedUser}
							account={{usernumber, pwd, socket_url}}
				/>
				<div
					className={`${styles['right-wrap']}`}
				>
					<History height={height - 450} width={width > 1500 ? 360 : 300}></History>
					<Tempgroups height={290} width={width > 1500 ? 360 : 300}></Tempgroups>
				</div>
			</div>
		)
	}
}



