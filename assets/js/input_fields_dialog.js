var inputFieldsDialog = 
{	
	container:'#dialogs_container',
	id:'input_fields_dialog',
	
	formId:'inputFieldsForm',
	
	getSelf:function()
	{
		return $('#'+this.id);
	},
	
	init: function()
	{		
		this.getSelf().dialog({ autoOpen: false, width:500, title:"Input", resizable:false, zIndex:15000, modal:true,
			buttons: { 'Ok': this.onOk, 'Cancel': this.onCancel } });
			
		this.getSelf().keydown(function(e) {
			//alert(e.keyCode);
			if (e.keyCode == 13) {
				inputFieldsDialog.onOk();
			}
		});
	},
	
	addField: function(fieldName, fieldType, visibleName, value, filter)
	{
		if (!visibleName) visibleName = fieldName;
		
		if (fieldType == 'hidden')
			control = '';
		else
			control = '<div class="clearfix"><label for="'+fieldName+'">'+visibleName+'</label><div class="input">';
		
		switch(fieldType)
		{
			case 'hidden':
				if (!value) value = '';
				control += '<input id="'+fieldName+'" class="xlarge" type="hidden" name="'+fieldName+'" value="'+value+'"/>';
				break;
			case 'text':
				if (!value) value = '';
				control += '<input id="'+fieldName+'" class="xlarge" type="text" size="30" name="'+fieldName+'" value="'+value+'"/>';
				break;
			case 'memo':
				if (!value) value = '';
				control += '<textarea id="'+fieldName+'" class="xlarge" type="text" size="30" name="'+fieldName+'">'+value+'</textarea>';
				break;
			case 'bool':
				if (Boolean(value))
					control += '<input id="'+fieldName+'" type="checkbox" value="true" name="'+fieldName+'" checked />';
				else 
					control += '<input id="'+fieldName+'" type="checkbox" value="true" name="'+fieldName+'" />';
				
				break;
			case 'select':
				control += '<select id="'+fieldName+'" class="medium" name="'+fieldName+'">';
				
				for(var i in filter.options)
					control += '<option value="'+i+'" ' + ((i == value)?'selected':'') +'>' + filter.options[i] + '</option>';
				
				control += '</select>';
				break;
			case 'optional_select':
				control += '<div class="input-prepend">';
				control += '<label class="add-on"><input id="use_'+fieldName+'" type="checkbox" value="true" '+
					(value == undefined ? '':'checked')+' name="use_'+fieldName+'"></label>'
				
				control += '<select id="'+fieldName+'" class="medium" name="'+fieldName+'">';
				
				for(var i in filter.options)
					control += '<option value="'+i+'" ' + ((i == value)?'selected':'') +'>' + filter.options[i] + '</option>';
				
				control += '</select>';
				control += '</div>';
				break;
		}
		
		if (fieldType != 'hidden') control += '</div></div>';
		
		$('#'+this.formId + ' > fieldset').append(control);
	},
	
	clearAndInit: function(title, callback)
	{
		if (!title) title = 'Input';
		
		if (!callback) 
			this.data_callback = null;
		else
			this.data_callback = callback;
			
		this.getSelf().dialog( 'option', 'title', title );
		
		$('#'+this.id+'_legend').html(title);	
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
		if (inputFieldsDialog.data_callback)
		{
			var fields = $('#' + inputFieldsDialog.formId).serializeArray();
			inputFieldsDialog.data_callback.call(this, utils.fields2json(fields));
		}
		
		$(inputFieldsDialog.getSelf()).dialog('close');
	},
	
	onCancel: function()
	{
		// TODO option to set single time callback override
		$(this).dialog('close');
	}
}