var dashboardView = 
{
	container:'#main_container',
	id:'dashboard_view',
	callback:null,
	rangeMax: 20,
	averageMax: 20,
	
	demoStarted:false,
	
	getSelf: function()
	{
		return $('#'+this.id);
	},
	
	init: function(callback)
	{
		dashboardView.callback = callback;
	},
	
	startDemo:function()
	{
		dashboardView.data1 = [];
		dashboardView.data2 = [];
		var t = new Date();
		for (var i = 59; i >= 0; i--) {
			var x = new Date(t.getTime() - i * 1000);
			dashboardView.data1.push([x, 0]);
			dashboardView.data2.push([x, Math.random()*40+70]);
		}
		
		dashboardView.g1 = new Dygraph(
			document.getElementById("graphdiv1"),
			dashboardView.data1,
			{	// options
				valueRange: [0, dashboardView.rangeMax],
				labels: ['Time', 'Quorum 1', 'Quorum 2', 'Quorum 3', 'Quorum 4'],
				rollPeriod: 2,
				logscale: false
			}       
		);
		
		// dashboardView.g2 = new Dygraph(
			// document.getElementById("graphdiv2"),
			// dashboardView.data2,
			// {	// options
				// drawPoints: true,
				// valueRange: [0, 120],
				// labels: ['Time', 'Random']
			// }   
		// );
		
		setInterval(function() {
			dashboardView.updateGraph();
		}, 1000);
	},
	
	getRangeMax: function(values)
	{
		var max = 0;
		for (var i in values)
		{
			for (var j = 1; j < values.length; j++)
			{
				if (values[i][j] > max)
					max = values[i][j];
			}
		}

		var scale = [1, 2, 5];
		var norm = 1;
		var mul = 1;
		for (var j = 0; norm < max; j++)
		{
			if (j % scale.length == 0)
				mul *= 10;
			norm = scale[j % scale.length] * mul;
		}
		max = norm;		
		return max;
	},
	
	updateGraph: function()
	{
		if (dashboardView.callback == null)
			return;

		var date = new Date();  // current time
		var deltas = dashboardView.callback();
		deltas.splice(0, 0, date);
		dashboardView.data1.push(deltas);
		var labels = [];
		for (var i = 0; i < deltas.length; i++)
		{
			if (i == 0)
				labels.push("Time");
			else
				labels.push("Quorum " + i);
		}
		dashboardView.data1.shift();

		// recalculate scale
		var rangeMax = dashboardView.getRangeMax(dashboardView.data1);
		var valueRange = [0, rangeMax];
		
		dashboardView.g1.updateOptions(
		{ 
			file: dashboardView.data1,
			valueRange: valueRange,
			labels: labels
		});
	},
	
	update: function(configState)
	{
		if (!configState)
		{
			return;
		}
		
		if (!dashboardView.demoStarted)
		{
			dashboardView.demoStarted = true;
			dashboardView.startDemo();
		}
		
		$("#dashboard_view_cluster_state")
			.html("The ScalienDB cluster is " + scaliendb.getClusterState(configState))
			.attr('class', "status-message " + scaliendb.getClusterState(configState));
		
		dashboardView.updateAlerts(configState);
	},
	
	updateAlerts: function(configState)
	{
		var has_alert = false;
		
		// Controllers
		for(var i in configState.controllers)
		{
			var status_class;
			var status_msg;
			
			if (configState.controllers[i].isConnected)
			{
				continue; // alert only errors
			}
			else
			{
				status_class = 'no-heartbeat';
				status_msg = 'No heartbeat';
			}
			
			has_alert = true;
			
			// find -> add / check,update,mark
			var le = $('#dashboard_controller_alerts > div#dashboard_controller_alerts_item_' + configState.controllers[i].nodeID);
			if (le.length == 0)
			{
				// add new db
				var le = htmlCodes.controllerListItem;
				$(le).attr('id', 'dashboard_controller_alerts_item_' + configState.controllers[i].nodeID)
					.attr('mark', 'ext')
					.attr('class', status_class)
					.html('Controller ' + configState.controllers[i].nodeID + ' [' + configState.controllers[i].endpoint +'] - ' + status_msg)
				.appendTo('#dashboard_controller_alerts');
			}
			else
			{
				le.attr('mark', 'ext');
				// check for rename,update,mark
				if (le.attr('class') != status_class)
					le.attr('class', status_class);
				
				if (le.html() != 'Controller ' + configState.controllers[i].nodeID + ' [' + configState.controllers[i].endpoint +'] - ' + status_msg)
					le.html('Controller ' + configState.controllers[i].nodeID + ' [' + configState.controllers[i].endpoint +'] - ' + status_msg);
			}
			
		}
		// remove unmarked
		$('#dashboard_controller_alerts > div[mark!="ext"]').remove();
		// remove mark
		$('#dashboard_controller_alerts > div').attr('mark', '');
		
		
		// Shardservers
		for(var i in configState.shardServers)
		{
			var status_class;
			var status_msg;
			
			if (configState.shardServers[i].hasHeartbeat)
			{
				continue;
			}
			else
			{
				status_class = 'no-heartbeat';
				status_msg = 'No heartbeat';
			}
			
			has_alert = true;
			
			// find -> add / check,update,mark
			var le = $('#dashboard_shardserver_alerts > div#shardserver_list_item_' + configState.shardServers[i].nodeID);
			if (le.length == 0)
			{
				// add new db
				var le = htmlCodes.shardserverListItem;
				$(le).attr('id', 'shardserver_list_item_' + configState.shardServers[i].nodeID)
					.attr('mark', 'ext')
					.attr('class', status_class)
					.html('Shardserver ' + configState.shardServers[i].nodeID + ' [' + configState.shardServers[i].endpoint +'] - ' + status_msg)
				.appendTo('#dashboard_shardserver_alerts');
			}
			else
			{
				le.attr('mark', 'ext');
				// check for rename,update,mark
				if (le.attr('class') != status_class)
					le.attr('class', status_class);
				
				if (le.html() != 'Shardserver ' + configState.shardServers[i].nodeID + ' [' + configState.shardServers[i].endpoint +'] - ' + status_msg)
					le.html('Shardserver ' + configState.shardServers[i].nodeID + ' [' + configState.shardServers[i].endpoint +'] - ' + status_msg);
			}
		}
		// remove unmarked
		$('#dashboard_shardserver_alerts > div[mark!="ext"]').remove();
		// remove mark
		$('#dashboard_shardserver_alerts > div').attr('mark', '');
		
		if (has_alert)
			$('#dashboard_server_alerts').show();
		else
			$('#dashboard_server_alerts').hide();
	},
	
	show: function()
	{
		this.getSelf().show();
	},
	
	hide: function()
	{
		this.getSelf().hide();;
	},
	
}