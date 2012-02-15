var treeMenu = 
{	
	container:'#tree_menu_box',
	id:'tree_menu',
	inited:false,
	
	getSelf:function()
	{
		return $('#'+treeMenu.id);
	},
	
	init: function()
	{
		$(treeMenu.getSelf()).treeview({
			collapsed: true, animated:"fast", persist: "cookie",
			clickhandler:{"class_name":"tree_menu_item", "function_name":treeMenu.onItemClick}
		});
	},
	
	update: function(configState)
	{
		if (!treeMenu.inited) 
		{
			treeMenu.inited = true;
			treeMenu.init();
		}
		
		if (!configState)
		{
			// TODO empty tree
			return;
		}
		
		// marking like .attr('mark', 'ext')
		// QuorumList
		for(var i in configState.quorums)
		{
			// find -> add / check,update,mark
			var qle = $('#tree_menu_quorum_list > li#tree_menu_quorum_' + configState.quorums[i].quorumID);
			if (qle.length == 0)
			{
				// add new quorum
				var qle = $('<li><span class="file"><a class="tree_menu_item"></a></span></li>')
					.attr('id', 'tree_menu_quorum_' + configState.quorums[i].quorumID)
					.attr('mark', 'ext')
					.find('a')
						.html(configState.quorums[i].name)
						.attr('rel', configState.quorums[i].quorumID)
						.click(treeMenu.onQuorumClick)
					.end()
				.appendTo('#tree_menu_quorum_list');
				$(treeMenu.getSelf()).treeview({add:qle});
			}
			else
			{
				// check for rename,update,mark
				qle.attr('mark', 'ext');
				if (qle.find('a').html() != configState.quorums[i].name)
					qle.find('a').html(configState.quorums[i].name);
			}
			
		}
		// remove unmarked
		$('#tree_menu_quorum_list > li[mark!="ext"]').each(function(index){
			// treeview bug workaround: $(treeMenu.getSelf()).treeview({remove:$(this)});
			$(this).remove();
			$('#tree_menu_quorum_list > li:last-child').addClass('last');
		});
		// remove mark
		$('#tree_menu_quorum_list > li').attr('mark', '');
		
		
		// DatabaseList
		for(var i in configState.databases)
		{
			var dble = $('#tree_menu_database_list > li#tree_menu_database_' + configState.databases[i].databaseID);
			if (dble.length == 0)
			{
				if (configState.databases[i].tables.length > 0)
				{
					// add new database
					var dble = $('<li><span class="folder"><a class="tree_menu_item"></a></span></li>')
						.attr('id', 'tree_menu_database_' + configState.databases[i].databaseID)
						.attr('mark', 'ext')
						.find('a')
							.html(configState.databases[i].name)
							.attr('rel', configState.databases[i].databaseID)
							.click(treeMenu.onDatabaseClick)
						.end()
						.appendTo('#tree_menu_database_list');
						
					var table_list = $('<ul></ul>')
						.attr('id', 'tree_menu_database_' + configState.databases[i].databaseID + '_table_list')
						.appendTo(dble);
						
					for(var j in configState.databases[i].tables)
					{
						var table = scaliendb.getTable(configState, configState.databases[i].tables[j])
						
						var table_list_item = $('<li><span class="file"><a class="tree_menu_item"></a></span></li>')
							.attr('id', 'tree_menu_database_table_' + table.tableID)
							.find('a')
								.html(table.name)
								.attr('rel', table.tableID)
								.click(treeMenu.onTableClick)
							.end()
							.appendTo(table_list);
					}
				}
				else
				{
					// add new database
					var dble = $('<li><span class="file"><a class="tree_menu_item"></a></span></li>')
						.attr('id', 'tree_menu_database_' + configState.databases[i].databaseID)
						.attr('mark', 'ext')
						.find('a')
							.html(configState.databases[i].name)
							.attr('rel', configState.databases[i].databaseID)
							.click(treeMenu.onDatabaseClick)
						.end()
						.appendTo('#tree_menu_database_list');
				}
				$(treeMenu.getSelf()).treeview({add:dble});
			}
			else
			{
				// check for rename,update,mark
				dble.attr('mark', 'ext');
				if (dble.find('a').html() != configState.databases[i].name)
					dble.find('a').html(configState.databases[i].name);
				
				var table_list = $('#tree_menu_database_' + configState.databases[i].databaseID + '_table_list');
				if (table_list.length > 0)
				{
					if (configState.databases[i].tables.length > 0)
					{
						// check existing table list
						for(var j in configState.databases[i].tables)
						{
							var table = scaliendb.getTable(configState, configState.databases[i].tables[j]);
							
							var tble = $('#tree_menu_database_' + configState.databases[i].databaseID + 
								'_table_list > #tree_menu_database_table_' + table.tableID);
							
							if (tble.length == 0)
							{
								// add new table item
								var tble = $('<li><span class="file"><a class="tree_menu_item"></a></span></li>')
								.attr('id', 'tree_menu_database_table_' + table.tableID)
								.attr('mark', 'ext')
								.find('a')
									.html(table.name)
									.attr('rel', table.tableID)
									.click(treeMenu.onTableClick)
								.end()
								.appendTo(table_list);
								
								$(treeMenu.getSelf()).treeview({add:tble});
							}
							else
							{
								// check for changes, mark
								tble.attr('mark', 'ext');
								if (tble.find('a').html() != table.name)
									tble.find('a').html(table.name);
							}
						}
						// remove unmarked
						$('#tree_menu_database_' + configState.databases[i].databaseID + '_table_list > li[mark!="ext"]').each(function(index){
							// treeview bug workaround: $(treeMenu.getSelf()).treeview({remove:$(this)});
							$(this).remove();
							$('#tree_menu_database_' + configState.databases[i].databaseID + '_table_list > li:last-child').addClass('last');
						});
						// remove mark
						$('#tree_menu_database_' + configState.databases[i].databaseID + '_table_list > li').attr('mark', '');
					}
					else
					{
						// remove table list
						table_list.remove();
						dble.attr('class', '');
						dble.find('span:first').addClass('file').removeClass('folder');
						dble.find('div.hitarea').remove();
						$('#tree_menu_database_list > li:last-child').addClass('last');
					}
				}
				else
				{
					if (configState.databases[i].tables.length > 0)
					{
						// add table list
						var table_list = $('<ul></ul>')
							.attr('id', 'tree_menu_database_' + configState.databases[i].databaseID + '_table_list')
							.appendTo(dble);
						
						for(var j in configState.databases[i].tables)
						{
							var table = scaliendb.getTable(configState, configState.databases[i].tables[j])
							
							var tble = $('<li><span class="file"><a class="tree_menu_item"></a></span></li>')
								.attr('id', 'tree_menu_database_table_' + table.tableID)
								.find('a')
									.html(table.name)
									.attr('rel', table.tableID)
									.click(treeMenu.onTableClick)
								.end()
								.appendTo(table_list);
						}
						
						dble.find('span:first').attr('class', 'folder');
						$(treeMenu.getSelf()).treeview({add:dble});
					}
				}
			}
		}
		// remove unmarked
		$('#tree_menu_database_list > li[mark!="ext"]').each(function(index){
			// treeview bug workaround: $(treeMenu.getSelf()).treeview({remove:$(this)});
			$(this).remove();
			$('#tree_menu_database_list > li:last-child').addClass('last');
		});
		// remove mark
		$('#tree_menu_database_list > li').attr('mark', '');
		
	},
	
	onItemClick: function()
	{
		if (controller = $(this).attr('controller')) {
			$('#main_container').children().each(function(){ $(this).hide(); });
						
			window[controller].show();
		}
	},
	
	onQuorumClick: function()
	{
		quorumView.update(lastConfigState, $(this).attr('rel'));
		$('#main_container').children().each(function(){ $(this).hide(); });
		quorumView.show();
	},
	
	onDatabaseClick: function()
	{
		tableListView.update(lastConfigState, $(this).attr('rel'));
		$('#main_container').children().each(function(){ $(this).hide(); });
		tableListView.show();
	},
	
	onTableClick: function()
	{
		tableView.update(lastConfigState, $(this).attr('rel'));
		$('#main_container').children().each(function(){ $(this).hide(); });
		tableView.show();
	}
}
