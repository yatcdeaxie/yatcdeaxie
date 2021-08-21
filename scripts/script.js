$(document).ready(() => {

  var players = playersList;
  let slpPhPrice = 0
  let loggedInPlayer;
  let validCredential = localStorage.getItem('credential');

  if (validCredential) {
    let decodedPasscode = atob(validCredential)
    loggedInPlayer = players.find(player => player.id === decodedPasscode);
    $('#body-container').show();
    $('.login-form').hide();
    getSlpPrice();
  } else {
    $('#body-container').hide();
  }
  
  $('#submit-passcode').click((e) => {
    let passcode = document.getElementById("passcode").value || '';
    let decodedPasscode = atob(passcode);
    loggedInPlayer = players.find(player => player.id === decodedPasscode);
    if (loggedInPlayer) {
      $('#passcode').removeClass("is-invalid");
      $('#passcode').get(0).setCustomValidity('');
      $('.login-form').hide();
      localStorage.setItem("credential", passcode);
      $('#body-container').show();
      e.preventDefault();
      getSlpPrice();
    } else {
      $('#passcode').get(0).setCustomValidity('Invalid passcode');
      $('#passcode').addClass("is-invalid");  
    }
  });

  function createPlayersTable() {
    for (var i = 0; i < players.length; i++) {
      let player = players[i];
      getPlayerAxieInfo(player.id);
      getPlayerArenaRanking(player.id);
      let playerTeam = setPlayerTeam(player.team);
      $(".table-body").append(
        `<tr id=${player.id}>
          <td>${player.name}<br>${playerTeam}
          <td style="text-align: right;">
            <span class="player-mmr badge badge-dark">0</span>
          <td style="text-align: right;">
            <span class="avg-slp badge badge-dark">0</span>
          <td style="text-align: right;">
            <span class="claimable-slp">0</span>
            <img src='img/slp.png' class='slp-png '><br>
            <span class="php-earned badge badge-warning mgT-3">₱0.00</span>`);
    }
  }

  function numberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        x = rows[i].getElementsByTagName("TD")[2].getElementsByClassName("avg-slp")[0];
        y = rows[i + 1].getElementsByTagName("TD")[2].getElementsByClassName("avg-slp")[0];
        if (removeCommaFromNumber(x.innerHTML) < removeCommaFromNumber(y.innerHTML)) {
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
  function removeCommaFromNumber(number) {
    return parseInt(number.replace(/,/g,''));
  }

  function getAverageSlpPerDay(dateStarted, totalSlp) {
    let oneDay = 24 * 60 * 60 * 1000; 
    let firstDate = new Date(); // get current date
    let secondDate = new Date(dateStarted);
    let diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
    return totalSlp/diffDays;
  }

  function getTotalSlpClaimable(aveSlp, totalSlp) {
    let slpClaimable = 0;
    if (aveSlp >= 195) {
      slpClaimable = totalSlp * .50;
    } else if(aveSlp >= 165 && aveSlp < 194) {
      slpClaimable = totalSlp * .45;
    } else if(aveSlp >= 135 && aveSlp < 164) {
      slpClaimable = totalSlp * .40;
    } else if(aveSlp >= 75 && aveSlp < 134) {
      slpClaimable = totalSlp * .35;
    } else {
      slpClaimable = totalSlp * 0;
    }
    return slpClaimable.toFixed();
  }

  function setAvgSlpBadgeColor(dailyAvg) {
    if (dailyAvg >= 195) {
      return 'badge-success';
    } else if(dailyAvg >= 165 && dailyAvg < 194) {
      return 'badge-info';
    } else if(dailyAvg >= 135 && dailyAvg < 164) {
      return 'badge-warning';
    } else if(dailyAvg >= 75 && dailyAvg < 134) {
      return 'badge-danger';
    } else {
      return 'badge-dark';
    }
  }

  function setPlayerTeam(team) {
    let teamIcons = new Array();
    for (i = 0; i < team.length; i++) {
      teamIcons.push(`<img src="./img/${team[i]}.png" class="imgsize-icon"/>`);
    }
    return teamIcons.join("");
  }

  function getFeeInSlp(playerFee, totalSlp) {
    return (totalSlp * playerFee) / 100;
  }

  function getFeeInPhp(playerFee, totalSlp) {
    return ((totalSlp * playerFee)/100) * slpPhPrice;
  }

  function getFee(aveSlp) {
    let fee = 0;
    if (aveSlp >= 195) {
      fee = '50';
    } else if(aveSlp >= 165 && aveSlp < 194) {
      fee = '55';
    } else if(aveSlp >= 135 && aveSlp < 164) {
      fee = '60';
    } else if(aveSlp >= 75 && aveSlp < 134) {
      fee = '65';
    } else {
      fee = '100';
    }
    return fee;
  }
  
  function setPlayerWallet(player, totalSlp = 0, claimableSlp = 0, totalPhp = 0, averageSlpPerDay = 0) {
    let playerFee = getFee(averageSlpPerDay) || 0;
    let feeInSlp = getFeeInSlp(playerFee, totalSlp);
    let feeInPhp = getFeeInPhp(playerFee, totalSlp);

    $(`#wallet-player-name`).text(`${player.name}`);
    $(`#wallet-avg-slp-per-day`).text(`${averageSlpPerDay.toFixed()}`);
    $(`#wallet-total-farmed-slp`).text(`${numberWithCommas(totalSlp.toFixed())}`);
    $(`#wallet-total-farmed-php`).text(`₱${numberWithCommas((totalSlp * slpPhPrice).toFixed())}`);
    $(`#wallet-fee`).text(`(${playerFee}%)`);
    $(`#wallet-fee-slp`).text(`-${numberWithCommas(feeInSlp.toFixed())}`);
    $(`#wallet-fee-php`).text(`-₱${numberWithCommas(feeInPhp.toFixed())}`);
    $(`#wallet-claimable-slp`).text(`${numberWithCommas(claimableSlp)}`);
    $(`#wallet-claimable-php`).text(`₱${numberWithCommas(totalPhp.toFixed())}`);
  }

  function getPlayerAxieInfo(id) {
    $.ajax({
      type: "GET",
      url: `https://game-api.skymavis.com/game-api/clients/${id}/items/1`,
      dataType: "json",
      success: function (result, status, xhr) {
        let playerId = result.client_id;
        let totalSlpCollected = result.total;
        let player = players.find((player) => player.id === playerId);
        let averageSlpPerDay = getAverageSlpPerDay(player.startDate, totalSlpCollected) || 0;
        let avgSlpBadgeColor = setAvgSlpBadgeColor(averageSlpPerDay);
        let claimableSlp = getTotalSlpClaimable(averageSlpPerDay, totalSlpCollected) || 0;
        let totalPhp = claimableSlp * slpPhPrice;
        if (playerId === loggedInPlayer.id) {
          setPlayerWallet(player, totalSlpCollected, claimableSlp, totalPhp, averageSlpPerDay);
        }

        $(`#${playerId} .claimable-slp`).replaceWith(`
          <span class="claimable-slp">${numberWithCommas(claimableSlp)}</span>
        `);
        $(`#${playerId} .avg-slp`).replaceWith(`
          <span class="avg-slp badge ${avgSlpBadgeColor}">${averageSlpPerDay.toFixed()}  <img src='img/slp.png' class='slp-png'></span>
        `);
        $(`#${playerId} .php-earned`).replaceWith(`
          <span class="php-earned badge badge-light mgT-3">₱${numberWithCommas(totalPhp.toFixed())}</span>`);
      },
      error: function (xhr, status, error) {
        console.log(`${xhr.status} ${xhr.statusText}`);
      }
    });
  }

  function getPlayerArenaRanking(id) {
    let roninAdd = id.substring(2);
    $.ajax({
      type: "GET",
      url: `https://axie-infinity.p.rapidapi.com/get-slp/ronin:${roninAdd}`,
      headers: {
        'x-rapidapi-host': 'axie-infinity.p.rapidapi.com',
        'x-rapidapi-key': '64776f09f3msh04aaad33770abefp150684jsn6766ed1262e0'
      },
      method: "GET",
      dataType: "json",
      success: function (result, status, xhr) {
        $(`#${id} .player-mmr`).replaceWith(`
          <span class="player-mmr badge badge-light">${numberWithCommas(result?.leaderboardData?.elo)}</span>`);
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
        createPlayersTable();
      },
      error: function (xhr, status, error) {
        createPlayersTable();
        console.log(xhr.status + "" + xhr.statusText);
      }
    });
  }

  $(document).ajaxStop(function() {
    sortPlayerByHighestSlp();
  });
});