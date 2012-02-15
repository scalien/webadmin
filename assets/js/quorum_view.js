var quorumView = 
{
	container:'#main_container',
	id:'quorum_view',
	
	quorumID:null,
	
	getSelf:function()
	{
		return $('#'+quorumView.id);
	},
	
	update: function(configState, quorumID)
	{
		if (!configState)
		{
			return;
		}
		
		if (!quorumID)
			quorumID = quorumView.quorumID;
		else 
			quorumView.quorumID = quorumID;
			
		if (!quorumView.quorumID)
			return;
		
		var details = quorumView.getQuorumDetails(scaliendb.getQuorum(configState, quorumID), configState);
		
		// buttons
		$('#quorum_view_add_node')
			.attr('rel', quorumID)
			.unbind('click')
			.click(quorumView.addNodeClick)
			.css('display', (scaliendb.shardServersNotInQuorum(quorumID).length > 0) ? 'inline-block' : 'none');
		
		$('#quorum_view_remove_node')
			.attr('rel', quorumID)
			.unbind('click')
			.click(quorumView.removeNodeClick)
			.css('display', (scaliendb.shardServersInQuorum(quorumID).length > 1) ? 'inline-block' : 'none');
			
		$('#quorum_view_rename_quorum')
			.attr('rel', quorumID)
			.unbind('click')
			.click(quorumView.renameClick);
		
		$('#quorum_view_delete_quorum')
			.attr('rel', quorumID)
			.unbind('click')
			.click(quorumView.deleteClick);
		
		// basic quorum info
		var vw = $('#quorum_view');
		
		if (vw.find('h1').html() != details.name)
			vw.find('h1').html(details.name);
			
		if (vw.find('span.quorumNumber').html() != quorumID)
			vw.find('span.quorumNumber').html(quorumID);
			
		if (vw.find('span.repl').html() != details.paxosID)
			vw.find('span.repl').html(details.paxosID);
					
		if (vw.find('span.explanation').html() != (details.explanation + '<br/>' + details.catchupText))
			vw.find('span.explanation').html(details.explanation + '<br/>' + details.catchupText); 
			
		if (details.state != 'healthy')
			$('#quorum_view_info').addClass('critical');
		else
			$('#quorum_view_info').removeClass('critical');
			
		
		// Shardservers
		for(var i in details.shardservers)
		{
			// find -> add / check,update,mark
			var le = $('#quorum_view_shardservers > div#shardserver_list_item_' + details.shardservers[i].nodeID);
			if (le.length == 0)
			{
		// TODO if (details.shardservers[j].primary) shardserver.addClass('primary');
				var le = htmlCodes.quorumShardserverListItem;
				$(le).attr('id', 'shardserver_list_item_' + details.shardservers[i].nodeID)
					.attr('mark', 'ext')
					.attr('class', details.shardservers[i].health)
					.find('span.node_id').html(details.shardservers[i].nodeID)
					.end()
					.find('span.pri').html(details.shardservers[i].pri)
					.end()
					.find('span.repl').html(details.shardservers[i].repl)
					.end()
					.find('a.activate')
						.attr('rel', details.shardservers[i].nodeID)
						.click(quorumView.activateNodeClick)
						.css('display', details.shardservers[i].hasActivate ? 'inline-block' : 'none')
					.end()
				.appendTo('#quorum_view_shardservers');
			}
			else
			{
				le.attr('mark', 'ext');
				// check for rename,update,mark
				if (le.attr('class') != details.shardservers[i].health)
					le.attr('class', details.shardservers[i].health);
				
				if (le.find('span.node_id').html() != details.shardservers[i].nodeID)
					le.find('span.node_id').html(details.shardservers[i].nodeID);
					
				if (le.find('span.pri').html() != details.shardservers[i].pri)
					le.find('span.pri').html(details.shardservers[i].pri);
					
				if (le.find('span.repl').html() != details.shardservers[i].repl)
					le.find('span.repl').html(details.shardservers[i].repl);
				
				if (details.shardservers[i].hasActivate)
					le.find('a.activate').show();
				else
					le.find('a.activate').hide();
			}
		}
		// remove unmarked
		$('#quorum_view_shardservers > div[mark!="ext"]').remove();
		// remove mark
		$('#quorum_view_shardservers > div').attr('mark', '');
		
		
		// Shards
		var shards = $('#quorum_view_shards').empty();
		for(var i in details.shards)
		{
			var shard = $('<span class="shard-number">')
				.html(details.shards[i])
				.appendTo(shards);
		}
		
	},
	
	show: function()
	{
		this.getSelf().show();
	},
	
	hide: function()
	{
		this.getSelf().hide();
	},
	
	createQuorum: function(data)
	{
		// TODO validate input data
		scaliendb.createQuorum(data.name, utils.removeSpaces(data.nodes));
	},
	
	renameQuorum: function(data)
	{
		scaliendb.renameQuorum(data.quorumID, data.name);
	},
	
	addNode: function(data)
	{
		// TODO validate data
		scaliendb.addNode(data.quorumID, data.nodeID);
	},
	
	removeNode: function(data)
	{
		// TODO validate data
		scaliendb.removeNode(data.quorumID, data.nodeID);
	},
	
	renameClick: function()
	{
		var quorumID = $(this).attr('rel');
		var quorum = scaliendb.getQuorum(lastConfigState, quorumID);
		inputFieldsDialog.clearAndInit('Rename quorum', quorumView.renameQuorum);
		inputFieldsDialog.addField('quorumID', 'hidden', '', quorumID);
		inputFieldsDialog.addField('name', 'text', 'Name:', quorum.name);
		inputFieldsDialog.show();
	},
	
	deleteClick: function()
	{
		var quorumID = $(this).attr('rel');
		confirmDialog.clearAndInit('Confirm delete', 'Are you sure?', function(param){
			scaliendb.deleteQuorum(param);
		}, quorumID);
		confirmDialog.show();
	},
	
	addNodeClick: function()
	{
		var quorumID = $(this).attr('rel');
		
		var nodes = scaliendb.shardServersNotInQuorum(quorumID);
		var options = Object();
		for(i in nodes) options[nodes[i]] = nodes[i];
		
		inputFieldsDialog.clearAndInit('Add server', quorumView.addNode);
		inputFieldsDialog.addField('quorumID', 'hidden', '', quorumID);
		inputFieldsDialog.addField('nodeID', 'select', 'Shard server:', null, {'options':options});
		inputFieldsDialog.show();
	},
	
	removeNodeClick: function()
	{
		var quorumID = $(this).attr('rel');
		
		var nodes = scaliendb.shardServersInQuorum(quorumID);
		var options = Object();
		for(i in nodes) options[nodes[i]] = nodes[i];
		
		inputFieldsDialog.clearAndInit('Remove server', quorumView.removeNode);
		inputFieldsDialog.addField('quorumID', 'hidden', '', quorumID);
		inputFieldsDialog.addField('nodeID', 'select', 'Shard server:', null, {'options':options});
		inputFieldsDialog.show();
	},
	
	activateNodeClick: function()
	{
		scaliendb.activateNode($(this).attr('quorumID'), $(this).attr('rel'));
	},
	
	getQuorumDetails: function(quorum, configState)
	{
		var details = Object();
		
		details.state = scaliendb.getQuorumState(quorum);
		details.name = quorum.name;
		details.quorumID = quorum.quorumID;
		
		if (quorum["hasPrimary"] == "true")
			details.primaryID = quorum["primaryID"];
		else
			details.primaryID = null;
		
		if (quorum['paxosID'] > 0)
			details.paxosID = quorum['paxosID'];
		else
			details.paxosID = 'unknown';
			
		quorum["activeNodes"].sort();
		details.catchupText = "";
		details.explanation = "";
		
		details.shardservers = Array();
		for (var i in quorum["activeNodes"])
		{
			var nodeID = quorum["activeNodes"][i];
			var shardServer = scaliendb.getShardServer(configState, nodeID);
			var priority = 1;
			for (var qp in shardServer["quorumPriorities"])
			{
				if (shardServer["quorumPriorities"][qp]["quorumID"] == quorum["quorumID"])
					priority = shardServer["quorumPriorities"][qp]["priority"]
			}
			var quorumInfo = scaliendb.getQuorumInfo(configState, nodeID, quorum["quorumID"]);
			if (quorumInfo != null)
			{
				if (quorumInfo["isSendingCatchup"])
					details.catchupText += "Shard server " + nodeID + " is sending catchup: " + utils.humanBytes(quorumInfo["catchupBytesSent"]) + "/" + utils.humanBytes(quorumInfo["catchupBytesTotal"]) + " (" + utils.humanBytes(quorumInfo["catchupThroughput"]) + "/s)";
			}
			
			details.shardservers.push({
				'nodeID':nodeID,
				'pri':priority,
				'repl':(details.paxosID !== "unknown") ? details.paxosID : quorumInfo["paxosID"],
				'primary':(nodeID == details.primaryID),
				'health':(shardServer["hasHeartbeat"] ? "healthy" : "no-heartbeat"),
				'hasActivate':false});
				
			if (nodeID == details.primaryID)
				details.explanation = "The quorum has a primary (" + details.primaryID + "), it is writable. ";
			
		}
		
		if (details.primaryID == null)
			details.explanation += "The quorum has no primary, it is not writable. ";
		if (quorum["inactiveNodes"].length > 0 && details.primaryID != null)
			details.explanation += "The quorum has inactive nodes. These can be brought back into the quorum (once they are up and running and catchup is complete) by clicking them above. ";
	
		quorum["inactiveNodes"].sort();
		for (var i in quorum["inactiveNodes"])
		{
			var nodeID = quorum["inactiveNodes"][i];
			var shardServer = scaliendb.getShardServer(configState, nodeID);
			var priority = 1;
			for (var qp in shardServer["quorumPriorities"])
			{
				if (shardServer["quorumPriorities"][qp]["quorumID"] == quorum["quorumID"])
					priority = shardServer["quorumPriorities"][qp]["priority"]
			}
			var quorumInfo = scaliendb.getQuorumInfo(configState, nodeID, quorum["quorumID"]);
			
			details.shardservers.push({
				'nodeID':nodeID,
				'pri':priority,
				'repl':(quorumInfo != null) ? quorumInfo["paxosID"] : '',
				'primary':(nodeID == details.primaryID),
				'health':(shardServer["hasHeartbeat"] ? "healthy" : "no-heartbeat"),
				'hasActivate':(shardServer["hasHeartbeat"] && details.primaryID != null)});
				
		}
	
		quorum["shards"].sort();
		details.shards = Array();
		for (var i in quorum["shards"])
			details.shards.push(quorum["shards"][i]);
		
		return details;
	}
}
