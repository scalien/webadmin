var quorumListView = 
{
	container:'#main_container',
	id:'quorum_list_view',
	inited:false,
	
	getSelf:function()
	{
		return $('#'+quorumListView.id);
	},
	
	init:function()
	{
		$('#quorum_list_view_new_quorum').click(function() {
			inputFieldsDialog.clearAndInit('Create quorum', quorumListView.createQuorum);
			inputFieldsDialog.addField('name', 'text', 'Name:');
			inputFieldsDialog.addField('nodes', 'text', 'Shard server list:');
			inputFieldsDialog.show();
		});
	},
	
	update: function(configState)
	{
		if (!quorumListView.inited) 
		{
			quorumListView.inited = true;
			quorumListView.init();
		}
		
		if (!configState)
		{
			// TODO empty list
			return;
		}
		
		// update list
		// marking like .attr('mark', 'ext')
		// QuorumList
		for(var i in configState.quorums)
		{
			// get quorum details
			var details = quorumListView.getQuorumDetails(configState.quorums[i], configState);
			
			// find -> add / check,update,mark
			var le = $('#quorum_list_view_box > div#quorum_list_item_' + configState.quorums[i].quorumID);
			if (le.length == 0)
			{
				// add new quorum
				var le = htmlCodes.quorumListItem;
				$(le).attr('id', 'quorum_list_item_' + details.quorumID)
					.attr('mark', 'ext')
					.find('h2').html(details.name + '<br/>(' + details.state + ')')
					.end()
					.find('span.quorumNumber').html(details.quorumID)
					.end()
					.find('span.repl').html(details.paxosID)
					.end()
					.find('span.explanation').html(details.explanation + '<br/>' + details.catchupText)
					.end()
				
				.appendTo('#quorum_list_view_box');
			}
			else
			{
				le.attr('mark', 'ext');
				// check for rename,update,mark
				if (le.find('h2').html() != details.name + '<br/>(' + details.state + ')')
					le.find('h2').html(details.name + '<br/>(' + details.state + ')');
					
				if (le.find('span.repl').html() != details.paxosID)
					le.find('span.repl').html(details.paxosID);
					
				if (le.find('span.explanation').html() != (details.explanation + '<br/>' + details.catchupText))
					le.find('span.explanation').html(details.explanation + '<br/>' + details.catchupText);
			}
			
		}
		// remove unmarked
		$('#quorum_list_view_box > div[mark!="ext"]').remove();
		// remove mark
		$('#quorum_list_view_box > div').attr('mark', '');
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
		scaliendb.createQuorum(utils.removeSpaces(data.name), utils.removeSpaces(data.nodes));
	},
	
	getQuorumDetails: function(quorum, configState)
	{
		var details = Object();
		
		details.state = scaliendb.getQuorumState(quorum);
		details.name = quorum.name;
		details.quorumID = quorum.quorumID;
		
		if (quorum["hasPrimary"] == true)
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
