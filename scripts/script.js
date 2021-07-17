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
  let slpPhPrice;
  $.ajax({
    type: "GET",
    url: "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0xcc8fa225d80b9c7d42f96e9570156c65d6caaa25&vs_currencies=php&include_24hr_change=true",
    dataType: "json",
    success: function (result, status, xhr) {
      var slpPrice = $(".slp-price");
      let slp = Object.values(result).find((slp) => slp.php);
      slpPhPrice = slp.php;
      console.log(slpPhPrice);
      slpPrice.append(`${slpPhPrice}`);
      $("slp").html(slpPrice);
    },
    error: function (xhr, status, error) {
      console.log(xhr.status + "" + xhr.statusText);
    }
  });

  for (var i = 0; i < playersId.length; i++) {
    let player = playersId[i];
    console.log(player);
    $.ajax({
      type: "GET",
      url: "https://lunacia.skymavis.com/game-api/clients/" + player.id + "/items/1",
      dataType: "json",
      success: function (result, status, xhr) {
        var body = $(".table-body");
        var slpRequired = 2250;
        let progressWidth = ((result["total"]/slpRequired) * 100).toFixed();
        let progStatus;
        if (progressWidth < 50) {
          progStatus = 'bg-danger';
        } else if(progressWidth < 100 && progressWidth >= 50) {
          progStatus = 'bg-warning';
        } else {
          progStatus = 'bg-success';
        }
        let totalSlpCollected = result["total"];
        let totalPhp = (totalSlpCollected/2) * slpPhPrice;
        body.append("<tr>");
        body.append("<td>" + player.name + "</td>");
        body.append(`
            <td>
              <div class="progress">
                <div class="progress-bar ${progStatus}" style="width: ${progressWidth}%"> 
                  ${totalSlpCollected} (${progressWidth}%)
                </div>
              </div>
            </td>`);
        body.append(`<td style="text-align: right;">
                    ${totalSlpCollected/2} 
                    <img src='img/slp.png'  class='imgsize-icon'><br>
                    <span class="php-earned badge badge-warning">₱${totalPhp.toFixed()}</span>
                  </td>`);
        body.append("</tr>");
        $("#message").html(body);
      },
      error: function (xhr, status, error) {
        console.log(xhr.status + "" + xhr.statusText);
      }
    });
  }
});