import React, { useState } from 'react';
import styles from './Box.less'
import iconfont from '../assets/iconfont.less'
import baseStyles from '../assets/base.less'

const Box = (props) => {
	const {
		content,
		height,
		width,
		title
	} = props
	return(
		<div
			title={title}
			className={`${styles['box-wrap']} ${baseStyles['m-box-border']}`}
			style={{height: `${height}px`, width: `${width}px`}}
		>
        <span className={`${styles['box-outline']}`}></span>
				<h3 className={styles.title}>
					<i className={`${iconfont['m-icon']} ${iconfont['icon-tongxunlu']}`}></i>
					{title}
				</h3>
				{content}
		</div>
	)
}

export default Box
