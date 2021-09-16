import React, { Component } from 'react';
import styles from './index.less';
import baseStyles from '../assets/base.less'
import { Drawer, Form, Select, DatePicker, Button } from 'antd';
const { Option } = Select;
import moment from 'moment';
import { connect } from 'dva';
import {getCallRecords} from '../services'

export default
class VoiceRecords extends Component {
	constructor (props) {
		super(props)
		this.onClose = this.onClose.bind(this)
		this.handleSearch = this.handleSearch.bind(this)
	}

	onClose () {
		this.props.onVoiceClose(this)
	}

	disabledDate(current) {
		// Can not select days before today and today
		return current && current < moment().endOf('day');
	}

	componentDidMount () {
		// this.props.onVoiceRef(this)
		const {usernumber, pwd} = this.props
		// dispatch({
		// 	type: 'sipUsers/getCallRecords',
		// 	payload: {
		// 		usernumber: usernumber,
		// 		pwd: pwd,
    //     moreParams: {
    //       caller_id_number: '10010023'
    //     }
		// 	}
		// });
		getCallRecords({usernumber, pwd, moreParams: {
			end_stamp: '2021-09-16 17:28:13',
			start_stamp: '2021-09-08 17:28:13',
		}})
	}

	optionsDom () {
		const {users} = this.props
		return users.map(user => {
			let {usr_number, usr_name} = user
			return (
				<Option
					key ={usr_number}
					value={usr_number}
				>
					{usr_name}
				</Option>
			)
		})
	}

	handleSearch () {
		console.log(14545)
	}

	render () {
		const {visible, users} = this.props
		return (
			<Drawer
				className={styles['voice-wrap']}
				title="语音记录"
				placement="right"
				closable={true}
				onClose={this.onClose}
				visible={visible}
				width={360}
			>
				<Form
					labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} 
					labelAlign="right"
					layout="inline" 
					className={`${styles['form-wrap']}`}
				>
					<Form.Item label="被叫"  wrapperCol={{ span: 12, offset: 1 }}>
						<Select

							className={styles['voice-wrap']}
							dropdownClassName={styles['select-wrap']}
							style={{ width: 100 }}>
							{this.optionsDom()}
						</Select>
					</Form.Item>
					<Form.Item label="主叫"  wrapperCol={{ span: 12, offset: 1 }}>
						<Select
							className={styles['voice-wrap']}
							dropdownClassName={styles['select-wrap']}
							style={{ width: 100 }}>
							{this.optionsDom()}
						</Select>
					</Form.Item>
					<Form.Item label="开始时间" wrapperCol={{ span: 16, offset: 1 }}>
					<DatePicker
						className={styles['date-wrap']}
						style={{ width: 220 }}
						format="YYYY-MM-DD HH:mm:ss"
						disabledDate={this.disabledDate}
						showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
					/>
					</Form.Item>
					<Form.Item label="结束时间"  wrapperCol={{ span: 16, offset: 1 }}>
					<DatePicker
						className={styles['date-wrap']}
						style={{ width: 220 }}
						format="YYYY-MM-DD HH:mm:ss"
						disabledDate={this.disabledDate}
						showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
					/>
					</Form.Item>

					<div className={`${baseStyles['flex']} ${baseStyles['mt10']}`}>
							<Button style={{marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,.3)', borderColor: 'rgba(255,255,255,.4)', fontSize: '13px'}}>清除</Button>
							<Button 
								type="primary" 
								style={{margin: '0 20px 0 10px'}}
								onClick={this.handleSearch}
							>查询</Button>
					</div>
				</Form>
			</Drawer>
		)
	}
}