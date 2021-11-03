import React, { Component } from 'react';
import styles from './Main.less';
import baseStyles from '../assets/base.less'
import Users from '../Users/Users'
import Call from '../Session/Call'
import History from '../History/History'
import Tempgroups from '../Tempgroups/tempgroups';
import { connect } from 'dva';
const QUERY_ONLINE_DURATION = 12000
let loadedAsset = false
let loadTimer = null


class SipCall extends Component {


	render () {
		return(
			<div></div>
		)
	}
}



