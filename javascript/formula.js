//formula update

var servercommands;
var fs = require('fs');
module.exports = {
	apply : apply,
	set : set
};

function set( ds )
{
	servercommands = ds;
}

function apply( socketHandler , connection, message )
{
	var username = message.user_name;
	var totalValue = 0;
	
	connection.query( "SELECT SUM(Market.price * Invests.shares) AS sum FROM Invests inner join Market on Market.tagname = Invests.tagname WHERE Invests.username = ? " , [username] , 
	function (err , investments ){
		if( err )
			throw err;
			console.log( investments );
	if( investments.length != 0 ){	
	if( investments[0].sum == null )
		investments[0].sum = 0;
	connection.query( "UPDATE users SET TotalValue = ( ? + AvailablePoints ) WHERE username = ? " , [investments[0].sum, username] , 
	function (err , blank ){
		if( err )
			throw err;
		});
		}
	});
}
