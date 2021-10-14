import React, { Component } from 'react';
import baseStyles from '../assets/base.less'
import iconfont from '../assets/iconfont.less'
import styles from '../Users/Users.less'
import { Input, Icon, Popover } from 'antd';

export default 
class Search extends Component {
	constructor (props) {
    super(props)
  }

	state = {
		inpVal: '',
		searchList: []
	}

	handleSearch (e) {
		const {users, usernumber} = this.props
		let val = e.target.value.toLowerCase()
		this.setState({inpVal: val})

		if (!val) {
			this.setState({
				searchList: []
			})
			return
		}
		const searchRes = users.filter(item => {
			return item.usr_name.toLowerCase().indexOf(val) > -1 && item.usr_number !== usernumber && item.usr_mapnum !== usernumber
		})

		

		this.setState({
			searchList: searchRes
		})
	}

	handleSelectSearchItem = (item) => {
		this.setState({
			inpVal: '',
			searchList: []
		})
		this.props.handleSelectSearchItem(item)
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
					{item.usr_name} {item.groupInfo ? `(群组:${item.groupInfo.group_name})`: ''}
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

	render () {
		return this.searchDom()
	}
}