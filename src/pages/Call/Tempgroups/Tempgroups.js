import React, { Component } from 'react';
import Box from '../Box/Box'
import iconfont from '../assets/iconfont.less'
import styles from './Tempgroups.less'
import baseStyles from '../assets/base.less'
import { Icon } from 'antd'
import Storage from '../utils/localStore';


 export default class Tempgroups extends Component {
  constructor (props) {
		super(props)
    this.removeTempItem = this.removeTempItem.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
	}

  state = {
    list:[]
  }
  removeTempItem (item, index) {
    const {list} = this.state
    const {usernumber} = this.props
    let _list = [...list]
    _list.splice(index, 1)
    this.setState({list: _list})

    Storage.localSet(`${usernumber}tempgroup`, _list.map(item => JSON.stringify(item)))
  }

  handleCreate (data) {
    this.props.tempCallByRecords(data)
  }


  getLocalData () {
    const {usernumber} = this.props

    let list = Storage.localGet(`${usernumber}tempgroup`) || []
    list = list.map(item => JSON.parse(item))

    this.setState({list})
  }

  componentDidMount () {
    this.getLocalData()

    this.props.onTempGroupRef(this)
  }

  GroupsList () {
    const {list} = this.state
    return (list.map((item, index) => {
      return (
        <div
          key={index}
          className={`${styles['group-item']} ${baseStyles['flex']} ${baseStyles['align-center']} ${baseStyles['m-item']}`}
          onClick={(e)=> {
            this.handleCreate(item)
          }}
        >
            <div className={[baseStyles['flex-item']]}>
              {item.name}
            </div>
            <Icon
              type="close"
              onClick={
                (e)=> {
                  this.removeTempItem(item, index)
                }
              }/>
        </div>
      )
    }))
  }

  render () {
    const {height, width} = this.props

    return (
      <Box
        title="临时群组记录"
        icon="icon-qunzu"
        height={(height)}
        width={width}
        content={
          <div>
            {
              this.state.list.length ? this.GroupsList() :
              (
                <div
                  className={`${baseStyles.flex} ${baseStyles.ft13} ${baseStyles['align-center']} ${baseStyles['justify-center']}`}
                  style={{lineHeight: '150px'}}
                >
                  暂无数据
                </div>
              )
            }
          </div>
        }
      >
      </Box>
    )
  }
}
