var scaliendb = 
{
	controller: "",
	developer: false,
	onResponse: this.showResult,
	onDisconnect: this.showError,
	timeout: 60 * 1000,

    //========================================================================
	//
	// ScalienDB Client interface
	//
	//========================================================================
	
	getQuorum: function(configState, quorumID)
	{
		for (var i in configState["quorums"])
		{
			var quorum = configState["quorums"][i];
			if (quorum["quorumID"] == quorumID)
				return quorum;
		}
		
		return null;
	},
	
	getQuorumState: function(quorum)
	{
		if (quorum["hasPrimary"] == "true")
		{
			if (quorum["inactiveNodes"].length == 0)
				state = "healthy";
			else
				state = "unhealthy";
		}
		else
			state = "critical";
	
		return state;
	},
	
	getQuorumInfo: function(configState, nodeID, quorumID)
	{
		var shardServer = scaliendb.getShardServer(configState, nodeID);
		for (var i in shardServer["quorumInfos"])
		{
			var quorumInfo = shardServer["quorumInfos"][i];
			if (quorumInfo["quorumID"] == quorumID)
				return quorumInfo;
		}
		return null;
	},

	getTableState: function(configState, tableID)
	{
		var state = "healthy";
		var table = scaliendb.getTable(configState, tableID);
		for (var i in table["shards"])
		{
			var shardID = table["shards"][i];
			var shard = locateShard(configState, shardID);
			var quorumState = scaliendb.getQuorumState(scaliendb.getQuorum(configState, shard["quorumID"]));
			if (state == "critical")
				continue;
			if (state == "unhealthy" && quorumState == "critical")
				state = quorumState;
			if (state == "healthy" && quorumState != "healthy")
				state = quorumState;
		}	
		return state;
	},

	getClusterState: function(configState)
	{
		var state = "healthy";
		for (var i in configState["quorums"])
		{
			var quorum = configState["quorums"][i];
			var quorumState = scaliendb.getQuorumState(scaliendb.getQuorum(configState, quorum["quorumID"]));
			if (state == "critical")
				continue;
			if (state == "unhealthy" && quorumState == "critical")
				state = quorumState;
			if (state == "healthy" && quorumState != "healthy")
				state = quorumState;
		}
		return state;
	},

	findMaster: function(onFindMaster)
	{ 
		this.json.rpc(scaliendb.controller, onFindMaster, scaliendb.onDisconnect, "getMasterHttp");
	},
	
	getConfigState: function(onConfigState)
	{ 
		this.json.rpc(scaliendb.controller, onConfigState, scaliendb.onDisconnect, "getConfigState");
	},

	pollConfigState: function(onConfigState, paxosID)
	{                                                                                                       
		var params = {};
		params["paxosID"] = paxosID;
		params["changeTimeout"] = scaliendb.timeout;
		this.json.rpc(scaliendb.controller, onConfigState, scaliendb.onDisconnect, "pollConfigState", params);
	},
	
	getDatabase: function(configState, databaseID)
	{
		for (var i in configState["databases"])
		{
			var table = configState["databases"][i];
			if (table["databaseID"] == databaseID)
				return table;
		}
		
		return null;
	},

	getTable: function(configState, tableID)
	{
		for (var i in configState["tables"])
		{
			var table = configState["tables"][i];
			if (table["tableID"] == tableID)
				return table;
		}
		
		return null;
	},
	
	getController: function(configState, nodeID)
	{
		for (var i in configState["controllers"])
		{
			var controller = configState["controllers"][i];
			if (controller["nodeID"] == nodeID)
				return controller;
		}
		
		return null;
	},

	getShardServer: function(configState, nodeID)
	{
		for (var i in configState["shardServers"])
		{
			var shardServer = configState["shardServers"][i];
			if (shardServer["nodeID"] == nodeID)
				return shardServer;
		}
		
		return null;
	},
	
	getShard: function(configState, shardID)
	{
		for (var key in configState)
		{
			if (key == "shards")
			{
				shards = configState[key];
				for (var shard in shards)
				{
					shd = shards[shard];
					if (shd["shardID"] == shardID)
						return shd;
				}
			}
		}
		
		return null;
	},
	
	shardServersNotInQuorum: function(quorumID)
	{
		var shardServers = [];
		// populate quorumIDs
		for (var s in lastConfigState["shardServers"])
		{
			var shardServer = lastConfigState["shardServers"][s];
			if (!shardServer.hasOwnProperty("quorumInfos"))
				continue;
				
			if (quorumID != undefined)
			{
				var found = false;
				for (var qi in shardServer["quorumInfos"])
				{
					var quorumInfo = shardServer["quorumInfos"][qi];
					if (quorumInfo["quorumID"] == quorumID)
					{
						// skip shardserver
						found = true;
						break;
					}
				}
				if (found)
					continue;
			}
			shardServers.push(shardServer["nodeID"]);
		}
		return shardServers;
	},
	
	shardServersInQuorum: function(quorumID)
	{
		var shardServers = [];
		// populate quorumIDs
		for (var s in lastConfigState["shardServers"])
		{
			var shardServer = lastConfigState["shardServers"][s];
			if (!shardServer.hasOwnProperty("quorumInfos"))
				continue;
				
			if (quorumID != undefined)
			{
				var found = false;
				for (var qi in shardServer["quorumInfos"])
				{
					var quorumInfo = shardServer["quorumInfos"][qi];
					if (quorumInfo["quorumID"] == quorumID)
					{
						// skip shardserver
						shardServers.push(shardServer["nodeID"]);
						break;
					}
				}
			}
		}
		return shardServers;
	},

	unregisterShardServer: function(nodeID)
	{                                                                                 
		var params = {};
		params["nodeID"] = nodeID;
		this.rpc("unregisterShardserver", params);
	},
	
	createQuorum: function(name, nodes)
	{                                                                                 
		var params = {};
		params["name"] = name;
		params["nodes"] = nodes;
		this.rpc("createQuorum", params);
	},

	renameQuorum: function(quorumID, name)
	{                                                                                 
		var params = {};
		params["quorumID"] = quorumID;
		params["name"] = name;
		this.rpc("renameQuorum", params);
	},

	deleteQuorum: function(quorumID)
	{                                                                                 
		var params = {};
		params["quorumID"] = quorumID;
		this.rpc("deleteQuorum", params);
	},

	addNode: function(quorumID, nodeID)
	{                                                                                 
		var params = {};
		params["quorumID"] = quorumID;
		params["nodeID"] = nodeID;
		this.rpc("addShardserverToQuorum", params);
	},

	removeNode: function(quorumID, nodeID)
	{                                                                                 
		var params = {};
		params["quorumID"] = quorumID;
		params["nodeID"] = nodeID;
		this.rpc("removeShardserverFromQuorum", params);
	},

	activateNode: function(quorumID, nodeID)
	{                                                                                 
		var params = {};
		params["quorumID"] = quorumID;
		params["nodeID"] = nodeID;
		this.rpc("activateShardserver", params);
	},

	createDatabase: function(name)
	{ 
		var params = {};
		params["name"] = name;
		this.rpc("createDatabase", params);
	},

	deleteDatabase: function(name)
	{ 
		var params = {};
		params["name"] = name;
		this.rpc("deleteDatabase", params);
	},
	
	renameDatabase: function(databaseID, name)
	{ 
		var params = {};
		params["databaseID"] = databaseID;
		params["name"] = name;
		this.rpc("renameDatabase", params);
	},
	
	deleteDatabase: function(databaseID)
	{ 
		var params = {};
		params["databaseID"] = databaseID;
		this.rpc("deleteDatabase", params);
	},
		
	createTable: function(databaseID, quorumID, name)
	{
		var params = {};
		params["databaseID"] = databaseID;
		params["quorumID"] = quorumID;
		params["name"] = name;
		this.rpc("createTable", params);
	},

	renameTable: function(tableID, name)
	{
		var params = {};
		params["tableID"] = tableID;
		params["name"] = name;
		this.rpc("renameTable", params);
	},

	deleteTable: function(tableID)
	{
		var params = {};
		params["tableID"] = tableID;
		this.rpc("deleteTable", params);
	},

	truncateTable: function(tableID)
	{
		var params = {};
		params["tableID"] = tableID;
		this.rpc("truncateTable", params);
	},

	freezeTable: function(tableID)
	{
		var params = {};
		params["tableID"] = tableID;
		this.rpc("freezeTable", params);
	},

	unfreezeTable: function(tableID)
	{
		var params = {};
		params["tableID"] = tableID;
		this.rpc("unfreezeTable", params);
	},

	splitShard: function(shardID, key)
	{
		var params = {};
		params["shardID"] = shardID;
		params["key"] = key;
		this.rpc("splitShard", params);
	},

	migrateShard: function(shardID, quorumID)
	{
		var params = {};
		params["shardID"] = shardID;
		params["quorumID"] = quorumID;
		this.rpc("migrateShard", params);
	},
	
	showResult: function(data)
	{
		//alert(data["response"]);
	},
	
	showError: function()
	{
		alert("connection lost");
	},
	
	rpc: function(name, params)
	{ 
		this.json.rpc(scaliendb.controller, scaliendb.onResponse, scaliendb.onDisconnect, name, params);
	},
	
	disconnect: function()
	{
		this.json.abort();
	},
		
    //========================================================================
	//
	// JSON utilities
	//
	//========================================================================
	json:
	{
		counter : 0,
		active : 0,
		func: {},
		debug: true,
		pollRequest: null,

		getJSONP: function(url, userfunc, errorfunc, showload)
		{
			var id = this.counter++;

			url += "&callback=scaliendb.json.func[" + id + "]";
			var scriptTag = document.createElement("script");
			scriptTag.setAttribute("id", "json" + id);
			scriptTag.setAttribute("type", "text/javascript");
			scriptTag.setAttribute("src", url);
			document.getElementsByTagName("head")[0].appendChild(scriptTag);
			if (showload)
				this.active++;
			scaliendb.util.trace("[" + this.active + "] calling " + url);

			this.func[id] = function(data)
			{
				if (data == undefined)
				{
					if (this.debug)
						alert("json.func[" + id + "]: empty callback");
					scaliendb.util.trace("json.func[" + id + "]: empty callback");
					errorfunc();
					return;
				}

				if (data.hasOwnProperty("error"))
				{
					if (this.debug)
						alert("json.func[" + id + "]: " + data.error);
					scaliendb.util.trace("json.func" + id + ": " + data.error);

					if (data.hasOwnProperty("type") && data.type == "session")
					{
						scaliendb.util.logout();
						return;
					}
				}

				scaliendb.util.trace("[" + this.active + "] json callback " + id);			
				userfunc(data);
				if (showload)
					this.active--;
				scaliendb.util.trace("[" + this.active + "] json callback " + id + " after userfunc");
				scaliendb.util.removeElement("json" + id);
				this.func = scaliendb.util.removeKey(this.func, "func" + id);
			}
		},
		
		getXHR: function(url, userfunc, errorfunc, showload)
		{
			var xhr = new XMLHttpRequest();
			var decode = this.decode;

			xhr.open("GET", url + "&origin=*", true);

			var requestTimer = setTimeout(function() {
				xhr.abort();
				errorfunc();
			}, 2 * scaliendb.timeout);

			var onreadystatechange = function()
			{
				if (xhr.readyState != 4)
					return;

				clearTimeout(requestTimer);

				if (xhr.status != 200)
				{   
					// pollRequest == null indicates that the request is aborted
					if (scaliendb.json.pollRequest !== null)
						errorfunc();
					scaliendb.json.pollRequest = null;
					return;
				}
				scaliendb.json.pollRequest = null;
				userfunc(decode(xhr.responseText));
			}

			xhr.onreadystatechange = onreadystatechange;
			this.pollRequest = xhr;
			xhr.send();
		},

		rpc: function(baseUrl, userfunc, errorfunc, cmd, params)
		{
			var url = baseUrl + cmd + "?mimetype=text/javascript";
			for (var name in params)
			{
				url += "&" + name + "=";
				param = params[name];
				if (typeof(param) != "undefined")
				{
					if (typeof(param) == "object" || typeof(param) == "array")
						var arg = this.encode(param);
					else
						var arg = param;
					var value = encodeURIComponent(arg);
				}
				else
					var value = "";
				url += value;
			}
			// TODO: detecting browser functionality
			// this.getJSONP(url, userfunc, errorfunc, true);   
			this.abort();
			this.getXHR(url, userfunc, errorfunc, true);
		},
	
		abort: function()
		{
			if (this.pollRequest != null)
			{
				var request = this.pollRequest;
				// this indicates that the request is aborted
				this.pollRequest = null;
				request.abort();
			}
		},
	
		encode: function(jsobj)
		{
			// if (typeof(jsobj) == "undefined")
			//  	return "";
		
			return JSON.stringify(jsobj);
		},
		
		decode: function(jsontext)
		{
			try {
				return JSON.parse(jsontext);
			} catch (e) {
				return null;
			}
		}
	},

}


