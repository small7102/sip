import React, { Component } from 'react';
import iconfont from '../assets/iconfont.less'
import styles from './Users.less'
import baseStyles from '../assets/base.less'
import Box from '../Box/Box'
import { Input, Checkbox, Avatar, Icon, Popover } from 'antd';

export default
class Users extends Component {
	constructor (props) {
		super(props)
		this.onSelectedUsersChange = this.onSelectedUsersChange.bind(this)
	}
	state = {
		selectedUserIds: [],
		inpVal: '',
		searchList: []
	}

	listDom () {
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
		return _users.map(item => {
			return (<li className={`${baseStyles['m-item']} ${styles['user-item']} ${onlineIds.includes(item.usr_number) ? styles['online'] : styles['offline']}`}
									key={item.usr_uuid}
									style={{width: `${this.width-20}px`}}
							>
						<div className={`${baseStyles['flex']} ${baseStyles['align-center']}`}>
								<Checkbox
									value={item.usr_number}
									disabled={item.usr_number === usernumber}
									>
									<Avatar
										style={{marginTop: '-10px', marginRight: '8px', backgroundColor: '#87d068'}}
										shape="square"
										size={36}
										src='https://hbimg.huabanimg.com/2d431c924927b2968d26722f519ae7ed38094e36d192-34zNAY_fw658/format/webp'
									/>
								</Checkbox>
								<div className={`${styles['item-name']} ${baseStyles['text-overflow']} ${baseStyles['flex-item']}`}>
											{item.usr_name} {item.usr_number === usernumber ? '(自己)' : ''}
								</div>
							<div className={`${baseStyles['flex']} ${baseStyles['align-center']}`}>
								<span className={`${baseStyles.ft12} ${styles['state']}`}>{onlineIds.includes(item.usr_number) ? '在线' : '离线'}</span>
								<i className={`${iconfont['icon-gengduo']} ${iconfont['m-icon']} ${styles['more-btn']}`}></i>
							</div>
						</div>
				</li>)
		})
	}

	onSelectedUsersChange (data) {
		this.props.getSelectedUserIds(data)
    this.setState({selectedUserIds: data})
	}

  removeUserById (id) {
    const {selectedUserIds} = this.state
    const _selectedUserIds = selectedUserIds.filter(item => item != id)
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

  componentDidMount(){
      this.props.onRef(this)
  }

	seachResultDom () {
		const {searchList} = this.state

		console.log(searchList, 123)
		return searchList.map((item, index) => {
			return (
				<div
					key={index}
					className={`${baseStyles['m-item']} ${styles['user-item']}`}
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
				visible = {true}
				overlayClassName={styles.pop}
				style={{width: `${width}px`, backgroundColor: '#16255b'}}
				content={
					<div className={baseStyles['scroll-bar']}
							style={{ width: `${width-40}px`, backgroundColor: '#16255b', maxHeight: '500px'}}>
						{
							this.seachResultDom()
						}
					</div>
				}
			>
				<Input 
					placeholder="输入名称"
					size="large"
					prefix={<Icon type="search" style={{ color: 'rgba(255,255,255,.8)' }} />}
					value={inpVal}
					onChange={
						(e) => this.handleSearch(e)
					}
				/>
			</Popover>
		)
	}

	render () {
		let {height, width = 360, users, loading} = this.props
    const {selectedUserIds} = this.state
		return(
			<Box
				title="通讯录"
				height={(height)}
				width={width}
				content={
					<div className="m-users-wrap">
						{this.searchDom()}
						<Checkbox.Group className={`${baseStyles['w100']}`}
                            value={selectedUserIds}
														onChange={this.onSelectedUsersChange}
						>
							<ul className={`${styles['list-wrap']} ${baseStyles['scroll-bar']}`} style={{height: `${height-100}px`}}>
								{this.listDom()}
							</ul>
						</Checkbox.Group>
					</div>
				}>
			</Box>
		)
	}
}

