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
	user     : 'admin', 
	password : '',
	port: '3316',
	database:'luludb'
}); 

/*
 普通页面
*/
app.get('/', function (req, res) {
  console.log(JSON.stringify(req.headers,null,4))
  //res.send('Hello World')
  
  var datobj = {
	title:'Hey',
	message: 'Hello there2',
	confdata: {
		labels: ["January", "February", "March", "April", "May", "June", "July"],
		datasets: [{
			label: "My First dataset",
			backgroundColor: 'rgb(255, 99, 132)',
			borderColor: 'rgb(255, 99, 132)',
			data: [10,20,30,25,15,32,28],
			fill: false,
		}, 
		{
			label: "My Second dataset",
			backgroundColor: 'rgb(54, 162, 235)',
			borderColor: 'rgb(54, 162, 235)',
			data: [76,45,43,23,54,23,43],
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

  res.render('index',datobj)
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
				if(err)	{res.send('err')}
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
								if(err)	{res.send('err');}
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
						res.send('Deny!');
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
	for(var key in req.body)
	{
		console.log(key+req.body[key]);
	}

    console.log(req.get('api-key'));
    console.log(req.query);
	
	pool.getConnection(function (err, conn) {
		if (err) throw err;	
		conn.query('select * from dev_idx WHERE DEVICE_ID='+req.query.deviceid +' AND API_KEY=\''+req.get('api-key')+'\'', function(err,rows,fields){
			if(err)	{res.send(err)}
			else if(rows.length==0){res.send('Deny!');}
			else
			{
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
					if(err) {res.send(err);}
					else{res.send('ok');}
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