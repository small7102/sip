export function byteToString(arr) {
	if (!arr) return
	if (typeof arr === 'string') {
			return arr;
	}
	var str = '',
			_arr = arr;
	for (var i = 0; i < _arr.length; i++) {
			var one = _arr[i].toString(2),
					v = one.match(/^1+?(?=0)/);
			if (v && one.length == 8) {
					var bytesLength = v[0].length;
					var store = _arr[i].toString(2).slice(7 - bytesLength);
					for (var st = 1; st < bytesLength; st++) {
							store += _arr[st + i].toString(2).slice(2);
					}
					str += String.fromCharCode(parseInt(store, 2));
					i += bytesLength - 1;
			} else {
					str += String.fromCharCode(_arr[i]);
			}
	}
	return str;
}

export function arrToObjectBySmyble(arr, syb = '=') {
	let obj = {}
	arr.forEach(item => {
		if (item) {
			let arrItem = item.split(syb)
			obj[arrItem[0]] = arrItem[1]
		}
	})

	return obj
}

function addZore (num) {
	return num > 9 ? num : '0'+num
}

export function sendsFormat (seconds, type='number') {
	let h=0,m=0,s=0
	h= Math.floor(seconds / 3600)
	m = Math.floor(seconds / 60)
	m = h ? m % 60 : m
	s= seconds % 60
	return type =='number' ? `${addZore(h)}:${addZore(m)}:${addZore(s)}` : `${m}分${s}秒`
}

/**
 * @param {String} fmt 传入时间格式
 * @param {Number} startType 要返回的时间字符串的格式类型，传入'year'则返回年开头的完整时间
 */
 export function dateFmt(fmt,date) {
  // console.log(date,1111)
  const o = {
    "M+" : date.getMonth()+1,                 //月份
    "d+" : date.getDate(),                    //日
    "h+" : date.getHours(),                   //小时
    "m+" : date.getMinutes(),                 //分
    "s+" : date.getSeconds(),                 //秒
    "q+" : Math.floor((date.getMonth()+3)/3), //季度
    "S"  : date.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
 }

 export function getParentIdMap (list) {
	let items = {}
	// 获取每个节点的直属子节点，*记住是直属，不是所有子节点
	for (let i = 0; i < list.length; i++) {
	  let deep = list[i].dep_level.length / 3, key
	  key  = deep === 1 ? '0' : list[i].dep_level.substr(0, (deep-1) * 3)
	  if (items[key]) {
		items[key].push(list[i])
	  } else {
		items[key] = []
		items[key].push(list[i])
	  }
	}
	return items
  }
  /**
  * 利用递归格式化每个节点
  */
export function formatTree (items, parentId = '0', flatMap={}) {
	let result = []
	if (!items[parentId]) {
	  return {tree: result, flatMap}
	}
	for (let t of items[parentId]) {
	  let value = {...t,parentId}
	  let _result = formatTree(items, value.dep_level, flatMap)
	  value.children = _result && _result.tree || []
	  value.children = value.children.concat(value.users)
	  result.push(value)
	  flatMap[parentId] = value.children
	}
	return {tree: result, flatMap}
  }
  
  
  export function getMapByList (list, key='dep_uuid', pid=true) {
	let map = {}
	list.forEach(item => {
	  map[item[key]] = {...item}
	  if (pid) {
		let deep = item.dep_level.length / 3, parentId
		parentId  = deep === 1 ? '0' : item.dep_level.substr(0, (deep-1) * 3)
		map[item[key]].parentId = parentId
	  }
	})
	return map
  }

