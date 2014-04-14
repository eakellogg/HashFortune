//Challenge Handler

var mysql = require('mysql');
var db_config = { host : 'hashfortune.com' , user : 'jzerr718_zerr2' , password : 'csGeni01' , database : 'jzerr718_HashFortune' };


var connection;

connection = mysql.createConnection(db_config); 

var curTime = new Date();

var hour = curTime.getHours() -2;
curTime.setSeconds( 0 );
curTime.setMinutes( 0 );
curTime.setHours( hour );


console.log( curTime );

connection.query(  "(SELECT Maxes.id , Entries.username , " +
                   " CASE Entries.value " +
                   " WHEN Maxes.max THEN 1 " +                   
"ELSE 0 END AS win ,  " +
"CASE Entries.value " +
"WHEN Maxes.max THEN Maxes.sum " +
"ELSE 0 END AS amount " +
"FROM " +
"(SELECT * FROM ( " +
"SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = ? ) ) AND (TotalValue = AvailablePoints) " +
"UNION " +
"SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM " +
"ChallengePurses " +
"INNER JOIN  " +
"(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM  " +
"( SELECT * FROM Challenges WHERE endTime = ? ) AS t1  " +
"INNER JOIN  " +
"(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM " +
"`Invests` " +
"INNER JOIN " +
"`Market` " +
"ON Market.tagname = Invests.tagname ) AS t2 " +
"ON t1.id = t2.challengeID " +
"GROUP BY username) AS t3 " +
"ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol) AS Entries " +
"INNER JOIN " +
"(SELECT MAX( value ) AS max , SUM( value ) AS sum , id FROM( " +
"SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = ? ) ) AND (TotalValue = AvailablePoints) " +
"UNION " +
"SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM " +

"ChallengePurses " +
"INNER JOIN  " +
"(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM  " +
"( SELECT * FROM Challenges WHERE endTime = ? ) AS t1  " +
"INNER JOIN  " +
"(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM " +
"`Invests` " +
"INNER JOIN " +
"`Market` " +
"ON Market.tagname = Invests.tagname ) AS t2 " +
"ON t1.id = t2.challengeID " +
"GROUP BY username) AS t3 " +
"ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol " +
"GROUP BY lol.id) AS Maxes " +
"ON Maxes.id = Entries.id) "
 , [ curTime , curTime , curTime , curTime] ,
	function( err, rows )
	{
		if( err )
			throw err;
		if( rows.length!=0)
		{
		console.log( rows );
		var result = createUpdateString( rows );
		var updateString = result.query;
		//console.log( updateString );
		//Okay to be paralel
		//Update
		connection.query( updateString , result.args, function(err ,rows )
		{
			if( err )
				throw err;
			console.log("Finished Update" );
		});
		//Insertion
		result = createInsertionString( rows );
		//console.log( result.query);
		connection.query( result.query, result.args, function(err ,rows )
		{
			if( err )
				throw err;
			console.log("Finished Insertion" );
		});
		//Deletion of challengePurses
		result = createDeletionString( rows );
		console.log( result.query );
		connection.query( result.query , result.args , function(err ,rows )
		{
			if( err )
				throw err;
			console.log("Finished Deletion" );
		});
		
		connection.query( "DELETE FROM Challenges WHERE endTime = ?" , [curTime] , function(err ,rows )
		{
			if( err )
				throw err;
			console.log("Finished Deletion of challenges" );
		});
		}
	});


function createUpdateString( rows )
{
	var query = "UPDATE users SET AvailablePoints = (CASE username "
	var args = new Array();
	for( var i =0; i < rows.length; i++)
	{
		query+= " WHEN ? THEN  AvailablePoints + ?  "; 
		args.push( rows[i].username );
		args.push( rows[i].amount );
	}
	query+= " END ) ";
	
	query+=" , TotalValue = (CASE username ";
	for( var i =0; i < rows.length; i++)
	{
		query+= " WHEN ? THEN (Totalvalue + ? ) "; 
		args.push( rows[i].username );
		args.push( rows[i].amount );
	}
	query+= " END )\n WHERE username IN ( ";
	
	for( var i =0; i < rows.length- 1 ; i++)
	{
		query+= " ? , ";
		args.push( rows[i].username );
	}
	
	query+= " ? )";
	args.push( rows[rows.length - 1].username );
	var result ={};
	result.query = query;
	result.args  = args;
	return result;
	
}

function createInsertionString( rows )
{
	var query = "INSERT INTO Alerts ( username , id , win , amount ) VALUES ";
	var args = new Array();
	for( var i =0; i < rows.length -1; i++)
	{
		query+= " ( ? , ? , ? , ? ) , \n";
		args.push( rows[i].username );
		args.push( rows[i].id );
		args.push( rows[i].win );
		args.push( rows[i].amount );
	}
	var i = rows.length-1;
	query+= " ( ? , ? , ? , ? )\n"
	args.push( rows[i].username );
	args.push( rows[i].id );
	args.push( rows[i].win );
	args.push( rows[i].amount );
	var result ={};
	result.query = query;
	result.args  = args;
	return result;
}

function createDeletionString( rows )
{
	var query = "DELETE FROM ChallengePurses WHERE id IN ( ";
	var args = new Array();
	for( var i = 0; i < rows.length -1; i++){
		
		query += " ? , ";
		args.push( rows[i].id );
	}
	query += " ? )";
	args.push( rows[ rows.length -1 ].id );
	var result ={};
	result.query = query;
	result.args  = args;
	return result;
}



/*
SELECT Challenges.id, username, Totalvalue
FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-13 16:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id


INSERT INTO Alerts ( username , id , amount , win ) 

(SELECT ChallengePurses.username AS username, Challenges.id  AS id, ChallengePurses.Totalvalue AS amount , 1 AS win  FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
INNER JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id);
*/


/*
SELECT Maxes.id , Entries.username , Entries.Totalvalue, Maxes.max FROM
(SELECT Challenges.id, username, Totalvalue
FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id) AS Entries
INNER JOIN
(SELECT  Challenges.id , MAX( TotalValue ) AS max FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id
GROUP BY Challenges.id) AS Maxes
ON Entries.id = Maxes.id



SELECT  Challenges.id , MAX( TotalValue )  AS max , SUM( Totalvalue ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id
GROUP BY Challenges.id
*/



/*

SELECT Maxes.id , Entries.username , Entries.Totalvalue, Maxes.max , Maxes.sum FROM
(SELECT Challenges.id, username, Totalvalue
FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id) AS Entries
INNER JOIN
(SELECT  Challenges.id , MAX( TotalValue )  AS max , SUM( Totalvalue ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id
GROUP BY Challenges.id) AS Maxes
ON Entries.id = Maxes.id

*/


/*
INSERT INTO Alerts ( id , username , win , amount ) 
(SELECT Maxes.id , Entries.username , 
CASE Entries.Totalvalue
WHEN Maxes.max THEN 1
ELSE 0 END AS win , 
CASE Entries.Totalvalue
WHEN Maxes.max THEN Maxes.sum
ELSE 0 END AS amount

FROM
(SELECT Challenges.id, username, Totalvalue
FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id) AS Entries
INNER JOIN
(SELECT  Challenges.id , MAX( TotalValue )  AS max , SUM( Totalvalue ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id
GROUP BY Challenges.id) AS Maxes
ON Entries.id = Maxes.id)









INSERT INTO Alerts ( id , username , win , amount ) 
(SELECT Maxes.id , Entries.username , 
CASE Entries.Totalvalue
WHEN Maxes.max THEN 1
ELSE 0 END AS win , 
CASE Entries.Totalvalue
WHEN Maxes.max THEN Maxes.sum
ELSE 0 END AS amount

FROM
(SELECT Challenges.id, username, Totalvalue
FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id) AS Entries
INNER JOIN
(SELECT  Challenges.id , MAX( TotalValue )  AS max , SUM( Totalvalue ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id
GROUP BY Challenges.id) AS Maxes
ON Entries.id = Maxes.id)






INSERT INTO Alerts ( id , username , win , amount ) 
(SELECT Maxes.id , Entries.username , 
CASE Entries.value
WHEN Maxes.max THEN 1
ELSE 0 END AS win , 
CASE Entries.value
WHEN Maxes.max THEN Maxes.sum
ELSE 0 END AS amount

FROM


(SELECT * FROM (
SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) ) AND (TotalValue = AvailablePoints)
UNION
 SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM

ChallengePurses
INNER JOIN 
(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS t1 
INNER JOIN 
(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM
`Invests`
INNER JOIN
`Market`
ON Market.tagname = Invests.tagname ) AS t2
ON t1.id = t2.challengeID
GROUP BY username) AS t3
ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol) AS Entries





INNER JOIN
(SELECT  Challenges.id , MAX( TotalValue )  AS max , SUM( Totalvalue ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id
GROUP BY Challenges.id) AS Maxes
ON Entries.id = Maxes.id)
*/



/*
Find all current peoples values 


SELECT * FROM(
SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) ) AND (TotalValue = AvailablePoints)
UNION
 SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM

ChallengePurses
INNER JOIN 
(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS t1 
INNER JOIN 
(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM
`Invests`
INNER JOIN
`Market`
ON Market.tagname = Invests.tagname ) AS t2
ON t1.id = t2.challengeID
GROUP BY username) AS t3
ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol


*/















/*

(SELECT Maxes.id , Entries.username , 
CASE Entries.value
WHEN Maxes.max THEN 1
ELSE 0 END AS win , 
CASE Entries.value
WHEN Maxes.max THEN Maxes.sum
ELSE 0 END AS amount

FROM


(SELECT * FROM (
SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) ) AND (TotalValue = AvailablePoints)
UNION
 SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM

ChallengePurses
INNER JOIN 
(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS t1 
INNER JOIN 
(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM
`Invests`
INNER JOIN
`Market`
ON Market.tagname = Invests.tagname ) AS t2
ON t1.id = t2.challengeID
GROUP BY username) AS t3
ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol) AS Entries


INNER JOIN
(SELECT  Challenges.id , MAX( TotalValue )  AS max , SUM( Totalvalue ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS Challenges
JOIN ChallengePurses 
ON Challenges.id = ChallengePurses.id
GROUP BY Challenges.id) AS Maxes
ON Entries.id = Maxes.id)



FULL CHECK

(SELECT Maxes.id , Entries.username , 
CASE Entries.value
WHEN Maxes.max THEN 1
ELSE 0 END AS win , 
CASE Entries.value
WHEN Maxes.max THEN Maxes.sum
ELSE 0 END AS amount

FROM


(SELECT * FROM (
SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = '2014-4-13 16:00:00' ) ) AND (TotalValue = AvailablePoints)
UNION
 SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM

ChallengePurses
INNER JOIN 
(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-13 16:00:00' ) AS t1 
INNER JOIN 
(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM
`Invests`
INNER JOIN
`Market`
ON Market.tagname = Invests.tagname ) AS t2
ON t1.id = t2.challengeID
GROUP BY username) AS t3
ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol) AS Entries


INNER JOIN
(SELECT MAX( value ) AS max , SUM( value ) AS sum , id FROM(
SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) ) AND (TotalValue = AvailablePoints)
UNION
 SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM

ChallengePurses
INNER JOIN 
(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-13 16:00:00' ) AS t1 
INNER JOIN 
(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM
`Invests`
INNER JOIN
`Market`
ON Market.tagname = Invests.tagname ) AS t2
ON t1.id = t2.challengeID
GROUP BY username) AS t3
ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol
GROUP BY lol.id) AS MAXES
ON MAXES.id = Entries.id )









*/
/*
Maxes 

SELECT MAX( value ) AS max , SUM( value ) AS sum , id FROM(
SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) ) AND (TotalValue = AvailablePoints)
UNION
 SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM

ChallengePurses
INNER JOIN 
(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS t1 
INNER JOIN 
(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM
`Invests`
INNER JOIN
`Market`
ON Market.tagname = Invests.tagname ) AS t2
ON t1.id = t2.challengeID
GROUP BY username) AS t3
ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol
GROUP BY lol.id

*/






/*
FINAL CHECK

(SELECT Maxes.id , Entries.username , 
CASE Entries.value
WHEN Maxes.max THEN 1
ELSE 0 END AS win , 
CASE Entries.value
WHEN Maxes.max THEN Maxes.sum
ELSE 0 END AS amount

FROM


(SELECT * FROM (
SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) ) AND (TotalValue = AvailablePoints)
UNION
 SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM

ChallengePurses
INNER JOIN 
(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS t1 
INNER JOIN 
(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM
`Invests`
INNER JOIN
`Market`
ON Market.tagname = Invests.tagname ) AS t2
ON t1.id = t2.challengeID
GROUP BY username) AS t3
ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol) AS Entries


INNER JOIN
(SELECT MAX( value ) AS max , SUM( value ) AS sum , id FROM(
SELECT  username , AvailablePoints AS value , id  FROM ChallengePurses WHERE (id IN ( SELECT id FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) ) AND (TotalValue = AvailablePoints)
UNION
 SELECT ChallengePurses.username , (ChallengePurses.AvailablePoints + t3.sum ) AS value , t3.id  FROM

ChallengePurses
INNER JOIN 
(SELECT username , tagname , challengeID AS id , SUM( price * shares ) AS sum FROM 
( SELECT * FROM Challenges WHERE endTime = '2014-4-12 15:00:00' ) AS t1 
INNER JOIN 
(SELECT Invests.username , Invests.tagname , Invests.challengeID , Invests.shares , Market.price  FROM
`Invests`
INNER JOIN
`Market`
ON Market.tagname = Invests.tagname ) AS t2
ON t1.id = t2.challengeID
GROUP BY username) AS t3
ON (ChallengePurses.username = t3.username AND ChallengePurses.id = t3.id ) ) AS lol
GROUP BY lol.id) AS Maxes
 ON Maxes.id = Entries.id)


*/











