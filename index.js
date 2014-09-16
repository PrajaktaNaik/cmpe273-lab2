var connect = require('connect');
var login = require('./login');

var app = connect();

app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main);

function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.end(login.hello(sid));	
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};

//Set the cookie for first time
function post(request, response) {
	// TODO: read 'name and email from the request.body'
	var email = request.body.email;
	var name = request.body.name;
	console.log(name+email);
	console.log(request.body);
	var newSessionId = login.login(name, email);
	response.setHeader('Set-Cookie','session_id=' + newSessionId);
	response.end(login.hello(newSessionId));
};

// delete the cookie/session id
function del(request, response) {
	console.log("DELETE:: Logout from the server");
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies){
		var sid = cookies['session_id'];
		 login.logout(sid);
		 response.end('Logged out from the server\n');
	}else{
		console.log("Session not found.Cannot delete the cookie");
	}	
};

//update the session id
function put(request, response) {
	console.log("PUT:: Re-generate new seesion_id for the same user");
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) { //if session_id is present in cookies
		var sid = cookies['session_id']; //get the old session id
		var email = login.getEmailId(sid); //get the email and name matching the old session id
		var name = login.getName(sid);
		console.log(email+name);
		var newSessionId = login.login(name, email);
	response.setHeader('Set-Cookie','session_id=' + newSessionId);
	console.log("new session id :"+ newSessionId)
response.end("Re-freshed session id\n");
	}else
	{
		console.log("Session not found.Session not refreshed");
	}
};

app.listen(8000);

console.log("Node.JS server running at 8000...");
