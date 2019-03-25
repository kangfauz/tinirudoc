
var rightbar = $(".rightbar");
rightbar.html("");
$(".content h2").each(function (i, elm){
    console.log(elm);
    $(this).prepend('<a class="shortcut-anchor" name="h2-'+i+'"></a>');
    text = $(".content h2:eq("+i+")").text();
    rightbar.append('<div class="py-1 "><a class="topics" href="#h2-'+i+'">'+text+'</a></div>');
})