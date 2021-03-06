/*
 * yuga.js 0.7.2 - 優雅なWeb制作のためのJS
 *
 * Copyright (c) 2009 Kyosuke Nakamura (kyosuke.jp)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Since:     2006-10-30
 * Modified:  2012-02-04
 */

/*
 * yuga.js TT Custom
 *
 * Copyright (c) 2011 TAGAWA takao (dounokouno@gmail.com)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Since:     2011-09-18
 * Modified:  2012-10-11
 */

(function($) {

	//---------------------------------------------------------------------

	$.yuga = {
		// URIを解析したオブジェクトを返すfunction
		Uri: function(path){
			var self = this;
			this.originalPath = path;
			//絶対パスを取得
			this.absolutePath = (function(){
				var e = document.createElement('a');
				e.href = path;
				return e.href;
			})();
			//絶対パスを分解
			var fields = {'schema' : 2, 'username' : 5, 'password' : 6, 'host' : 7, 'path' : 9, 'query' : 10, 'fragment' : 11};
			var r = /^((\w+):)?(\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/.exec(this.absolutePath);
			for (var field in fields) {
				this[field] = r[fields[field]];
			}
			this.querys = {};
			if(this.query){
				$.each(self.query.split('&'), function(){
					var a = this.split('=');
					if (a.length == 2) self.querys[a[0]] = a[1];
				});
			}
		},
		//ユニークな配列を取得
		uniqueArray: function(array) {
			var storage = new Object;
			var uniqueArray = new Array();
			var i, value;
			for (var i=0;i<array.length;i++) {
				value = array[i];
				if (!(value in storage)) {
					storage[value] = true;
					uniqueArray.push(value);
				}
			}
			return uniqueArray;
		},
		//ロールオーバー
		rollover: function(options) {
			var c = $.extend({
				hoverSelector: '.btn, .allbtn img',
				groupSelector: '.btngroup',
				postfix: '-over'
			}, options);
			//ロールオーバーするノードの初期化
			var rolloverImgs = $(c.hoverSelector).filter(isNotCurrent);
			rolloverImgs.each(function(){
				this.originalSrc = $(this).attr('src');
				this.rolloverSrc = this.originalSrc.replace(new RegExp('('+c.postfix+')?(\.gif|\.jpg|\.png)$'), c.postfix+"$2");
				this.rolloverImg = new Image;
				this.rolloverImg.src = this.rolloverSrc;
			});
			//グループ内のimg要素を指定するセレクタ生成
			var groupingImgs = $(c.groupSelector).find('img').filter(isRolloverImg);

			//通常ロールオーバー
			rolloverImgs.not(groupingImgs).hover(function(){
				$(this).attr('src',this.rolloverSrc);
			},function(){
				$(this).attr('src',this.originalSrc);
			});
			//グループ化されたロールオーバー
			$(c.groupSelector).hover(function(){
				$(this).find('img').filter(isRolloverImg).each(function(){
					$(this).attr('src',this.rolloverSrc);
				});
			},function(){
				$(this).find('img').filter(isRolloverImg).each(function(){
					$(this).attr('src',this.originalSrc);
				});
			});
			//フィルタ用function
			function isNotCurrent(i){
				return Boolean(!this.currentSrc);
			}
			function isRolloverImg(i){
				return Boolean(this.rolloverSrc);
			}
		},
		//カテゴリー内表示
		category: function(options) {
			var c = $.extend({
				buttonSelector: '.btn',
				currentImagePostfix: '-over'
			}, options);
			var bodyClasses = new Array();
			if ($('body').attr('class')) {
				bodyClasses = $('body').attr('class').split(' ');
			}
			for (var i=0;i<bodyClasses.length;i++) {
				$(c.buttonSelector).each(function(){
					if ($(this).hasClass(bodyClasses[i])) {
						var originalSrc = $(this).attr('src');
						var rolloverSrc = originalSrc.replace(new RegExp('('+c.currentImagePostfix+')?(\.gif|\.jpg|\.png)$'), c.currentImagePostfix+"$2");
						//初期表示
						$(this).attr('src', rolloverSrc);
						//hoverイベントを上書き
						$(this).hover(function(){
							$(this).attr('src', rolloverSrc);
						}, function(){
							$(this).attr('src', rolloverSrc);
						});
					}
				});
			}
		},
		//外部リンクは別ウインドウを設定
		externalLink: function(options) {
			var c = $.extend({
				windowOpen: true
			}, options);
			var uri = new $.yuga.Uri(location.href);
			var e = $('a[href^="http://"],a[href^="https://"]').not('a[href^="' + uri.schema + '://' + uri.host + '/' + '"]');
			if (c.windowOpen) {
				e.click(function() {
					window.open(this.href, '_blank');
					return false;
				});
			}
			e.addClass(c.externalClass);
		},
		//ページ内リンクはするするスクロール
		scroll: function(options) {
			var c = $.extend({
				duration: 500
			}, options);
			$('a[href^="#"], area[href^="#"]').not('a[href="#"], area[href="#"]').click(function(event){
				var hrefdata = new $.yuga.Uri(this.getAttribute('href'));
				var position = $('#'+hrefdata.fragment).offset().top;
				$(navigator.userAgent.match(/safari/i) ? 'body' : 'html').animate({scrollTop: position}, {
					duration: c.duration,
					complete: function(){
						location.href = hrefdata.absolutePath;
					}
				});
				event.preventDefault();
				return false;
			});
		},
		//タブ機能
		tab: function(options) {
			var c = $.extend({
				tabNavSelector: '.tabnav',
				activeTabClass: 'active'
			}, options);
			$(c.tabNavSelector).each(function(){
				var tabNavList = $(this).find('a[href^=#], area[href^=#]');
				var tabBodyList;
				tabNavList.each(function(){
					this.hrefdata = new $.yuga.Uri(this.getAttribute('href'));
					var selecter = '#'+this.hrefdata.fragment;
					if (tabBodyList) {
						tabBodyList = tabBodyList.add(selecter);
					} else {
						tabBodyList = $(selecter);
					}
					$(this).unbind('click');
					$(this).click(function(){
						tabNavList.removeClass(c.activeTabClass);
						$(this).addClass(c.activeTabClass);
						tabBodyList.hide();
						$(selecter).show();
						return false;
					});
				});
				tabBodyList.hide()
				tabNavList.filter(':first').trigger('click');
			});
		},
		//odd、even、first-cchild、last-child、nth-childクラスを追加
		child: function(options) {
			var c = $.extend({
				selector: '.child',
				oddClass: 'odd',
				evenClass: 'even',
				firstChidlClass: 'first-child',
				lastChidlClass: 'last-child'
			}, options);
			$(c.selector).each(function(){
				//JSでは0から数えるのでevenとaddを逆に指定
				$(this).children(':odd').addClass(c.evenClass);
				$(this).children(':even').addClass(c.oddClass);
				//:first-child, :last-childをクラスとして追加
				$(this).children(':first-child').addClass(c.firstChidlClass);
				$(this).children(':last-child').addClass(c.lastChidlClass);
				//:nth-childをクラスとして追加
				var n=0;
				$(this).children().each(function(){
					n++;
					$(this).addClass('nth-child-'+n);
					for (var i=2;i<=n;i++) {
						if ((n%i) == 0) {
							$(this).addClass('nth-child-'+i+'n');
						}
					}
				});
			});
		},
		//href属性の内容に合わせてアイコン用クラスを追加
		icon: function(options) {
			var c = $.extend({
				ignoreClass: '.nonicon'
			}, options);
			// 別ウィンドウクラス
			var uri = new $.yuga.Uri(location.href);
			var e = $('a[href^="http://"],a[href^="https://"]').not('a[href^="' + uri.schema + '://' + uri.host + '/' + '"]').not(c.ignoreClass);
			e.addClass('external');
			// その他クラス
			$('a[href^="mailto"]').not(c.ignoreClass).addClass('mailto');
			$('a[href$=".pdf"]').not(c.ignoreClass).addClass('pdf');
			$('a[href$=".doc"], a[href$=".docx"]').not(c.ignoreClass).addClass('doc');
			$('a[href$=".xls"], a[href$=".xlsx"]').not(c.ignoreClass).addClass('xls');
			$('a[href$=".ppt"], a[href$=".pptx"]').not(c.ignoreClass).addClass('ppt');
			$('a[href$=".zip"]').not(c.ignoreClass).addClass('zip');
		},
		//ボックスの高さを揃える
		heightLine: function(options) {
			var c = $.extend({
				parentSelector: '.heightline-parent',
				groupClassPrefix: 'heightline-'
			}, options);
			//heightline-parent
			$(c.parentSelector).each(function(){
				var height = 0;
				$(this).children().each(function(){
					if (height < parseInt($(this).height())) {
						height = parseInt($(this).height());
					}
				});
				$(this).children().height(height);
			});
			//heightline-group
			var classes = new Array();
			$('body *').not(c.parentSelector+',script,style,br').each(function(){
				if ($(this).attr('class') && $(this).attr('class').match(new RegExp(c.groupClassPrefix))) {
					var ary = $(this).attr('class').split(' ');
					for (var i=0;i<ary.length;i++) {
						if (ary[i].match(new RegExp(c.groupClassPrefix))) {
							classes.push(ary[i]);
						}
					}
				}
			});
			classes = $.yuga.uniqueArray(classes);
			for (var i=0;i<classes.length;i++) {
				height = 0;
				$('.'+classes[i]).each(function(){
					if (height < parseInt($(this).height())) {
						height = parseInt($(this).height());
					}
				});
				$('.'+classes[i]).height(height);
			}
		},
		//トグル表示
		toggleBox: function(options) {
			var c = $.extend({
				selector: '.toggle',
				speed: 'normal'
			}, options);
			//要素を非表示
			$(c.selector).each(function(){
				$(this).parent().next().hide();
			});
			//クリックイベント
			$(c.selector).click(function(){
				$(this).parent().next().slideToggle(c.speed);
			});
		},
		//ポップアップウィンドウ
		popup: function(options) {
			var c = $.extend({
				name: '',
				width: 600,
				height: 400,
				status: 'yes',
				scrollbars: 'yes',
				directories: 'yes',
				menubar: 'yes',
				resizable: 'yes',
				toolbar: 'yes'
			}, options);
			$('a.popup').click(function(){
				window.open(this.href, c.name, 'width='+c.width+',height='+c.height+',status='+c.status+',scrollbars='+c.scrollbars+',directories='+c.directories+',menubar='+c.menubar+',resizable='+c.resizable+',toolbar='+c.toolbar);
				return false;
			});
		}
	};
})(jQuery);
