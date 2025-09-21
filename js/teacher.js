document.addEventListener("DOMContentLoaded", function() {
    const sheetID = "14Q55BP69jdGi715vHNeMlC9MtEoCRms4ZI8KkrBSaIs";
    const gid = "0";
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?gid=${gid}&tqx=out:json`;

    fetch(url)
      .then(res => res.text())
      .then(text => {
        const jsonText = text.substr(text.indexOf("{"), text.lastIndexOf("}") - text.indexOf("{") + 1);
        const dataObj = JSON.parse(jsonText);

        const tableBody = document.querySelector("#results-table tbody");
        tableBody.innerHTML = ""; 

        dataObj.table.rows.forEach(row => {
          const timestamp = row.c[0]?.f || row.c[0]?.v || "";
          const name = row.c[1]?.v || "";
          const score = row.c[2]?.v || "";

          let tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${name}</td>
            <td>${score}</td>
            <td>${timestamp}</td>
          `;
          tableBody.appendChild(tr);
        });

      })
      .catch(err => {
        console.error("Error loading sheet data:", err);
      });
  });

document.getElementById("clear-btn").addEventListener("click", function () {
    const scriptURL = "https://script.google.com/macros/s/AKfycbwPnGOeHQUz3Ori2zGKILPaIBZdAYb_wBu7abmIzDt5CxJQ29_h1oR6CN64Q-RXUR9_/exec";
    alert("Clearing results, please wait....");
    fetch(`${scriptURL}?action=clear`, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ anything: "whatever" }),
        headers: { "Content-Type": "application/json" }
    })
    .then(() => {
        alert("All results cleared!");
        location.reload();
    })
    .catch(err => alert("Error: " + err));
});