var express = require("express");
var router = express.Router();
var request = require('request');
router.get("/random/:min/:max", function(req, res) {//random test
	console.log(req)
    var min = parseInt(req.params.min);
    var max = parseInt(req.params.max);
    if (isNaN(min) || isNaN(max)) {
        res.status(400);
        res.json({result:false,error: "参数错误！" });
        return;
    }
    var result = Math.round((Math.random() * (max - min)) + min);
    var rejson={ result:true,data: result }
    if('callback' in req.query)
    {
        res.type('text/javascript');
        res.send(req.query.callback + '(' + JSON.stringify(rejson) + ')');
    }else
    {
        res.json(rejson);
    }
});
router.get("/classAuth", function(req, res) {//ex
	var apiLogin='http://reg.tool.hexun.com/wapreg/checklogin.aspx?format=json&encode=no',
	apiTechInfo='http://test.partner.px.hexun.com/api/partner/get_partnershow_info?partnerId=13798641',
	apiClassInfo='http://test.apilesson.hexun.com/api/classauth/199773?showclassplan=true',
	userToken=escape(req.cookies.userToken),
	result={login:false,teacherId:null,userid:null,username:null,teacherName:null},
    rejson={ result:true,data: result },
    getLogin=new Promise(function  (resolve,reject) {
    	var opt ={
			url:apiLogin,
			method:'post',
    		headers:{ 'content-Type': 'application/json','cookie':userToken}
    	}
	request(opt,function(a,b,c){
	 	resolve(b)
	 }) 
	}),
    getTechInfo=new Promise(function  (resolve,reject) {
	 request.get(apiTechInfo,function(a,b,c){
	 	resolve(b.body)
	 }) 
	}),
    getClassInfo=new Promise(function  (resolve,reject) {
	 request.get(apiClassInfo,function(a,b,c){
	 	resolve(b.body)
	 }) 
	}),
    arrlist=[];
    function re(){
    	if('callback' in req.query)
	    {
	        res.type('text/javascript');
	        res.send(req.query.callback + '(' + JSON.stringify(rejson) + ')');
	    }else
	    {
	        res.json(rejson);
	    }
    }
    Promise.all([getLogin,getTechInfo,getClassInfo]).then(
    	function(results){
    		var data0=JSON.parse(results[0].body),
    		data1=JSON.parse(results[1]),
    		data2=JSON.parse(results[2]);
    		rejson.data={
	    		login:data0.islogin=='True'?true:false,
	    		teacherId:data1.data.data.jobCode||null,
	    		teacherName:data1.data.data.nickname||null,
	    		userId:data0.userid||null,
	    		userName:data0.username||null,
	    		classId:data2.data.classId||null,
				className:data2.data.className||null,
				detail:results[0]
	    	}
	    	re();
    	}
	).catch(
	function(err){
		rejson={ result:false,err: err };re()
	});
});
module.exports = router ;