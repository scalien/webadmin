var serverListView = 
{
	container:'#main_container',
	id:'server_list_view',
	inited:false,
	
	getSelf:function()
	{
		return $('#'+serverListView.id);
	},
	
	init:function()
	{
	},
	
	update: function(configState)
	{
		if (!serverListView.inited) 
		{
			serverListView.inited = true;
			serverListView.init();
		}
		
		if (!configState)
		{
			// TODO empty list
			return;
		}
		
		// Controllers
		for(var i in configState.controllers)
		{
			var status_class;
			var status_msg;
			
			if (configState.controllers[i].isConnected)
			{
				if (configState.master == configState.controllers[i].nodeID)
				{
					status_class = 'master';
					status_msg = 'Master';
				}
				else
				{
					status_class = 'healthy';
					status_msg = 'Healthy';
				}
			}
			else
			{
				status_class = 'no-heartbeat';
				status_msg = 'No heartbeat';
			}
			
			// find -> add / check,update,mark
			var le = $('#controller_list_view_box > div#controller_list_item_' + configState.controllers[i].nodeID);
			if (le.length == 0)
			{
				// add new db
				var le = htmlCodes.controllerListItem;
				$(le).attr('id', 'controller_list_item_' + configState.controllers[i].nodeID)
					.attr('mark', 'ext')
					.attr('class', status_class)
					.find('span.node_id').html(configState.controllers[i].nodeID)
					.end()
					.find('span.endpoint').html(configState.controllers[i].endpoint)
					.end()
					.find('span.status').html(status_msg)
					.end()
				.appendTo('#controller_list_view_box');
			}
			else
			{
				le.attr('mark', 'ext');
				// check for rename,update,mark
				if (le.attr('class') != status_class)
					le.attr('class', status_class);
				
				if (le.find('span.node_id').html() != configState.controllers[i].nodeID)
					le.find('span.node_id').html(configState.controllers[i].nodeID);
					
				if (le.find('span.endpoint').html() != configState.controllers[i].endpoint)
					le.find('span.endpoint').html(configState.controllers[i].endpoint);
					
				if (le.find('span.status').html() != status_msg)
					le.find('span.status').html(status_msg);
			}
			
		}
		// remove unmarked
		$('#controller_list_view_box > div[mark!="ext"]').remove();
		// remove mark
		$('#controller_list_view_box > div').attr('mark', '');
		
		
		// Shardservers
		for(var i in configState.shardServers)
		{
			var status_class;
			var status_msg;
			
			if (configState.shardServers[i].hasHeartbeat)
			{
				status_class = 'healthy';
				status_msg = 'Healthy';
			}
			else
			{
				status_class = 'no-heartbeat';
				status_msg = 'No heartbeat';
			}
			
			// find -> add / check,update,mark
			var le = $('#shardserver_list_view_box > div#shardserver_list_item_' + configState.shardServers[i].nodeID);
			if (le.length == 0)
			{
				var le = htmlCodes.shardserverListItem;
				$(le).attr('id', 'shardserver_list_item_' + configState.shardServers[i].nodeID)
					.attr('mark', 'ext')
					.attr('class', status_class)
					.find('span.node_id').html(configState.shardServers[i].nodeID)
					.end()
					.find('span.endpoint').html(configState.shardServers[i].endpoint)
					.end()
					.find('span.status').html(status_msg)
					.end()
					.find('a.remove').attr('rel', configState.shardServers[i].nodeID).click(serverListView.unregisterShardServer)
					.end()
				.appendTo('#shardserver_list_view_box');
			}
			else
			{
				le.attr('mark', 'ext');
				// check for rename,update,mark
				if (le.attr('class') != status_class)
					le.attr('class', status_class);
				
				if (le.find('span.node_id').html() != configState.shardServers[i].nodeID)
					le.find('span.node_id').html(configState.shardServers[i].nodeID);
					
				if (le.find('span.endpoint').html() != configState.shardServers[i].endpoint)
					le.find('span.endpoint').html(configState.shardServers[i].endpoint);
					
				if (le.find('span.status').html() != status_msg)
					le.find('span.status').html(status_msg);
			}
		}
		// remove unmarked
		$('#shardserver_list_view_box > div[mark!="ext"]').remove();
		// remove mark
		$('#shardserver_list_view_box > div').attr('mark', '');
	},
	
	unregisterShardServer: function()
	{
		confirmDialog.clearAndInit('Unregister shard server',
		'Are you sure you want to permanently unregister the shard server from the ScalienDB cluster?',
		function(param) {
			scaliendb.unregisterShardServer(param);
		},
		$(this).attr('rel'));
		confirmDialog.show();
	},
	
	show: function()
	{
		this.getSelf().show();
	},
	
	hide: function()
	{
		this.getSelf().hide();;
	}
}
