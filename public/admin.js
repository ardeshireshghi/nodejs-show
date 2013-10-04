
$(document).ready(function() {
	
	var admin = function(options) {
		
		this.initialize =  function(options) {
			this.serverAddress = (options.serverAddress != undefined) ? options.serverAddress : 'http://192.168.1.86:3700';
			this.socket = io.connect(this.serverAddress);
			
			this.bindEvents();
		}
		
		
		this.bindEvents = function() {
			var that = this;
			var sendButton = $("#send");
			var textBox = $('#pageText');
			var field = $('#field');
			
			// Event listeners
			field.on("change",   $.proxy(this, "onFieldChanged"));
			sendButton.on('click',  $.proxy(this, "callServer"));
			textBox.on('keyup', $.proxy(this, "onTextEdited"));
			$(document).on('keyup', $.proxy(this, "callServer"));
			
			// Server event listeners (for initial data setting)
			this.socket.on('adminContent', function (data) {
				if (data.content != undefined) {
					var contentCode = data.content;
					var content = $("#content");
					var field = $('#field');
					field.val(contentCode);
					
					(contentCode.indexOf('iframe') != -1) ? content.html(contentCode) : content.html(that.generateHTML(contentCode));
					
					
				} else {
					console.log("There is a problem:", data);
				}
			});
			
			this.socket.on('adminTextBoxUpdate', function(data) {
				if (data.content == undefined)
					return;
				
				var textBoxNewValue = data.content;
				var textBox = $('#pageText');
				
				// Update value
				textBox.val(textBoxNewValue);		
					
			});
		
		}
		
		this.onFieldChanged = function(e) {
			var sendButton = $("#send");
			sendButton.removeAttr("disabled");
		}
		
		/**
		 * Sends messages to the server
		 *
		 * @param 	e		JS event object 
		 */
		this.callServer = function(e) {
			if ( e.type == "keyup" && e.keyCode != 13)
				return;
			
			var sendButton = $("#send");
			
			if (sendButton.attr("disabled"))
				return;
			
			var field = $('#field');
			var contentCode = field.val();
			
			if (contentCode == "")
				return;
			
			// Update content
			var content = $("#content");
			(contentCode.indexOf('iframe') != -1) ? content.html(contentCode) : content.html(this.generateHTML(contentCode));
			
			
			
			var message = { content: contentCode};
			this.socket.emit('adminChangedContent', message);
			field.focus();
			sendButton.attr("disabled", true);
		} 
		
		
		/**
		 * Sends messages to the server
		 *
		 * @param 	e		JS event object 
		 */
		this.onTextEdited = function(e) {
			var textBox = $('#pageText');
			var message = { content: textBox.val()};
			this.socket.emit('textBoxChanged', message);
			
		}
			
		this.generateHTML = function (data) {
		
			var html = ''; 
			
			html = "<img src='" + data + "' style='width: 100%; position: relative;' />";
			return html;
		}
			
		this.initialize(options);
	
	}
	
	var settings = {serverAddress: "http://www.e-ardi.com:3700"};
	var myAdmin = new admin(settings);
	

 
});
