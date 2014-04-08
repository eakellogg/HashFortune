
// connect and get a cookie -- THIS FUNCTION NEEDS ATTENTION
function connectProcedure(message) //TODO 
{

	var userName = getCookie( "user_name" )
	// If you already have logged in let the server know about your new socket
	if( userName )
	{
		var passWord = getCookie( "pass_word");
		socket.emit( "re_establish" , { user_name : userName , pass_word : passWord	} );
		
	var userObj = { user_name : userName , pass_word : passWord	};
	
		if ( firstTime )
		{
			socket.emit( "my_investments_request"        , { user_name : user_name, portfolio_name : user_name });
			socket.emit( "trending_request"        , { user_name : user_name });
			socket.emit( 'leader_request' ,          { user_name : user_name });
			socket.emit( 'friend_table_request' , { user_name : user_name, portfolio_name : user_name });
			firstTime = false;
		}
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
		table2 = table2 + "<tr><td width=50% onMouseOver=\"show_menu('" + message[x].name + "T')\" onMouseOut=\"hide_menu('" + message[x].name + "T')\" >";
		table2 = table2 + "<a onclick=\" rename_page( 'Hashtag Investment' ); document.getElementById('hashtag_name').innerHTML='#' + '" + message[x].name + "'; switch_to_tag('" + user_name + "', '" + message[x].name + "', 0); clear_searches(); hide_all(); document.getElementById('chartdiv').innerHTML=''; socket.emit('chart_request' , { tagname : '" + message[x].name + "', user_name : '" + user_name + "' } ); show_hashtag_page(); \">";
		table2 = table2 + "#" + message[x].name + "</a> <a style=\"display:none; color:black\" id=\"" + message[x].name + "T\" href=\"http://www.urbandictionary.com/define.php?term=" + message[x].name + "\" target=\"_blank\">Urban Dictionary Definition</a> </td><td>" + message[x].count + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("trending").innerHTML=finaltable;
}

function myInvestmentsProcedure(message)
{
	var table1 = "<table width=75%; class='center';> <caption>Investments</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50% onMouseOver=\"show_menu('" + message[x].tagname + "I')\" onMouseOut=\"hide_menu('" + message[x].tagname + "I')\" >";
		table2 = table2 + "<a onclick=\" rename_page( 'Hashtag Investment' ); document.getElementById('hashtag_name').innerHTML='#' + '" + message[x].tagname + "'; switch_to_tag('" + user_name + "', '" + message[x].tagname + "', 0); clear_searches(); hide_all(); document.getElementById('chartdiv').innerHTML=''; socket.emit('chart_request' , { tagname : '" + message[x].tagname + "', user_name : '" + user_name + "' } ); show_hashtag_page(); \">";
		table2 = table2 + "#" + message[x].tagname + "</a> <a style=\"display:none; color:black\"  id=\"" + message[x].tagname + "I\" href=\"http://www.urbandictionary.com/define.php?term=" + message[x].tagname + "\" target=\"_blank\">Urban Dictionary Definition</a> </td><td>" + message[x].amount + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("investments_summary").innerHTML=finaltable;
}

function leaderProcedure(message)
{

	var table1 = "<table width=75%; class='center';> <caption>Leader Board</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%><a onclick=\"rename_page('Portfolio'); hide_all(); show_portfolio('" + message[x].username + "');\"> " + message[x].username + " </ a></td><td>" + message[x].TotalValue + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("leaderboard").innerHTML=finaltable;
}

function playerInfoProcedure(message)
{
	var table1 = "<table width=75%; class='center';> <caption>" + message.username + "</caption>";
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


function friendsProcedure(message)
{
	var table1 = "<table width=75%; class='center';> <caption>Friends</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";

	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		//table2 = table2 + "<tr><td width=50%>" + message[x].Friend + "</td><td>" + message[x].TotalValue + "</td></tr>";
		table2 = table2 + "<tr><td width=50%><a onclick=\"rename_page('Portfolio'); hide_all(); show_portfolio('" + message[x].Friend + "');\"> " + message[x].Friend + " </ a></td><td>" + message[x].TotalValue + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("friends").innerHTML=finaltable;
}

function friendRequestsProcedure(message)
{
	var table1 = "<table width=75%; class='center';> <caption>Friend Requests</caption>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";

	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		table2 = table2 + "<tr><td width=50%>" + message[x].sender + "</td><td width=25%><button type='button' onclick=\"acceptFriend( '"; 
		table2 = table2 + message[x].receiver + "' , '" + message[x].sender + "' );\"> Accept </ button></ td><td width=25%>";
		table2 = table2 + "<button type='button' onclick=\"declineFriend( '" + message[x].receiver + "' , '" + message[x].sender + "' );\"> Decline </ button></ td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("friend_requests").innerHTML=finaltable;
}

// present the user with a warning
function warningProcedure(message)
{
	alert(message.content);
}

