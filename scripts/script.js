$(document).ready(function () {
  var players = playersList;
  let slpPhPrice = 0

  createPlayersTable();
  getSlpPrice();

  function createPlayersTable() {
    for (var i = 0; i < players.length; i++) {
      let player = players[i];
      let playerTeam = setPlayerTeam(player.team);
      getPlayerAxieInfo(player.id);
      $(".table-body").append(
        `<tr id=${player.id}>
          <td>${player.name}<br>${playerTeam}
          <td>
            <div class="progress position-relative">
              <div class="progress-bar" role="progressbar"></div>
              <small class="percentage justify-content-center d-flex position-absolute w-100"></small>
            </div>
          <td style="text-align: right;">
            <span class="claimable-slp">0</span>
            <img src='img/slp.png' class='imgsize-icon'><br>
            <span class="php-earned badge badge-warning">₱0.00</span>`);
    }
    sortPlayerByHighestSlp();
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function sortPlayerByHighestSlp() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("player-list");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[2];
        y = rows[i + 1].getElementsByTagName("TD")[2];
        if (Number(x.innerHTML) > Number(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

  function getTotalSlpClaimable(status, totalSlp) {
    let slpClaimable = 0;
    if (status === "probationary") {
      if (totalSlp >= 2000) {
        slpClaimable = totalSlp * .5;
      } else if(totalSlp >= 1500 && totalSlp < 2000) {
        slpClaimable = totalSlp * .4;
      } else if(totalSlp >= 1250 && totalSlp < 1500) {
        slpClaimable = totalSlp * .3;
      } else if(totalSlp >= 1000 && totalSlp < 1250) {
        slpClaimable = totalSlp * .2;
      }
    } else if (status === "regular") {
      if (totalSlp >= 3000) {
        slpClaimable = totalSlp * .5;
      } else if(totalSlp >= 2700 && totalSlp < 3000) {
        slpClaimable = totalSlp * .4;
      } else if(totalSlp >= 2250 && totalSlp < 2700) {
        slpClaimable = totalSlp * .35;
      } else if(totalSlp >= 1500 && totalSlp < 2250) {
        slpClaimable = totalSlp * .3;
      } else if(totalSlp >= 1000 && totalSlp < 1500) {
        slpClaimable = totalSlp * .2;
      }
    } else {
      slpClaimable = totalSlp;
    }
    return slpClaimable.toFixed();
  }

  function setProgressStatus(progressWidth) {
    if (progressWidth < 50) {
      return '#ff7070';
    } else if(progressWidth < 100 && progressWidth >= 50) {
      return '#f2f769';
    } else {
      return '#59f082';
    }
  }

  function setPlayerTeam(team) {
    let teamIcons = new Array();
    for (i = 0; i < team.length; i++) {
      teamIcons.push(`<img src="./img/${team[i]}.png" class="imgsize-icon"/>`);
    }
    return teamIcons.join("");
  }

  function getPlayerAxieInfo(id) {
    $.ajax({
      type: "GET",
      url: `https://game-api.skymavis.com/game-api/clients/${id}/items/1`,
      dataType: "json",
      success: function (result, status, xhr) {
        let playerId = result.client_id;
        let totalSlpCollected = result.claimable_total;
        let slpRequired = 2250;
        let player = players.find((player) => player.id === playerId );
        let claimableSlp = getTotalSlpClaimable(player.status, totalSlpCollected) || 0;
        let progressWidth = ((totalSlpCollected/slpRequired) * 100).toFixed();
        let progStatus = setProgressStatus(progressWidth);
        let totalPhp = claimableSlp * slpPhPrice;
        $(`#${playerId} .progress-bar`).replaceWith(`
          <div class="progress-bar" role="progressbar" style="width: ${progressWidth}%; background-color: ${progStatus}"></div>
              <small class="percentage justify-content-center d-flex position-absolute w-100">
                ${numberWithCommas(totalSlpCollected)} (${progressWidth}%)
              </small>
            </div>
          `);
        $(`#${playerId} .claimable-slp`).replaceWith(`
          <span class="claimable-slp">${numberWithCommas(claimableSlp)}</span>
        `);
        $(`#${playerId} .php-earned`).replaceWith(`
          <span class="php-earned badge badge-warning">₱${numberWithCommas(totalPhp.toFixed(2))}</span>`);
      },
      error: function (xhr, status, error) {
        console.log(`${xhr.status} ${xhr.statusText}`);
      }
    });
  }

  function getSlpPrice() {
    $.ajax({
      type: "GET",
      url: "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0xcc8fa225d80b9c7d42f96e9570156c65d6caaa25&vs_currencies=php&include_24hr_change=true",
      dataType: "json",
      success: function (result, status, xhr) {
        var slpPrice = $(".slp-price");
        let slp = Object.values(result).find((slp) => slp.php);
        slpPhPrice = slp.php;
        slpPrice.append(`${slpPhPrice}`);
        $("slp").html(slpPrice);
      },
      error: function (xhr, status, error) {
        console.log(xhr.status + "" + xhr.statusText);
      }
    });
  }

  // for (var i = 0; i < players.length; i++) {
  //   let player = players[i];
  //   console.log(player);
  //   $.ajax({
  //     type: "GET",
  //     url: "https://lunacia.skymavis.com/game-api/clients/" + player.id + "/items/1",
  //     dataType: "json",
  //     success: function (result, status, xhr) {
  //       var body = $(".table-body");
  //       var slpRequired = 2250;
  //       let progressWidth = ((result["total"]/slpRequired) * 100).toFixed();
  //       let progStatus;
  //       if (progressWidth < 50) {
  //         progStatus = 'bg-danger';
  //       } else if(progressWidth < 100 && progressWidth >= 50) {
  //         progStatus = 'bg-warning';
  //       } else {
  //         progStatus = 'bg-success';
  //       }
  //       let totalSlpCollected = result["total"];
  //       let totalPhp = (totalSlpCollected/2);
  //       body.append("<tr>");
  //       body.append("<td>" + player.name + "</td>");
  //       body.append(`
  //           <td>
  //             <div class="progress">
  //               <div class="progress-bar ${progStatus}" style="width: ${progressWidth}%"> 
  //                 ${totalSlpCollected} (${progressWidth}%)
  //               </div>
  //             </div>
  //           </td>`);
  //       body.append(`<td style="text-align: right;">
  //                   ${totalSlpCollected/2} 
  //                   <img src='img/slp.png'  class='imgsize-icon'><br>
  //                   <span class="php-earned badge badge-warning">₱${totalPhp.toFixed()}</span>
  //                 </td>`);
  //       body.append("</tr>");
  //       $("#message").html(body);
  //     },
  //     error: function (xhr, status, error) {
  //       console.log(xhr.status + "" + xhr.statusText);
  //     }
  //   });
  // }
});