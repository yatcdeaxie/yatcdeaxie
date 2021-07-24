var arenaLvl = [
  { mmr: "Under 800", slpGained: "No" },
  { mmr: "800-999", slpGained: "1" },
  { mmr: "1000-1099", slpGained: "3" },
  { mmr: "1100-1299", slpGained: "7" },
  { mmr: "1300-1499", slpGained: "8" },
  { mmr: "1500-1799", slpGained: "9" },
  { mmr: "1800-1999", slpGained: "10" },
  { mmr: "2000-2199", slpGained: "11" },
  { mmr: "2200+", slpGained: "12" }
];

var adventureLvl = [
  { mmr: "1-4", slpGained: "1" },
  { mmr: "5-9", slpGained: "2" },
  { mmr: "10-14", slpGained: "4" },
  { mmr: "15-16", slpGained: "6" },
  { mmr: "17-20", slpGained: "6-10" },
  { mmr: "21-36", slpGained: "10-20" }
];

$(document).ready(() => {
 createArenaMmrTable();
 createAdventureTable();

  function createArenaMmrTable() {
    for (var i = 0; i < arenaLvl.length; i++) {
      let arena = arenaLvl[i];
      $(".table-arena").append(
        `<tr>
          <td>${arena.mmr}
          <td>${arena.slpGained} <img src='img/slp.png' class='imgsize-icon'/>`);
    }
  }

  function createAdventureTable() {
    for (var i = 0; i < adventureLvl.length; i++) {
      let arena = adventureLvl[i];
      $(".table-adventure").append(
        `<tr>
          <td>${arena.mmr}
          <td>${arena.slpGained} <img src='img/slp.png' class='imgsize-icon'/>`);
    }
  }
});