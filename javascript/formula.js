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
	var convertedCurrentTime = new Date();
	
	convertedCurrentTime.setHours(convertedCurrentTime.getHours() - 2);
	convertedCurrentTime.setMinutes(0);
	convertedCurrentTime.setSeconds(0);
	connection.query( "SELECT LastLogout FROM users WHERE username = ? " , [ username ] ,
		function (err , rows )
		{
			if( err )
				throw err;

		var min15 =1000*60*15;
		
		var timediff;
		timediff = 2;
		if( rows.length != 0 )
		{
		// Convert both dates to milliseconds
		//var date1_ms = rows[0].LastLogout.getTime();
		//var date2_ms = convertedCurrentTime.getTime();
		// Calculate the difference in milliseconds
		//var difference_ms = date2_ms - date1_ms;
		// Convert back to days and return
		//timediff =  difference_ms/min15;
		//	console.log( timediff );
		}
			if (true )
			{





	
	connection.query( "SELECT init.tagname, init.amount AS oldAmount, " + 
						"(SELECT COUNT(*) FROM investments WHERE tagname = " +
						"init.tagname) AS peopleNow, " +
						"init.investorCount AS peoplePst, " + 
						"newTag.count AS tweetsNow, " +
						"oldTag.count AS tweetsPast " + 
						"FROM investments init " +
						"LEFT join hashTags oldTag on (oldTag.dateTime = " +
						"init.timeInvested AND oldTag.name = init.tagname) " +
						"LEFT join hashTags newTag on (newTag.name = init.tagname AND newTag.dateTime = ?)" +
						"WHERE init.username = ?" , [ convertedCurrentTime , username ] , 
	function (err , rows) {
		if( err ) {
				throw err;
		}		
		var array = new Array();
		var newTotalValue = 0;
		
		
		if( rows.length > 0 )
		{
			for( var i =0; i < rows.length; i++)
			{
				var obj = rows[i];
				
				if( obj.oldAmount == 'NULL' ) {
					obj.oldAmount = 0;
				}
				if( obj.peopleNow == 'NULL' ) {
					obj.peopleNow = 0;
				}
				if( obj.peoplePst == 'NULL' ) {
					obj.peoplePst = 0;
				}
				if( obj.tweetsNow == 'NULL' ) {
					obj.tweetsNow = 0;
				}
				if( obj.tweetsPast == 'NULL' ) {
					obj.tweetsPast = 0;
				}
				
				array[i]  =  {};
				array[i].newamount = obj.oldAmount + Math.floor(Math.pow( obj.peopleNow - obj.peoplePst, 2 )) + (obj.oldAmount/100)*( obj.tweetsNow - obj.tweetsPast );
				if( array[i].newamount < 0 )
					array[i].newamount = 0;
				array[i].tagname   = obj.tagname;
				array[i].peopleNow = obj.peopleNow;
				
				newTotalValue += array[i].newamount;
			}
			var output = {};
			output = "Updating player " + username + " at time " + new Date() + " \nThe rows recieved from the query \n";
			for( var i =0; i < rows.length; i++)
			{
				output += "tagname: " + rows[i].tagname  + "\n" +
				"OldAmount " + rows[i].oldAmount + " newAmount " + array[i].newamount + 
				"\npeopleNow " + rows[i].peopleNow + " peoplePst " + rows[i].peoplePast + 
				"\ntweetsNow " + rows[i].tweetsNow + " tweetsPast " + rows[i].tweetsPast + " \n\n";
			}

			var filename = "./userLogs/" + username +  ".txt";
		    fs.appendFile( filename , output , function ( err ) 
			{
				if( err )
					{
						throw err;
					}
			});
			
			var query = "UPDATE investments SET amount = CASE tagname\n";
			var arguements = new Array(); var count = 0;
			
			for( var i =0; i < array.length; i++)
			{	
				query = query + "WHEN ? THEN ? \n";
				arguements[ count ] = array[i].tagname;
				count++;
				arguements[ count ] = array[i].newamount;
				count++;
			}
			
			query = query + "END,\n";
			query = query + "investorcount = CASE tagname \n";
			
			for( var i =0; i < array.length; i++)
			{
				query = query + "WHEN ? THEN ?\n"
				arguements[ count ] = array[i].tagname;
				count++;
				arguements[ count ] = array[i].peopleNow;
				count++;
			}
			
			query = query + "END,\n"
			query = query + "timeInvested = ? WHERE username = ? AND tagname IN ( ";
			arguements[ count ] = convertedCurrentTime;
			count++;
			arguements[ count ] = username;
			count++;
			
			for( var i =0; i < array.length- 1; i++)
			{
				query = query + "? , ";
				arguements[ count ] = array[i].tagname;
				count++;
			}
			
			query = query + "? ) \n";
			arguements[ count ] = array[array.length-1].tagname;
			count++;

			connection.query( query , arguements, 
			function(err , rows ) { 			
				if(err) {
					throw err; 
				}
			});
		}	
		
		connection.query( "UPDATE users SET TotalValue = (? + availablePoints) WHERE username = ?" , [ newTotalValue , username ] , 
		function (err , rows) {
			if( err) {
				throw err;
			}
			newmessage = {};
			newmessage.user_name = username;
			servercommands.serveMyTrending(newmessage);
		});
	});	
}
else
{
	newmessage = {};
	newmessage.user_name = username;
	servercommands.serveMyTrending(newmessage);
}});
}
