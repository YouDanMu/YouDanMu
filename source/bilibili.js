var Bilibili = {
	var support = {

	function getSign(params,appkey,AppSecret) {

		params['appkey']=appkey;
	    data = "";
	    paras = params.keys();
	    paras.sort();
	    for (para in paras) {
	        if (data !== "") {
	            data += "&";
	        }
	        data += para + "=" + params[para];
	    }
	    //if (AppSecret === undefined) {
	    return data
	    //TODO: we assume AppSecret is always empty
	    

	};


	var getDanmuku = (function() {

	video = {};

	return function(aid,appkey,page,AppSecret,fav,callback) {
		if (page === undefined) {
			page = 1;
		}

	    paras = {'id': GetString(aid),'page': GetString(page)};
	    if (fav !== undefined) {
	        paras['fav'] = fav;
		}	
	    url =  'http://api.bilibili.cn/view?'+ this.GetSign(paras,appkey,AppSecret);
	    //jsoninfo = JsonInfo(url);

	    fetch(url).then(function(response) {
	    			return response.json();
	   			 }).then(function(json)) {
			 		video['aid'] = json['title'];
				    video['guankan'] = json['play']
				    video['commentNumber'] = json['review']
				    video['danmu'] = json['video_review']
				    video['shoucang'] = json['favorites'];
				    video['description'] = json['description']
				    video['cover'] = json['pic'];
				    video['mid'] = json['mid']
				    video['author'] = json['author'];
				    video['page'] = json['pages'];
				    video['date'] = json['created_at'];
				    video['credit'] = json['credit'];
				    video['coin'] = json['coins'];
				    video['spid'] = json['spid'];
				    video['cid'] = json['cid'];
				    video['offsite'] = json['offsite'];
				    video['partname'] = json['partname'];
				    video['src'] = json['src'];
				    video['tid'] = json['tid']
				    video['typename'] = json['typename']
				    video['instant_server'] = json['instant_server'];
	 					//taglist = json['tag'];
	 				callback(video);

	   			 }.then(function(ex) {

	   			 	console.log('error fetching video json');

	   			 });


	};


	};
	this.CommentList = {'comments': {}, 'commentNumber': 0, 'page': 0};


	
	
}) ();



}



Bilibili.support.prototype.fetchDanmuku = (function() {
	return function(cid) {
		url = 'http://comment.bilibili.cn/'+cid+'.xml';
		content = fetch(url).then(function(response) {
							return response.text();
						}).then(function(str) {
							parser = new window.DOMParser();

						})



    	content = zlib.decompressobj(-zlib.MAX_WBITS).decompress(getURLContent(url))
    	return content;
	}

}) ();