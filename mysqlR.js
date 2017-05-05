
var Step = require('step');
var mysql = require('mysql');
var pool = mysql.createPool({
//	connectionLimit : 100,
	host     : '127.0.0.1',      
	user     : 'admin', 
	password : '',
	port: '3316',
	database:'luludb'
}); 

function getcon(err, conn)
{
	 if (err) console.log("POOL ==> " + err);
	conn.query('select * from student_base', (err,rows,fields)=>{
		if(err)	{
			throw err;
		}else{
			console.log( rows );
		}
	  });
	conn.release();
pool.end();
}

//pool.getConnection(getcon);

Step(
		function(result,entire){
		 
		  console.log(result); // undefined
		  console.log(entire); // []
		  var that =this;
		  setTimeout(function(){
			that.step('abc');
		  },1000);
		 
		},function(result,entire){
		 
		  console.log(result); // 'abc' 
		  console.log(entire); // ['abc']  
		  return 123; //return ::返回一个非undefined的值，和调用this.step();效果相同
		  /*注意：如果未返回数据，或者未调用this.step()，将会中断回调的执行，后面的回调都不会执行！！！*/
		 
		},function(result,entire){
		 
		  console.log(result); // 'abc'  ::此值为上一个回调执行的结果
		  console.log(entire); // ['abc', 123]  ::此值为历史所有回调执行结果按次序组成的数组
		  var that=this;
		  setTimeout(function(){
			that.step({abc:123});
			console.log(that.index); //that.index为一个整数，代表回调被调用的次序，而不是返回结果的次序。
		  },200);
		 
		},function(result,entire){
		 
		  console.log(result); // {abc:123}
		  console.log(entire); // [ 'abc', 123, { abc: 123 } ]
		 
		}
);


