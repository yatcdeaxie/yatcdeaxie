var playersId = 
[
  {
    id: "0xe93f2622be726d62c371a0589a47d2da8c683f9d",
    name: "vonaceaxiemain"
  },
  {
    id: "0xe93f2622be726d62c371a0589a47d2da8c683f9e",
    name: "Big Boss III"
  },
  {
    id: "0xe93f2622be726d62c371a0589a47d2da8c683f9df",
    name: "yatv"
  }
]

$(document).ready(function () {
  for (var i = 0; i < playersId.length; i++) {
    let player = playersId[i];
    console.log(player);
    $.ajax({
      type: "GET",
      url: "https://lunacia.skymavis.com/game-api/clients/" + player.id + "/items/1",
      dataType: "json",
      success: function (result, status, xhr) {
        var body = $(".table-body");
        console.log(player.name);
        body.append("<tr>");
        body.append("<td>" + player.name + "</td>");
        body.append("<td>" + result["total"]/30 + " <img src='img/slp.png'  class='imgsize-icon'></td>");
        body.append("<td>" + result["total"] + "</td>");
        body.append("</tr>");
        $("#message").html(body);
      },
      error: function (xhr, status, error) {
        alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
      }
    });
  }
});