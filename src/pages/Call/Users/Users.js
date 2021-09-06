import React, { Component } from 'react';
import iconfont from '../assets/iconfont.less'
import styles from './Users.less'
import baseStyles from '../assets/base.less'
import Box from '../Box/Box'
import { Input, Checkbox, Avatar, Icon } from 'antd';

export default
class Users extends Component {
	constructor (props) {
		super(props)
		this.onSelectedUsersChange = this.onSelectedUsersChange.bind(this)
	}
	state = {
		selectedUserIds: []
	}

	listDom (users, onlineIds=[]) {
		if (onlineIds.length) {
			const onlineUsers = []
			const offlineUsers = users.filter(item => {
				let isOnline = onlineIds.includes(item.usr_number)
				if (isOnline) onlineUsers.push(item)
				return !isOnline
			})

			users = onlineUsers.concat(offlineUsers)
		}
		return users.map(item => {
			return (<li className={`${baseStyles['m-item']} ${styles['user-item']} ${onlineIds.includes(item.usr_number) ? styles['online'] : styles['offline']}`} 
									key={item.usr_uuid}
									style={{width: `${this.width-20}px`}}
							>
						<div className={`${baseStyles['flex']} ${baseStyles['align-center']}`}>
							<div className={`${baseStyles['flex-item']}`}>	
								<Checkbox 
									value={item.usr_number}
									>
									<Avatar
										style={{marginTop: '-10px', marginRight: '8px', backgroundColor: '#87d068'}}
										shape="square"
										size={36}
										src='https://hbimg.huabanimg.com/2d431c924927b2968d26722f519ae7ed38094e36d192-34zNAY_fw658/format/webp'
									/>
									{item.usr_name}
								</Checkbox>
							</div>
							<div className={`${baseStyles['flex']} ${baseStyles['align-center']}`}>
								<span className={baseStyles.ft12}>{onlineIds.includes(item.usr_number) ? '在线' : '离线'}</span>
								<i className={`${iconfont['icon-gengduo']} ${iconfont['m-icon']} ${styles['more-btn']}`}></i>
							</div>
						</div>
				</li>)
		})
	}

	onSelectedUsersChange (data) {
		this.props.getSelectedUserIds(data)
	}
	
	render () {
		let {height, width = 360, users, loading, onlineIds} = this.props
		return(
			<Box
				title="通讯录"
				height={(height)}
				width={width}
				content={
					<div>
						<Input placeholder="输入名称" 
									prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
									style={{backgroundColor: 'rgba(255,255,255,.1) !important'}}
						/>
						<Checkbox.Group className={`${baseStyles['w100']}`}
														onChange={this.onSelectedUsersChange}
						>
							<ul className={`${styles['list-wrap']} ${baseStyles['scroll-bar']}`} style={{height: `${height-100}px`}}>
								{this.listDom(users, onlineIds)}
							</ul>
						</Checkbox.Group>
					</div>
				}>
			</Box>
		)
	}
}

