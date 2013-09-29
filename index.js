// var express = require("express");
// var app = express();
// var port = 8800;
 
// app.get("/", function(req, res){
    // res.send("Wow! This is my node!");
// });
 
// app.listen(port);
// console.log("Listening on port " + port);




var dbUsers;



// create user	
// dbConnection.query("INSERT INTO users (email, name, password, created_at, modified_at) VALUES ('mamad@mamad.com', 'Mamad', 'pass123', 1375619235, 1375619235)", function (error, rows, fields) { 
          // console.log("Errors: ", error, "rows:", rows, "fields:", fields);
		  // //dbUsers = rows;
      // });
 

//var users = {ardi:




/* var checkAuth = function(req, res, next){
  if(typeof(req.session.user) === 'undefined') {
    req.session.user = { name: '', pass: '', loggedIn: false }
  }

  if (!req.session.user.loggedIn) {
    // req.session.user.loggedIn = true should be set in the 'login' route, in $R.user.validateLogin
    res.redirect('/login');
  } else {
    // if we already have a req.session.user and they are logged in, keep going
    next();
  }
} */

/* function checkAuth(req, res, next) {
  if (req.session.user_id === undefined) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
} */

// App Routes
/* app.get('/login', function (req, res) {
  var post = req.body;
  if (post.user == 'ardi' && post.password == '1l0v3ard1') {
    req.session.user_id = 1;
    res.redirect('/chat');
  } else {
    res.send('Bad user/pass');
  }
});

app.get('/logout', function (req, res) {
  delete req.session.user_id;
  res.redirect('/login');
}); */      

// Authenticator
// The variables

// App listening (Socket listening to app (express.js) port  


var show = function(options) {
	
	// this.dbSettings = { 
		   // user: "root", 
		   // password: "1l0v3n1ckdata", 
		   // database: "e_ardi"
	// };
	
	this.init = function(options) {
		this.setConfig();
	
		// Setup web socket
		this.setSocketIO();
	};
	
	this.setConfig = function() {
		// Initial app config
		this.setExpress();
		//this.setDB();
		
		// Set view (template engine) to jade
		this.app.set('views', __dirname + '/tpl');
		this.app.set('view engine', "jade");
		this.app.engine('jade', require('jade').__express);
		
		// web root
		this.app.use(this.express.static(__dirname + '/public'));
		
			
		// Defines routes
		this.setRoutes();	
		
		
		
	};
	
	this.setExpress = function(){
		this.express = require("express");
		this.app = this.express();
		this.port = 3700;
	};
	
	// this.setDB = function() {
		// // Set db
		// var mysql = require("mysql"); 
		// this.dbConnection = mysql.createConnection(this.dbSettings); 
	// };
	
	this.setRoutes = function() {
		/* this.app.get('/users', this.checkAuth, function (req, res) {
			res.send(JSON.stringify(dbUsers));
		}); */

		this.app.get('/', function (req, res) {
			res.render("show");
		});
		
		this.app.get('/register', function (req, res) {
			res.render("register");
		});
		
		this.app.get('/login', function (req, res) {
			res.render("login");
		});
		
		this.app.get('/admin', function (req, res) {
			res.render("admin");
		});
		
		// this.app.get('/', function (req, res) {
			// res.redirect("login");
		// });
		
		this.app.post('/auth/register', function (req, res) {
			res.render("page");
		});
		
		this.app.post('/auth/login', function (req, res) {
			res.render("page");
		});

	};
	
	this.setSocketIO = function() {
	// App listening (Socket listening to app (express.js) port  
		this.io = require('socket.io').listen(this.app.listen(this.port));
		var that = this;
		this.io.sockets.on('connection', function (socket) {
			//socket.emit('message', { message: 'welcome to the chat' });
			socket.on('adminChangedContent', function (data) {
				console.log("Server received new Data", data);
				if (data.content !== undefined) 
					that.io.sockets.emit('newContent', data);
				
			});
		});
	};
	
	// this.checkAuth = function() {
		// var users		= [		
								// {name: "ardi", pass: "123456"}, 
								// {name: "atoos", pass: "pass123"}
		// ];                  
		
		// var express = require("express");
		// var basicAuthMessage = 'Restrict area, please identify';
		// var basicAuth;
		// // The function
		// return basicAuth = express.basicAuth(function(username, password) {
		  // for (var index in users) {
			// if (username === users[index].name && password === users[index].pass)
				// return true;
		  // }
		  
		  // return false;
		// }, basicAuthMessage);
	// };
	
	// this.getUsers = function() {
		// // Get users
		// dbConnection.query('SELECT * FROM users;', function (error, rows, fields) { 
          // this.dbUsers = rows;
		// });
		
		// return this.users;
	// }
	
	this.run = function(options) {
		this.init(options);
	};
	
}

var myShow = new show();
myShow.run();


