var htmlCodes = 
{
	quorumListItem:
	'<div class="row">\
		<h2 class="span5"></h2>\
		<div class="span7">\
			<div>\
				<span>Quorum number:</span>\
				<span class="quorumNumber"></span>\
			</div>\
			<div>\
				<span>Replication round:</span>\
				<span class="repl"></span>\
			</div>\
			<div>\
				<span>Explanation:</span><br/>\
				<span class="explanation"></span>\
			</div>\
		</div>\
	</div>',
	quorumShardserverListItem:
	'<div>\
		NodeID: <span class="node_id"></span>\
		Priority: <span class="pri"></span>\
		Replication round: <span class="repl"></span>\
		<a class="activate" title="Click to activate node">Activate</a>\
	</div>',
	controllerListItem:
	'<div>\
		NodeID: <span class="node_id"></span>\
		Endpoint: <span class="endpoint"></span>\
		Status: <span class="status"></span>\
	</div>',
	shardserverListItem:
	'<div>\
		NodeID: <span class="node_id"></span>\
		Endpoint: <span class="endpoint"></span>\
		Status: <span class="status"></span>\
		<a class="remove" title="Remove from cluster">Remove</a>\
	</div>',
	databaseListItem:
	'<div class="row">\
		<h2 class="span6"></h2>\
		<div class="span6">\
			<div>\
				<span>Database number:</span>\
				<span class="databaseNumber"></span>\
			</div>\
		</div>\
	</div>',
	tableListItem:
	'<div class="row">\
		<h2 class="span6"></h2>\
		<div class="span6">\
			<div>\
				<span>Table number:</span>\
				<span class="tableNumber"></span>\
			</div>\
			<div>\
				<span>Replication factor:</span>\
				<span class="repl_factor"></span>\
			</div>\
			<div>\
				<span>Shard splitting frozen:</span>\
				<span class="frozen"></span>\
			</div>\
			<div>\
				<span>Size:</span>\
				<span class="size"></span>\
			</div>\
		</div>\
	</div>',
	'tableViewShardListItem':
	'<div>\
		<h2 class="span3"></h2>\
		<div class="span9">\
			<div>\
				<span>Quorum:</span>\
				<span class="quorum"></span>\
			</div>\
			<div>\
				<span>Start key:</span>\
				<span class="start_key"></span>\
			</div>\
			<div>\
				<span>End key:</span>\
				<span class="end_key"></span>\
			</div>\
			<div>\
				<span>Splitable:</span>\
				<span class="splitable"></span>\
			</div>\
			<div>\
				<span>Split key:</span>\
				<span class="split_key"></span>\
			</div>\
			<div>\
				<span>Size:</span>\
				<span class="size"></span>\
			</div>\
		</div>\
		<div class="btn_box">\
			<button class="btn split_shard">Split shard</button>\
			<button class="btn migrate_shard">Migrate shard</button>\
		</div>\
	</div>'
}