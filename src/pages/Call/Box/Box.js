import React, { useState } from 'react';
import styles from './Box.less'
import iconfont from '../assets/iconfont.less'
import baseStyles from '../assets/base.less'

const Box = (props) => {
	const {
		content,
		height,
		width,
		title,
    icon="icon-tongxunlu"
	} = props
	return(
		<div
			title={title}
			className={`${styles['box-wrap']} ${baseStyles['m-box-border']}`}
			style={{height: `${height}px`, width: `${width}px`}}
		>
        <span className={`${styles['box-outline']}`}></span>
				<h3 className={`${styles.title} ${baseStyles.flex}`}>
					<i className={`${iconfont['m-icon']} ${iconfont[icon]}`}></i>
					{title}
				</h3>
				{content}
		</div>
	)
}

export default Box
