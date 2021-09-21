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

