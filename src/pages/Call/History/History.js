import React, { useState } from 'react';
import Box from '../Box/Box'
import iconfont from '../assets/iconfont.less'
import styles from './History.less'
import baseStyles from '../assets/base.less'
import { Icon } from 'antd';

const History = (props) => {
	const {height, width} = props

  const list = [
    {name: '编号897867', time: '2021-08-21 10:20', type: '呼出'},
    {name: '编号897867', time: '2021-08-21 10:20', type: '呼出'},
    {name: '编号897867', time: '2021-08-21 10:20', type: '呼出'},
    {name: '编号897867', time: '2021-08-21 10:20', type: '呼出'},
    {name: '编号897867', time: '2021-08-21 10:20', type: '呼出'},
    {name: '编号897867', time: '2021-08-21 10:20', type: '呼出'},
    {name: '编号897867', time: '2021-08-21 10:20', type: '呼出'},
    {name: '编号897867', time: '2021-08-21 10:20', type: '呼出'},
    {name: '编号897867', time: '2021-08-21 10:20', type: '呼出'},
  ]

  const Calls = list.map(function(item, index) {
    return (<div key={index} className={`${baseStyles['flex']} ${baseStyles['align-center']} ${styles['call-item']} ${baseStyles['m-item']}`}>
      <div className={[baseStyles['flex-item']]}>
        <div className={styles['name']}>{item.name}</div>
        <div className={styles['sub-info']}>{item.time}  {item.type}</div>
      </div>
      <Icon type="right" />
    </div>)
  })
	return (
		<Box
			title="历史通话记录"
      icon="icon-dianhua"
			height={(height)}
			width={width}
			content={
				<div className={`${baseStyles['scroll-bar']}`} style={{height: `${height-60}px`}}>
					{Calls}
				</div>
			}
		>
		</Box>
	)
}

export default History
