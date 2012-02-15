var confirmDialog = 
{	
	container:'#dialogs_container',
	id:'confirm_dialog',
	
	formId:'confirmForm',
	
	getSelf:function()
	{
		return $('#'+this.id);
	},
	
	init: function()
	{		
		this.getSelf().dialog({ autoOpen: false, width:500, title:"Confirm", resizable:false, zIndex:15000, modal:true,
			buttons: { 'Ok': this.onOk, 'Cancel': this.onCancel } });
			
		this.getSelf().keydown(function(e) {
			//alert(e.keyCode);
			if (e.keyCode == 13) {
				confirmDialog.onOk();
			}
		});
	},
	
	clearAndInit: function(title, message, callback, param)
	{
		if (!title) title = 'Confirm';
		
		if (!callback) 
			this.data_callback = null;
		else
			this.data_callback = callback;
			
		if (!param) 
			this.param = null;
		else
			this.param = param;
			
		if (!message) message = title;
			
		this.getSelf().dialog( 'option', 'title', title );
		
		$('#'+this.id+'_legend').html(message);
		$('#'+this.formId + ' > fieldset > :not(legend)').remove();
	},
	
	show: function()
	{
		this.getSelf().dialog('open');
	},
	
	hide: function()
	{
		this.getSelf().dialog('close');
	},
	
	onOk: function()
	{
		if (confirmDialog.data_callback)
		{
			confirmDialog.data_callback.call(this, confirmDialog.param);
		}
		
		$(confirmDialog.getSelf()).dialog('close');
	},
	
	onCancel: function()
	{
		$(this).dialog('close');
	}
}