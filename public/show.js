
$(document).ready(function() {
	
	var show = function(options) {
		
		this.initialize =  function(options) {
			this.serverAddress = (options.serverAddress != undefined) ? options.serverAddress : 'http://192.168.1.86:3700';
			this.socket = io.connect(this.serverAddress);
			
			this.bindEvents();
		}
		
		
		this.bindEvents = function() {
			var that = this;
			this.socket.on('newContent', function (data) {
				if (data.content != undefined) {
					var contentCode = data.content;
					var content = $("#content");
					
					(contentCode.indexOf('iframe') != -1) ? content.html(contentCode) : content.html(that.generateHTML(contentCode));
					content.append(makeHTMLMessages(newMessage));
					
				} else {
					console.log("There is a problem:", data);
				}
			});
			
			this.socket.on('textBoxUpdate', function(data) {
				if (data.content == undefined)
					return;
				
				var textBoxNewValue = data.content;
				var textBox = $('#pageText');
				
				// Update value
				textBox.val(textBoxNewValue);		
					
			});
 
		}
		
	
		this.generateHTML = function (data) {
		
			var html = ''; 
			
			html = "<img src='" + data + "' style='width: 100%; position: relative;' />";
			return html;
		}
		
		this.initialize(options);
	
	}
		
	 var settings = {serverAddress: "http://www.e-ardi.com:3700"};
	var myShow = new show(settings);
 
});
