import React, { Component } from 'react';
import Box from '../Box/Box'
import iconfont from '../assets/iconfont.less'
import styles from './History.less'
import baseStyles from '../assets/base.less'
import { Icon } from 'antd';
import './History.css';
import Storage from '../utils/localStore';
import {dateFmt} from '../utils'


export default class History extends Component {
  constructor (props) {
		super(props)
    this.handleCallback = this.handleCallback.bind(this)
	}

  state = {
    list: []
  }

  getLocalData () {
    const {usernumber} = this.props

    let list = Storage.localGet(`${usernumber}records`) || []
    list = list.map(item => JSON.parse(item))

    this.setState({list})
  }

  handleCallback (data) {
    this.props.tempCallByRecords(data)
  }

  Calls () {
    const {list} = this.state
    return list.map((item, index) => {
      return (
        <div key={index}
            className={`${baseStyles['flex']} ${baseStyles['align-center']} ${styles['call-item']} ${baseStyles['m-item']}`}
            onClick={()=> {
              this.handleCallback(item)
            }}
        >
          <div className={`${baseStyles['flex-item']} ${baseStyles['text-overflow']}`}>
            {/* <div className={styles['name']}>989898989898989898,sgdgggg,erejhjhjhjhjj,wewe</div> */}
            <div className={`${styles['name']} ${baseStyles['text-overflow']}`}>{item.name}</div>
            <div className={styles['sub-info']}>{dateFmt('yyyy-MM-dd hh:mm:ss',new Date(item.time))} {item.type == 1 ? '呼入': '呼出'}</div>
          </div>
          <Icon type="right" className={baseStyles.ft14}/>
        </div>)
    })
  }

  noData () {
    const {height} = this.props
    return (
      <div
        className={`${baseStyles.flex} ${baseStyles.ft14} ${baseStyles['align-center']} ${baseStyles['justify-center']}`}
        style={{lineHeight: `${height-60}px`, color: 'rgba(255,255,255,.5)'}}
      >
        暂无数据
      </div>
    )
  }

  componentDidMount () {
    this.props.onRecordsRef(this)
    this.getLocalData()
  }

  render () {
    const {height, width} = this.props
    const {list} = this.state
    return (
      <Box
        title="历史通话记录"
        icon="icon-dianhua"
        height={(height)}
        width={width}
        content={
          <div className={`${baseStyles['scroll-bar']}`} style={{height: `${height-60}px`}}>
            {list.length ? this.Calls() : this.noData()}
          </div>
        }
      >
      </Box>
    )
  }
}
