import React, { Component } from 'react';
import styles from './index.less';
import baseStyles from '../assets/base.less'
import iconfont from '../assets/iconfont.less'
import { Drawer, Form, Select, Popover,DatePicker, Button, Pagination, Icon, Spin } from 'antd';
const { Option } = Select;
import moment from 'moment';
import { connect } from 'dva';
import {getCallRecords} from '../services'
import {sendsFormat} from '../utils'

let voiceAudio = null

export default
class VoiceRecords extends Component {
	constructor (props) {
		super(props)
		this.onClose = this.onClose.bind(this)
		this.handleSearch = this.handleSearch.bind(this)
		this.showTotal = this.showTotal.bind(this)
		this.playAll = this.playAll.bind(this)
		this.handleNext = this.handleNext.bind(this)
		this.handlePrev = this.handlePrev.bind(this)
		this.onEndDateChange = this.onEndDateChange.bind(this)
		this.onStartDateChange = this.onStartDateChange.bind(this)
	}

  state = {
    list: [],
    destination_number: '',
    total: 0,
    currentUrl: '',
    currentId: '',
    currentIndex: 0,
    playing: false,
    end_stamp: new Date(),
    caller_id_number: '',
    start_stamp: '',
    loading: false,
    offset: 1,
  }

  initData (usr_number) {
    this.setState({
      destination_number: usr_number,
      caller_id_number: usr_number,
      end_stamp: new Date()
    })
  }

	onClose () {
		this.props.onVoiceClose(this)
    voiceAudio = document.getElementById('voiceAudio')
    voiceAudio.pause()
    this.setState({
      list: [],
      total: 0,
      destination_number: '',
      caller_id_number: '',
      start_stamp: '',
      currentUrl: '',
      currentId: '',
      currentIndex: 0,
      playing: false,
      end_stamp: new Date(),
    })
	}

	disabledDate(current) {
		// Can not select days before today and today
		return current && current >= moment().endOf('day');
	}

	componentDidMount () {
    this.props.onRef(this)
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
    const {usernumber, pwd, realm, dataUrl} = this.props
    const {end_stamp, start_stamp, destination_number, caller_id_number,offset} = this.state

		this.setState({loading: true})
    getCallRecords({
      usernumber: `${usernumber}@${realm}`,
      pwd,
      data_url: dataUrl,
      moreParams: {
        end_stamp: end_stamp ? moment(end_stamp).format('YYYY-MM-DD hh:mm:ss') : null,
        start_stamp: start_stamp ? moment(start_stamp).format('YYYY-MM-DD hh:mm:ss') : null,
        limit: 50,
        caller_id_number,
        destination_number,
        offset: offset-1
		}}).then(res => {
      this.setState({loading: false})
      if (res && res.header && res.header.code == '1') {
        this.setState({list: res.cdrs, total: parseInt(res.total_count)})
      }
    }).catch(err => {
      this.setState({loading: false})
    })
	}

  showTotal () {
    return `共${this.state.total}条`
  }

  playAll () {
    const {list,currentId, currentIndex} = this.state
    if (!currentId) {
      this.handlePlay(list[0], 0)
    } else {
      let currentData = list[currentIndex]
      this.handlePlay(currentData, currentIndex)
    }
  }

  handlePrev () {
    const {list, currentIndex} = this.state
    if (!currentIndex) return
    this.handlePlay(list[currentIndex-1], currentIndex-1)
  }
  handleNext () {
    const {list, currentIndex} = this.state
    if (currentIndex===list.length-1) {
      this.handlePlay(list[0], 0)
      return
    }
    this.handlePlay(list[currentIndex+1],currentIndex+1)
  }

  handlePlay (data,index) {
    console.log(index, 'index')
    const {playing, currentId,list} = this.state
    const {uuid, audio_url} = data
    if (!audio_url) {
      index+1 === list.length ? this.handlePlay(list[0], 0) : this.handlePlay(list[index+1], index+1)
      return
    }

    voiceAudio = document.getElementById('voiceAudio')
    if (currentId===uuid) {//播放暂停
      playing ? voiceAudio.pause() : voiceAudio.play()
     this.setState({
       playing: !playing
     })

    } else {
     this.setState({
       currentUrl: `${this.props.dataUrl}${audio_url}`,
       currentId: uuid,
       currentIndex: index,
       playing: true
     })
    }
  }

  renderPlayer () {
    return (
      <div className={`${styles['player-wrap']} ${baseStyles['w100']} ${baseStyles['flex']} ${baseStyles['align-center']} ${baseStyles['justify-center']}`}>
        <div className={styles.prev} onClick={this.handlePrev}>
          <Icon type="caret-left" className={styles['side-icon']}/>
        </div>
        <div
          className={styles.play}
          onClick={this.playAll}
        >
          <Icon type={this.state.playing ? 'pause-circle': 'play-circle'} className={styles['play-icon']}/>
        </div>
        <div
          className={styles.next}
          onClick={this.handleNext}
        >
          <Icon type="caret-right"  className={styles['side-icon']}/>
        </div>
      </div>
    )
  }

  onEndDateChange (e) {
    this.setState({
      end_stamp: e ? moment(e, 'YYYY-MM-DD HH:mm:ss') : null
    })
  }
  onStartDateChange (e) {
    this.setState({
      start_stamp: e ? moment(e, 'YYYY-MM-DD HH:mm:ss') : null
    })
  }

  onCallerChange = (e) => {
    this.setState({
      caller_id_number: e
    })
  }

  onDestinationChange = (e) => {
    this.setState({
      destination_number: e
    })
  }

  pageNoChange = (pageNo) => {
    this.setState({
      offset: pageNo
    }, () => {
      this.handleSearch()
    })
  }

  handleClear = () => {
    this.setState({
      destination_number:'',
      caller_id_number: '',
      start_stamp: '',
      end_stamp: new Date(),
    })
  }

  renderList () {
    const {list, currentId, playing} = this.state
    const {usersMap} = this.props
    return list.map((item, index) => {
      let {mebers} = item
      if (mebers) {
        mebers = JSON.parse(mebers)
        mebers = mebers.map(user => {
         return user && usersMap[user] && usersMap[user].usr_name || ''
        }).join(',')
      }
      return (
        <div key={index}
              className={`${baseStyles['m-item']} ${styles['voice-item']} ${baseStyles['flex']} ${baseStyles['align-center']}`}>
          <div>
            <Popover
              content={mebers || item.destination_name}
              trigger="click"
              overlayClassName={styles.pop}
              >
            <div
              className={baseStyles['text-overflow']}
              style={{width: '300px'}}
            >
              {item.caller_id_name} <i className={`${iconfont['m-icon']} ${iconfont['icon-chufadaodaxiao']}`}></i>
                <span className={baseStyles.ft12}>
                  {mebers || item.destination_name}
                </span>
            </div>
              </Popover>
            <div className={`${styles['sub-info']}`}>
                {moment(new Date(parseInt(item.start_stamp+'000'))).format('YYYY-MM-DD hh:mm:ss')}
              <span style={{paddingLeft: 8}}>{item.duration && `时长:${sendsFormat(item.duration, 'text')}`}</span>
              <span style={{paddingLeft: 8}}>{mebers ? '临时群组' : '单呼'}</span>
            </div>
          </div>

          {item.audio_url&&(<div style={{marginLeft: 'auto'}}
            onClick={()=> {
              this.handlePlay(item, index)
            }}
          >
            <Icon type={currentId===item.uuid && playing ? 'pause-circle': 'play-circle'}
                  className={styles['play-btn']}/>
          </div>)}
        </div>
      )
    })
  }

	render () {
		const {visible, height} = this.props
    const {loading, destination_number, caller_id_number,total, currentUrl, list, end_stamp, start_stamp} = this.state

		return (
			<Drawer
				className={styles['voice-wrap']}
				title="语音记录"
				placement="right"
				closable={true}
				onClose={this.onClose}
				visible={visible}
				width={400}
			>
				<Form
					labelCol={{ span: 5 }} wrapperCol={{ span: 12 }}
					labelAlign="right"
					layout="inline"
					className={`${styles['form-wrap']}`}
				>
					<Form.Item label="被叫"  wrapperCol={{ span: 12, offset: 1 }}>
						<Select
              showSearch
              value={destination_number}
							className={styles['voice-wrap']}
							dropdownClassName={styles['select-wrap']}
							style={{ width: 100 }}
              allowClear={true}
              onChange={this.onDestinationChange}
            >
							{this.optionsDom()}
						</Select>
					</Form.Item>
					<Form.Item label="主叫"  wrapperCol={{ span: 12, offset: 1 }}>
						<Select
							className={styles['voice-wrap']}
							dropdownClassName={styles['select-wrap']}
              value={caller_id_number}
              allowClear
              showSearch
							style={{ width: 100 }}
              onChange={this.onCallerChange}
            >
							{this.optionsDom()}
						</Select>
					</Form.Item>
					<Form.Item label="开始时间" wrapperCol={{ span: 16, offset: 1 }}>
					<DatePicker
            showTime
            allowClear
						className={styles['date-wrap']}
            dropdownClassName={styles['drop-date-wrap']}
						style={{ width: 220 }}
						format="YYYY-MM-DD HH:mm:ss"
						disabledDate={this.disabledDate}
            value={start_stamp ? moment(start_stamp, 'YYYY-MM-DD HH:mm:ss') : null}
						onChange={
              (e) => {
                this.onStartDateChange(e)
              }
            }
					/>
					</Form.Item>
					<Form.Item label="结束时间"  wrapperCol={{ span: 16, offset: 1 }}>
					<DatePicker
            showTime
            allowClear
						className={styles['date-wrap']}
            dropdownClassName={styles['drop-date-wrap']}
						style={{ width: 220 }}
						format="YYYY-MM-DD HH:mm:ss"
						disabledDate={this.disabledDate}
            value={end_stamp ? moment(end_stamp, 'YYYY-MM-DD HH:mm:ss') : null}
						onChange={
              (e) => {
                this.onEndDateChange(e)
              }
            }
					/>
					</Form.Item>

					<div className={`${baseStyles['flex']} ${baseStyles['mt10']}`}
              style={{paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, .2)'}}
          >
							<Button
                style={{marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,.3)', borderColor: 'rgba(255,255,255,.4)', fontSize: '13px'}}
                onClick={this.handleClear}
              >
                  清除
                </Button>
							<Button
								type="primary"
                loading={loading}
								style={{margin: '0 20px 0 10px'}}
								onClick={this.handleSearch}
							>查询</Button>
					</div>
          {list.length?
            <Pagination
                size="small"
                className={`${baseStyles['mt10']} ${styles['pagination-wrap']}`}
                total={total}
                showTotal={this.showTotal}
                onChange={this.pageNoChange}
            /> : ''}
				</Form>

        <div
          className={`${baseStyles['scroll-bar']} ${baseStyles['mt10']}`}
          style={{height: `${height-240}px`}}
        >

          {loading ? (
            <div className={`${baseStyles.flex} ${baseStyles['justify-center']} ${baseStyles['align-center']}`}>
              <Spin/>
            </div>
          ): list.length ? this.renderList() : <div className={baseStyles.ft14} style={{lineHeight: '150px', textAlign:'center', color: 'rgba(255, 255, 255, .6'}}>暂无数据</div>}
          <audio
            src={currentUrl}
            autoPlay
            id="voiceAudio"
            onEnded={
              ()=> {
                this.handleNext()
              }
            }
          >
          </audio>
        </div>

        {list.length ? this.renderPlayer() : ''}
			</Drawer>
		)
	}
}
