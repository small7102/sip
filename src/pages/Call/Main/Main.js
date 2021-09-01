import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import Exception from '@/components/Exception';
import styles from './Main.less';
import baseStyles from '../assets/base.less'
import Users from '../Users/Users'
import Call from '../Session/Call'
import History from '../History/History'
import Tempgroups from '../Tempgroups/tempgroups';

function loadSipAssets() {
	let tag_hdr = document.getElementsByTagName('head')[0];
	['/SIPml.js', '/src/tinySIP/src/tsip_api.js'].forEach(src => {
		let tag_script = document.createElement('script');
			tag_script.setAttribute('type', 'text/javascript');
			tag_script.setAttribute('src', src + "?svn=252");
			tag_hdr.appendChild(tag_script);
	})
}

const SipCall = () => {
	loadSipAssets()

	let height = document.body.clientHeight
	let width = document.body.clientWidth

	return(
		<div
			className={`${styles.sipcall} ${baseStyles['flex']}`}
			style={{height: `${height-48}px`}}
		>
      <Users height={height-140} width={width > 1500 ? 360 : 300}></Users>
			<Call height={height-140}></Call>
			<div 
				className={`${styles['right-wrap']}`}
			>
				<History height={height - 450} width={width > 1500 ? 300 : 240}></History>
				<Tempgroups height={290} width={width > 1500 ? 300 : 240}></Tempgroups>
			</div>
		</div>
	)
}

export default SipCall
