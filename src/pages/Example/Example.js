/*
 * @Author: duanguang
 * @Date: 2022-04-26 17:08:20
 * @LastEditTime: 2022-04-27 01:52:31
 * @LastEditors: duanguang
 * @Description: 
 * @FilePath: /sip/src/pages/Example/Example.js
 * 「扫去窗上的尘埃，才可以看到窗外的美景。」
 */
import React,{ Component } from 'react';
import Call from '../Call';

export default
class MCall extends Component {
    constructor (props) {
		super(props)
    }
    
    render() {
        return (
            <Call
                usernumber="10010129" 
                pwd = '021832'
                realm = 'kinet'
                socket_url = 'wss://183.47.46.242:7443/'
                data_url = 'http://183.47.46.242:8008'
            />
        )
    }
}