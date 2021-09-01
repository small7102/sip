import React, { useState } from 'react';
import Box from '../Box/Box'
import iconfont from '../assets/iconfont.less'
import styles from './Tempgroups.less'
import baseStyles from '../assets/base.less'
import { Icon } from 'antd';

const Tempgroups = (props) => {
	const {height, width} = props

	const list = [
    {name: '临时群组1', time: '2021-08-21 10:20', type: '呼出'},
    {name: '临时群组2', time: '2021-08-21 10:20', type: '呼出'},
    {name: '临时群组3', time: '2021-08-21 10:20', type: '呼出'},
  ]

	const GroupsList = list.map((item, index) => {
		return (
			<div key={index} className={`${styles['group-item']} ${baseStyles['flex']} ${baseStyles['align-center']} ${baseStyles['m-item']}`}>
					<div className={[baseStyles['flex-item']]}>
						{item.name}
					</div>
      		<Icon type="close" />	
			</div>
		)
	})
	return (
		<Box
			title="临时群组记录"
			height={(height)}
			width={width}
			content={
				<div>
					{GroupsList}
				</div>
			}
		>
		</Box>
	)
}

export default Tempgroups