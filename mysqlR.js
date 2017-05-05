
var async = require("async");
var mysql = require('mysql');
var pool = mysql.createPool({
//	connectionLimit : 100,
	host     : '127.0.0.1',      
	user     : 'admin', 
	password : '',
	port: '3316',
	database:'luludb'
}); 




/////////////////////////////////////////////////////////////////////////////////
async.series({
    a: function(callback){
		pool.getConnection(function getcon(err, conn)
		{
			 if (err) console.log("POOL ==> " + err);
			conn.query('select * from student_base', (err,rows,fields)=>{
				if(err)	{
					throw err;
				}else{
					console.log( rows );
					callback(null, 1,11);
				}
			  });
			conn.release();
		});
		console.log('执行 func1');
    },
    b: function(callback){
		pool.end();
		console.log('执行 func2');
		callback(null, 2);
    },
	 c: function(callback){
        setTimeout(function() {
            callback(null, 3);
        }, 100);
		console.log('执行 func3');
    }
}, function(err, results) {
	console.log(results);
    // results is now equal to: {one: 1, two: 2}
});
/*
async.series({
    a: function(callback){
		setTimeout(function(){
			callback(null, 1);
		},2000);
		console.log('执行 func1');
    },
    b: function(callback){
        setTimeout(function() {
            callback(null, 2);
        }, 1100);
		console.log('执行 func2');
    },
	 c: function(callback){
        setTimeout(function() {
            callback(null, 3);
        }, 100);
		console.log('执行 func3');
    }
}, function(err, results) {
	console.log(results);
    // results is now equal to: {one: 1, two: 2}
});



*/