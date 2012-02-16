var tableView = 
{
	container:'#main_container',
	id:'table_view',
	
	tableID:null,
	
	ininted:false,
	
	getSelf:function()
	{
		return $('#'+tableView.id);
	},
	
	init: function()
	{
		$('#table_view_fold_shards').click(function() {
			$('#table_view_shards').children().addClass('folded');
		});
		
		$('#table_view_unfold_shards').click(function() {
			$('#table_view_shards').children().removeClass('folded');
		});
		
		// TODO click actions
	},
	
	update: function(configState, tableID)
	{
		if (!configState)
		{
			// TODO empty list
			return;
		}
		
		if (!tableView.inited)
		{
			tableView.inited = true;
			tableView.init();
		}
		
		if (!tableID)
			tableID = tableView.tableID;
		else 
			tableView.tableID = tableID;
			
		if (!tableView.tableID)
			return;
		
		table = scaliendb.getTable(configState, tableID);
		
		// buttons
		$('#table_view_delete')
			.attr('rel', tableID)
			.unbind('click')
			.click(tableView.deleteClick);
		
		$('#table_view_truncate')
			.attr('rel', tableID)
			.unbind('click')
			.click(tableView.truncateClick);
		
		$('#table_view_freeze')
			.attr('rel', tableID)
			.unbind('click')
			.click(tableView.freezeClick)
			.css('display', table.isFrozen ? 'none' : 'inline-block');
		
		$('#table_view_unfreeze')
			.attr('rel', tableID)
			.unbind('click')
			.click(tableView.unfreezeClick)
			.css('display', table.isFrozen ? 'inline-block' : 'none');
		
		$('#table_view_rename')
			.attr('rel', tableID)
			.unbind('click')
			.click(tableView.renameClick);
			
		if (table.isFrozen)
		{
			$('#table_view_freeze').hide();
			$('#table_view_unfreeze').show();
		}
		else
		{
			$('#table_view_freeze').show();
			$('#table_view_unfreeze').hide();
		}
		
		var details = tableView.getTableDetails(table, configState);
		
		// basic info
		var vw = $('#table_view');
		
		if (vw.find('h1#table_view_table_name').html() != table.name)
			vw.find('h1#table_view_table_name').html(table.name);
			
		if (vw.find('span.tableNumber').html() != tableID)
			vw.find('span.tableNumber').html(tableID);
			
		// mapped quorums?
		var quorums = $('<span>');
		for(var i in details.quorums)
		{
			var shard = $('<span class="quorum-number">')
				.addClass(details.quorums[i].state)
				.html(details.quorums[i].quorumID)
				.appendTo(quorums);
		}
		if (vw.find('span.mappedQuorums').html() != quorums)
			vw.find('span.mappedQuorums').html(quorums);
		
		if (vw.find('span.repl_factor').html() != details.rfactor)
			vw.find('span.repl_factor').html(details.rfactor);
			
		if (vw.find('span.frozen').html() != table.isFrozen ? 'yes' : 'no')
			vw.find('span.frozen').html(table.isFrozen ? 'yes' : 'no');
			
		if (vw.find('span.size').html() != utils.humanBytes(details.size))
			vw.find('span.size').html(utils.humanBytes(details.size));
		
		
		if (details.state != 'healthy')
			$('#table_view_info').addClass('critical');
		else
			$('#table_view_info').removeClass('critical');
			
		// update list
		// marking like .attr('mark', 'ext')
		// ShardList
		for (var i in details.shards)
		{
			var shard = scaliendb.getShard(configState, details.shards[i].shardID);
		
			var start_key = shard['firstKey'] == '' ? '(empty)' : shard['firstKey'];
			var end_key = shard['lastKey'] == '' ? '(empty)' : shard['lastKey'];
			var splitable = shard['isSplitable'] ? 'yes' : 'no';
			var split_key = utils.defstr(shard['splitKey']) == '' ? '(empty)' : utils.defstr(shard['splitKey']);
			
			// find -> add / check,update,mark
			var le = $('#table_view_shards > div#shard_list_item_' + shard.shardID);
			if (le.length == 0)
			{
				// add new table
				var le = htmlCodes.tableViewShardListItem;
				$(le).attr('id', 'shard_list_item_' + shard.shardID)
					.attr('mark', 'ext')
					.find('h2')
						.html('Shard ' + shard.shardID)
						.click(function() { $(this).parent().toggleClass('folded'); })
					.end()
					.find('span.quorum').html(shard.quorumID + '('+ details.shards[i].state +')')
					.end()
					.find('span.start_key').html(start_key)
					.end()
					.find('span.end_key').html(end_key)
					.end()
					.find('span.splitable').html(splitable)
					.end()
					.find('span.split_key').html(split_key)
					.end()
					.find('span.size').html(utils.humanBytes(shard.shardSize))
					.end()
					.find('button.split_shard')
						.attr('rel', shard.shardID)
						.click(tableView.splitShardClick)
						.css('display', shard["isSplitable"] ? 'inline-block' : 'none')
					.end()
					.find('button.migrate_shard')
						.attr('rel', shard.shardID)
						.click(tableView.migrateShardClick)
						.css('display', (configState.quorums.length > 1) ? 'inline-block' : 'none')
					.end()
				.appendTo('#table_view_shards');
			}
			else
			{
				le.attr('mark', 'ext');
				// check for rename,update,mark
				if (le.find('h2').html() != 'Shard ' + shard.shardID)
					le.find('h2').html('Shard ' + shard.shardID);
					
				if (le.find('span.quorum').html() != shard.quorumID + '('+ details.shards[i].state +')')
					le.find('span.quorum').html(shard.quorumID + '('+ details.shards[i].state +')');
						
				if (le.find('span.start_key').html() != start_key)
					le.find('span.start_key').html(start_key);
						
				if (le.find('span.end_key').html() != end_key)
					le.find('span.end_key').html(end_key);
						
				if (le.find('span.splitable').html() != splitable)
					le.find('span.splitable').html(splitable);
						
				if (le.find('span.split_key').html() != split_key)
					le.find('span.split_key').html(split_key);
					
				if (le.find('span.size').html() != utils.humanBytes(shard.shardSize))
					le.find('span.size').html(utils.humanBytes(shard.shardSize));
				
				if (shard["isSplitable"])
					le.find('button.split_shard').show();
				else
					le.find('button.split_shard').hide();
					
				if ((configState.quorums.length > 1))
					le.find('button.migrate_shard').show();
				else
					le.find('button.migrate_shard').hide();
			}
		}
		// remove unmarked
		$('#table_view_shards > div[mark!="ext"]').remove();
		// remove mark
		$('#table_view_shards > div').attr('mark', '');
	},
	
	show: function()
	{
		this.getSelf().show();
	},
	
	hide: function()
	{
		this.getSelf().hide();;
	},
	
	renameTable: function(data)
	{
		scaliendb.renameTable(data.tableID, utils.removeSpaces(data.name));
	},
	
	truncateClick: function()
	{
		var tableID = $(this).attr('rel');
		confirmDialog.clearAndInit('Confirm truncate', 'Are you sure?', function(param){
			scaliendb.truncateTable(param);
		}, tableID);
		confirmDialog.show();
	},
	
	deleteClick: function()
	{
		var tableID = $(this).attr('rel');
		confirmDialog.clearAndInit('Confirm delete', 'Are you sure?', function(param){
			scaliendb.deleteTable(param);
		}, tableID);
		confirmDialog.show();
	},
	
	freezeClick: function()
	{
		var tableID = $(this).attr('rel');
		scaliendb.freezeTable(tableID);
	},
	
	unfreezeClick: function()
	{
		var tableID = $(this).attr('rel');
		scaliendb.unfreezeTable(tableID);
	},
	
	renameClick: function()
	{
		var tableID = $(this).attr('rel');
		var tbl = scaliendb.getTable(lastConfigState, tableID);
		inputFieldsDialog.clearAndInit('Rename table', tableView.renameTable);
		inputFieldsDialog.addField('tableID', 'hidden', '', tableID);
		inputFieldsDialog.addField('name', 'text', 'Name:', tbl.name);
		inputFieldsDialog.show();
	},
	
	migrateShard: function(data)
	{
		scaliendb.migrateShard(data.shardID, data.quorumID);
	},
	
	migrateShardClick: function()
	{
		var shardID = $(this).attr('rel');
		
		if (!lastConfigState.hasOwnProperty("quorums")) return false;
		
		var options = Object();
		// populate quorumIDs
		for (var q in lastConfigState["quorums"])
		{
			var quorum = lastConfigState["quorums"][q];
			if (!quorum.hasOwnProperty("quorumID"))
				continue;
			
			var quorumID = quorum["quorumID"];
			options[quorumID] = quorumID;
		}
		inputFieldsDialog.clearAndInit('Migrate shard', tableView.migrateShard);
		inputFieldsDialog.addField('shardID', 'hidden', '', shardID);
		inputFieldsDialog.addField('quorumID', 'select', 'Migrate to quorum:', null, {'options':options});
		inputFieldsDialog.show();
	},
	
	splitShard: function(data)
	{
		scaliendb.splitShard(data.shardID, data.key);
	},
	
	splitShardClick: function()
	{
		var shardID = $(this).attr('rel');
		inputFieldsDialog.clearAndInit('Split shard', tableView.splitShard);
		inputFieldsDialog.addField('shardID', 'hidden', '', shardID);
		inputFieldsDialog.addField('key', 'text', 'Split key:');
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
				'state':scaliendb.getQuorumState(scaliendb.getQuorum(configState, shard["quorumID"]))});
			
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
				'state':scaliendb.getQuorumState(scaliendb.getQuorum(configState, quorumIDs[i]))});
		}
	
		return details;
	}
}