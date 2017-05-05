var httpRes = require('http');

var options = {
  hostname: 'api.heclouds.com',
  port: 80,
  path: '/devices/5116178',
  method: 'GET',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
	'api-key':'yI5Gc4CQwpi6yb0wXGhSg4BNkMM=',
//  'Content-Length': Buffer.byteLength(postData)
  }
};

var req = httpRes.request(options,(res)=>{
	console.log(`STATUS: ${res.statusCode}`);
	console.log(res.headers);
	res.setEncoding('utf8');
	res.on('data',(chunk)=>{
		var jso = JSON.parse(chunk);
		console.log(`data:${JSON.stringify(jso,null,4)}`);
	});
	res.on('end',()=>{
		console.log("end data!");
	})
	res.on('error',(er)=>{
		console.log(er.message);
	})
})

req.end();