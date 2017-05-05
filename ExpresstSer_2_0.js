var express = require('express')
var app = express();
var api = express(); // the sub app
var bodyParser = require('body-parser');

api.use(bodyParser.json()); // for parsing application/json
api.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.use('/api', api); // mount the sub app
app.use(express.static('public')); // 静态文件
app.set('views', './views') //views, 放模板文件的目录
app.set('view engine', 'jade') //模板引擎


var mysql = require('mysql');
var pool = mysql.createPool({
//	connectionLimit : 100,
	host     : '127.0.0.1',      
	user     : 'lulu', 
	password : 'lu930616',
	port: '3306',
	database:'testDB'
}); 

/*
 普通页面
*/
var datobj = {
title:'Hey',
message: 'Hello there2',
confdata: {
	labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
	datasets: [{
		label: "My First dataset",
		backgroundColor: 'rgb(255, 99, 132)',
		borderColor: 'rgb(255, 99, 132)',
		data: [0,0,0,0,0,0,0],
		fill: false,
	}, 
	{
		label: "My Second dataset",
		backgroundColor: 'rgb(54, 162, 235)',
		borderColor: 'rgb(54, 162, 235)',
		data: [1,1,1,1,1,1,1],
		fill: false,
	}],
	opt:{
		responsive: true,
		title:{
			display:true,
			text:'Chart.js Line Chart'
		},
		tooltips: {
			mode: 'index',
			intersect: false,
		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		scales: {
			xAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Month'
				}
			}],
			yAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Value'
				}
			}]
		}
	}
}
}
  
  
app.get('/', function (req, res) {
  console.log(JSON.stringify(req.headers,null,4))
  //res.send('Hello World')
  

  	pool.getConnection(function (err, conn) {
		if (err) throw err;	
		conn.query("SELECT *,DATE_FORMAT(tm,'%Y-%m-%d')as D,HOUR(TIME(tm))as H FROM `dev_1001` WHERE DATE(tm)>DATE_SUB(CURDATE(),INTERVAL 2 DAY) ORDER BY tm DESC", function(err,rows,fields){
			if(err)	{res.send('{msg:"err",info:"'+err+'"}')}
			else
			{
				if(rows.length>0)
				{
					var senddata = [];
					var dictDT={}
					var dcount=0;
					for (var idx in rows)
					{
						if(!dictDT[rows[idx].D])
							dictDT[rows[idx].D]={0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[],11:[],12:[],13:[],14:[],15:[],16:[],17:[],18:[],19:[],20:[],21:[],22:[],23:[]};
						dictDT[rows[idx].D][Number(rows[idx].H)].push(rows[idx].temperature)
					}
					for (var iDay in dictDT)
					{
						for(var iHour in dictDT[iDay])
						{
							if(dictDT[iDay][iHour])
							{
								senddata.push(dictDT[iDay][iHour][0]) // 一个时间多个数值 暂取第一个 应该取平均值
							}
							else
							{
								senddata.push("")
							}
						}
						datobj.confdata.datasets[dcount].data = senddata
						dcount++
						senddata=[]
					}
					console.log(dictDT);
					
					res.render('index',datobj)
					//res.send('hehe');
				}
				else
				{
					datobj.message="No Data!"
					res.render('index',datobj)
				}
			}
		})
	})
	console.log("dddone")
	
})

/*
 API 接口 /api/?
*/
api.get('/', function (req, res) {

    console.log(JSON.stringify(req.headers,null,4));
	console.log(req.ip);
    console.log(req.get('api-key'));
    console.log(req.query);

//
	pool.getConnection(function (err, conn) {
			if (err) throw err;			
			conn.query('select * from dev_idx WHERE DEVICE_ID='+req.query.deviceid +' AND API_KEY=\''+req.get('api-key')+'\'', function(err,rows,fields){
				if(err)	{return res.send('{msg:"err",info:"'+err+'"}')}
				else
				{
					if(rows.length>0)
					{
						var field = '';
						for (var key in req.query)
						{
							if(key.toUpperCase() !== 'DEVICEID')
							{
								field+=(key.toUpperCase()+'=');
								field+=(req.query[key].toUpperCase()+' AND ');
							}

						}
						field+='1';
						console.log(field);
						
						if(field !== '1')
						{
							var tbName = 'dev_'+req.query.deviceid;
							conn.query('select * from '+tbName+' WHERE '+field, function (err,rowsd,fields){	
								if(err)	{res.send('{msg:"err",info:"'+err+'"}');}
								else
								{
									
									if(rowsd.length>0){
										console.log(rowsd);
										var senddata='';
										for (var idx in rowsd)
										{
											senddata += (JSON.stringify(rowsd[idx],null,4)+"\r\n");
										}
										res.send(senddata);
									}
									else{
										res.send('none');
									}
								
								}

							});
						}
						else{
							res.send('none');
						}
					}
					else
					{
						res.send('{msg:"err",info:"Deny"}');
					}
				
				}
			});
		conn.release();
		//pool.end();
		});
  //console.log(req);
});

api.post('/', function (req, res) {

	console.log(JSON.stringify(req.body,null,4));

    console.log(req.get('api-key'));
    console.log(req.query);
	
	pool.getConnection(function (err, conn) {
		if (err) throw err;	
		conn.query('select * from dev_idx WHERE DEVICE_ID='+req.query.deviceid +' AND API_KEY=\''+req.get('api-key')+'\'', function(err,rows,fields){
			if(err)	{res.send(err)}
			else if(rows.length==0){res.send('{msg:"err",info:"Deny"}');}
			else
			{
				var count=0;
				for(var key in req.body)
				{
					//console.log(key+req.body[key]);
					count++;
				}
				if(count<1)
					return res.send('{msg:"err",info:"body count 0"}');
				// 认证成功
				var field='';
				var value='';
				if(rows[0]['POINT1']){field+=('`'+rows[0]['POINT1']+'`,');value+=('\''+req.body[rows[0]['POINT1']]+'\',');};
				if(rows[0]['POINT2']){field+=('`'+rows[0]['POINT2']+'`,');value+=('\''+req.body[rows[0]['POINT2']]+'\',');};
				if(rows[0]['POINT3']){field+=('`'+rows[0]['POINT3']+'`,');value+=('\''+req.body[rows[0]['POINT3']]+'\',');};
				if(rows[0]['POINT4']){field+=('`'+rows[0]['POINT4']+'`,');value+=('\''+req.body[rows[0]['POINT4']]+'\',');};
				if(rows[0]['POINT5']){field+=('`'+rows[0]['POINT5']+'`,');value+=('\''+req.body[rows[0]['POINT5']]+'\',');};
				if(rows[0]['POINT6']){field+=('`'+rows[0]['POINT6']+'`,');value+=('\''+req.body[rows[0]['POINT6']]+'\',');};
				if(rows[0]['POINT7']){field+=('`'+rows[0]['POINT7']+'`,');value+=('\''+req.body[rows[0]['POINT7']]+'\',');};
				// 此处使用replace还是insert有待思考
				var sqls ='INSERT INTO `dev_'+req.query.deviceid+'` ('+field+'`DATA`) VALUES ('+value+'\''+JSON.stringify(req.body)+'\')';

				console.log(sqls);
				conn.query(sqls, function(err,rows,fields){
					if(err) {res.send('{msg:"err",info:"'+err+'"}');}
					else{res.send('{msg:"ok"}');}
				
				});
				
			}
		});
	});
	
	
	
});

app.listen(3000)
/*

var admin = express(); // the sub app

admin.get('/', function (req, res) {
  console.log(admin.mountpath); // /admin
  res.send('Admin Homepage');
})



app.use('/admin', admin); // mount the sub app
*/