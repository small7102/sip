import React, { Component } from 'react';
import iconfont from '../assets/iconfont.less'
import styles from './Call.less';
import baseStyles from '../assets/base.less'
import { message, Icon } from 'antd';
const ringbacktoneSrc = require('../assets/sounds/ringbacktone.wav')
const ringtoneSrc = require('../assets/sounds/ringtone.wav')
import {byteToString, arrToObjectBySmyble} from '../utils'


let oSipStack = null
let oSipSessionRegister = null
let oSipSessionCall = null

export default class extends Component {

	constructor (props) {
		super(props)
		this.sipCall = this.sipCall.bind(this)
		this.stopPtt = this.stopPtt.bind(this)
		this.removeSelectedUser = this.removeSelectedUser.bind(this)
	}
	state = {
		sipAvalible: false,
		audioRemote: null,
		ringbackTone: null,
		oSipStack: null,
		oSipSessionRegister: null,
		oSipSessionCall: null,
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
		connectedMemberObj: {},
    talkingUser: null,
		ptting: false, // 正在ptt
		calling: false, // 正在拨号
		callConnected: false,
		sessionId: null,
		loginConfig: {
			display_name: '10010022',
			enable_early_ims: true,
			enable_media_stream_cache: false,
			enable_rtcweb_breaker: true,
			events_listener: { events: '*', listener: (e) => {
				this.onSipEventStack(e)
			} },
			ice_servers: "[]",
			impi: "10010022",
			impu: "sip:10010022@kinet",
			outbound_proxy_url: "",
			password: "228304",
			realm: "kinet",
			sip_headers: [
				{ name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
				{ name: 'Organization', value: 'Doubango Telecom' }
			],
			websocket_proxy_url: "wss://183.47.46.242:7443"
		}
	}

  mMessgae (type, text) {
    message.destroy()
    message[type](text)
  }

	onSipEventStack (e) {
		// console.log(e.type, 111)
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
					}
					catch (e) {

					}
					break;
				}
				default: break;
		}
	}

	// 会话的回调
	onSipEventSession (e) {
		// let {oSipSessionRegister, oSipSessionCall} = this.state
		let content = []
		const {type, session} = e
		console.log(e)
		switch (type) {
			case 'connecting': {
				break;
			}
			case 'connected':
			{
				let bConnected = (type == 'connected');
				if (session == oSipSessionRegister) { // 注册登录成功
					this.setState({sipAvalible: true})
					// console.log(this.state.sipAvalible,)

				} else if (session == oSipSessionCall) {

				}
				break;
			}
			case 'i_ao_request':
			{
				if (session == oSipSessionCall) {
						let iSipResponseCode = e.getSipResponseCode();
						if (iSipResponseCode == 180 || iSipResponseCode == 183) {
								this.setState({calling: true})
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
			case 'i_info': {
				if (session == oSipSessionCall) {
					let content = !content && Array.isArray(e.content) && e.content.length && e.content
					if (Array.isArray(content) && content.length) {

						let info = byteToString(content), infoUser

						let infoArr = info.split('\r\n')
						let cbInfo = arrToObjectBySmyble(infoArr)
						let {action, status, state} = cbInfo

            if (state) {
              infoUser = this.selectedUsers.find(item => item.usr_number === cbInfo.number)
            }
						console.log(cbInfo, action, 1254545)
						if (state == 'add') {
							// 有人加紧会话
							const connectedMemberObj = {...this.state.connectedMemberObj}
							connectedMemberObj[cbInfo.number] = cbInfo
              this.oMessage('info',`${infoUser.usr_name}接入会话`)

							this.setState({callConnected: true,
														 calling: false,
														 connectedMemberObj
														})
						} else if (state == 'talking') {
							// count: "2"
							// level: "1"
							// number: "10010023"
							// pttid: "10010023"
							// state: "talking
              this.setState({
                talkingUser: {
                  ...infoUser
                }
              })
              this.oMessage('info',`${infoUser.usr_name}正在讲话`)
						} else if (state == 'release') {
							// count: "2"
							// number: "10010023"
							// state: "release"
              this.setState({
                talkingUser: null
              })
						} else if (state == 'del') {
							// count: "1", state: "del", number: "10010023"
              this.oMessage('info',`${infoUser.usr_name}结束通话`)
						}
						else if (action == 'req') {
							// 自己申请ptt
							this.setState({ptting: status == 'ok' ? true : false})
						} else if (action == 'rel' && status == 'ok') {
							// 自己释放ptt
							this.setState({ptting: false})
						}
					}
				}
				break;
			}
			case 'terminated': {
				if (session == oSipSessionRegister) {

					oSipSessionCall = null;
					oSipSessionRegister = null;
				}
				else if (session == oSipSessionCall) {
					oSipSessionCall = null;
					this.setState({callConnected: false, calling: false})
				}
				break;
			}
		}
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
		// if (!this.state.sipAvalible) return // sip登录时代
		let {selectedUsers} = this.props
		if (!selectedUsers.length) return

		if (this.state.callConnected && oSipSessionCall) {
			let reqRes = oSipSessionCall.info(`action=req\r\nid=${this.state.sessionId}level=1`,
				'application/poc_msg',
				this.state.oConfigCall
			)
			return
		}
		if (oSipStack && !oSipSessionCall && !tsk_string_is_null_or_empty('10010023')) {
			oSipSessionCall = oSipStack.newSession('call-audio', this.state.oConfigCall)

			this.setState({sessionId: oSipSessionCall.o_session.i_id, calling: true})

			let roomId = this.randomRoom()
			let config = {...this.state.oConfigCall}
			console.log(this.state.sessionId, config, '会话id')
			let tempGroup = oSipSessionCall.call(roomId, {
				...config,
				members: '10010023#10010007'
				// members: selectedUsers.map(item=> item.usr_number).join('#')
			})
			if (tempGroup !=0) {
				console.log('拨号失败...')
				oSipSessionCall = null
				this.setState({calling: false, sessionId: null})
        this.mMessgae('error','呼叫失败')
			}

		} else if (oSipSessionCall) {
			console.log(oSipSessionCall)
			// oSipSessionCall.accept(this.state.oConfigCall)
		}
	}

	stopPtt () {
		console.log('挂断')
		let hanguoRes = oSipSessionCall.info(`action=rel\r\nid=${this.state.sessionId}level=1`,
			'application/poc_msg',
			this.state.oConfigCall
		)

		this.setState({ptting: false})
	}

  removeSelectedUser (id) {
    this.props.removeSelectedUser(id)
  }

	componentDidMount () {
		let audioRemote = document.getElementById('audio_remote')
		let create = document.getElementById('create')

		// let ringbackTone = document.getElementById('ringbackTone')

		const { loginConfig, oConfigCall } = this.state
    const {height} = this.props

		this.setState({
			oConfigCall: {...oConfigCall, audio_remote: audioRemote}
		})

		setTimeout(() => {
			if (!oSipStack) {
				oSipStack = new SIPml.Stack(loginConfig)

				let startRes = oSipStack.start()
			}
      console.log('init-init')
    }, 2000)


    message.config({
      top: (height+140)/2 - 20,
      duration: 3,
    });
	}

  talkingDom (className) {
    return(
      <div className={`${styles[className]} ${baseStyles['flex']} ${baseStyles['align-center']} ${baseStyles['justify-around']}`}>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
        <div className={`${styles['ani-item']}`}></div>
      </div>
    )
  }

	selectedUsersDom () {
		let {selectedUsers} = this.props
    const {sessionId, talkingUser} = this.state
		selectedUsers = selectedUsers || []
		return (
			selectedUsers.map( (user)=> {
				return (
							<li
									key={user.usr_number}
									className={`${styles['selected-user-item']} ${baseStyles['m-box-border']}`}>
									<div className={`${styles['avatar-wrap']}`}>
										<div className={styles['top-info']}>
                      {
                        !sessionId ?
                        <Icon type="close"
                              className={`${baseStyles['pointer']}`}
                              onClick={this.removeSelectedUser.bind(this,user.usr_number)}
                        />
                        : ''
                      }
										</div>
										<img src="https://hbimg.huabanimg.com/2d431c924927b2968d26722f519ae7ed38094e36d192-34zNAY_fw658/format/webp"/>
									</div>
									<div className={`${baseStyles['flex']} ${baseStyles['align-center']} ${styles['sub-info']}`}>
										<span className={`${baseStyles['flex-item']} ${styles.name} ${baseStyles['text-overflow']}`}>
											{user.usr_name} {user.usr_number}
										</span>

                    {talkingUser ? this.talkingDom('talking-ani') : ''}
									</div>
							</li>
				)
			})
		)
	}


  createHandlers = () => {
    const { callConnected, calling, ptting } = this.state
    return (<div className={`${styles.handlers} ${baseStyles['flex']} ${baseStyles['justify-center']} ${baseStyles['align-center']}`}>
     <div className={`${styles['handler-item']}`}>
       <div className={`${styles['cancel']} ${styles['handler-between']} ${styles['handler-item-circle']}`}>
       <i className={`${iconfont['m-icon']} ${iconfont['icon-guaduan']} ${baseStyles['ft40']}`}></i>
       </div>
       <span className={styles['btn-text']}>{callConnected ? '挂断' : '取消'}</span>
     </div>
     {
       callConnected ?
        (
          <div className={`${styles['handler-item']} ${baseStyles['pr']}`}>
            <div onClick={ptting ? this.stopPtt : this.sipCall} className={`${styles['ptt']} ${styles['handler-center']} ${styles['handler-item-circle']}`}>
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
                 className={`${styles['create']} ${styles['handler-center']} ${styles['handler-item-circle']}`}
                 onClick={this.sipCall}
            >
              <i className={`${iconfont['m-icon']} ${iconfont['icon-dianhua']} ${baseStyles['ft60']}`}></i>
            </div>
            <span className={styles['btn-text']}>{calling ? '连接中...' : '创建'}</span>
          </div>
        )
     }
     <div className={`${styles['handler-item']}`}>
       <div className={`${styles['save']} ${styles['handler-between']} ${styles['handler-item-circle']}`}>
         <i className={`${iconfont['m-icon']} ${iconfont['icon-bianji']} ${baseStyles['ft30']}`}></i>
       </div>
       <span className={styles['btn-text']}>保存</span>
     </div>
   </div>
 )};

	render () {
		const { height } = this.props;
		const { calling, talkingUser } = this.state
		return (
			<div className={`${baseStyles['m-box-border']} ${baseStyles['flex-item']} ${styles['call-wrap']}`}
					style={{height: `${height}px`}}
					>
				<div className={styles.top}></div>
				<h2 className={styles.title}>语音通话</h2>
				<audio id="audio_remote" autoPlay></audio>
				<audio id="ringbackTone" autoPlay={calling ? true : false} loop src={ringbacktoneSrc}>
				</audio>
				<audio id="audio_remote" autoPlay></audio>
				<div className={`${baseStyles.h100} ${baseStyles['direction-col']} ${baseStyles['flex']} ${baseStyles['justify-center']}`}
				>
					<ul className={`${styles['selected-user-wrap']} ${baseStyles.flex} ${baseStyles['justify-center']} ${baseStyles['scroll-bar']}`}
					>
							{this.selectedUsersDom()}
					</ul>
          {
            talkingUser && (
              <div>
                <div className={`${baseStyles['flex']} ${baseStyles['align-center']} ${baseStyles['justify-center']}`}>
                  {talkingUser.usr_name}正在说话...
                </div>
              </div>
            )
          }
					{this.createHandlers()}
				</div>
			</div>
		)
	}
}
