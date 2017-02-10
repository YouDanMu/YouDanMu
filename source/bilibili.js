var Bilibili = {

	bilibiliAppKey = '03fc8eb101b091fb';

	var CommentList = {'comments': [], 'commentNumber': 0, 'pid': 0};
	var support = {
		function getSign(params,appkey,AppSecret) {

			params['appkey']=appkey;
		        data += para + "=" + params[para];
		    data = "";
		    paras = Object.keys(params);
		    paras.sort();
		    for (para in paras) {
		        if (data !== "") {
		            data += "&";
		        }
		    }
		    //if (AppSecret === undefined) {
		    return data
		    //TODO: we assume AppSecret is always empty
		};

		var getVideoInfo = (function() {

			var video = {};

			return function(aid,appkey,page,AppSecret,fav) {
				if (page === undefined) {
					var page = 1;
				}

			    paras = {'id': GetString(aid),'page': GetString(page)};
			    if (fav !== undefined) {
			        paras['fav'] = fav;
				}	
			    var url =  'http://api.bilibili.cn/view?'+ this.GetSign(paras,appkey,AppSecret);
			    //jsoninfo = JsonInfo(url);

			    return fetch(url).then(function(response) {
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
			 				return video;

			   			 }.then(function(ex) {

			   			 	console.log('error fetching video json');

			   			 });
			};
		}) ();
		
		var getDanmuku = function(cid) {
			var url = 'http://comment.bilibili.cn/'+cid+'.xml';
			var content;
			return fetch(url).then(function(response) {
							return response.text();
						}).then(function(str) {
							var parser = new window.DOMParser();
							var content = parser.parseFromString(str, "application/xml");
							return content;
						}).then(function(ex)) {
							console.log(ex);
						}
		}

		var parseDanmuku = function (dom) {


				var comments = [];
   				var comment_element = dom.getElementsByTagName('d');
   				var i = -1;
    			for (comment in comment_element){
    				i++;
    				try{
	            		var p = str(comment.getAttribute('p')).split(',');
	           			assert(len(p) >= 5);
	            		assert(p[1] === '1' || p[1] === '4' || p[1] === '5' || p[1] === '6' || p[1] === '7');
	            		if (p[1] !== '7') {
	               			var c = comment.childNodes[0].nodeValue.replace('/n', '\n');
	                		var size = parseInt(p[2]);
	                		comments.push.apply( {'time': parseFloat(p[0]), 'timeStamp': parseInt(p[4]), 'index': i, 'content' : c, 
	                							'type': {'1': 0, '4': 2, '5': 1, '6': 3}[p[1]], 
	                							'color': parseInt(p[3]), 'size': size} );
	                	} else {
	                		var c = comment.childNodes[0].nodeValue;
	               			comments.push.apply( {'time': parseFloat(p[0]), 'timeStamp': parseInt(p[4]), 'index': i, 'content': c, 'type': 7, 
	               				'color': parseInt(p[3]), 'size': size} );
	               		}
	               		//FORMAT: {Time, UNIX timestamp, Index of Dammuku ,Content ,Type, Color, Size }

           			} catch(e) {
           				continue;
           			}
				}	
				return {comments,Object.keys(comment_element).length};
		}

	var GetDanmakuByAvID(avid, pid) {
		var videoInfo = support.getVideoInfo(avid,bilibiliAppKey,pid,undefined,undefined);
		var danmuXml = support.getDanmuku(videoInfo['cid']);
		var danmukuObject = support.parseDanmuku(danmuXml);
		CommentList['comments'] = danmukuObject[0];
		CommentList['pid'] = pid;
		CommentList['commentNumber'] = danmukuObject[1];

		return CommentList;


	}

}