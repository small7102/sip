import React, { Component } from 'react';
import iconfont from '../assets/iconfont.less'
import styles from './Call.less';
import baseStyles from '../assets/base.less'
import { message, Icon, Modal, Button, Input, Form } from 'antd';
const ringbacktoneSrc = require('../assets/sounds/ringbacktone.wav')
const ringtoneSrc = require('../assets/sounds/ringtone.wav')
import {byteToString, arrToObjectBySmyble, sendsFormat} from '../utils'
import Storage from '../utils/localStore'
import Settings from '../Settings'

let oSipStack = null
let oSipSessionRegister = null
let oSipSessionCall = null
let oSipSessionMessage = null
let timer = null
let waitingTimer = null

export default class extends Component {

	constructor (props) {
		super(props)
		this.sipCall = this.sipCall.bind(this)
		this.stopPtt = this.stopPtt.bind(this)
		this.hangUp = this.hangUp.bind(this)
		this.handleSave = this.handleSave.bind(this)
		this.handleOk = this.handleOk.bind(this)
		this.handleCancel = this.handleCancel.bind(this)
		this.changeInpVal = this.changeInpVal.bind(this)
		this.removeSelectedUser = this.removeSelectedUser.bind(this)
		this.getLocalSettings = this.getLocalSettings.bind(this)
	}
	state = {
		sipAvalible: false,
		audioRemote: null,
		ringbackTone: null,
    netNormal: true,
    modalVisible: false,
    halfCall: true,
    inpVal: '',
		oConfigCall: {
			bandwidth: { audio: undefined, video: undefined },
			events_listener: { events: '*', listener: (e) => {
				this.onSipEventSession(e)
			}},
			sip_caps: [
				{ name: '+g.oma.sip-im' },
        { name: 'language', value: '\"en,fr\"' }
			]
		},
		connectedMemberObj: {},//已经加入通话的成员
    talkingUser: null,
		ptting: false, // 正在ptt
		calling: false, // 正在拨号
		callConnected: false,
		sessionId: null,
		userCardSty: '',
    calledUsers: [],//已经创建呼叫的成员
		netInfoObj: {},
		duration: 0,
    autoAnswer: false,
    waitingDuration: 30,
		loginConfig: {
			enable_early_ims: true,
			enable_media_stream_cache: false,
			enable_rtcweb_breaker: true,
			events_listener: { events: '*', listener: (e) => {
				this.onSipEventStack(e)
			} },
			ice_servers: "[]",
			outbound_proxy_url: "",
			realm: "kinet",
			sip_headers: [
				{ name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
				{ name: 'Organization', value: 'Doubango Telecom' }
			],
		}
	}

  mMessage (type, text) {
    message.destroy()
    message[type](text)
  }

	ringbackTone () {
		// let ringbackTone = document.getElementById('ringbackTone')
		// ringbackTone.play()
	}

	onSipEventStack (e) {
    console.log(e, '事件回调')
		switch (e.type) {
			case 'started':
				{
					try {
						oSipSessionRegister = oSipStack.newSession('register',{
							expires: 200,
							events_listener: { events: '*', listener: (e) => {
								this.onSipEventSession(e)
							} },
							sip_caps: [
													{ name: '+g.oma.sip-im', value: null },
													//{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
													{ name: '+audio', value: null },
													{ name: 'language', value: '\"en,fr\"' }
							]
						})
						oSipSessionRegister.register();

						oSipSessionMessage = oSipStack.newSession('message',{
							expires: 200,
							events_listener: { events: '*', listener: (e) => {
								this.onSipEventSession(e)
							} },
							sip_caps: [
													{ name: '+g.oma.sip-im', value: null },
													//{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
													{ name: '+audio', value: null },
													{ name: 'language', value: '\"en,fr\"' }
							]
						})
						oSipSessionMessage.message();
					}
					catch (e) {

					}
					break;
				}
        case 'failed_to_start': {
          this.setState({netNormal: false})
          this.mMessage('error', 'scoket连接失败')
        }
				case 'i_new_call': {
					if (oSipSessionCall) {
						e.newSession.hangup()
					} else {
            oSipSessionCall = e.newSession;
						oSipSessionCall&&oSipSessionCall.setConfiguration(this.state.oConfigCall);

            let usernumber = e.newSession &&  e.newSession.o_session && e.newSession.o_session.o_uri_from && e.newSession.o_session.o_uri_from.s_user_name
						if (e.call_info) {
							let info = e.call_info.replace('<members=', '').split('#')
							usernumber = info[0]
							this.setState({sessionId: e.newSession.o_session.i_id})
						}
            
            if (usernumber) {
              let user = this.props.users.find(item => item.usr_number == usernumber)
              if (user) {
                this.setState({calledUsers: [user], halfCall: e.call_info ? true : false})
                this.ringbackTone()
                this.handleAutoAnswer()
              }
            }
					}
					break;
				}
				case 'i_new_message': {
					// console.log(e.content, 'messsage')
					let netInfoObj = {...this.state.netInfoObj}
					let content = e.content || []
					let netInfo = JSON.parse(byteToString(content))
					netInfoObj[netInfo.exten] = netInfo

					this.setState({netInfoObj})
					break;
				}
				default: break;
		}
	}

	// 会话的回调
	onSipEventSession (e) {
		const {connectedMemberObj, calledUsers, callConnected} = this.state
    const {selectedUsers, hasPoCDevice} = this.props
		const {type, session, description} = e

		console.log(e,123)
		switch (type) {
			case 'connecting': {
				break;
			}
			case 'connected':
			{
				let bConnected = (type == 'connected');
				if (session == oSipSessionRegister) { // 注册登录成功
					this.setState({sipAvalible: true})
				} else if (session == oSipSessionCall) {
					if (description === 'In call') {
						this.setState({callConnected: true})
						this.countTime()
            this.waitingTimeCount()
					}
				} else {
        }
				break;
			}
			case 'i_ao_request':
			{
				if (session == oSipSessionCall) {
						let iSipResponseCode = e.getSipResponseCode();
						if (iSipResponseCode == 180 || iSipResponseCode == 183) {
						}
				}
				break;
			}
			case 'm_early_media':
			{
				if (session == oSipSessionCall) {

				}
				break;
			}
			case 'sent_request': {
				break;
			}
      case 'm_stream_audio_remote_added': {
        if (hasPoCDevice) {
          this.setState({callConnected: true})
          this.waitingTimeCount()
        }
        break;
      }
			case 'i_info': {
				if (session == oSipSessionCall) {
					let content = !content && Array.isArray(e.content) && e.content.length && e.content
					if (Array.isArray(content) && content.length) {

						let info = byteToString(content), infoUser

						let infoArr = info.split('\r\n')
						let cbInfo = arrToObjectBySmyble(infoArr)
						let {action, status, state, result, count, number} = cbInfo
            let users = selectedUsers ? selectedUsers : [...this.state.calledUsers ]
            console.log(cbInfo, 12345)
            if (state) {
              infoUser = users.find(item => item.usr_number === cbInfo.number)
              if (!selectedUsers) {
                users.push(infoUser)
                this.setState({calledUsers: users})
              } 
            }
						if (state == 'add') {
							let obj = connectedMemberObj ? {...connectedMemberObj} : {}
							// 有人加进会话
							obj[cbInfo.number] = cbInfo
              this.mMessage('info',`${infoUser.usr_name}接入会话`)

              if (!callConnected) {
                this.waitingTimeCount()
                this.countTime()
              }

							this.setState({
								callConnected: true,
								calling: false,
								connectedMemberObj: obj,
							})

						} else if (state == 'talking') {
              this.setState({
                talkingUser: {...infoUser}
              })
              this.clearWaitingTimer()
						} else if (state == 'release') {
              this.setState({
                talkingUser: null
              })
              this.waitingTimeCount()
						} else if (state == 'del') {
							// count: "1", state: "del", number: "10010023"
              this.mMessage('info',`${infoUser.usr_name}结束通话`)
							if (count == 1){//整个会话结束
								this.hangUp()
							}else{//成员退出
								this.removeSelectedUser(number)
								let _calledUsers = calledUsers.filter(item => item.usr_number !== number)
								this.setState({calledUsers: _calledUsers})
							}
						}
						else if (action == 'req') {
							// 自己申请ptt
							this.setState({ptting: status == 'ok' ? true : false})
              status == 'ok' ? this.clearWaitingTimer() : this.mMessage('warning', '通话被占用')
						} else if (action == 'rel' && result == 'ok') {
							// 自己释放ptt
							this.setState({ptting: false})
              this.waitingTimeCount()
						}
					}
				}
				break;
			}
			case 'terminated':case 'terminating': {
				if (session == oSipSessionRegister) {

					oSipSessionCall = null;
					oSipSessionRegister = null;
				}
				else if (session == oSipSessionCall) {
					this.mMessage('error','呼叫终止')
					this.removeSelectedUser()
					this.setState({
						callConnected: false,
						sessionId: null,
						calling: false,
						connectedMemberObj: null,
						calledUsers: [],
						duration: 0,
						talkingUser: null,
            halfCall: true
					})
					oSipSessionCall = null;
					// 清除计时器
					clearInterval(timer)
          timer = null
				}
				break;
			}
		}
	}

  handleAutoAnswer () {
    if (this.state.autoAnswer) {
      this.sipCall()
    } else {
			this.setState({calling: true})
		}
  }

  waitingTimeCount (text) {
    let waiting = 0
    waitingTimer = setInterval(() => {
			console.log(waiting,this.state.waitingDuration,4444)
      waiting++
      if (waiting>=this.state.waitingDuration) {
        this.hangUp()
        this.mMessage('warning', text)
				this.clearWaitingTimer()
      }
    },1000)
  }

  clearWaitingTimer () {
    clearInterval(waitingTimer)
		waitingTimer = null
  }

	randomRoom () {
		let roomId = '111'
		for (let i = 0;i < 10; i++) {
			roomId += Math.round(Math.random()*10)
		}
		return roomId
	}

	// 开始拨号
	sipCall () {
    const {netNormal, calledUsers, oConfigCall, callConnected} = this.state
    const {selectedUsers, account} = this.props
		if(!netNormal){
      this.mMessage('error', 'scoket连接失败')
      return
    }

    // 接听别人的通话
    if (!selectedUsers.length && calledUsers.length && !callConnected) { // 接听别人的通话
			oSipSessionCall.accept(oConfigCall)
			let obj = {}
			obj[calledUsers[0].usr_number] = calledUsers[0]
			this.setState({connectedMemberObj: obj, calling: false})

      this.saveRecords()
			console.log(account.usernumber, '发送接收指令')
			return
    }

		if (this.state.callConnected && oSipSessionCall) { //申请通话权限
			oSipSessionCall.info(`action=req\r\nid=${this.state.sessionId}\r\nlevel=1`,
				'application/poc_msg',
				this.state.oConfigCall
			)
			return
		}

    // 创建通话
		if (oSipStack && !oSipSessionCall) {
      this.saveRecords()
			oSipSessionCall = oSipStack.newSession('call-audio', oConfigCall)

			this.setState({sessionId: oSipSessionCall.o_session.i_id, calling: true})

			let roomId = this.randomRoom()
			let config = {...oConfigCall}
			// console.log(this.state.sessionId, config, '会话id')
			let tempGroup = oSipSessionCall.call(roomId, {
				...config,
				members: selectedUsers.map(item=> item.usr_number).join('#')
			})
			if (tempGroup !=0) {
				oSipSessionCall = null
				this.setState({calling: false, sessionId: null})
        this.mMessage('error','呼叫失败')
			} else {
        this.setState({calledUsers: [...selectedUsers]})
      }
		} else if (oSipSessionCall) {
			// oSipSessionCall.accept(this.state.oConfigCall)
		}
	}

	stopPtt () {
		oSipSessionCall.info(`action=rel\r\nid=${this.state.sessionId}\r\nlevel=1`,
			'application/poc_msg',
			this.state.oConfigCall
		)
	}

  hangUp () {
		if (oSipSessionCall) {
			oSipSessionCall.hangup({
				events_listener: {
					events: '*',
					listener: (e)=> {
						this.onSipEventSession(e)
					}
				}
			})
		} else {
			this.removeSelectedUser()
		}
  }

  removeSelectedUser (id) {
    this.props.removeSelectedUser(id)
  }

	countTime () {
		let {duration} = this.state
		if (!timer) {
			timer = setInterval(()=> {
				duration++
				this.setState({duration})
			}, 1000)
		} else {
			clearInterval(timer)
			timer = null
		}
	}

  handleSave () {
    this.setState({modalVisible: true})
  }

  saveRecords () {
    const {usernumber, myself} = this.props.account
		const {selectedUsers} = this.props	
		const {calledUsers} = this.state

    let records = Storage.localGet(`${usernumber}records`) || []
		let callType = calledUsers.length && !selectedUsers.length ? 1 : 0
    records.unshift(JSON.stringify({
      name: callType ? calledUsers[0].usr_number : myself && myself.usr_name,
      time: new Date().getTime(),
      type: callType,
      users: this.props.selectedUsers.length ? this.props.selectedUsers : this.state.calledUsers
    }))

    records = records.splice(0,50)
    Storage.localSet(`${usernumber}records`, records)
    this.props.saveRecords()
  }

  handleOk () {
    const {usernumber} = this.props.account
    const {inpVal} = this.state

    let tempGroups = Storage.localGet(`${usernumber}tempgroup`) || []
    tempGroups.unshift(JSON.stringify({
      name: inpVal,
      users: this.props.selectedUsers
    }))

    tempGroups = tempGroups.splice(0,50)
    Storage.localSet(`${usernumber}tempgroup`, tempGroups)
    this.setState({modalVisible: false, inpVal: ''})
    this.mMessage('success', '保存成功')

    this.props.saveTempgroup()
  }

  handleCancel () {
    this.setState({modalVisible: false, inpVal: ''})
  }

  changeInpVal (e) {
    this.setState({
      inpVal: e.target.value
    })
  }

	componentWillMount () {
		const {account} = this.props
		const {loginConfig} = this.state

		const {usernumber, pwd, socket_url} = account
		const _loginConfig = {
				...loginConfig,
				display_name: usernumber,
				impi: usernumber,
				impu: `sip:${usernumber}@kinet`,
				password: pwd,
				websocket_proxy_url: socket_url
		}

		this.setState({
			loginConfig: _loginConfig
		})
	}

	componentDidMount () {
    this.props.onRef(this)

		let audioRemote = document.getElementById('audio_remote')

		const { oConfigCall } = this.state
    const {height} = this.props

		this.setState({
			oConfigCall: {...oConfigCall, audio_remote: audioRemote}
		})

    message.config({
      top: (height+140)/2 - 20,
      duration: 3,
    });
		this.getLocalSettings()
	}
  
  getLocalSettings () {
    const {account} = this.props

    let settings = Storage.localGet(`${account.usernumber}settings`)
  
    if (settings) {
      settings = JSON.parse(settings)
      this.setState({
        autoAnswer: settings.autoAnswer,
        waitingDuration: settings.waitingDuration,
      })
    }
  }

  newSip () {
    const { loginConfig } = this.state
    if (!oSipStack) {
      oSipStack = new SIPml.Stack(loginConfig)
      oSipStack.start()
    }
  }

  talkingDom (className) {
    return(
      <div className={`${styles[className]} ${baseStyles['pointer']} ${baseStyles['flex']} ${baseStyles['align-center']} ${baseStyles['justify-around']}`}>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
      </div>
    )
  }

  callingDom () {
    return (
      <div className={`${baseStyles.pa} ${styles['calling-ani']}`}>
        <div className={`${styles['calling-ani-item']}`}></div>
        <div className={`${styles['calling-ani-item']}`}></div>
        <div className={`${styles['calling-ani-item']}`}></div>
      </div>
    )
  }

	getUserCardStyleByNum (len) {
		let sty = ''
		if (len > 3 && len <= 6) {
			sty = 'medium'
		} else if (len > 6) {
			sty = 'small'
		} else {
			sty = 'normal'
		}
		return sty
	}

	formatDuration () {
		const {duration} = this.state
		return sendsFormat(duration)
	}

	batteryDom (id) {
		const {netInfoObj} = this.state

		return (
			netInfoObj[id] &&
			<div className={`${styles['battery-wrap']} ${baseStyles['flex']} ${baseStyles['align-center']}`}>
				<span className={styles.val}>{netInfoObj[id].battery + '%'}</span>
				<div className={styles['left']}></div>
				<div className={`${styles['right']} ${baseStyles['pr']}`}>
					<div
						className={styles.battery}
						style={{width: netInfoObj[id].battery + '%'}}
					>
					</div>
				</div>
			</div>
		)
	}

	signalDom (id) {
		const {netInfoObj} = this.state
		const netInfo = netInfoObj[id]

		if (!netInfo) return

		const {netLevel=0, netType='0'} = netInfo
		return (
			netType != '0' ?
			(<div className={`${styles['signal-wrap']} ${baseStyles['flex']}`}>
				<div className={styles['signal-item']}
						style={{opacity: parseInt(netLevel) > 0 ? 1 : .4}}
				></div>
				<div className={styles['signal-item']}
						style={{opacity: parseInt(netLevel) > 1 ? 1 : .4}}
				></div>
				<div className={styles['signal-item']}
						style={{opacity: parseInt(netLevel) > 2 ? 1 : .4}}
				></div>
				<div className={styles['signal-item']}
						style={{opacity: parseInt(netLevel) > 3 ? 1 : .4}}
				></div>
			</div>) :
			(
				<div className={`${styles['wifi-wrap']} ${baseStyles['pr']}`}>
					<i className={`${styles['wifi-icon']} ${iconfont['m-icon']} ${iconfont['icon-wifi-outline']}`}></i>
					<div
						className={styles.current}
						style={{height: `${(netLevel-1)*4 || 2}px`}}
					>
						<i className={`${styles['inner-icon']} ${baseStyles['pa']} ${iconfont['m-icon']} ${iconfont['icon-wifi-outline']}`}
							// style={{bottom: '-8px'}}
						></i>
					</div>
				</div>
			)
		)
	}

	selectedUsersDom () {
		const {selectedUsers=[]} = this.props
    const {sessionId, talkingUser, calledUsers, connectedMemberObj, userCardSty, halfCall, callConnected} = this.state
    const users = calledUsers.length ? calledUsers : selectedUsers || []
		let sty = this.getUserCardStyleByNum(users.length)

		return (
			users.map( (user)=> {
				return (
							<li
									key={user.usr_number + new Date().getTime()}
									className={`${styles['selected-user-item']} ${styles[sty]} ${styles[userCardSty]} ${baseStyles['m-box-border']}`}>
									<div
                    className={`${styles['avatar-wrap']}`}
                    style={{backgroundColor:  `${user.usr_type === 'dispatch' ? '#4e86c7' : '#87d068'}`}}
                  >
										<div className={`${styles['top-info']} ${baseStyles['flex']} ${baseStyles['align-center']}`}>

                      { sessionId ?
                        [<span className={`${styles['state-icon']} ${styles[connectedMemberObj && connectedMemberObj[user.usr_number] || (!halfCall && callConnected) ? 'light': 'dark']}`}></span>,
                        <div className={`${baseStyles.ft12} ${styles['user-state']} ${baseStyles['flex-item']}`}>
                          {connectedMemberObj && connectedMemberObj[user.usr_number] || (!halfCall && callConnected) ? '已接入' : '连接中'}
                        </div>] : <Icon type="close"
                              className={`${baseStyles['pointer']}`}
                              onClick={this.removeSelectedUser.bind(this, user.usr_number)}
                        />
                      }
											{
												this.batteryDom(user.usr_number)
											}
											{
												this.signalDom(user.usr_number)
											}
										</div>
                      <div
                        className={`${baseStyles.w100} ${baseStyles.flex} ${baseStyles['justify-center']} ${baseStyles['align-center']}`}
                        style={{height: '100%'}}
                      >
                          <i
                            className={`${iconfont['m-icon']} ${iconfont[user.usr_type === 'dispatch' ? 'icon-diannao' : 'icon-chengyuan']}`}
                            style={{fontSize: `${user.usr_type === 'dispatch' ? 40 : 53}px`}}
                          ></i>
                      </div>
										{/* <img src="https://hbimg.huabanimg.com/2d431c924927b2968d26722f519ae7ed38094e36d192-34zNAY_fw658/format/webp"/> */}
									</div>
									<div className={`${baseStyles['flex']} ${baseStyles['align-center']} ${styles['sub-info']}`}>
										<span className={`${styles.name} ${baseStyles['flex-item']} ${baseStyles['text-overflow']}`}>
											{user.usr_name}
										</span>

											{talkingUser && talkingUser.usr_number === user.usr_number ? this.talkingDom('talking-ani') : ''}
									</div>
							</li>
				)
			})
		)
	}

  tipsDom () {
    return (
      <div
				className={`${baseStyles.flex} ${baseStyles.h100} ${baseStyles['align-center']} ${baseStyles['justify-center']}`}
				style={{marginBottom: -141, color: 'rgba(255,255,255,.5)'}}
			>
        <i className={`${iconfont['m-icon']} ${iconfont['icon-tixing']}`}
           style={{color: '#F4B754'}}
        ></i>
        请先在左侧列表选择成员
      </div>
    )
  }


  createHandlers = () => {
    const {selectedUsers} = this.props
    const { callConnected, calling, ptting, calledUsers, halfCall } = this.state
    return (<div className={`${styles.handlers} ${baseStyles['flex']} ${baseStyles['justify-center']} ${baseStyles['align-center']}`}>
     <div className={`${styles['handler-item']}`}
          onClick={this.hangUp}
      >
       <div className={`${styles['cancel']} ${styles['handler-between']} ${styles['handler-item-circle']}`}>
       <i className={`${iconfont['m-icon']} ${iconfont['icon-guaduan']} ${baseStyles['ft40']}`}></i>
       </div>
       <span className={styles['btn-text']}>{callConnected ? '挂断' : '取消'}</span>
     </div>
     {
       callConnected ? halfCall && 
        (
          <div className={`${styles['handler-item']} ${baseStyles['pr']}`}
								onClick={ptting ? this.stopPtt : this.sipCall}>
            <div className={`${styles['ptt']} ${styles['handler-center']} ${styles['handler-item-circle']}`}>
              <i className={`${iconfont['m-icon']} ${iconfont['icon-yuyin']} ${baseStyles['ft50']}`}></i>
            </div>
            <span className={styles['btn-text']}>PTT</span>
            { ptting ?
              this.talkingDom('ptt-ani') : ''
            }
          </div>
        ) : 
        (
          <div className={`${styles['handler-item']}`}>
            <div id="create"
                 className={`${styles['create']} ${styles['handler-center']} ${styles['handler-item-circle']} ${baseStyles['pr']}`}
                 style={{backgroundColor: `${calledUsers.length && !selectedUsers.length ? '#87d068' : '#3e79f2'}`}}
                 onClick={this.sipCall}
            >
              <i className={`${iconfont['m-icon']} ${iconfont['icon-dianhua']} ${baseStyles['ft60']}`}></i>

              {calling && this.callingDom()}
            </div>
            <span className={styles['btn-text']}>{calling ? '连接中...' : calledUsers.length && !selectedUsers.length ? '接听' : '创建'}</span>
          </div>
        )
     }
     <div
        className={`${styles['handler-item']}`}
        onClick={this.handleSave}
     >
       <div className={`${styles['save']} ${styles['handler-between']} ${styles['handler-item-circle']}`}>
         <i className={`${iconfont['m-icon']} ${iconfont['icon-bianji']} ${baseStyles['ft30']}`}></i>
       </div>
       <span className={styles['btn-text']}>保存</span>
     </div>
   </div>
 )};

	render () {
    const { height, selectedUsers, account } = this.props;
		const { callConnected, calling, talkingUser, duration, modalVisible, inpVal, calledUsers, halfCall} = this.state

		return (
			<div className={`m-call-wrap ${baseStyles['m-box-border']} ${baseStyles['flex-item']} ${styles['call-wrap']}`}
					style={{height: `${height}px`, zIndex: 3}}
					>
				<div className={styles.top}></div>
				<h2 className={styles.title}>语音通话</h2>
        <i className={`${iconfont['m-icon']} ${iconfont['icon-pronunciatio']} ${styles['bg-icon']}`}
        ></i>
        <Settings mMessage={this.mMessage} getLocalSettings={this.getLocalSettings} usernumber={account.usernumber}/>
				<audio id="audio_remote" autoPlay></audio>
				<audio id="ringbackTone" muted autoPlay loop src={ringbacktoneSrc}>
				</audio>
				<div className={`${baseStyles.h100} ${baseStyles['direction-col']} ${baseStyles['flex']} ${baseStyles['justify-center']}`}
				>
					<ul className={`${styles['selected-user-wrap']} ${baseStyles.flex} ${baseStyles['justify-center']} ${baseStyles['scroll-bar']}`}
					>
							{this.selectedUsersDom()}
					</ul>
          <div>
						<div className={`${styles.timer} ${baseStyles['ft40']} ${baseStyles['flex']} ${baseStyles['justify-center']}`}>
							{duration ? this.formatDuration() : ''}
						</div>
						<div className={`${baseStyles['flex']} ${baseStyles['align-center']} ${baseStyles['justify-center']} ${styles['center-info']}`}>
							{talkingUser ? `${talkingUser.usr_name}正在说话...` : !halfCall ? callConnected ? '通话已连接' : calledUsers[0].usr_name+'正在邀请你通话...' : ''}
						</div>
					</div>
					{ selectedUsers.length || calledUsers.length ? this.createHandlers() : this.tipsDom()}
				</div>

        <Modal
          title="保存临时群组"
          visible={modalVisible}
          className={styles.modal}
          footer={null}
          onCancel={this.handleCancel}
        >
          <Input
            size="large"
            value={inpVal}
            placeholder="输入名称"
            onChange={
              (e) => {
                this.changeInpVal(e)
              }
            }
          />

          <div className={`${baseStyles.flex} ${baseStyles['mt10']}`}>
            <Button
              style={{margin: '0 10px 0 auto'}}
              onClick = {this.handleCancel}
            >
              取消
            </Button>
            <Button
              type="primary"
              disabled={!inpVal}
              onClick = {this.handleOk}
            >
              确定
            </Button>
          </div>
        </Modal>
			</div>
		)
	}
}
