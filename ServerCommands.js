

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
                                          // If you're also serving http, display a 503 error.
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
	giveHandler   : giveHandler,
	serveMyTrending : serveMyTrending,
	servePlayerInfo : servePlayerInfo,
	serveLeaderBoard : serveLeaderBoard,
	setLeaderBoard : setLeaderBoard,
	setTrendingPage : setTrendingPage,
	serveSearchUser : serveSearchUser,
	serveSearchEmail : serveSearchEmail
};

setInterval( setLeaderBoard , 60 * 60 * 60 );
setInterval( setTrendingPage , 60 *60 * 60 );

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
	connection.query( "SELECT name , count FROM hashTags ORDER BY dateTime DESC , count DESC LIMIT 10" , 
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
	connection.query( "INSERT INTO users ( username , password , email , AvailablePoints) VALUES (  ?, ? , ? , 5000 )" , [ newUser.user_name , newUser.pass_word , newUser.email ] , 
	function( err , blank){
		if( err )  {
			throw err;
		}
	});
}


// verify the creation of a new account
//TODO should more be done to check a new account besides just checkng that its unused?
function VerifyCreate(message)
{
	var user = message.user_name;
	var pass = message.pass_word;
	var email = message.user_email;
	
	
	// search the username
	var clientSocket = this;
	connection.query( 'SELECT username FROM users WHERE username = ?', [user] , 
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
function VerifyLogin(message) 
{
	var username = message.user_name;
	var password = message.pass_word;
	var clientSocket = this;

	// search for the username and password of the user in question
	connection.query( "SELECT * FROM `users` WHERE username = ? AND password = ?", [username, password],
	function(err, user_info) {
		if(err) {
			throw err;
		}

		// no user found from the search
		if(user_info.length == 0) {
			
			socketHandler.messageAnonymous( clientSocket , 'login_fail' , "User does not exist" );			
		}
		
		// if the user does exist
		else {
			if(user_info[0].username == username && user_info[0].password == password) {
				socketHandler.addClient( username , clientSocket );
				var returnmessage = {};
				returnmessage.cred = "cred";
				returnmessage.loc = "homepage.html";
				returnmessage.user = username;
				returnmessage.pass = password;	
				socketHandler.messageUser( username, 'login_ok' , returnmessage );
			}
			else
			{
				socketHandler.messageAnonymous( clientSocket , 'login_fail' , "Password incorrect");
			}
		}
	});
	
	formula.apply( socketHandler , connection , message);
}


// update the hashtag page for a specific user
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
			var output = { available_points : user_info[0].AvailablePoints , invested : 0 , total_invested : 0 , players_invested : 0 } 

			// search for the investment for the user in question
			connection.query( "SELECT amount FROM `investments` WHERE username = ? AND tagname = ?", [username, message.tag_name], 
			function( err , investment_info )
			{
				if(err) {
					throw err;
				}
					
				// if the investment exists, update the output with the user's current investment	
				if(investment_info.length != 0) {
					output.invested = investment_info[0].amount;
				}
				
				socketHandler.messageUser( username , 'tag_page' , output );	
			});	
		}
	});
}


// handle a user's buy operation
function serveBuyHash(message)
{
	if( message.amount >= 0 )
	{
	// search for the uninvested points of the user
	connection.query( "SELECT `AvailablePoints` FROM users WHERE username = ?", [message.user_name], 
	function (err, user_info) { 
		if(err) {
			throw err;
		}

		// if the user and his/her available points exist
		if(user_info.length > 0) {
			var oldpoints = user_info[0].AvailablePoints;
			var newpoints = oldpoints - message.amount;
				
			// if the new amount would cause amount to go negative - invalid buy
			if(newpoints < 0) {
				var warning = {};
				warning.content = "You do not have the points to make that investment!";
				socketHandler.messageUser(message.user_name, 'warning', warning);
			}
				
			// valid buy operation
			else{
				// search for the investment for the user in question
				connection.query( "SELECT `amount` FROM investments WHERE username = ? AND tagname = ?", [message.user_name, message.tag_name], 
				function (err, investment_info) { 
					if(err) {
						throw err;
					}
		
					var investTime = getCurrentTime();
					
					// if the investment already existed
					if(investment_info.length > 0) {
						var oldamount = investment_info[0].amount;
						var newamount = parseInt(oldamount) + parseInt(message.amount);		  
						connection.query( "UPDATE `investments` SET amount = ?, timeInvested = ? WHERE username = ? AND tagname = ?", [newamount, investTime, message.user_name, message.tag_name],
						function(err, blank) {
							if(err) {
								throw err;
							}
						});
					}
					
					// make new investment
					else {
					
						// get the current number of investors
						connection.query( "SELECT * FROM investments WHERE tagname = ? LIMIT 1", [message.tag_name], 
						function (err, entry) { 
							if(err) {
								throw err;
							}

							// insert new investment into the database
							connection.query( "INSERT INTO investments ( username, tagname, amount, timeInvested, challengeID, investorCount) VALUES ( ?, ?, ?, ?, 0, ? )" , 
							[message.user_name, message.tag_name, message.amount, investTime, entry.length + 1 ], //Todo hard coded challege value of 0
							function( err , blank){
								if( err ) {
									throw err;
								}
								
							});
							//Add one to investment count
							connection.query( "UPDATE users SET investCount = (investCount + 1 ) WHERE username = ? " ,[ message.user_name ] ,
							function ( err , rows )
							{
								if ( err )
									throw err;
								
							});
						});
					}
				});
			
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
		}	
	});
	}
	else
	{
		socketHandler.messageUser( message.user_name , 'warning' , { content : "You can't buy negative poitns " } );
	}
}


// handle a user's sell operation
function serveSellHash(message)
{
	if( message.amount >= 0)
	{
	// search for the investment for the user in question
	connection.query( "SELECT `amount` FROM investments WHERE username = ? AND tagname = ?", [message.user_name, message.tag_name], 
	function (err, investment_info) { 
		if(err) {
			throw err;
		}

		// if the investment exists
		if(investment_info.length > 0) {
			var oldamount = investment_info[0].amount;
			var newamount = oldamount - message.amount;

			// if the user has the points to sell
			if(newamount >= 0) {
			
				// if points would be left over
				if(newamount > 0) {
				
					var investTime = getCurrentTime();
				
					connection.query( "UPDATE `investments` SET amount = ?, timeInvested = ? WHERE username = ? AND tagname = ?", [newamount, investTime, message.user_name, message.tag_name],
					function(err, blank) {
						if(err) {
							throw err;
						}
					});
				}
				
				// if selling entire investment
				if(newamount == 0) {
					connection.query( "DELETE FROM `investments` WHERE username = ? AND tagname = ?", [message.user_name, message.tag_name],
					function(err, blank) {
						if(err) {
							throw err;
						}
					});	
					connection.query( "UPDATE users SET investCount = (investCount -1 ) WHERE username = ?" , [message.user_name],
					function( err , rows )
					{
						if( err )
							throw err;
					});
				}
					
				// search for the uninvested points of the user
				connection.query( "SELECT `AvailablePoints` FROM users WHERE username = ?", [message.user_name], 
				function (err, user_info) { 
					if(err) {
						throw err;
					}
			
					// if the user exists
					if(user_info.length > 0) {
						var oldpoints = user_info[0].AvailablePoints;
						var newpoints = parseInt(oldpoints) + parseInt(message.amount);
			
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

			// if the user does not have the points to sell
			else {
				var warning = {};
				warning.content = "You do not have that many points to sell!";
				socketHandler.messageUser(message.user_name, 'warning', warning);
			}
		}
		
		// user doesn't own that invest - can't sell
		else {
			var warning = {};
			warning.content = "You do not currently have an investment to sell!";
			socketHandler.messageUser(message.user_name, 'warning', warning);
		}
	});
	}
	else
	{
		socketHandler.messageUser( message.user_name , 'warning' , { content : "You can not sell negative points" } );
	}
}


// search for the top ten trending hashtags (name and count) to return to the requester
function serveTrending(message) 
{
	var username = message.user_name;
	
	// select the name and count of the top ten trending hashtags
	/*
	connection.query( "SELECT name , count FROM hashTags ORDER BY dateTime DESC , count DESC LIMIT 10" , 
	function( err , hashtags )
	{
		if(err) {
			throw err;
		}
			
		socketHandler.messageUser( username , 'trending_table' , hashtags );
	});
	*/
	socketHandler.messageUser( username , 'trending_table' , trendingTable );
}

function serveMyTrending(message)
{
var username = message.user_name;
connection.query( "SELECT investCount FROM users WHERE username = ? ", [username] , function (err ,rows )
{
	if(err)
		throw err;
	var limit = rows[0].investCount;
	connection.query( "SELECT  tagname , amount FROM investments WHERE username = ? LIMIT ?" , [username, limit] , 
	function (err , investments ){
		if( err )
			throw err;
		socketHandler.messageUser( username,  'my_investments_table' , investments );

	});
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

var username = message.user_name;
connection.query( "SELECT username , AvailablePoints , TotalValue FROM users WHERE username = ?" ,
	[ username ] , 
	function( err , rows ){
	if( err )
		throw err;
	
	socketHandler.messageUser( username , 'player_info_table' , rows[0] );
	}
);
}

function serveLeaderBoard(message){

	var username = message.user_name;
	/*connection.query( "SELECT username , TotalValue FROM users ORDER BY TotalValue DESC LIMIT 10" , 
		function (err , rows )
		{
			if( err)
				throw err;
			socketHandler.messageUser( username , 'leader_board' , rows);
		});
		*/
		socketHandler.messageUser( username , 'leader_board' , leaderBoard );
}
