import React, { Component } from 'react';
import baseStyles from '../assets/base.less'
import { Icon, Button, Modal, Switch, InputNumber } from 'antd';
import Storage from '../utils/localStore';
import styles from './index.less'

export default class Settings extends Component {
  constructor (props) {
		super(props)
	}

  state = {
    modalVisible: false,
    autoAnswer: false,
    waitingDuration: 30
  }

  onSwitchChange = (e) => {
    this.setState({autoAnswer: e})
  }

  onInputChange = (e) => {
    this.setState({waitingDuration: e})
  }

  handleSave () {
    let {autoAnswer, waitingDuration} = this.state
    let {usernumber} = this.props
    Storage.localSet(`${usernumber}settings`,
      JSON.stringify({
        autoAnswer,
        waitingDuration
      })
    )

    this.props.mMessage('info', '保存成功')
    this.props.getLocalSettings()
  }

  getLocal () {
    let {usernumber} = this.props

    let settings = Storage.localGet(`${usernumber}settings`)

    
    if (settings) {
      settings = JSON.parse(settings)
      console.log(settings, usernumber)
      this.setState({
        autoAnswer: settings.autoAnswer,
        waitingDuration: settings.waitingDuration,
      }, () => {
        console.log(this.state,333)
      })
    }
  }

  componentDidMount () {
    this.getLocal()
  }

  render () {
    const {modalVisible, autoAnswer, waitingDuration} = this.state
    return (
      <div className={styles['settings-wrap']}>
        <Button
          className={styles['settings-btn']}
          ghost 
          size="small"
          onClick={
            ()=> {
              this.setState({modalVisible: true}, () => {
                this.getLocal()
              })
            }
          }
        >设置</Button>

        <Modal
          title="通话设置"
          visible={modalVisible}
          className={styles.modal}
          // footer={null}
          onCancel={
            () => {
              this.setState({modalVisible: false})
            }
          }
          onOk={
            () => {
              this.setState({modalVisible: false})
              this.handleSave()
            }
          }
        >
          <div className={`${baseStyles.flex} ${baseStyles['align-center']}`}>
            <span className={baseStyles.ft12}>自动接听</span>
            <Switch 
              onChange={this.onSwitchChange}
              checked={autoAnswer}
              className={styles['switch-name']}
              style={{marginLeft: 'auto'}}
            />
          </div>
          <div className={`${baseStyles.flex} ${baseStyles.mt10} ${baseStyles['align-center']}`}>
            <span className={baseStyles.ft12}>静默时长</span>
            <InputNumber 
              onChange={this.onInputChange}
              value={waitingDuration}
              max={60}
              style={{marginLeft: 'auto'}}
            />
          </div>

        </Modal>
      </div>
    )
  }
}
