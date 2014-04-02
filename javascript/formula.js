//formula update

var servercommands = require('../ServerCommands.js');

module.exports = {
	apply : apply
};

function apply( socketHandler , connection, message )
{
	var username = message.user_name;
	var convertedCurrentTime = new Date();
	convertedCurrentTime.setHours(convertedCurrentTime.getHours() - 2);
	convertedCurrentTime.setMinutes(0);
	convertedCurrentTime.setSeconds(0);
					
	connection.query( "SELECT init.tagname, init.amount AS oldAmount, " + 
						"(SELECT COUNT(*) FROM hashTags WHERE name = " +
						"init.tagname) AS peopleNow, " +
						"init.investorCount AS peoplePst, " + 
						"newTag.count AS tweetsNow, " +
						"oldTag.count AS tweetsPast " + 
						"FROM investments init " +
						"LEFT join hashTags oldTag on (oldTag.dateTime = " +
						"init.timeInvested AND oldTag.name = init.tagname) " +
						"LEFT join hashTags newTag on newTag.name = init.tagname " +
						"WHERE init.username = ? AND newTag.dateTime = ?" , [ username , convertedCurrentTime ] , 
	function (err , rows) {
		if( err ) {
				throw err;
		}
				
		var array = new Array();
		
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
			array[i].newamount = obj.oldAmount + ( obj.peopleNow - obj.peoplePst ) + ( obj.tweetsNow - obj.tweetsPast );
			array[i].tagname   = obj.tagname;
		}
		
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
			query = query + "WHEN ? THEN (SELECT COUNT(*) FROM hashTags WHERE name = ? )\n"
			arguements[ count ] = array[i].tagname;
			count++;
			arguements[ count ] = array[i].tagname;
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
			
			newmessage = {};
			newmessage.user_name = username;
			servercommands.serveMyTrending(newmessage);
		});				
	});	
}
