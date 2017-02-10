/* If the injection succeeded, this line should print to the console. */
console.log('__MSG_YDM_welcome_log__');

(function(e){var t="的一是在不了有和人这中大为上个国我以要他时来用们生到作地於出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进著等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又麼利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较长将组见计别她手角期根论运农指几九区强放决西被乾做必战先回则任取据处队南给色光门即保治北造百规热领七海地口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严首底液官德调随病苏失尔死讲配女黄推显谈罪神艺呢席含企望密批营项防举球英氧势告李台落木帮轮破亚师围注远字材排供河态封另施减树溶怎止案言士均武固叶鱼波视仅费紧爱左章早朝害续轻服试食充兵源判护司足某练差致板田降黑犯负击范继兴似余坚曲输修的故城夫够送笑船占右财吃富春职觉汉画功巴跟虽杂飞检吸助升阳互初创抗考投坏策古径换未跑留钢曾端责站简述钱副尽帝射草冲承独令限阿宣环双请超微让控州良轴找否纪益依优顶础载倒房突坐粉敌略客袁冷胜绝析块剂测丝协重诉念陈仍罗盐友洋错苦夜刑移频逐靠混母短皮终聚汽村云哪既距卫停烈央察烧迅行境若印洲刻括激孔搞甚室待核校散侵吧甲游久菜味旧模湖货损预阻毫普稳乙妈植息扩银语挥酒守拿序纸医缺雨吗针刘啊急唱误训愿审附获茶鲜粮斤孩脱硫肥善龙演父渐血欢械掌歌沙著刚攻谓盾讨晚粒乱燃矛乎杀药宁鲁贵钟煤读班伯香介迫句丰培握兰担弦蛋沉假穿执答乐谁顺烟缩征脸喜松脚困异免背星福买染井概慢怕磁倍祖皇促静补评翻肉践尼衣宽扬棉希伤操垂秋宜氢套笔督振架亮末宪庆编牛触映雷销诗座居抓裂胞呼娘景威绿晶厚盟衡鸡孙延危胶还屋乡临陆顾掉呀灯岁措束耐剧玉赵跳哥季课凯胡额款绍卷齐伟蒸殖永宗苗川妒岩弱零杨奏沿露杆探滑镇饭浓航怀赶",n="，，，，。",r=t.length,i=n.length,s=10,o=50,e=e||window;e.lorem=function(e,u){var u=u||{},a=typeof u.usePunc=="undefined"?!0:u.usePunc,f=[],e=parseInt(e)||10,l=0,c,h=0,p=Math.floor(Math.random()*(o-s))+s;while(l<e)c=Math.floor(Math.random()*r),a&&h==p&&s<e-l?(f.push(n.charAt(Math.floor(Math.random()*i))),p=Math.floor(Math.random()*(o-s))+s,h=0):f.push(t.charAt(c)),h++,l++;return a&&f.push("。"),f.join("")}})();

function log() {
    if (true) {
        console.log.call(this, arguments);
    }
}

function setStyles(dom, styles) {
    var key, value;
    for (key in styles) {
        value = styles[key];
        dom.style[key] = value;
    }
}

function YDM() {
    this.dom = {};
}

YDM.prototype.init = (function () {
    return function () {
        log('YDM.init');
        var overlay = document.getElementById('ydm-overlay');
        var movie_player = document.getElementById('movie_player');
        if (overlay != null || movie_player == null) return;
        this.dom['movie_player'] = movie_player;
        overlay = this.dom['overlay'] = document.createElement('div');
        overlay.id = 'ydm-overlay';
        movie_player.appendChild(overlay);
    };
})();

YDM.prototype.addDanmu = (function () {
    function removeDanmu() {
        this.remove();
    }
    return function (text, top) {
        var danmu = document.createElement('div');
        danmu.classList.add('ydm-danmu');
        danmu.style.top = top;
        
        var hiddenText = document.createElement('span');
        hiddenText.classList.add('ydm-danmu-hidden-text');
        hiddenText.innerText = text;

        var displayText = document.createElement('span');
        displayText.classList.add('ydm-danmu-text');
        displayText.innerText = text;
        danmu.appendChild(hiddenText);
        danmu.appendChild(displayText);
        danmu.addEventListener('animationend', removeDanmu, false);
        this.dom['overlay'].appendChild(danmu);
    };
})();

YDM.prototype.pause = function () {
    this.dom['overlay'].classList.add('paused');
};

YDM.prototype.resume = function () {
    this.dom['overlay'].classList.remove('paused');
};

(function () {
    var randomInterval = null;
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function randomAdd() {
        ydm.addDanmu(lorem(randomInt(5,30)), randomInt(0,90).toString() + '%');
    }
    YDM.prototype.randomResume = function () {
        if (randomInterval != null) return;
        this.resume();
        randomInterval = setInterval(randomAdd, 1000);
    };
    YDM.prototype.randomPause = function () {
        if (randomInterval == null) return;
        clearInterval(randomInterval);
        this.pause();
        randomInterval = null;
    };
})();

window.ydm = new YDM();

document.addEventListener('DOMContentLoaded', function () {
    log('DOMContentLoaded');
    var oldReady = window.onYouTubePlayerReady;
    hijectLoadFunction();
    window.onYouTubePlayerReady = function (player) {
        log('onYouTubePlayerReady:', player);
        // hijectMethods(player);
        player.addEventListener('onStateChange', function (state) {
            log('onStateChange:', state);
            switch (state) {
                case 1: // playing
                    ydm.init();
                    ydm.randomResume();
                    break;
                case 2: // paused
                    ydm.randomPause();
                    break;
            }
        });
        if (typeof oldReady == 'function') {
            return oldReady.call(this, arguments);
        }
    };
})

function hijectLoadFunction() {
    if (window.ytplayer == null) {
        setTimeout(hijectLoadFunction.bind(this), 0);
        return;
    }
    var oldLoad = window.ytplayer.load;
    window.ytplayer.load = function () {
        log('ytplayer.load', arguments);
        // loadCaption(window.ytplayer.config.args);
        return oldLoad();
    };
    if (window.ytplayer.config.args.video_id != null) {
        ydm.init();
        ydm.randomResume();
    }
    // window.ytplayer.load();
}

//assertion function for testing
function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}
