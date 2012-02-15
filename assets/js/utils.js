var utils = 
{
	trace: function(obj)
	{
		console.log(obj);
	},
	
	parseConnectionLocation: function()
	{
		var match = /^\w+:\/\/([\w.]+:[0-9]+)\/.*$/.exec(window.location);
		if (match == null)
			return null;
		controller = match[1];
		if (!utils.endsWith(controller, "/json/"))
			controller = controller + "/json/";
		return controller;
	},
	
	parseDeveloperMode: function()
	{
		var match = /[\?&]dev($|&)/.exec(window.location);
		if (match == '')
			return false;
		else
			return true;
	},
	
	fields2json: function(fields)
	{
		var ret = new Object();
		var cnt = fields.length;
		for (i = 0; i < cnt; i++)
			ret[fields[i].name] = fields[i].value;
		
		return ret;
	},
	
	startsWith: function(str, s)
	{
		if (!str) return false;
		return (str.indexOf(s) == 0)
	},
	
	endsWith: function(str, s)
	{
		if (!str) return false;
		return (str.indexOf(s) == (str.length - s.length));
	},
	
	removeSpaces: function(str)
	{
		return str.replace(/ /g,'')
	},
	
	contains: function(arr, obj)
	{
		var i = arr.length;
		while (i--)
		{
			if (arr[i] === obj)
				return true;
		}
		return false;
	},
	
	humanBytes: function(size)
	{
		var units = "kMGTPEZY";
		var n = size;
		var m = size;
		var u = 0;
		
		if (typeof size == 'undefined')
			return "0";
		
		while (utils.numDigits(n) > 3)
		{
			m = Math.round(n / 100.0) / 10.0;
			n = Math.round(n / 1000.0);
			u++;
		}
		
		var dim = (u == 0 ? "" : units[u - 1]);
		return "" + m + dim;
	},
	
	numDigits: function(num)
	{
		return ("" + num).length;
	},
	
	pluralize: function(count, noun)
	{
		// add exceptions here
		if (count <= 1)
			return noun;
		else
			return noun + "s";
	},
	
	cardinality: function(count, noun)
	{
		return count + " " + utils.pluralize(count, noun);
	},
	
	defstr: function(val, defval)
	{
		if (typeof val == 'undefined')
		{
			if (typeof defval == 'undefined')
				return "";
			return "" + defval;
		}
		return "" + val;
	}
	
	/*elem: function(id)
	{
		return document.getElementById(id);
	},

	keys: function(arr)
	{
		var r = new Array();
		for (var key in arr)
			r.push(key);
		return r;
	},

   removeKey: function(arr, key)
	{
		var n = new Array();
		for (var i in arr)
			if (i != key)
				n.push(arr[i]);	
		return n;
	},

	removeElement: function(id)
	{
		e = this.elem(id);
		e.parentNode.removeChild(e);
	},

	padString: function(str, width, pad)
	{
		str = "" + str;
		while (str.length < width)
			str = pad + str;

		return str;
	},

	escapeQuotes: function(str)
	{
		str = str.replace(/'/g, "\\x27");
		str = str.replace(/\"/g, "\\x22");
		return str;
	},

	clear: function(node)
	{
		while (node.childNodes.length > 0)
		{
			node.removeChild(node.firstChild);
		}
	},
	
*/
}	