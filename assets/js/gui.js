var lastConfigState = null;
var timer;

// onLoad
$(function() {
	inputFieldsDialog.init();
	confirmDialog.init();
	
	$('#logout_button').click(logout);
	
	init();
	showLogin();
});

function init()
{
	scaliendb.onDisconnect = onDisconnect;
	scaliendb.onResponse = onResponse;
	scaliendb.disconnect();
	
	//scaliendb.controller = 'fly.home:8080/json/';//utils.parseConnectionLocation();
	scaliendb.controller = '192.168.137.101:8080/json/';//utils.parseConnectionLocation();
	scaliendb.developer = utils.parseDeveloperMode();

	updateGui();
}

function updateGui(configState)
{
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
	
	dashboardView.update(configState);
}

function logout()
{
	clearTimeout(timer);
	init();
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