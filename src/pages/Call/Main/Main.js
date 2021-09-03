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
	state = {
		height: 1080,
		width: 1920,
		usernumber: '10010007',
		pwd: '460490',
		selectedUserIds: [],
		selectedUsers: [],
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

	getSelectedUsers (data) {
		let {sipUsers} = this.props
		const selectedUsers = sipUsers.users.filter(user => {
			return data.includes(user.usr_number)
		})
		this.setState({selectedUsers})
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
		let {height, width, selectedUsers} = this.state
		this.loadSipAssets()
	
		return(
			<div
				className={`${styles.sipcall} ${baseStyles['flex']}`}
				style={{height: `${height-48}px`}}
			>
				<Users height={height-140} 
							 width={width > 1500 ? 360 : 300}
							 users={sipUsers.users}
							 loading={loading}
							 onlineIds={sipUsers.onlineUserIds}
							 getSelectedUserIds={
								 (data) => {
										this.getSelectedUsers(data)
								 }
							 }
				/>
				<Call height={height-140}
							selectedUsers= {selectedUsers}
				/>
				<div 
					className={`${styles['right-wrap']}`}
				>
					<History height={height - 450} width={width > 1500 ? 300 : 240}></History>
					<Tempgroups height={290} width={width > 1500 ? 300 : 240}></Tempgroups>
				</div>
			</div>
		)
	}
}



