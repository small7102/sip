import React, { useState } from 'react';
import iconfont from '../assets/iconfont.less'
import styles from './Users.less'
import baseStyles from '../assets/base.less'
import Box from '../Box/Box'
import { Input, Checkbox, Avatar, Icon } from 'antd';
import {queryUsers} from '../services'


queryUsers({usernumber:'10010006'}).then(res => {
	console.log(res)
}).catch(err => {
	console.log(err)
})
const Users = (props) => {
	let {height, width = 360} = props
	let list = [
		{name: '编号123', id: 1, status: 1},
		{name: '编号857', id: 2, status: 0},
		{name: '编号9757', id: 3, status: 1},
		{name: '编号787', id: 4, status: 0},
		{name: '编号111', id: 5, status: 0},
		{name: '编号333', id: 6, status: 0},
		{name: '编号666', id: 7, status: 0},
		{name: '编号89757', id: 8, status: 0},
		{name: '编号89757', id: 9, status: 0},
		{name: '编号89757', id: 10, status: 0},
		{name: '编号89757', id: 11, status: 0},
		{name: '编号89757', id: 12, status: 0},
	]

	let listResult = list.map(function (item) {
		return (<li className={`${baseStyles['m-item']} ${styles['user-item']} ${item.status ? styles['online'] : styles['offline']}`} 
								key={item.id}
								style={{width: `${width-20}px`}}
						>
					<div className={`${baseStyles['flex']} ${baseStyles['align-center']}`}>
						<div className={`${baseStyles['flex-item']}`}>	
							<Checkbox 
								value={item.id}
								>
								<Avatar
									style={{marginTop: '-10px', marginRight: '8px', backgroundColor: '#87d068'}}
									shape="square"
									size={36}
									src='https://hbimg.huabanimg.com/2d431c924927b2968d26722f519ae7ed38094e36d192-34zNAY_fw658/format/webp'
								/>
								{item.name}
							</Checkbox>
						</div>
						<div className={`${baseStyles['flex']} ${baseStyles['align-center']}`}>
							<span className={baseStyles.ft12}>{item.status ? '在线' : '离线'}</span>
							<i className={`${iconfont['icon-gengduo']} ${iconfont['m-icon']} ${styles['more-btn']}`}></i>
						</div>
					</div>
			</li>)
	})
	
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
					<Checkbox.Group>
						<ul className={`${styles['list-wrap']} ${baseStyles['scroll-bar']}`} style={{height: `${height-100}px`}}>
							{listResult}
						</ul>
					</Checkbox.Group>
				</div>
			}>
		</Box>
	)
}

export default Users
