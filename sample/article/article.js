(function(factory) {
    'use strict';
    if (typeof define == '= function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($) {
    'use strict';
    var Article = window.Article || {};

    Article = (function() {

        function Article(element, settings) {

            var _ = this,
                dataSettings;

            _.defaults = {
                childDiv: "childDiv",
                childClass: "child_div",
                parentDiv: "motherLayer",
                fontUp: ".fontUp",
                fontDown: ".fontDown",
                changeBtn: ".changeBtn",
                preBtn: ".page_prev",
                nextBtn: ".page_next",
                mode: 4,
                maxmode: 4,
                fontsize: 14,
                lineheight: 25,
                wordbreak: true,
                allwidth: 1280,
                mode2width: 325,
                maxfont: 30,
                minfont: 9,
                pagenum: 0
            };

            dataSettings = $(element).data('article') || {};
            _.ele = $(element);
            _.options = $.extend({}, _.defaults, dataSettings, settings);

            _.parentDiv;
            _.parentHeight;
            _.childHeight;
            _.totalPage;
            _.checkNum;
            _.checkColmun;
            _.obj;
            _.getLayerWidth;

            _.mode = _.options.mode;
            _.pageN = _.options.pagenum;
            _.lineHeight = _.options.lineheight;
            _.fontSize = _.options.fontsize;
            _.parentDiv = $("#" + _.options.parentDiv);
            _.parentHeight = _.parentDiv.innerHeight();

            _.loadDefalut();
        }

        return Article;

    }());

    Article.prototype.loadDefalut = function() {
        var _ = this;
        _.widthChange();
        _.setArticle();
        _.fontSizeModify();
        _.makeDivAction();
        _.eventBind();
    };

    Article.prototype.eventBind = function() {
        var _ = this;
        $(_.options.fontUp).on("click", $.proxy(_.fontSizeUp, _));
        $(_.options.fontDown).on("click", $.proxy(_.fontSizeDown, _));
        $(_.options.changeBtn).on("click", function() {
            _.modeChage($(this).data("change"))
        });
        $(_.options.preBtn).on("click", function(e) {
            _.movePrev(1);
            e.preventDefault();
        });
        $(_.options.nextBtn).on("click", function(e) {
            _.moveNext(1);
            e.preventDefault();
        });
    };

    Article.prototype.wordCutMode = function() {
        var _ = this;
        var obj = $("#"+_.options.parentDiv).find(">div");
        if (!_.options.wordbreak) {
            obj.css("wordBreak", "break-all");
        } else {
            obj.css({
                "wordBreak": "keep-all",
                "wordWrap": "break-word"
            })
        }
        _.pageN = 0;
    };

    Article.prototype.widthChange = function() {
        var _ = this;
        if(_.mode > _.options.maxmode) _.mode = _.options.maxmode;
        if (_.mode == 1) {
            _.getLayerWidth = _.options.allwidth;
        } else {
            _.getLayerWidth = (_.options.allwidth/_.mode)-25;
        }
    };

    Article.prototype.setArticle = function() {
        var _ = this;

        for (var i = 0; i < _.options.maxmode; i++) {
            _.innerContents = $("<div></div>");
            _.innerContents.attr("id", "innerArt" + i);
            _.innerContents.html(_.ele.html());
            _.copyLayer = $("<div></div>");
            _.copyLayer.attr("id", _.options.childDiv + i);
            _.copyLayer.addClass(_.options.childClass);
            _.copyLayer.width(_.getLayerWidth);
            _.copyLayer.css({
                "position": "absolute",
                "left": ((_.getLayerWidth + 20) * i),
                "top": ((-1 * _.parentHeight) * i)
            });
            _.copyLayer.append(_.innerContents);
            _.parentDiv.append(_.copyLayer);
        }
        _.ele.remove();
        _.nowModeSetting();
    };

    Article.prototype.nowModeSetting = function() {
        var _ = this;
        $("."+_.options.childClass).hide();
        $("#pagingArea").hide();
        for (var i = 0; i < _.mode; i++) {
            var obj = $("#"+_.options.childDiv + i);
            obj.show();
            obj.width(_.getLayerWidth);
            obj.css("left",((_.getLayerWidth + 25) * i));
            $("#pagingArea").show();
        }
        if (_.mode == 1) {
            _.parentDiv.height($("#"+_.options.childDiv + "0").innerHeight());
            $("#pagingArea").hide();
        }
    };

    Article.prototype.modeChage = function(modeNo) {
        var _ = this;
        _.mode = modeNo;
        if (_.mode != 1) _.parentDiv.height(_.parentHeight);
        _.widthChange();
        _.nowModeSetting();
        _.pageN = 0;
        _.moveArticle();
    };

    Article.prototype.moveArticle = function(str) {
        var _ = this;
        $("."+_.options.childClass).each(function() {
            var idx = $(this).index();
            $(this).css("top", (-(1 * _.parentHeight)) * (idx + (_.mode * _.pageN)));
        });
        _.makePaging(str);
    };

    Article.prototype.makePaging = function(str) {
        var _ = this;
        var str;
        _.checkNum = 0 || parseInt(str / 10);
        if (_.checkNum > 0) {
            str = _.checkNum * 10;
        } else {
            str = 0;
        }
        
        if (_.mode == 1) _.totalPage = 1;
        else _.totalPage = Math.ceil($("#childDiv0").innerHeight() / (_.parentHeight * _.mode));
        var innerHtml = "";
        for (var i = str; i < _.totalPage; i++) {
            innerHtml += "<a href='#' class='page_btn' data-indx='"+i+"' id='pagingNo" + i + "'>" + (i + 1) + "</a>";
        }
        if (document.getElementById("pagingArea")) document.getElementById("pagingArea").innerHTML = innerHtml;
        if ($("#pagingNo" + _.pageN)) {
            $("#pagingNo" + _.pageN).addClass("active");
            $(".page_btn.active").focus();
        };

        $(document).off("click.article").on("click.article",".page_btn" ,function(e) {
			var selfi = $(this).data("indx");
			_.movePage(selfi);
			e.preventDefault();
		})

        _.viewPagingArea();
		
    };

    Article.prototype.movePage = function(num) {
        var _ = this;
        _.pageN = num;
        _.moveArticle(num);
    };

    Article.prototype.viewPagingArea = function(str) {
        var _ = this;
        var $pageLen = $("#pagingArea a:last-child").text();
        if ($pageLen < 10) {
            $(".btn_ten").hide();
        } else {
            $(".btn_ten").show();
            $("#pagingArea a:eq(9)").nextUntil().hide();
        }
    };


    Article.prototype.movePrev = function(step) {
        var _ = this;
        _.step = step;
        if (_.step == "all") {
            if (_.pageN > 0) {
                _.pageN = 0;
                _.moveArticle(_.pageN);
            }
        } else {
            if (_.pageN > 0) {
                _.pageN -= _.step;
                if (_.pageN < 0) _.pageN = 0;
                _.moveArticle(_.pageN);
            }
        }

    };

    Article.prototype.moveNext = function(step) {
        var _ = this;
        _.step = step;
        if (step == "all") {
            if (_.pageN < _.totalPage - 1) {
                _.pageN = $("#pagingArea a").length - 1;
                _.moveArticle(_.pageN);
            }
        } else {
            if (_.pageN < _.totalPage - 1) {
                _.pageN += step;
                if (_.pageN > _.totalPage - 1) _.pageN = _.totalPage - 1;
                _.moveArticle(_.pageN);
            }
        }
    };

    Article.prototype.fontSizeModify = function() {
        var _ = this;
        for (var i = 0; i < _.mode; i++) {
            var obj = document.getElementById("innerArt" + i);
            if (obj) {
                obj.style.fontSize = _.fontSize + "px";
                obj.style.lineHeight = _.lineHeight + "px";
            }
        }
        _.parentHeight = _.lineHeight * Math.round(_.parentHeight / _.lineHeight);
        if (_.mode != 1) _.parentDiv.height(_.parentHeight);
        else _.parentDiv.height($("#childDiv0").innerHeight());
        _.pageN = 0;
        _.moveArticle();
        _.wordCutMode();
    };

    Article.prototype.fontSizeUp = function() {
        var _ = this;
        if (_.fontSize < _.options.maxfont) {
            _.fontSize += 1;
            _.lineHeight += 1;
            _.fontSizeModify();
        }
    };

    Article.prototype.fontSizeDown = function() {
        var _ = this;
        if (_.fontSize > _.options.minfont) {
            _.fontSize -= 1;
            _.lineHeight -= 1;
            _.fontSizeModify();
        }
    };

    Article.prototype.clearDivAction = function() {
        var _ = this;
        for (var i = 0; i < _.mode; i++) {
            var obj = document.getElementById("childDiv" + i);
            obj.style.cursor = "";
            obj.onmousemove = "";
            obj.onmouseout = "";
            obj.onmousedown = "";
            obj.onmouseup = "";
        }
    };


    Article.prototype.makeDivAction = function() {
        var _ = this;
        _.clearDivAction();
        if (_.mode != 1) {
            $("#childDiv0").css("cursor", "pointer");
            $("#childDiv" + (_.mode - 1)).css("cursor", "pointer");
            $("#childDiv0").on("click", function(e) {
                _.movePrev(1);
                e.preventDefault();
            })
            $("#childDiv" + (_.mode - 1)).on("click", function(e) {
                _.moveNext(1);
                e.preventDefault();
            })
        }
    };

    $.fn.article = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i = 0,
            ret;
        for (i; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].article = new Article(_[i], opt);
            else
                ret = _[i].Article[opt].apply(_[i].Article, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));
