var databaseListView = 
{
	container:'#main_container',
	id:'database_list_view',
	inited:false,
	
	getSelf:function()
	{
		return $('#'+databaseListView.id);
	},
	
	init:function()
	{
		$('#database_list_view_new_database').click(function() {
			inputFieldsDialog.clearAndInit('Create databse', databaseListView.createDatabase);
			inputFieldsDialog.addField('name', 'text', 'Name:');
			inputFieldsDialog.show();
		});
	},
	
	update: function(configState)
	{
		if (!databaseListView.inited) 
		{
			databaseListView.inited = true;
			databaseListView.init();
		}
		
		if (!configState)
		{
			return;
		}
		
		// update list
		// marking like .attr('mark', 'ext')
		// DatabaseList
		for(var i in configState.databases)
		{
			var databaseID = configState.databases[i].databaseID;
			var databaseSize = databaseListView.calculateDatabaseSize(configState, databaseID);
		
			// find -> add / check,update,mark
			var le = $('#database_list_view_box > div#database_list_item_' + databaseID);
			if (le.length == 0)
			{
				// add new db
				var le = htmlCodes.databaseListItem;
				$(le).attr('id', 'database_list_item_' + databaseID)
					.attr('mark', 'ext')
					.find('h2').html(configState.databases[i].name)
					.end()
					.find('span.databaseNumber').html(databaseID)
					.end()
					.find('span.databaseSize').html(utils.humanBytes(databaseSize))
					.end()
				.appendTo('#database_list_view_box');
			}
			else
			{
				le.attr('mark', 'ext');
				// check for rename,update,mark
				if (le.find('h2').html() != configState.databases[i].name)
					le.find('h2').html(configState.databases[i].name);
			}
			
		}
		// remove unmarked
		$('#database_list_view_box > div[mark!="ext"]').remove();
		// remove mark
		$('#database_list_view_box > div').attr('mark', '');
	},
	
	show: function()
	{
		this.getSelf().show();
	},
	
	hide: function()
	{
		this.getSelf().hide();;
	},
	
	createDatabase: function(data)
	{
		scaliendb.createDatabase(utils.removeSpaces(data.name));
	},
	
	calculateDatabaseSize: function(configState, databaseID)
	{
		var size = 0;
		var tables = {};
		for (var i in configState.tables)
		{
			var table = configState.tables[i];
			if (table["databaseID"] == databaseID)
				tables[table["tableID"]] = table["tableID"];
		}
		
		for (var i in configState.shards)
		{
			var shard = configState.shards[i];
			if (tables.hasOwnProperty(shard["tableID"]))
				size += shard["shardSize"];
		}
		return size;
	},

}
