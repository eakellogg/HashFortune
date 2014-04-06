
var fs = require('fs');
var trendingTable;
var leaderBoard;
// create connection to sql database
var mysql = require('mysql');

var db_config = { host : 'hashfortune.com' , user : 'jzerr718_zerr2' , password : 'csGeni01' , database : 'jzerr718_HashFortune' };


var connection;
var formula = require('./javascript/formula.js');



function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          //
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

// type of exports possible
module.exports = {
	createUser   : createUser,
	VerifyCreate : VerifyCreate,
	VerifyLogin  : VerifyLogin,
	serveTagPage : serveTagPage,
	serveBuyHash : serveBuyHash,
    serveSellHash : serveSellHash,
	serveTrending : serveTrending,
	serveFriends : serveFriends,
	serveFriendRequests : serveFriendRequests,
	serveAcceptFriend : serveAcceptFriend,
	serveDeclineFriend : serveDeclineFriend,
	giveHandler : giveHandler,
	serveMyTrending : serveMyTrending,
	servePlayerInfo : servePlayerInfo,
	serveLeaderBoard : serveLeaderBoard,
	setLeaderBoard : setLeaderBoard,
	setTrendingPage : setTrendingPage,
	serveSearchUser : serveSearchUser,
	serveSearchEmail : serveSearchEmail,
	serveLogout  : serveLogout,
	serveChart : serveChart
};

setInterval( setLeaderBoard ,  60 * 1000);
setInterval( setTrendingPage , 60 * 1000 );


function serveChart( message) 
{
	var socket = this;

	//now getting the historical values from the hashTags table
	connection.query( "SELECT dateTime AS time , price FROM hashTags WHERE name = ? " , [ message.tagname] , function (err , rows )
	{
		if( err )
			throw err;
		socket.emit( 'chart_data' , rows );
	});
	
	var username = message.user_name;
	var filename = "./userLogs/" + username + ".txt";
	var output = "Requesting chart for " + message.tagname + " at Time " + new Date() + " \n\n";
	fs.appendFile( filename , output , function ( err ) {
		if( err )
			throw err;
	});
}
function serveLogout( message )
{

	var username = message.user_name;
	socketHandler.removeClient( username );
	
	var convertedCurrentTime = new Date();
	
	/*Not needed in new mechanic but might be interesting data to store? not sure
	connection.query( "UPDATE users SET lastLogout = ? WHERE username = ? " , [ convertedCurrentTime , username] ,
		function ( err , rows )
		{
			if( err )
				throw err;
		}
	);
	*/
	var filename = "./userLogs/" + username + ".txt";
	var output = "loging out  at Time " + new Date() + " \n\n";
    fs.appendFile( filename , output , function ( err ) //The log out time is kinda stored here
	{
		if( err )
			throw err;
	});
}
function serveSearchUser(message)
{
}
function serveSearchEmail(message)
{
}
function setLeaderBoard()
{
		connection.query( "SELECT username , TotalValue FROM users ORDER BY TotalValue DESC LIMIT 10" , 
		function (err , rows )
		{
			if( err)
				throw err;
			leaderBoard = rows;
		});
}


function setTrendingPage()
{

	connection.query( "SELECT name , price FROM hashTags ORDER BY dateTime DESC , price DESC LIMIT 10" , 
	function( err , hashtags )
	{
		if(err) {
			throw err;
		}
		
		trendingTable = hashtags;
	});
}

function giveHandler( handler )
{
	socketHandler = handler;
}

// create a new user account
function createUser( newUser , connection )
{
	// insert new user into the database
	connection.query( "INSERT INTO users ( username , password , email , AvailablePoints) VALUES ( ? , ? , ? , 5000 )" , [ newUser.user_name , newUser.pass_word , newUser.email ] , 
	function( err , blank){
		if( err )  {
			throw err;
		}
	});
	var filename = "./userLogs/" + newUser.user_name + ".txt";
	var output = "Creating user at Time " + new Date() + " \n\n";
			fs.appendFile( filename , output , function ( err ) 
			{
				if( err )
					throw err;
			});
}


// verify the creation of a new account
//TODO should more be done to check a new account besides just checking that its unused?
function VerifyCreate(message)
{
	var user = message.user_name;
	var pass = message.pass_word;
	var email = message.user_email;
	
	
	// search the username
	var clientSocket = this;
	connection.query( 'SELECT username FROM users WHERE username = ? LIMIT 1', [user] , 
	function( err , user_info )
	{
		if(err) {
			throw err;
		}
	
		//The desired user name is unused
		if(  user_info.length == 0 ){			
			var newUser = {};
			newUser.user_name = user;
			newUser.pass_word = pass;
			newUser.email     = email;
			createUser( newUser , connection );
			
			socketHandler.addClient( user , clientSocket );

			var message = {};
			message.cred = "cred";
			message.loc = "homepage.html";
			message.user = user;
			message.pass = pass;
			socketHandler.messageUser( user, 'login_ok' , message	); //Tell the user to log in with new account
		}
		else {
			socketHandler.messageAnonymous( clientSocket , 'warning' , { content: user + " is already in use. " });
		}
	});
	

}

// verify the login of a user

//TODO nothing changed directly here, but the formula it calls in now different 
function VerifyLogin(message) 
{
	var username = message.user_name;
	var password = message.pass_word;
	var clientSocket = this;

	//TODO THIS WILL BE A PROBLEM IF SOMEONE TRIES TO LOG IN AS YOU
	
	socketHandler.addClient( username , clientSocket);
	// search for the username and password of the user in question
	connection.query( "SELECT username, password FROM `users` WHERE username = ? AND password = ? LIMIT 1", [username, password],
	function(err, user_info) {
		if(err) {
			throw err;
		}

		// no user found from the search
		if(user_info.length == 0) {
			
			socketHandler.messageAnonymous( clientSocket , 'login_fail' , "User does not exist" );	
			socketHandler.removeClient( username );
		}
		
		// if the user does exist
		else {
			if(user_info[0].username == username && user_info[0].password == password) {
				
				var returnmessage = {};
				returnmessage.cred = "cred";
				returnmessage.loc = "homepage.html";
				returnmessage.user = username;
				returnmessage.pass = password;	
				socketHandler.messageUser( username, 'login_ok' , returnmessage );
				
				formula.apply( socketHandler , connection , message); //This will change
			}
			else
			{
				socketHandler.messageAnonymous( clientSocket , 'login_fail' , "Password incorrect");
			}
		}
	});
	
	var filename = "./userLogs/" + username + ".txt";
	var output = "Logged in " + new Date() + " \n\n";
	fs.appendFile( filename , output , function ( err ) 
	{
		if( err )
			throw err;
	});
	
}


// update the hashtag page for a specific user
//TODO Need user invested 
function serveTagPage(message)
{
	var username = message.user_name;
	// search for the uninvested points of the user
	connection.query( "SELECT AvailablePoints FROM users WHERE username = ? ", [username] , 
	function( err , user_info )
	{
		if(err) {
			throw err;
		}
		
		// if the user and his/her available points exist
		if( user_info.length > 0 )
		{	
			// create the output with the user's available points incorporated
			var output = { available_points : user_info[0].AvailablePoints , user_invested : 0 , total_invested : 0 , value : 0 } 

			// search for the investment for the user in question
			connection.query( "SELECT shares FROM `Invests` WHERE username = ? AND tagname = ?", [username, message.tag_name], 
			function( err , investment_info )
			{
				if(err) {
					throw err;
				}
					
				// if the investment exists, update the output with the user's current investment	
				if(investment_info.length != 0) {
					output.user_invested = investment_info[0].shares;
				}
				
					connection.query( "SELECT shares, price FROM `Market` WHERE tagname = ?", [message.tag_name], 
					function( err , market_info )
					{
						if(err) {
							throw err;
						}
						
						if(market_info.length != 0) {
							output.total_invested = market_info[0].shares;
							output.value = market_info[0].price;
							
						}
						socketHandler.messageUser( username , 'tag_page' , output );	
					});
				
			});	
		}
	});
	
	var filename = "./userLogs/" + username + ".txt";
	var output = "Asked for tag page  " + message.tag_name + " at Time " + new Date() + " \n\n";
			fs.appendFile( filename , output , function ( err ) 
			{
				if( err )
					throw err;
			});
}


// handle a user's buy operation
function serveBuyHash(message)
{
	if( message.amount > 0 )
	{
	// search for the uninvested points of the user
	connection.query( "SELECT `AvailablePoints` FROM users WHERE username = ?", [message.user_name],
	function(err,user_info) {
		if(err) {
			throw err;
		}
		
		if(user_info.length > 0) {
			//get the value of the shares
			connection.query( "SELECT `price` FROM Market WHERE tagname = ?", [message.tag_name],
			function (err, value_info) { 
				if(err) {
					throw err;
				}
				
				var cost = Math.ceil(value_info[0].price * message.amount);
				var newpoints = user_info[0].AvailablePoints - cost;
				
				// if the new amount would cause amount to go negative - invalid buy
				if(newpoints < 0) {
					var warning = {};
					warning.content = "You do not have the points to make that investment!";
					socketHandler.messageUser(message.user_name, 'warning', warning);
				}
				
				// valid buy operation
				else{
					// search for the investment for the user in question
					connection.query( "SELECT `shares` FROM Invests WHERE username = ? AND tagname = ?", [message.user_name, message.tag_name], 
					function (err, investment_info) { 
						if(err) {
							throw err;
						}
					
						// if the investment already existed
						if(investment_info.length > 0) {
							var oldamount = investment_info[0].shares;
							var newamount = oldamount + message.amount;		  
							connection.query( "UPDATE `Invests` SET shares = ? WHERE username = ? AND tagname = ?", [newamount, message.user_name, message.tag_name],
							function(err, blank) {
								if(err) {
									throw err;
								}
							});
						}
					
						// make new investment
						else {
							// insert new investment into the database
							connection.query( "INSERT INTO Invests ( username, tagname, shares, challengeID) VALUES ( ?, ?, ?, 0 )" , 
							[message.user_name, message.tag_name, message.amount], //Todo hard coded challege value of 0
							function( err , blank){
								if( err ) {
									throw err;
								}
							
							});
							
							
							//Add one to investment count
							connection.query( "UPDATE users SET investCount = (investCount + 1) WHERE username = ? " ,[ message.user_name ] ,
							function ( err , rows )
							{
								if ( err ){
									throw err;
								}
							});
						}
						
					});
					
					//********
					//TODO update value based off of change in shares
					//********
					
					// update the user with the post investment point total
					connection.query( "UPDATE `users` SET AvailablePoints = ? WHERE username = ?", [newpoints, message.user_name],
					function(err, blank) {
						if(err) {
							throw err;
						}
						var update = {};
						update.user_name = message.user_name;
						update.tag_name = message.tag_name;
						serveTagPage(update);
					});
				}
			});
		}	
	});
	}
	else
	{
		socketHandler.messageUser( message.user_name , 'warning' , { content : "You can't buy negative stocks " } );
	}
	
	
	var filename = "./userLogs/" + message.user_name + ".txt";
	var output = "Bought tag  " + message.tag_name + " For " + message.aount + " at Time " + new Date() + " \n\n";
			fs.appendFile( filename , output , function ( err ) 
			{
				if( err )
					throw err;
			});
}


// handle a user's sell operation
function serveSellHash(message)
{
	if( message.amount >= 0)
	{
	// search for the investment for the user in question
	connection.query( "SELECT `shares` FROM Invests WHERE username = ? AND tagname = ?", [message.user_name, message.tag_name], 
	function (err, investment_info) { 
		if(err) {
			throw err;
		}

		// if the investment exists
		if(investment_info.length > 0) {
			var oldamount = investment_info[0].shares;
			var newamount = oldamount - message.amount;

			// if the user has the shares to sell
			if(newamount >= 0) {
				
				connection.query( "UPDATE `Market` SET shares = (shares - ?) WHERE tagname = ?", [message.amount, message.tag_name], 
				function (err, blank) { 
					if(err) {
						throw err;
					}
				});
				
				//*******
				//TODO update value based off of changes in shares
				//*******
				
				// if shares would be left over
				if(newamount > 0) {
					connection.query( "UPDATE `Invests` SET shares = ? WHERE username = ? AND tagname = ?", [newamount, message.user_name, message.tag_name],
					function(err, blank) {
						if(err) {
							throw err;
						}
					});
				}
				
				// if selling entire investment
				if(newamount == 0) {
					connection.query( "DELETE FROM `Invests` WHERE username = ? AND tagname = ?", [message.user_name, message.tag_name],
					function(err, blank) {
						if(err) {
							throw err;
						}
					});	
					connection.query( "UPDATE `users` SET investCount = (investCount -1 ) WHERE username = ?" , [message.user_name],
					function( err , rows )
					{
						if( err )
							throw err;
					});
				}
				
				
				
				connection.query( "SELECT `price` FROM Market WHERE tagname = ?", [message.tag_name],
				function(err, updated_market) {
					if(err) {
						throw err;
					}
					var added_value = Math.ceil(updated_market[0].value * message.amount)
					
					// update the user with the post investment point total
					connection.query( "UPDATE `users` SET AvailablePoints = (? + AvailablePoints) WHERE username = ?", [added_value, message.user_name],
					function(err, blank) {
						if(err) {
							throw err;
						}
								
						var update = {};
						update.user_name = message.user_name;
						update.tag_name = message.tag_name;
						serveTagPage(update);
					});
				});
			}


			// if the user does not have the shares to sell
			else {
				var warning = {};
				warning.content = "You do not have that many stocks to sell!";
				socketHandler.messageUser(message.user_name, 'warning', warning);
			}
		}
		
		// user doesn't own that invest - can't sell
		else {
			var warning = {};
			warning.content = "You do not currently have stocks to sell!";
			socketHandler.messageUser(message.user_name, 'warning', warning);
		}
	});
	}
	else
	{
		socketHandler.messageUser( message.user_name , 'warning' , { content : "You can not sell negative stocks" } );
	}
	
	var filename = "./userLogs/" + message.user_name + ".txt";
	var output = "Sold tag  " + message.tag_name + " For " + message.aount + " at Time " + new Date() + " \n\n";
			fs.appendFile( filename , output , function ( err ) 
			{
				if( err )
					throw err;
			});
}


//Give the requester  the current trending_table
function serveTrending(message) 
{
	var username = message.user_name;
	socketHandler.messageUser( username , 'trending_table' , trendingTable );
}


function serveMyTrending(message ) {

var portfolio_name = message.portfolio_name;

connection.query( "SELECT  Invests.tagname , Invests.shares, price FROM Invests inner join Market on Market.tagname = Invests.tagname WHERE Invests.username = ? " , [portfolio_name] , 
function (err , investments ){
	if( err )
		throw err;
	socketHandler.messageUser( message.user_name,  'my_investments_table' , investments );

});


}


// returns the current time in the appropriate format for the sql database used
function getCurrentTime() {
	var now = new Date();
	now.setHours(now.getHours() - 2);
	now.setMinutes(0);
	now.setSeconds(0);
	return now;
}


function servePlayerInfo(message) {

var portfolio_name = message.portfolio_name;
connection.query( "SELECT username , AvailablePoints , TotalValue FROM users WHERE username = ?" ,
	[ portfolio_name ] , 
	function( err , rows ){
	if( err )
		throw err;
	
	socketHandler.messageUser( message.user_name , 'player_info_table' , rows[0] );
	}
);
}

function serveFriends(message) {
	var username = message.user_name;
	connection.query( "SELECT sender AS Friend, TotalValue FROM friends inner join users on users.username = friends.sender WHERE accepted = 1 AND receiver = ? UNION ALL SELECT receiver AS Friend, TotalValue FROM friends inner join users on users.username = friends.receiver WHERE accepted = 1 AND sender = ?", [username, username] ,
	function (err , friends )
	{
		if(err) {
			throw err;
		}
		console.log(friends);
		socketHandler.messageUser( username, 'friends_table' , friends );
	});
}

function serveFriendRequests(message) {
	var username = message.user_name;
	connection.query( "SELECT sender, receiver FROM friends WHERE accepted = 0 AND receiver = ?", [username] , 
	function (err , requests )
	{
		if(err) {
			throw err;
		}
		socketHandler.messageUser( username, 'friend_request_table' , requests );
	});
}

function serveAcceptFriend(message) {
	var username = message.user_name;
	connection.query( "UPDATE `friends` SET accepted = 1 WHERE sender = ? AND receiver = ?", [message.friend_name, message.user_name],
	function(err, blank) {
		if(err) {
			throw err;
		}
		
		socketHandler.messageUser( username, 'friends_table' , friends );
		socketHandler.messageUser( username, 'friend_request_table' , requests );
	});
}

function serveDeclineFriend(message) {
	var username = message.user_name;
	connection.query( "DELETE FROM `friends` WHERE sender = ? AND receiver = ?", [message.friend_name, message.user_name],
	function(err, blank) {
		if(err) {
			throw err;
		}
		
		socketHandler.messageUser( username, 'friends_table' , friends );
		socketHandler.messageUser( username, 'friend_request_table' , requests );
	});
}

function serveLeaderBoard(message){

	var username = message.user_name;
	socketHandler.messageUser( username , 'leader_board' , leaderBoard );
}
