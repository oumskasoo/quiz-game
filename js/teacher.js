if (!localStorage.getItem("teacherLoggedIn")) {
        alert("Please login first!");
        window.location.href = "login.html";
    }

// if (window.Chart && window.ChartDataLabels) {
//   Chart.register(ChartDataLabels);
// }

document.addEventListener("DOMContentLoaded", async function() {
    const sheetID = "14Q55BP69jdGi715vHNeMlC9MtEoCRms4ZI8KkrBSaIs";
    const gid = "0";
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?gid=${gid}&tqx=out:json`;

    // DOM
    const tableBody = document.querySelector("#results-table tbody");

    const SORT_TYPES = ["text", "number", "text", "date"]; // Name, Score, Feedback, Time

    const theadThs = document.querySelectorAll("#results-table thead th");
    const tbody = document.querySelector("#results-table tbody");

    // Add click events to each table header
    theadThs.forEach((th, idx) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", () => {
        // Calculate the new direction (asc/desc)
        const current = th.getAttribute("data-sort") || "none";
        const dir = current === "asc" ? "desc" : "asc";
        // Clear the arrows in other table headers
        theadThs.forEach(h => h.removeAttribute("data-sort"));
        th.setAttribute("data-sort", dir);

        // Read and sort the current table rows
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const type = SORT_TYPES[idx];

        rows.sort((a, b) => {
          const aText = a.children[idx]?.textContent.trim() ?? "";
          const bText = b.children[idx]?.textContent.trim() ?? "";

          let aVal = aText, bVal = bText;
          if (type === "number") {
            aVal = parseFloat(aText) || 0;
            bVal = parseFloat(bText) || 0;
          } else if (type === "date") {
            aVal = Date.parse(aText) || 0;
            bVal = Date.parse(bText) || 0;
          } else {
            aVal = aText.toLowerCase();
            bVal = bText.toLowerCase();
          }

          const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return dir === "asc" ? cmp : -cmp;
        });

        // Re-attach the sorted rows
        rows.forEach(r => tbody.appendChild(r));
      });
    });

    // Tool: Pulling gviz JSON from Google Sheets
    async function fetchSheetJSON(gvizUrl) {
      const res = await fetch(gvizUrl);
      const text = await res.text();
      const json = JSON.parse(
        text.replace(/^[\s\S]*setResponse\(/, "").replace(/\);?\s*$/, "")
      );
      return json;
    }

    // A:ID, B:Timestamp, C:Name, D:Score, E:Feedback
    function parseRows(gvizJson) {
      const rows = gvizJson?.table?.rows || [];
      return rows.map(r => {
        const c = r.c || [];
        const id        = c[0]?.v ?? "";
        const timestamp = c[1]?.f || c[1]?.v || "";
        const name      = c[2]?.v ?? "";
        const score     = c[3]?.v ?? "";
        const feedback  = c[4]?.v ?? "";
        return { id, timestamp, name, score, feedback };
      });
    }

    document.getElementById("refresh-btn").addEventListener("click", async () => {
      const btn = document.getElementById("refresh-btn");
      btn.disabled = true;
      btn.textContent = "🔄 Refreshing...";
      await loadAndRenderData();
      btn.textContent = "🔄 Refresh Data";
      btn.disabled = false;
    });
   
    // Sort by time in descending order
    function sortByTimeDesc(arr) {
      return [...arr].sort((a, b) => {
        const ta = Date.parse(a.timestamp) || 0;
        const tb = Date.parse(b.timestamp) || 0;
        return tb - ta;
      });
    }

    // Rendering: The four columns are consistent with the table header.
    function renderTable(rows) {
      if (!tableBody) return;
      tableBody.innerHTML = "";
      const frag = document.createDocumentFragment();

      rows.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${r.name}</td>
          <td>${r.score}</td>
          <td>${r.feedback}</td>
          <td>${r.timestamp}</td>
        `;
        frag.appendChild(tr);
      });

      tableBody.appendChild(frag);
    }

    // Initialization process
    try {
      const json = await fetchSheetJSON(url);
      const parsed = parseRows(json);
      const sorted = sortByTimeDesc(parsed);
      renderTable(sorted);
      // initChartToggle(sorted);
    } catch (err) {
      console.error(err);
      alert("Data reading failed, please try again later.");
    }

    async function loadAndRenderData() {
      try {
        const bust = `&cachebust=${Date.now()}`;
        const res = await fetch(url + bust);
        const text = await res.text();
        const json = JSON.parse(text.replace(/^[\s\S]*setResponse\(/, "").replace(/\);?\s*$/, ""));
        const parsed = parseRows(json);
        const sorted = sortByTimeDesc(parsed);

        renderTable(sorted);

        // if (typeof initChartToggle === "function") {
        //   initChartToggle(sorted);
        // }

        // const wrap = document.getElementById("chart-wrap");
        // if (wrap && wrap.style.display !== "none") {
        //   wrap.innerHTML = '<canvas id="feedbackChart" width="800" height="320"></canvas>';
        //   requestAnimationFrame(() => buildFeedbackChart(sorted));
        // }

      } catch (err) {
        console.error(err);
        alert("Data reading failed, please try again later.");
      }
    }

    // function getFeedbackCounts(rows) {
    //   const counts = {};
    //   rows.forEach(r => {
    //     // Force conversion to string to avoid .trim errors
    //     const key = String(r.feedback ?? "").trim().toLowerCase();
    //     if (!key) return;
    //     counts[key] = (counts[key] || 0) + 1;
    //   });
    //   return counts;
    // }

    // let feedbackChartInstance = null;

    // function buildFeedbackChart(rows) {
    //   const counts = getFeedbackCounts(rows);
    //   const entries = Object.entries(counts);

    //   if (entries.length === 0) {
    //     const wrap = document.getElementById("chart-wrap");
    //     if (wrap) wrap.innerHTML = '<p style="margin:8px 0;">No feedback data to display.</p>';
    //     return;
    //   }

    //   entries.sort((a, b) => b[1] - a[1]);
    //   const labels = entries.map(([k]) => k);
    //   const values = entries.map(([, v]) => v);
    //   const total = values.reduce((s, v) => s + v, 0);

    //   const palette = [
    //     "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
    //     "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"
    //   ];

    //   const canvas = document.getElementById("feedbackChart");
    //   if (!canvas) return;

    //   if (feedbackChartInstance) {
    //     feedbackChartInstance.destroy();
    //     feedbackChartInstance = null;
    //   }

    //   const ctx = canvas.getContext("2d");

    //   feedbackChartInstance = new Chart(ctx, {
    //     type: "pie",
    //     data: {
    //       labels,
    //       datasets: [{
    //         data: values,
    //         backgroundColor: labels.map((_, i) => palette[i % palette.length]),
    //         borderWidth: 0
    //       }]
    //     },
    //     options: {
    //       responsive: true,
    //       maintainAspectRatio: false,
    //       plugins: {
    //         legend: { position: "bottom" },
    //         tooltip: { enabled: false }, 
    //         // ✅ Display percentages on sectors
    //         datalabels: {
    //           formatter: (val, ctx) => {
    //             const pct = total ? ((val / total) * 100).toFixed(1) : 0;
    //             return `${pct}%`;
    //           },
    //           color: "#fff",
    //           font: { weight: "bold", size: 14 },
    //           textAlign: "center",
    //         }
    //       }
    //     }
    //   });
    // }

    // function initChartToggle(rows) {
    //   const btn = document.getElementById("toggle-chart-btn");
    //   const wrap = document.getElementById("chart-wrap");
    //   if (!btn || !wrap) return;

    //   let visible = false;

    //   btn.addEventListener("click", () => {
    //     visible = !visible;
    //     btn.textContent = visible ? "📊 Hide Feedback Chart" : "📊 Show Feedback Chart";

    //     if (visible) {
    //       wrap.style.display = "block";
    //       wrap.innerHTML = '<canvas id="feedbackChart" width="800" height="320"></canvas>';

    //       requestAnimationFrame(() => {
    //         buildFeedbackChart(rows);
    //       });
    //     } else {
    //       if (feedbackChartInstance) {
    //         feedbackChartInstance.destroy();
    //         feedbackChartInstance = null;
    //       }
    //       wrap.style.display = "none";
    //       wrap.innerHTML = "";
    //     }
    //   });
    // }
});

document.getElementById("clear-btn").addEventListener("click", function () {
    const scriptURL = "https://script.google.com/macros/s/AKfycbyeqvCaljDDQP8eIhCOjwBdTDzu4JA7_ypAK_9yg-sJZlLhq4IU2d8gIOooxpnUUgPt/exec";
    if (!confirm("Are you sure you want to clear ALL results? This cannot be undone.")) return;
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

document.getElementById("logout-btn").addEventListener("click", function () {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("teacherLoggedIn");
      window.location.href = "index.html"; 
    }
});

document.getElementById("export-csv-btn").addEventListener("click", () => {
  const rows = Array.from(document.querySelectorAll("#results-table tr"));
  const csv = rows.map(tr => {
    const cells = Array.from(tr.children).map(td => {
      const text = td.textContent.replace(/"/g, '""');
      return `"${text}"`;
    });
    return cells.join(",");
  }).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "results.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});