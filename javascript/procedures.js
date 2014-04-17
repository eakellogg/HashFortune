/* This file contains the functions that provide client-side functionality for recieving messages from the server.
 * Most of the functions create divs in the html, dynamically filling them with information.
 */

//<script src = "/homepageFunction.js"></script>
function connectProcedure(message) //TODO //ChallengeTODO add something that checks which purse you're in and sets that cookie
{
		var userName = getCookie( "user_name" );
	// If you already have logged in let the server know about your new socket
	if( userName )
	{
		var passWord = getCookie( "pass_word");
		var currentChallenge = getCookie ( "challenge_id" );
		force_change_current_challenge( currentChallenge );
		socket.emit( "re_establish" , { user_name : userName , pass_word : passWord	, challenge_id : currentChallenge} );
		
	var userObj = { user_name : userName , pass_word : passWord	};
	
		if ( firstTime )
		{
			socket.emit( 'my_investments_request'        , { user_name : user_name, portfolio_name : user_name, challenge_id : currentChallenge});
			socket.emit( 'trending_request'        , { user_name : user_name });
			socket.emit( 'top_tags_request' 		, {user_name : user_name});
			socket.emit( 'leader_request' ,          { user_name : user_name });
			socket.emit( 'player_info_request' , {user_name : user_name, challenge_id : currentChallenge });
			socket.emit( 'friend_table_request' , { user_name : user_name, portfolio_name : user_name });
			socket.emit( 'challenges_request' , {user_name : user_name}); 
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
function loginProcedure(message)			//ChallengeTODO FIXME -------------------------------------------------
{
	setCookie( "user_name" , message.user , 1);
	setCookie( "pass_word" , message.pass , 1);
	//setCookie( "challenge_id" , message.chall , 1);
	
	var loc = message.loc;
	window.location.replace(loc);
}



// update the user info in the appropriate areas on a hashtag page
function tagProcedure(message) 
{ 
	var total = message.value * message.user_invested;
	document.getElementById("current_value").innerHTML = total;
	document.getElementById("my_uninvested_points").innerHTML= message.available_points;
	document.getElementById("current_stock_count").innerHTML = message.user_invested; 
	document.getElementById("total_shares").innerHTML = message.total_invested;
	document.getElementById("value_per_share").innerHTML = message.value;
	
}


// update the trending hashtags table
function trendingProcedure(message)
{
    var table1 = "<table width=75%; class='center';> <caption>Trending Hashtags</caption> <tr><th>Hashtag Name</th><th>Stock Price</th><tr>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		if (x%2 == 1)
			table2 = table2 + "<tr class=\"alt\">"
		else
			table2 = table2 + "<tr>"
		table2 = table2 + "<td width=50% onMouseOver=\"show_menu('" + message[x].name + "T')\" onMouseOut=\"hide_menu('" + message[x].name + "T')\" >";
		table2 = table2 + "<a onclick=\" rename_page( 'Hashtag Investment' ); current_tag = '" + message[x].name + "'; document.getElementById('hashtag_name').innerHTML='#' + '" + message[x].name + "'; switch_to_tag('" + user_name + "', '" + message[x].name + "', 0); clear_searches(); hide_all(); document.getElementById('chartdiv').innerHTML=''; socket.emit('chart_request' , { tagname : '" + message[x].name + "', user_name : '" + user_name + "' } ); show_hashtag_page(); \">";
		table2 = table2 + "#" + message[x].name + "</a> <a style=\"display:none; color:black\" id=\"" + message[x].name + "T\" href=\"https://twitter.com/search?q=%23" + message[x].name + "\" target=\"_blank\">Twitter Search</a> </td><td>" + message[x].price + "</td></tr>";

	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("trending").innerHTML=finaltable;
}

// update the top hashtags table
function topTagsProcedure(message)
{
    var table1 = "<table width=75%; class='center';> <caption>Top Hashtags</caption> <tr><th>Hashtag Name</th><th>Stock Price</th><tr>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	//console.log("top procedure");
	// fill the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		if (x%2 == 1)
			table2 = table2 + "<tr class=\"alt\">"
		else
			table2 = table2 + "<tr>"
		table2 = table2 + "<td width=50% onMouseOver=\"show_menu('" + message[x].name + "T')\" onMouseOut=\"hide_menu('" + message[x].name + "T')\" >";
		table2 = table2 + "<a onclick=\" rename_page( 'Hashtag Investment' ); current_tag = '" + message[x].name + "'; document.getElementById('hashtag_name').innerHTML='#' + '" + message[x].name + "'; switch_to_tag('" + user_name + "', '" + message[x].name + "', 0); clear_searches(); hide_all(); document.getElementById('chartdiv').innerHTML=''; socket.emit('chart_request' , { tagname : '" + message[x].name + "', user_name : '" + user_name + "' } ); show_hashtag_page(); \">";
		table2 = table2 + "#" + message[x].name + "</a> <a style=\"display:none; color:black\" id=\"" + message[x].name + "T\" href=\"https://twitter.com/search?q=%23" + message[x].name + "\" target=\"_blank\">Twitter Search</a> </td><td>" + message[x].price + "</td></tr>";

	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("top_tags").innerHTML=finaltable;
}

function myInvestmentsProcedure(message) //Changed to have three columns , tagname , #stocks , total value
{
	if (message.length > 0)
	{
		var table1 = "<table width=75%; class='center';> <caption>Investments</caption> <tr><th>Hashtag Name</th><th># of Stocks</th><th>Total Value</th></tr>";
		var table3 = "</table> <BR> <BR>";	
		var table2 = "";
		
		// file the table with the hashtag info received
		for(var x = 0; x < message.length; x++ )
		{
			if( message.price == undefined )
			{
				message.price = 0;
			}
			if (x%2 == 1)
				table2 = table2 + "<tr class=\"alt\">"
			else
				table2 = table2 + "<tr>"
			table2 = table2 + "<td width=50% onMouseOver=\"show_menu('" + message[x].tagname + "I')\" onMouseOut=\"hide_menu('" + message[x].tagname + "I')\" >";
			table2 = table2 + "<a onclick=\" rename_page( 'Hashtag Investment' ); current_tag = '" + message[x].tagname + "'; document.getElementById('hashtag_name').innerHTML='#' + '" + message[x].tagname + "'; switch_to_tag('" + user_name + "', '" + message[x].tagname + "', 0); clear_searches(); hide_all(); document.getElementById('chartdiv').innerHTML=''; socket.emit('chart_request' , { tagname : '" + message[x].tagname + "', user_name : '" + user_name + "' } ); show_hashtag_page(); \">";
			table2 = table2 + "#" + message[x].tagname + "</a> <a style=\"display:none; color:black\"  id=\"" + message[x].tagname + "I\" href=\"https://twitter.com/search?q=%23" + message[x].tagname + "\" target=\"_blank\">Twitter Search</a> </td><td>" + message[x].shares + "</td><td>" + message[x].shares * message[x].price + "</td></tr>";
		}
		var finaltable = table1 + table2 + table3;
		document.getElementById("investments_summary").innerHTML=finaltable;
	}
	else
	{
		//var table1 = "<table width=75%; class='center';> <caption>Investments</caption> <tr><th>Hashtag Name</th><th># Stocks</th><th>Total Value</th></tr>";
		//var table3 = "</table> <BR> <BR>";	
		//var table2 = "";
		//var finaltable = table1 + table2 + table3;
		var finaltable = "<table width=75%; class='center';> <caption>Investments</caption> <tr><th>No current investments.</th></tr></table><BR><BR>";
		document.getElementById("investments_summary").innerHTML=finaltable;
	}
}

function leaderProcedure(message)
{

	var table1 = "<table width=75%; class='center';> <caption>Leader Board</caption><tr><th>Username</th><th>Net Worth</th></tr>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";
	
	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		if (x%2 == 1)
			table2 = table2 + "<tr class=\"alt\">"
		else
			table2 = table2 + "<tr>"
		table2 = table2 + "<td width=50%><a onclick=\"rename_page('Portfolio'); hide_all(); show_portfolio('" + message[x].username + "');\"> " + message[x].username + " </ a></td><td>" + message[x].TotalValue + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("leaderboard").innerHTML=finaltable;
}
function playerInfoProcedure(message) //TODO might need change here
{
	if (true)
	{
		var table1 = "<table width=75%; class='center';> <caption id=\"PICKME\">" + message[0].username + "</caption>";
		var table3 = "</table> <BR> <BR>";	
		var table2 = "";
		console.log(message[0].username);
		var uninvested = message[0].AvailablePoints;
		var total      = message[0].TotalValue;
		var invested   = total - uninvested;

			table2 = table2 + "<tr><td width=50%>Uninvested Points </td><td>" + uninvested + "</td></tr>";
			table2 = table2 + "<tr class=\"alt\"><td width=50%>Value of owned stocks </td><td>" + invested + "</td></tr>";
			table2 = table2 + "<tr><td width=50%>Net Worth </td><td>" + total + "</td></tr>";


		var finaltable = table1 + table2 + table3;
		document.getElementById("player_info").innerHTML=finaltable;
		
	}
	else
	{
		alert("that user is not in the current challenge");
	}
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


function friendsProcedure(message) //No change needed here
{

	var table1 = "<table width=75%; class='center';> <caption>Friends</caption> <tr><th>Username</th><th>Net Worth</th></tr>";
	var table3 = "</table> <BR> <BR>";	
	var table2 = "";

	// file the table with the hashtag info received
	for(var x = 0; x < message.length; x++ )
	{
		if (x%2 == 1)
			table2 = table2 + "<tr class=\"alt\">"
		else
			table2 = table2 + "<tr>"
		table2 = table2 + "<td width=50%><a onclick=\"rename_page('Portfolio'); hide_all(); show_portfolio('" + message[x].Friend + "');\"> " + message[x].Friend + " </ a></td><td>" + message[x].TotalValue + "</td></tr>";
	}

	var finaltable = table1 + table2 + table3;
	document.getElementById("friends").innerHTML=finaltable;
}

function friendRequestsProcedure(message)
{
	
	if (message.length != 0)
	{
		var table1 = "<table width=75%; class='center';> <caption>Friend Requests</caption>";
		var table3 = "</table> <BR> <BR>";	
		var table2 = "";
		
		// file the table with the friend info received
		for(var x = 0; x < message.length; x++ )
		{
			if (x%2 == 1)
			table2 = table2 + "<tr class=\"alt\">"
		else
			table2 = table2 + "<tr>"
			table2 = table2 + "<td width=50%>" + message[x].sender + "</td><td width=25%><button type='button' onclick=\"acceptFriend( '"; 
			table2 = table2 + message[x].receiver + "' , '" + message[x].sender + "' );\"> Accept </ button></ td><td width=25%>";
			table2 = table2 + "<button type='button' onclick=\"declineFriend( '" + message[x].receiver + "' , '" + message[x].sender + "' );\"> Decline </ button></ td></tr>";
		}

		var finaltable = table1 + table2 + table3;
	}
	else{
		var finaltable="";
	}
	
	document.getElementById("friend_requests").innerHTML=finaltable;
}

function friendButtonProcedure(message)
{
	var button = "";
	if(message.result) {
		button = button + "<button type=\"button\" onclick=\"send_friend_request('" + user_name + "','" + message.friend +"'); show_portfolio('" + message.friend  + "'); \"/> Add Friend </button>";
	}
	else {
		button = button + "<button type=\"button\" onclick=\"remove_friend('" + user_name + "','" + message.friend +"'); show_portfolio('" + message.friend  + "'); \"/> Remove Friend </button>";
	}
	document.getElementById("friend_button").innerHTML=button;
}

function userSearchProcedure(message)
{
	hide_all();
	show_portfolio(message.portfolio_name);
}

// present the user with a warning
function warningProcedure(message)
{
	alert(message.content);
}

function chartProcedure(message){

	chartData = message;
	var chart = new AmCharts.AmSerialChart();
	chart.dataProvider = chartData;
	chart.categoryField = "time";
	
	
	var chartScrollbar = new AmCharts.ChartScrollbar();
	chart.addChartScrollbar(chartScrollbar);
	
	var graph = new AmCharts.AmGraph();
	graph.valueField = "price"; //This changed to a tags stock value at each time
	graph.type = "line";
	
	chart.addGraph(graph);
	
	var categoryAxis = chart.categoryAxis;
	categoryAxis.autoGridCount  = true;
	categoryAxis.gridPosition = "start";
	categoryAxis.labelRotation = 90;
	
	graph.type = "line";
	graph.lineColor = "#003300";
	graph.fillAlphas = 0; // or delete this line, as 0 is default
	//graph.bullet = "round";
	//graph.lineColor = "#8d1cc6"
	
	chart.write('chartdiv');
}

function challengesProcedure(message) {			// ChallengeTODO this is where the toolbar will actually be created
	//create the normal one
	var table1 = "<table id=\"challenge_toolbar_table\">";
	var table3 = "</table>";
	var table2 = "<tr><td class=\"pointable_toolbar\" id = \"challenge0\" onclick = \" change_current_challenge(" + message[message.length-1].id + ");  \">";
	table2 = table2 + "<b>Main Account</b> <br>Available: " + message[message.length - 1].AvailablePoints + "<br>Total: " + message[message.length - 1].TotalValue + "</td></tr>";
	
	var limit = 9;
	if (message.length < 10)
	{
		limit = message.length - 1;
	}
	
	for (var x = 0; x < limit; x++)
	{
		if( message[x].status == 1 || message[x].status == 2 )		//take 1 out - means hasn't start
		{
			table2 = table2 + "<tr class = \"pointable_toolbar\" id = challenge" + message[x].id + " onclick = \" change_current_challenge(" + message[x].id + "); \">";
			table2 = table2 + "<td> <b>" + message[x].name + "</b> <br>Available: " + message[x].AvailablePoints + "<br>Total: " + message[x].TotalValue + "<br>";
			if (message[x].status == 1)
				table2 += "Starts: " + message[x].startTime;
			else
				table2 = table2 + "<div id=\"" + message[x].endTime + "\" name=\"countdown\"/></td></tr>";
		}
		
	}
	
	var finaltable = table1 + table2 + table3;
	document.getElementById("challenge_toolbar").innerHTML=finaltable;
	
	
	
	var table = "<p><b>Howdy! Challenges are currently under construction and in Beta testing.  " +  
			"We would appreciate it if you don't try them out until we have them working properly.  Thanks!</b></p>" +
			"<table wide = 75%; class='center'; id='centered'> " +
            "<caption id ='caption'> Current Challenges</caption> " +
			"<tr>" +
			"<th>Challenge Name</th>" +
			"<th>Players</th>" +
    	   "	<th>Initial Investment</th>" +
		   "    <th>Status</th>"+
    	   " </tr> ";

		for( var i =0 ; i < message.length-1; i++ )
		{
			if (i%2 == 1)
				table = table + "<tr class=\"alt\">"
			else
				table = table + "<tr>"
			table += "<td>" + message[i].name + " </td><td> " + message[i].playerCount + 
			"</td><td> " + message[i].wager + " </td><td> ";
			if(message[i].status == 0)
			{
				table += "<button type='button' onclick='acceptChallenge( \"" + user_name + "\" , \"" + message[i].id + "\", \"1\");'>Accept</ button>";
				table += "<button type='button' onclick='acceptChallenge( \"" + user_name + "\" , \"" + message[i].id + "\", \"0\");'>Decline</ button>";
			}
			else if (message[i].status == 1)
				table += "Starts: " + message[i].startTime;
			else
				table += "<div id=\"" + message[i].endTime + "\" name=\"countdown\"/>";
			table += " </td></tr>";
		}
		table+= "</table>"
		
		document.getElementById("challenge_home").innerHTML=table;
	
	var counters = document.getElementsByName("countdown");
	for (i = 0; i < counters.length; i++)
	{
		createCountdown(counters[i].id);
		alert(counters[i].id);
	}
	
}

function createCountdown(id)
{
	var countdown = document.getElementById(id);
	var end = id;
	var target = new Date();
	target.setFullYear(parseInt(end.substring(0,4)));
	target.setMonth(parseInt(end.substring(5,7)) - 1);		//the -1 is needed... not sure why...
	target.setDate(parseInt(end.substring(8,10)));
	target.setHours(parseInt(end.substring(11,13)));
	target.setMinutes(parseInt(end.substring(14,16)));
	target.setSeconds(parseInt(end.substring(17,19)));
	var end_time = target.getTime();
	
	var days, hours, minutes, seconds;
	
	setInterval(function() {
	
		var now = new Date();
		var curr_time = now.getTime();
		var seconds_left = (end_time - curr_time) / 1000;
		
		if (seconds_left > 0)
		{
			days = parseInt(seconds_left / 86400);
			seconds_left = seconds_left % 86400;
			
			hours = parseInt(seconds_left / 3600);
			seconds_left = seconds_left % 3600;
			
			minutes = parseInt(seconds_left / 60);
			seconds = parseInt(seconds_left % 60);
			countdown.innerHTML = hours + ":" + minutes + ":" + seconds + " remaining";
		}
		else
		{
			countdown.innerHTML = "Challenge isn't going";
			//return;
		}
	}, 1000);
	
}
