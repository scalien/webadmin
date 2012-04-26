var lastConfigState = null;
var timer;
var lastReplicationRounds = {};
var lastCatchupBytes = {};

// onLoad
$(function() {
	inputFieldsDialog.init();
	confirmDialog.init();
	
	$('#logout_button').click(logout);
	
	init();
	if (scaliendb.controller == "")
		showLogin();
	else
		connect();
});

function init()
{
	var args = utils.parseQueryString();
	if (args.hasOwnProperty("controller"))
		scaliendb.controller = args["controller"];
	
	scaliendb.onDisconnect = onDisconnect;
	scaliendb.onResponse = onResponse;
	scaliendb.disconnect();
	
	scaliendb.developer = utils.parseDeveloperMode();
	
	dashboardView.init({
		replicationPerSeconds: getReplicationDeltas,
		catchup: getCatchupDeltas
	});
	
	updateGui();
}

function sortConfigStateNames(configState)
{
	// sort database names
	configState.databases.sort(function(a, b) {
		return utils.caseInsensitiveCompare("name", a, b);
	});

	// sort table names inside databases
	for (var d in configState.databases)
	{
		var database = configState.databases[d];
		var tables = [];
		
		for (var i in database.tables)
		{
			var tableID = database.tables[i];
			var table = scaliendb.getTable(configState, tableID);
			tables.push(table);
		}
		
		tables.sort(function(a, b) {
			return utils.caseInsensitiveCompare("name", a, b);
		});
		
		var sortedTableIDs = [];
		for (var i in tables)
		{
			sortedTableIDs.push(tables[i].tableID);
		}
		
		database.tables = sortedTableIDs;
	}
}

function getReplicationDeltas()
{
	var deltas = [];

	if (lastConfigState == null)
		return deltas;

	for (var q in lastConfigState.quorums)
	{
		var quorum = lastConfigState.quorums[q];
		var diff = 0;
		if (lastReplicationRounds.hasOwnProperty(quorum.quorumID))
			diff = quorum.paxosID - lastReplicationRounds[quorum.quorumID];
		
		lastReplicationRounds[quorum.quorumID] = quorum.paxosID;
		deltas.push(diff);
	}
	return deltas;
}

function getCatchupDeltas()
{
	if (lastConfigState == null)
		return;

	var deltas = [];
	for (var s in lastConfigState.shardServers)
	{
		var shardServer = lastConfigState.shardServers[s];
		for (var q in shardServer.quorumInfos)
		{
			var quorumInfo = shardServer.quorumInfos[q];
			if (!quorumInfo.isSendingCatchup)
				continue;
		
			var key = shardServer.nodeID + "/" + quorumInfo.quorumID;
			var diff = 0;
			if (lastCatchupBytes.hasOwnProperty(key))
				diff = quorumInfo.catchupBytesSent - lastCatchupBytes[key];
		
			lastCatchupBytes[key] = quorumInfo.catchupBytesSent;
			deltas.push(diff);
		}	
	}
	return deltas;
}

function updateGui(configState)
{
	if (configState)
		sortConfigStateNames(configState);
	
	utils.trace({'updateGui':configState});

	// update topbar
	if (!configState)
		$('#controller_info_stripe').html('Not connected...');
	else
		$('#controller_info_stripe').html('Connected to ' + scaliendb.controller);
		
	// update treeMenu
	treeMenu.update(configState);
	
	quorumListView.update(configState);
	quorumView.update(configState);
	
	serverListView.update(configState);
	
	databaseListView.update(configState);
	tableListView.update(configState);
	tableView.update(configState);
	
	lastConfigState = configState;
	dashboardView.update(configState);
}

function clearQueryStringConnection()
{
	var args = utils.parseQueryString();
	if (args.hasOwnProperty("controller"))
	{
		// redirect
		var controller = "controller" + "=" + encodeURIComponent(scaliendb.controller);
		var href = window.location.href.replace(controller, "");
		window.location.href = href;
	}
}

function logout()
{
	clearTimeout(timer);
	init();
	clearQueryStringConnection();
	// control may never get here
	showLogin();
}

function showLogin()
{
	inputFieldsDialog.clearAndInit('Login', connect);
	inputFieldsDialog.addField('controller', 'text', 'Connect to cluster:', scaliendb.controller);
	inputFieldsDialog.show();
}

function connect(parms)
{
	var controller;
	var direct = false;
	
	if (!parms)
		controller = scaliendb.controller;
	else
		controller = parms.controller;
	
	if (utils.startsWith(controller, "direct://"))
	{
		controller = controller.replace("direct://", "");
		direct = true;     
	}
	
	// HACK Windows 7 IPv6 localhost resolv bug fix
	if (!utils.startsWith(controller, "http://"))
	{
		if (utils.startsWith(controller, "localhost"))
			controller = controller.replace(/localhost/i, "127.0.0.1");
		controller = "http://" + controller;
	}
	else
		controller = controller.replace(/http:\/\/localhost/i, "http://127.0.0.1");
	
	if (!utils.endsWith(controller, "/json/"))
		controller = controller + "/json/";
	if (controller !== scaliendb.controller)
		scaliendb.controller = controller;

	if (direct)
		updateConfigState();
    else
		findMaster();
}

function findMaster()
{
	scaliendb.findMaster(onFindMaster);
}

function onFindMaster(obj)
{
	if (obj["response"] == "NOSERVICE" || obj["response"] == "0.0.0.0:0")
	{
		setTimeout("findMaster()", 1000);
		return;
	}
	
	var controller = obj["response"];
	if (!utils.startsWith(controller, "http://"))
		controller = "http://" + controller;
	if (!utils.endsWith("controller", "/json/"))
		controller = controller + "/json/";
	if (controller !== scaliendb.controller)
		scaliendb.controller = controller;
		
	var args = utils.parseQueryString();
	if (!args.hasOwnProperty("controller") || args["controller"] != scaliendb.controller)
	{
		// redirect
		var href = window.location.href.substring(0, window.location.href.lastIndexOf('?'));
		href += "?" + "controller" + "=" + encodeURIComponent(scaliendb.controller);
		window.location.href = href;
	}


	updateConfigState();
}

function updateConfigState()
{
	scaliendb.getConfigState(onConfigState);
}

function onConfigState(configState)
{
	lastConfigState = configState;
	
	updateGui(configState);
	
	scaliendb.timeout = 60 * 1000;
	scaliendb.pollConfigState(onConfigState, configState["paxosID"]);
}

function onDisconnect()
{
	init();
	// try reconnect
	clearTimeout(timer);
	timer = setTimeout(connect, 1000);	
}

function onResponse(json)
{
	if (json.hasOwnProperty("response") && json["response"] == "FAILED")
		alert('Something went wrong!');// TODO showError("Error", "Something went wrong!");
	updateConfigState();
}
