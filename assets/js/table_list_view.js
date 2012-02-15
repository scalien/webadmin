// tableListView is the database view too

var tableListView = 
{
	container:'#main_container',
	id:'table_list_view',
	
	databaseID:null,
	
	getSelf:function()
	{
		return $('#'+tableListView.id);
	},
	
	update: function(configState, databaseID)
	{
		if (!configState)
		{
			// TODO empty list
			return;
		}
		
		if (!databaseID)
			databaseID = tableListView.databaseID;
		else 
			tableListView.databaseID = databaseID;
			
		if (!tableListView.databaseID)
			return;
		
		database = scaliendb.getDatabase(configState, databaseID);
		
		// buttons
		$('#table_list_view_delete_table')
			.attr('rel', databaseID)
			.unbind('click')
			.click(tableListView.deleteDatabaseClick);
			
		$('#table_list_view_rename_table')
			.attr('rel', databaseID)
			.unbind('click')
			.click(tableListView.renameDatabaseClick);
			
		$('#table_list_view_new_table')
			.attr('rel', databaseID)
			.unbind('click')
			.click(tableListView.createTableClick);
		
		// basig info
		$('#table_list_view #table_list_view_database_name').html(database.name);
		
		
		// update list
		// marking like .attr('mark', 'ext')
		// TableList
		for(var i in database.tables)
		{
			var tableID = database.tables[i];
			var table = scaliendb.getTable(configState, tableID);
			
			var details = tableListView.getTableDetails(table, configState);
			
			// find -> add / check,update,mark
			var le = $('#table_list_view_box > div#table_list_item_' + tableID);
			if (le.length == 0)
			{
				// add new table
				var le = htmlCodes.tableListItem;
				$(le).attr('id', 'table_list_item_' + tableID)
					.attr('mark', 'ext')
					.find('h2').html(table.name)
					.end()
					.find('span.tableNumber').html(tableID)
					.end()
					.find('span.repl_factor').html(details.rfactor)
					.end()
					.find('span.frozen').html(table.isFrozen ? 'yes' : 'no')
					.end()
					.find('span.size').html(utils.humanBytes(details.size))
					.end()
				.appendTo('#table_list_view_box');
			}
			else
			{
				le.attr('mark', 'ext');
				// check for rename,update,mark
				if (le.find('h2').html() != table.name)
					le.find('h2').html(table.name);
					
				if (le.find('span.repl_factor').html() != details.rfactor)
					le.find('span.repl_factor').html(details.rfactor);
					
				if (le.find('span.frozen').html() != table.isFrozen ? 'yes' : 'no')
					le.find('span.frozen').html(table.isFrozen ? 'yes' : 'no');
					
				if (le.find('span.size').html() != utils.humanBytes(details.size))
					le.find('span.size').html(utils.humanBytes(details.size));
			}
		}
		// remove unmarked
		$('#table_list_view_box > div[mark!="ext"]').remove();
		// remove mark
		$('#table_list_view_box > div').attr('mark', '');
	},
	
	show: function()
	{
		this.getSelf().show();
	},
	
	hide: function()
	{
		this.getSelf().hide();;
	},
	
	renameDatabase: function(data)
	{
		// TODO validate input data
		scaliendb.renameDatabase(data.databaseID, data.name);
	},
	
	renameDatabaseClick: function()
	{
		var databaseID = $(this).attr('rel');
		var db = scaliendb.getDatabase(lastConfigState, databaseID);
		inputFieldsDialog.clearAndInit('Rename database', tableListView.renameDatabase);
		inputFieldsDialog.addField('databaseID', 'hidden', '', databaseID);
		inputFieldsDialog.addField('name', 'text', 'Name:', db.name);
		inputFieldsDialog.show();
	},
	
	deleteDatabaseClick: function()
	{
		confirmDialog.clearAndInit('Delete database',
			'Are you sure?',
			function(param) {
				scaliendb.deleteDatabase(param);
			},
			$(this).attr('rel'));
		confirmDialog.show();
	},
	
	createTable: function(data)
	{
		// TODO validate input data
		scaliendb.createTable(data.databaseID, data.quorumID, data.name);
	},
	
	createTableClick: function(shardID)
	{
		// TODO validate input data
		var databaseID = $(this).attr('rel');
		
		if (!lastConfigState.hasOwnProperty("quorums")) return false;
		
		var options = Object();
		// populate quorumIDs
		for (var q in lastConfigState["quorums"])
		{
			var quorum = lastConfigState["quorums"][q];
			if (!quorum.hasOwnProperty("quorumID"))
				continue;
			
			// shardID is optional
			if (shardID != undefined)
			{
				var currentQuorum = false;
				for (var qs in quorum["shards"])
				{
					var quorumShardID = quorum["shards"][qs];
					if (quorumShardID == shardID)
					{
						currentQuorum = true;
						break;
					}
				}
				if (currentQuorum)
					continue;
			}
			var quorumID = quorum["quorumID"];
			options[quorumID] = quorumID;
		}
		inputFieldsDialog.clearAndInit('Create table', tableListView.createTable);
		inputFieldsDialog.addField('databaseID', 'hidden', '', databaseID);
		inputFieldsDialog.addField('name', 'text', 'Name:');
		inputFieldsDialog.addField('quorumID', 'select', 'QuorumID:', null, {'options':options});
		inputFieldsDialog.show();
	},
	
	getTableDetails: function(table, configState)
	{
		var details = Object();
		
		details.rfactor = 0;
		details.size = 0;
		
		var quorumIDs = new Array();
		
		details.shards = Array();
		table["shards"].sort();
		for (var i in table["shards"])
		{
			var shardID = table["shards"][i];
			var shard = scaliendb.getShard(configState, shardID);
			if (shard == null)
				continue;
			details.size += shard["shardSize"];
			
			details.shards.push({
				'shardID':shardID,
				'state':scaliendb.getQuorumState(configState, shard["quorumID"])});
			
			quorumID = shard["quorumID"];
			if (!utils.contains(quorumIDs, quorumID))
				quorumIDs.push(quorumID);
			var quorum = scaliendb.getQuorum(configState, quorumID);
			if (quorum == null)
				continue;
			if (quorum["activeNodes"].length > details.rfactor)
				details.rfactor = quorum["activeNodes"].length;
		}
		
		details.quorums = Array();
		quorumIDs.sort();
		for (var i in quorumIDs)
		{
			details.quorums.push({
				'quorumID':quorumIDs[i],
				'state':scaliendb.getQuorumState(configState, quorumIDs[i])});
		}
	
		return details;
	}
}