var utils = 
{
	trace: function(obj)
	{
		//console.log(obj);
	},
	
	parseQueryString: function()
	{
		var uri = window.location.href;
		var queryString = {};
		uri.replace(
			new RegExp("([^?=&]+)(=([^&]*))?", "g"),
			function($0, $1, $2, $3) { queryString[$1] = decodeURIComponent($3); }
		);
		return queryString;
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
	},
	
	caseInsensitiveCompare: function(property, a, b)
	{
		return a[property].toLowerCase().localeCompare(b[property].toLowerCase());
	},
	
	getAlertStyle: function(style)
	{
		switch (style)
		{
		case "healthy":
			return "alert-message block-message success";
		case "unhealthy":
			return "alert-message block-message warning";
		case "critical":
		case "no-heartbeat":
			return "alert-message block-message error";
		case "master":
			return "alert-message block-message info";
		default:
			return style;
		}
	}
}	