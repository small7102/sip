import React, { Component } from 'react';
import iconfont from '../assets/iconfont.less'
import styles from './Call.less';
import baseStyles from '../assets/base.less'
import { Row, Col, Icon } from 'antd';

const users = [
	{name: '编号123', id: 1, status: 1},
	{name: '编号857', id: 2, status: 1},
	{name: '编号9757', id: 3, status: 1},
].map(function (user) {
	return (
			<Col
				span={8}
				key={user.id}
				className={`${baseStyles.flex} ${baseStyles['justify-center']}`}
			>
				<li
						className={`${styles['selected-user-item']} ${baseStyles['m-box-border']}`}>
						<div className={`${styles['avatar-wrap']}`}>
							<div className={styles['top-info']}>
								<Icon type="close"/>
							</div>
							<img src="https://hbimg.huabanimg.com/2d431c924927b2968d26722f519ae7ed38094e36d192-34zNAY_fw658/format/webp"/>
						</div>
						<div className={`${baseStyles['flex']} ${baseStyles['align-center']} ${styles['sub-info']}`}>
							<span className={`${baseStyles['flex-item']} ${styles.name}`}>
								{user.name}
							</span>

						</div>
				</li>
			</Col>
	)
})
const SelectedUers = (
	<ul className={styles['selected-user-wrap']}>
		<Row>
			{users}
		</Row>
	</ul>
);


const CreateHandlers = (
  <div className={`${styles.handlers} ${baseStyles['flex']} ${baseStyles['justify-center']} ${baseStyles['align-center']}`}>
    <div className={`${styles['handler-item']}`}>
      <div className={`${styles['cancel']} ${styles['handler-between']}`}>
			<i className={`${iconfont['m-icon']} ${iconfont['icon-guaduan']} ${baseStyles['ft40']}`}></i>
			</div>
      <span className={styles['btn-text']}>取消</span>
    </div>
    <div className={`${styles['handler-item']}`}>
      <div className={`${styles['create']} ${styles['handler-center']}`}>
				<i className={`${iconfont['m-icon']} ${iconfont['icon-dianhua']} ${baseStyles['ft60']}`}></i>
			</div>
      <span className={styles['btn-text']}>创建</span>
    </div>
    <div className={`${styles['handler-item']}`}>
      <div className={`${styles['save']} ${styles['handler-between']}`}>
				<i className={`${iconfont['m-icon']} ${iconfont['icon-bianji']} ${baseStyles['ft30']}`}></i>
			</div>
      <span className={styles['btn-text']}>保存</span>
    </div>
  </div>
);

export default class extends Component {
	state = {
		audioRemote: null,
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
		loginConfig: {
			display_name: '10010006',
			enable_early_ims: true,
			enable_media_stream_cache: false,
			enable_rtcweb_breaker: true,
			events_listener: { events: '*', listener: (e) => {
				this.onSipEventStack(e)
			} },
			ice_servers: "[]",
			impi: "10010023",
			impu: "sip:10010023@kinet",
			outbound_proxy_url: "",
			password: "309311",
			realm: "kinet",
			sip_headers: [
				{ name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
				{ name: 'Organization', value: 'Doubango Telecom' }
			],
			websocket_proxy_url: "wss://183.47.46.242:7443"
		}
	}

	onSipEventStack (e) {
		console.log(e.type, 111)
		switch (e.type) {
			case 'started':
				{
					try {
						this.setState({
							oSipSessionRegister: this.state.oSipStack.newSession('register',{
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
						})
						this.state.oSipSessionRegister.register();
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
		console.log(e,222)
		const {type, session} = e
		switch (type) {
			case 'connecting': case 'connected': 
			{
				let bConnected = (type == 'connected');
				if (session == this.state.oSipSessionRegister) {
					// 模拟拨号
					this.sipCall()

				} else if (session == this.state.oSipSessionCall) {

				}
			}
		}
	}

	// 开始拨号
	sipCall () {
		if (this.state.oSipStack && !this.state.oSipSessionCall && !tsk_string_is_null_or_empty('10010007')) {
			this.setState({
				oSipSessionCall: this.state.oSipStack.newSession('call-audio', this.state.oConfigCall)
			})

			if (this.state.oSipSessionCall.call('10010007') != 0) {
				console.log('拨号失败...')
				this.setState({
					oSipSessionCall: null
				})
			}
		}
	}

	componentDidMount () {
		let audioRemote = document.getElementById('audio_remote')
		this.setState({
			audioRemote,
			oConfigCall: {...this.state.oConfigCall, audio_remote: audioRemote}
		})
	}

	render () {
		const { height } = this.props;
		const { loginConfig } = this.state

		// loadTiny()
		setTimeout(() => {
			if (!this.state.oSipStack) {
				this.setState({
					oSipStack: new SIPml.Stack(loginConfig)
				})
				let startRes = this.state.oSipStack.start()
			}
    }, 1000)

		return (
			<div className={`${baseStyles['m-box-border']} ${baseStyles['flex-item']} ${styles['call-wrap']}`}
					style={{height: `${height}px`}}
					>
				<div className={styles.top}></div>
				<h2 className={styles.title}>语音通话</h2>
				<audio id="audio_remote" autoPlay></audio>
				<div className={`${baseStyles.h100} ${baseStyles['direction-col']} ${baseStyles['flex']} ${baseStyles['justify-center']}`}
				>
					{SelectedUers}
					{CreateHandlers}
				</div>
			</div>
		)
	}
}
