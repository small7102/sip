export function byteToString(arr) {
	console.log(arr)
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