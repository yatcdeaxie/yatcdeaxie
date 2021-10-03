$(document).ready(() => {

  var players = playersList;
  let slpPhPrice = 0
  let loggedInPlayer;
  let validCredential = localStorage.getItem('credential');
  let axieResetDate;

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

  $(document).on("click",".nav-link.arena", function () {
    $(".mmr").css('display', 'table-cell');
    $(".ranking").css('display', 'table-cell');
    $(".daily-avg").css('display', 'none');
    $(".claimableSlp").css('display', 'none');
    sortPlayerByRanking();
  });

  $(document).on("click",".nav-link.slp-earned", function () {
    $(".mmr").css('display', 'none');
    $(".ranking").css('display', 'none');
    $(".daily-avg").css('display', 'table-cell');
    $(".claimableSlp").css('display', 'table-cell');
    sortPlayerByHighestSlp();
  });

  $(document).on("click",".player-battle-history", function () {
    let getId = this.getAttribute('id');
    let player = players.find((player) => player.id === getId);
    $('#team-name-battle-history').text(`Team ${player.name}`);
    getBattleHistory(getId);
  });

  $(document).on("click",".close", function () {
    $(".modal-body .fighters").empty();
  });

  function createPlayersTable() {
    $("#total-player").text(players.length);
    for (var i = 0; i < players.length; i++) {
      let player = players[i];
      getPlayerAxieInfo(player.id);
      getPlayerArenaRanking(player.id);
      let playerTeam = setPlayerTeam(player.team);
      let activeRow = loggedInPlayer.id === player.id ? 'active-row' : '';
      let activeTabIsSlpEarned = $("a.nav-link.active.slp-earned").length === 1;
      let hidemmrdetails = activeTabIsSlpEarned ? 'display: none;' : '';
      let marketPlaceLink = `https://marketplace.axieinfinity.com/profile/ronin:${player.id.substring(2)}/axie`;
      if (activeTabIsSlpEarned) {
        $(".mmr").css('display', 'none');
        $(".ranking").css('display', 'none');
      }
      let activePlayerAdmin = loggedInPlayer.id === '0x00f1224b055edcb0accab42eda55df0bf00f48a4';
      let addBr = activePlayerAdmin ? '<br/>' : '';
      let feeDisplay = !activePlayerAdmin ? 'display: none;' : '';
      $(".table-body").append(
        `<tr id=${player.id} class="${activeRow}">
          <td>
            <div style="display: flex;">
              <button type="button" id="${player.id}" class="player-battle-history" data-toggle="modal" data-target="#battleHistoryModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-collection-play" viewBox="0 0 16 16">
                  <path d="M2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1zm2.765 5.576A.5.5 0 0 0 6 7v5a.5.5 0 0 0 .765.424l4-2.5a.5.5 0 0 0 0-.848l-4-2.5z"/>
                  <path d="M1.5 14.5A1.5 1.5 0 0 1 0 13V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 6v7a1.5 1.5 0 0 1-1.5 1.5h-13zm13-1a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5h-13A.5.5 0 0 0 1 6v7a.5.5 0 0 0 .5.5h13z"/>
                </svg>
              </button>
              <div>
                <div>${player.name}</div>
                <div><a href="${marketPlaceLink}" target="_blank">${playerTeam}</a></div>
              </div>
            </div>
          <td style="text-align: right; ${hidemmrdetails}" class="mmr">
            <span class="player-mmr badge badge-dark">0</span>
          <td style="text-align: right; ${hidemmrdetails}" class="ranking">
            <span class="player-ranking badge badge-dark">0</span>
          <td style="text-align: right;" class="daily-avg">
            <span class="avg-slp badge badge-dark">0</span>
          <td style="text-align: right;" class="claimableSlp">
            <span class="claimable-slp">0</span>
            <span class="php-earned badge badge-light mgT-3" style="${feeDisplay}">₱0.00</span>
            ${addBr}
            <span class="fee-player badge badge-warning mgT-3" style="${feeDisplay}">0</span>
            <span class="fee-player-php badge badge-warning mgT-3" style="${feeDisplay}">₱0.00</span>`);
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
        x = rows[i].getElementsByTagName("TD")[3].getElementsByClassName("avg-slp")[0];
        y = rows[i + 1].getElementsByTagName("TD")[3].getElementsByClassName("avg-slp")[0];
        if (removeCommaFromNumber(x.innerHTML) < removeCommaFromNumber(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
        if (i === rows.length-2) {
          getPlayerRank();
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

  function sortPlayerByRanking() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("player-list");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[2].getElementsByClassName("player-ranking")[0];
        y = rows[i + 1].getElementsByTagName("TD")[2].getElementsByClassName("player-ranking")[0];
        if (removeCommaFromNumber(x.innerHTML) > removeCommaFromNumber(y.innerHTML)) {
          shouldSwitch = true;
          break;
        }
        if (i === rows.length-2) {
          getPlayerRank();
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

  function getPlayerRank() {
    let playerId = loggedInPlayer.id;
    let ranking = $(`#${playerId}`)[0].rowIndex;
    $(`#player-ranking`).text(`${ranking}`);
  }

  function removeCommaFromNumber(number) {
    return parseInt(number.replace(/,/g,''));
  }

  function getAverageSlpPerDay(dateStarted, totalSlp) {
    let currentDate = new Date(); // get current date
    axieResetDate = new Date(currentDate);
    let scholarStartDate = new Date(dateStarted);
    let convertDiffDays = (axieResetDate.getDate() - scholarStartDate.getDate())
    let resetTime = axieResetDate.getHours() >= 8 ? convertDiffDays + 1 : convertDiffDays; 
    let avgSlp = totalSlp/resetTime || 0;
    return avgSlp.toFixed();
  }

  function getTotalSlpClaimable(dailyAvg, totalSlp) {
    let slpClaimable = 0;
    if (dailyAvg >= 195) {
      slpClaimable = totalSlp * .50;
    } else if(dailyAvg >= 165 && dailyAvg <= 194) {
      slpClaimable = totalSlp * .45;
    } else if(dailyAvg >= 135 && dailyAvg <= 164) {
      slpClaimable = totalSlp * .40;
    } else if(dailyAvg >= 105 && dailyAvg <= 134) {
      slpClaimable = totalSlp * .35;
    } else if(dailyAvg >= 75 && dailyAvg <= 104) {
      slpClaimable = totalSlp * .30;
    } else {
      slpClaimable = totalSlp * 0;
    }
    return slpClaimable.toFixed();
  }

  function setAvgSlpBadgeColor(dailyAvg) {
    if (dailyAvg >= 195) {
      return 'badge-success';
    } else if(dailyAvg >= 165 && dailyAvg <= 194) {
      return 'badge-info';
    } else if(dailyAvg >= 135 && dailyAvg <= 164) {
      return 'badge-warning';
    } else if(dailyAvg >= 105 && dailyAvg <= 134) {
      return 'badge-danger';
    } else if(dailyAvg >= 75 && dailyAvg <= 104) {
      return 'badge-secondary';
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

  function getUnclaimedInPhp(unclaimedSlp) {
    return unclaimedSlp * slpPhPrice;
  }

  function getFee(aveSlp) {
    let fee = 0;
    if (aveSlp >= 195) {
      fee = '50';
    } else if(aveSlp >= 165 && aveSlp <= 194) {
      fee = '55';
    } else if(aveSlp >= 135 && aveSlp <= 164) {
      fee = '60';
    } else if(aveSlp >= 105 && aveSlp <= 134) {
      fee = '65';
    } else if(aveSlp >= 75 && aveSlp <= 104) {
      fee = '70';
    } else {
      fee = '100';
    }
    return fee;
  }
  
  function setPlayerWallet(player, totalSlp = 0, claimableSlp = 0, totalPhp = 0, averageSlpPerDay = 0, unclaimedSlp = 0) {
    let playerFee = getFee(averageSlpPerDay) || 0;
    let diffDays = (axieResetDate.getDate() - new Date(player.startDate).getDate());
    let resetTime = axieResetDate.getHours() >= 8 ? diffDays + 1 : diffDays;
    let totalDaysDiff = resetTime > 16 ? 0 : resetTime;
    let feeInSlp = getFeeInSlp(playerFee, totalSlp);
    let feeInPhp = getFeeInPhp(playerFee, totalSlp);
    let unclaimedSlpInPhp = getUnclaimedInPhp(unclaimedSlp);
    let claimableSlpInSlp = +claimableSlp + unclaimedSlp;
    let claimableSlpInPhp = unclaimedSlpInPhp + +totalPhp;

    $(`#wallet-player-name`).text(`${player.name}`);
    $(`#wallet-avg-slp-per-day`).text(`${averageSlpPerDay}`);
    $(`#wallet-farming-days`).text(`${totalDaysDiff}`);
    $(`#wallet-start-date`).text(`${new Date(player.startDate).toLocaleDateString()}`);

    $(`#wallet-total-farmed-slp`).text(`+${numberWithCommas(totalSlp.toFixed())}`);
    $(`#wallet-total-farmed-php`).text(`+₱${numberWithCommas((totalSlp * slpPhPrice).toFixed())}`);

    $(`#wallet-fee`).text(`(${playerFee}%)`);
    $(`#wallet-fee-slp`).text(`-${numberWithCommas(feeInSlp.toFixed())}`);
    $(`#wallet-fee-php`).text(`-₱${numberWithCommas(feeInPhp.toFixed())}`);

    $(`#wallet-unclaimed-slp`).text(`+${numberWithCommas(unclaimedSlp.toFixed())}`);
    $(`#wallet-unclaimed-php`).text(`+₱${numberWithCommas(unclaimedSlpInPhp.toFixed())}`);

    $(`#wallet-claimable-slp`).text(`${numberWithCommas(claimableSlpInSlp)}`);
    $(`#wallet-claimable-php`).text(`₱${numberWithCommas(claimableSlpInPhp.toFixed())}`);
  }

  function getPlayerAxieInfo(id) {
    $.ajax({
      type: "GET",
      url: `https://game-api.skymavis.com/game-api/clients/${id}/items/1`,
      dataType: "json",
      success: function (result, status, xhr) {
        let playerId = result.client_id;
        let player = players.find((player) => player.id === playerId);
        let unclaimedSlp = player.unclaimedSlp;
        let totalFarmedPrevCutoff = player.totalFarmedPrevCutoff;
        let deductedSlp = player?.deductedSlp || 0;
        let totalFarmed = (result.total - deductedSlp) || 0;
        let totalSlpCollected = totalFarmed - totalFarmedPrevCutoff;
        let averageSlpPerDay = getAverageSlpPerDay(player.startDate, totalSlpCollected) || 0;
        let avgSlpBadgeColor = setAvgSlpBadgeColor(averageSlpPerDay);
        let claimableSlp = getTotalSlpClaimable(averageSlpPerDay, totalSlpCollected) || 0;
        let totalPhp = (claimableSlp * slpPhPrice).toFixed();
        let fee = getFee(averageSlpPerDay) || 0;
        let playerFeeSlp = ((totalSlpCollected * fee)/100).toFixed();
        let playerFeePhp = (playerFeeSlp * slpPhPrice).toFixed();
        if (playerId === loggedInPlayer.id) {
          setPlayerWallet(player, totalSlpCollected, claimableSlp, totalPhp, averageSlpPerDay, unclaimedSlp);
        }
        let activePlayerAdmin = loggedInPlayer.id === '0x00f1224b055edcb0accab42eda55df0bf00f48a4';
        let feeDisplay = !activePlayerAdmin ? 'display: none;' : '';

        $(`#${playerId} .claimable-slp`).replaceWith(`
          <span class="claimable-slp badge badge-light">${numberWithCommas(claimableSlp)}</span>
        `);
        $(`#${playerId} .avg-slp`).replaceWith(`
          <span class="avg-slp badge ${avgSlpBadgeColor}">${averageSlpPerDay}</span>
        `);
        $(`#${playerId} .php-earned`).replaceWith(`
          <span class="php-earned badge badge-light mgT-3" style="${feeDisplay}">₱${numberWithCommas(totalPhp)}</span>`);

        $(`#${playerId} .fee-player`).replaceWith(`
          <span class="fee-player badge badge-warning mgT-3" style="${feeDisplay}">${numberWithCommas(playerFeeSlp)}</span>`);

        $(`#${playerId} .fee-player-php`).replaceWith(`
          <span class="fee-player-php badge badge-warning mgT-3" style="${feeDisplay}">₱${numberWithCommas(playerFeePhp)}</span>`);
      },
      error: function (xhr, status, error) {
        console.log(`${xhr.status} ${xhr.statusText}`);
      }
    });
  }

  function getPlayerArenaRanking(id) {
    $.ajax({
      type: "GET",
      url: `https://axie-infinity.p.rapidapi.com/get-update/${id}`,
      headers: {
        'x-rapidapi-host': 'axie-infinity.p.rapidapi.com',
        'x-rapidapi-key': '64776f09f3msh04aaad33770abefp150684jsn6766ed1262e0'
      },
      method: "GET",
      dataType: "json",
      success: function (result, status, xhr) {
        $(`#${id} .player-mmr`).replaceWith(`
          <span class="player-mmr badge badge-light">${numberWithCommas(result?.leaderboard?.elo)}</span>`);

        $(`#${id} .player-ranking`).replaceWith(`
          <span class="player-ranking badge badge-light">${numberWithCommas(result?.leaderboard?.rank)}</span>`);
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
        slpPhPrice = slp.php.toFixed(2);
        slpPrice.append(`${slpPhPrice}`);
        $("slp").text(slpPrice);
        createPlayersTable();
      },
      error: function (xhr, status, error) {
        createPlayersTable();
        console.log(xhr.status + "" + xhr.statusText);
      }
    });
  }

  function getBattleHistory(id) {
    $.ajax({
      type: "GET",
      url: `https://game-api.axie.technology/battlelog/${id}`,
      dataType: "json",
      success: function (result, status, xhr) {
        let fighterHtml = '';
        if (result[0]?.items?.length === 0) {
          fighterHtml += `<div>NO DATA FOUND!</div>`;
        }
        let gameList = result[0].items;
        let itemCount = gameList.length < 20 ? gameList.length : 20;
        for (i = 0; i < itemCount; i++) {
          let teamNumber = getKeyByValue(gameList[i], id);
          let setTeamId = teamNumber === 'first_client_id' ? gameList[i].first_team_id : gameList[i].second_team_id;
          let isWinner = (teamNumber === 'first_client_id' && gameList[i].winner === 0) || (teamNumber === 'second_client_id' && gameList[i].winner === 1); 
          let teamOneWin = '';
          let teamTwoWin = '';
          isWinner ? teamOneWin = 'winner' : teamTwoWin = 'winner';
          let fighters = gameList[i].fighters;
          fighters.sort((a) => (a.team_id === setTeamId) ? -1 : 1);
          fighterHtml += `<a href="https://cdn.axieinfinity.com/game/deeplink.html?f=rpl&q=${gameList[i].battle_uuid}" target="_blank">`;
            fighterHtml += `<div class="team-one ${teamOneWin}">`; 
              for (a = 0; a < 3; a++) {
                fighterHtml += `
                  <span>
                    <img class="img-fluid" src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${fighters[a].fighter_id}/axie/axie-full-transparent.png"/>
                  </span>
                `;
              }
            fighterHtml += `</div>`;
            fighterHtml += `<span class="pd-05"><img src="./img/versus.png" class="imgsize-icon"/></span>`;
            fighterHtml += `<div class="team-two ${teamTwoWin}">`;
              for (a = 3; a < 6; a++) {
                fighterHtml += `
                  <span>
                    <img class="img-fluid" src="https://storage.googleapis.com/assets.axieinfinity.com/axies/${fighters[a].fighter_id}/axie/axie-full-transparent.png"/>
                  </span>
                `;
              }
            fighterHtml += `</div>`;
          fighterHtml += `</a>`;
        }
        $('.fighters').html(fighterHtml);
      },
      error: function (xhr, status, error) {
        console.log(xhr.status + "" + xhr.statusText);
      }
    });
  }

  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

  $(document).ajaxStop(() => {
    sortPlayerByHighestSlp();
  });
});