/*Preprocess*/
var LANG = ['python', 'scala', 'r', 'julia', 'c++', 'perl'];
var TITLE_WITH_LANG = ['/get_started/', '/tutorials/', '/how_to/', '/architecture/'];
for(var i = 0; i < LANG.length; ++i) {
    TITLE_WITH_LANG.push('/api/' + LANG[i] + '/');
}

/*Check whether is API page*/
var API_PAGE = ['python'];
var isAPI = false;

function render_left_helper(toc, currentText) {
    var lefttoc = toc;
    var currentText = currentText, trailing = ' Documents';
    if (currentText.endsWith(trailing)) currentText = currentText.substring(0, currentText.length - trailing.length);
    if (currentText == 'System') currentText = 'Architecture';

    lefttoc.addClass('current');
    $('.leftsidebar > .sphinxsidebarwrapper').children().remove();
    $('.leftsidebar > .sphinxsidebarwrapper').append(lefttoc);
    
    $('.leftsidebar > .sphinxsidebarwrapper').prepend('<h3>' + currentText + ' Contents</h3>');
    addToggle('.leftsidebar');
    
    $('.leftsidebar li a').click(function () {
        $('.leftsidebar li a').css('color', 'black');
        $(this).css('color', '#337ab7');
    });
}

/*Render content tree of different pages*/
function render_lefttoc() {
    var url = window.location.href, indexTrailing = 'index.html';
    if (url.indexOf(indexTrailing) == -1) {
        for(var i = 0; i < TITLE_WITH_LANG.length; ++i) {
            var path = TITLE_WITH_LANG[i];
            if (url.indexOf(path) != -1) {
                var urlPath = 'http://' + window.location.host + path;
                $.get(urlPath + indexTrailing, null, function(data) {
                    var currentText = $($.parseHTML(data)).find('.leftsidebar >  .sphinxsidebarwrapper > ul.current > li.current > a').html();
                    if (isAPI) {
                        render_left_helper($($.parseHTML(data)).find('#table-of-contents > div > ul'), currentText);
                    }
                    else {
                        render_left_helper($($.parseHTML(data)).find('.leftsidebar > .sphinxsidebarwrapper > ul.current > li.current > ul'), currentText);
                        var tocLink = $('.leftsidebar .sphinxsidebarwrapper .leaf a');
                        var staticLink = 'http';
                        tocLink.each(function () {
                            if (!$(this).attr('href').startsWith(staticLink)) {
                                $(this).attr('href', urlPath + $(this).attr('href'));
                            }
                        });
                    }
                    keepExpand();
                    $('.sphinxsidebar').css("visibility", "visible");
                })
            }
        }
    }
    else {
        var currentText = $('.leftsidebar >  .sphinxsidebarwrapper > ul.current > li.current > a').html();
        var toc = isAPI ? $('#table-of-contents > div > ul').clone() : $('.leftsidebar > .sphinxsidebarwrapper > ul.current > li.current > ul').clone();
        render_left_helper(toc, currentText);
        $('.sphinxsidebar').css("visibility", "visible");
    }
}

/*Render contents inside page*/
function render_righttoc() {
    var url = window.location.href, apiFlag = '/api/', indexTrailing = 'index.html';
    
    var rightTocTitle = "Page Contents";
    $("div.rightsidebar > div.sphinxsidebarwrapper > h3").children().remove();
    $("div.rightsidebar > div.sphinxsidebarwrapper > h3").html(rightTocTitle);
    
    addToggle('.rightsidebar');
    
    $('.rightsidebar li a').click(function () {
        $('.rightsidebar li a').css('color', 'black');
        $(this).css('color', '#337ab7');
    });
    
    if (url.indexOf(indexTrailing) != -1 || isAPI) {
        $('.rightsidebar').hide();
    }
}

/*Highlight entry when scrolling*/
function scroll_righttoc() {
    var navbarHeight = 60;
    var links = $('.rightsidebar a');
    for(var i = 1; i < links.length; ++i) {
        var divID = links.eq(i).attr('href');
        if ($(divID).offset().top - $(window).scrollTop() > navbarHeight) {
            $('.rightsidebar a').css('color', 'black');
            links.eq(i - 1).css('color', '#337ab7');
            if (!links.eq(i - 1).parent().hasClass('leaf')) {
                links.eq(i - 1).parent().removeClass('closed');
                links.eq(i - 1).parent().addClass('opened');
                links.eq(i - 1).parent().find('ul').first().show();
            }
            break;
        }
    }
}

/*Decorate toc*/
function addToggle(tocClass) {
    var allEntry = $(tocClass + " div.sphinxsidebarwrapper li");
    var subEntry = $(tocClass + " div.sphinxsidebarwrapper").children("ul").first().children("li");
    if (subEntry.length == 1) {
        subEntry.prepend("<span class='tocToggle' onclick='toggle(this)'></span>");
        subEntry.addClass('opened');
        allEntry = subEntry.find("li");
        //subEntry.children("a").hide();
        subEntry.children("ul").css("padding-left", "0");
        //subEntry.parent().css("margin-left", "-10px");
    }
    allEntry.each(function () {
        $(this).prepend("<span class='tocToggle' onclick='toggle(this)'></span>");
        var childUL = $(this).find("ul");
        if (childUL.length && childUL.first().children().length) {
            $(this).addClass("closed");
            $(this).find("ul").first().hide();
        }
        else $(this).addClass("leaf");
        var anchor = $(this).children("a").first();
        anchor.click(function () {
            autoExpand(anchor);
        });
    });
};

/*Sidebar toc toggle button behavior*/
function toggle(elem) {
    if ($(elem).parent().hasClass("closed")) {
        $(elem).parent().find("ul").first().show();
        $(elem).parent().removeClass("closed").addClass("opened");
    }
    else if ($(elem).parent().hasClass("opened")) {
        $(elem).parent().find("ul").first().hide();
        $(elem).parent().removeClass("opened").addClass("closed");
    }
}

/*Automatically expand child level while cilcking an entry*/
function autoExpand(elem) {
    if (elem.parent().hasClass("closed")) {
        elem.parent().removeClass("closed").addClass("opened");
        elem.parent().children("ul").first().show();
    }
    else {
        elem.parent().removeClass("opened").addClass("closed");
        elem.parent().children("ul").first().hide();
    }
}

/*Keep toc expansion while redirecting*/
function keepExpand() {
    var url = window.location.href, currentEntry;
    var entryList = isAPI ? $('.leftsidebar li') : $('.sphinxsidebar li');
    for(var i = entryList.length - 1; i >= 0; --i) {
        var entryURL = entryList.eq(i).find('a').first().attr('href');
        if (entryURL != '#' && url.indexOf(entryURL) != -1) {
            currentEntry = entryList.eq(i);
            break;
        }
    }
    
    if (isAPI) {
        var rootEntry = currentEntry;
        if (rootEntry.parent().parent().is('li')) rootEntry = rootEntry.parent().parent();
        rootEntry.children("ul").first().remove();
        rootEntry.append($('.rightsidebar .sphinxsidebarwrapper > ul > li > ul').clone());
        var allEntry = $(".leftsidebar div.sphinxsidebarwrapper li");
        allEntry.each(function () {
            var anchor = $(this).children("a").first();
            anchor.click(function () {
                autoExpand(anchor);
            });
        });
        $('.sphinxsidebar li').each(function () {
            if (url.endsWith($(this).find('a').first().attr('href'))) {
                currentEntry = $(this);
                return false;
            }
        });
        $('.leftsidebar li a').click(function () {
            $('.leftsidebar li a').css('color', 'black');
            $(this).css('color', '#337ab7');
        });
    }
    currentEntry.find('a').first().css('color', '#337ab7');
    currentEntry.children("ul").first().show();
    if (!currentEntry.hasClass('leaf')) currentEntry.removeClass("closed").addClass("opened");
    while(currentEntry.parent().is('ul') && currentEntry.parent().parent().is('li')) {
        currentEntry = currentEntry.parent().parent();
        currentEntry.removeClass("closed").addClass("opened");
        currentEntry.children("ul").first().show();
    }
}


$(document).ready(function () {
    var url = window.location.href, searchFlag = 'search.html';
    if (url.indexOf(searchFlag) == -1) {
        for(var i = 0; i < API_PAGE.length; ++i) {
            if (url.indexOf('/api/' + API_PAGE[i]) != -1) {
                isAPI = true;
                break;
            }
        }
        render_righttoc();
        if ($('.leftsidebar').length) render_lefttoc();
    }
    $(window).scroll(function () {
        scroll_righttoc();
    });
});