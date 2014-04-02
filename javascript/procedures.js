
// connect and get a cookie -- THIS FUNCTION NEEDS ATTENTION
function connectProcedure(message) //TODO 
{

	var userName = getCookie( "user_name" )
	// If you already have logged in let the server know about your new socket
	if( userName )
	{
		var passWord = getCookie( "pass_word");
		socket.emit( "re_establish" , { user_name : userName , pass_word : passWord	} );
 		//socket.emit( "login"        , { user_name : userName , pass_word : passWord	} );
		
		var userObj = { user_name : userName , pass_word : passWord	};
		//THIS SHOULD NOT HAPPEN HERE EVERY TIME IN THE LONG RUN ONLY WHEN NEEDED BUT FOR NOW IS OKAY
		socket.emit( "trending_request"        , userObj );
		socket.emit( "my_investments_request"     , userObj );
		socket.emit( 'leader_request' , userObj  );
		socket.emit( 'player_info_request' , userObj );

	}
	else
	{
	
		if( window.location.pathname != "/index.html")
			window.location.replace("index.html");
	
	}
	
}


// handle a login
function loginProcedure(message)
{
	setCookie( "user_name" , message.user , 1);
	setCookie( "pass_word" , message.pass , 1);
	
	var loc = message.loc;
	window.location.replace(loc);
}



// update the user info in the appropriate areas on a hashtag page
function tagProcedure(message) 
{
	document.getElementById("my_invested_points").innerHTML = message.invested;
	document.getElementById("my_uninvested_points").innerHTML=message.available_points;
	document.getElementById("total_investors").innerHTML= message.players_invested;
	document.getElementById("total_invested_points").innerHTML= message.total_invested;
}


// update the trending hashtags table
function trendingProcedure(message)
{
    var table1 = "<table width=75%; class='center';> <caption>Trending Hashtags</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%>#" + message[x].name + "</td><td>" + message[x].count + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("trending").innerHTML=finaltable;
}

function myInvestmentsProcedure(message)
{
	var table1 = "<table width=75%; class='center';> <caption>Your Investments</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%>#" + message[x].tagname + "</td><td>" + message[x].amount + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("investments_summary").innerHTML=finaltable;
	document.getElementById("investments_all").innerHTML=finaltable;
}

function leaderProcedure(message)
{

	var table1 = "<table width=75%; class='center';> <caption>Leader Board</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%>" + message[x].username + "</td><td>" + message[x].TotalValue + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("leaderboard").innerHTML=finaltable;
}

function playerInfoProcedure(message)
{
	var table1 = "<table width=75%; class='center';> <caption>Player Info</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	var uninvested = message.AvailablePoints;
	var total      = message.TotalValue;
	var invested = total - uninvested;
		
		table2 = table2 + "<tr><td width=50%>UninvestedPoints </td><td>" + uninvested + "</td></tr>";
		table2 = table2 + "<tr><td width=50%>InvestedPoints </td><td>" + invested + "</td></tr>";
		table2 = table2 + "<tr><td width=50%>Net Worth </td><td>" + total + "</td></tr>";
	

	var finaltable = table1 + table2 + table3;
	document.getElementById("player_info").innerHTML=finaltable;
}

function userProcedure(message)
{
	var table1 = "<table style=border:0px solid black;>";
	var table2 = "";
    var table3 = "</table> <BR> <BR>";
    
    for (var x = 0; x < message.length; x++ )
    {
    	table2 = table2 + "<tr><td>" + message[x] + "</td></tr>";
    	//maybe also add a button to go to their profile
    }
    
    var finaltable = table1 + table2 + table3;
    document.getElementById("user_search_results").innerHTML = finaltable;
}


// present the user with a warning
function warningProcedure(message)
{
	alert(message.content);
}

