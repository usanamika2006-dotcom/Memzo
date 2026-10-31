// MEMZO Dashboard Charts Initialization (Chart.js)

function initRevenueChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue ($)',
        data: data,
        borderColor: '#062722',
        backgroundColor: 'rgba(145, 232, 193, 0.25)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#C9FF82',
        pointBorderColor: '#062722',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#062722',
          titleColor: '#91E8C1',
          bodyColor: '#FFFFFF',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              return 'Revenue: $' + context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 });
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#777F79',
            font: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 12
            }
          }
        },
        y: {
          grid: {
            color: '#E6E9E2',
            borderDash: [4, 4]
          },
          ticks: {
            color: '#777F79',
            font: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 12
            },
            callback: function (value) {
              return '$' + value;
            }
          }
        }
      }
    }
  });
}

function initStatusDoughnut(canvasId, statusCounts) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = Object.keys(statusCounts);
  const data = Object.values(statusCounts);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#C9FF82', // Active (lime)
          '#91E8C1', // Confirmed (mint)
          '#E6E9E2', // Draft (grey)
          '#062722'  // Closed (teal)
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 12
            },
            padding: 14
          }
        }
      },
      cutout: '70%'
    }
  });
}
