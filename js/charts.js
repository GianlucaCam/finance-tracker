// js/charts.js

// Configurazione font e colori globale per Chart.js
const getChartThemeConfig = () => {
  const isDark = document.body.classList.contains('dark-theme');
  return {
    textColor: isDark ? '#94a3b8' : '#64748b',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipColor: isDark ? '#f8fafc' : '#0f172a',
    tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
  };
};

/**
 * Genera la lista degli ultimi 6 mesi a partire da una data selezionata (mese/anno)
 */
function getLast6Months(year, month) {
  const months = [];
  // Ciclo all'indietro di 5 mesi fino al mese selezionato
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleString('it-IT', { month: 'short' }) + ' ' + d.getFullYear().toString().slice(-2)
    });
  }
  return months;
}

/**
 * Inizializza o aggiorna il grafico a ciambella delle spese per categoria
 */
window.updateCategoryChart = function(chartInstance, canvasId, placeholderId, expensesByCategory, categories) {
  const canvas = document.getElementById(canvasId);
  const placeholder = document.getElementById(placeholderId);
  if (!canvas) return null;

  const catIds = Object.keys(expensesByCategory);
  const values = Object.values(expensesByCategory);

  // Se non ci sono spese, mostra il placeholder vuoto e distruggi il grafico esistente
  if (catIds.length === 0 || values.reduce((a, b) => a + b, 0) === 0) {
    if (chartInstance) {
      chartInstance.destroy();
    }
    canvas.classList.add('hidden');
    placeholder.classList.remove('hidden');
    return null;
  }

  // Altrimenti, mostra la canvas e nascondi il placeholder
  canvas.classList.remove('hidden');
  placeholder.classList.add('hidden');

  const labels = [];
  const colors = [];
  const data = [];

  catIds.forEach(id => {
    const cat = categories.find(c => c.id === id);
    labels.push(cat ? cat.name : 'Altro');
    colors.push(cat ? cat.color : '#6b7280');
    data.push(expensesByCategory[id]);
  });

  const theme = getChartThemeConfig();

  // Se il grafico esiste già, aggiorna i dati ed effettua il redraw
  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.options.plugins.legend.labels.color = theme.textColor;
    chartInstance.update();
    return chartInstance;
  }

  // Altrimenti, crea un nuovo grafico
  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: theme.textColor,
            font: {
              family: 'Inter',
              size: 11,
              weight: 500
            },
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipColor,
          bodyColor: theme.tooltipColor,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          bodyFont: { family: 'Inter' },
          titleFont: { family: 'Inter', weight: 'bold' },
          callbacks: {
            label: function(context) {
              const val = context.raw;
              return ` Speso: ${val.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}`;
            }
          }
        }
      }
    }
  });
}

/**
 * Inizializza o aggiorna il grafico a barre del trend mensile delle entrate e uscite (ultimi 6 mesi)
 */
window.updateTrendChart = function(chartInstance, canvasId, placeholderId, transactions, year, month) {
  const canvas = document.getElementById(canvasId);
  const placeholder = document.getElementById(placeholderId);
  if (!canvas) return null;

  const monthsData = getLast6Months(year, month);
  const labels = [];
  const incomes = [];
  const expenses = [];

  let hasData = false;

  monthsData.forEach(m => {
    labels.push(m.label);
    let monthIncome = 0;
    let monthExpense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getFullYear() === m.year && tDate.getMonth() === m.month) {
        if (t.type === 'income') {
          monthIncome += Number(t.amount);
          hasData = true;
        } else if (t.type === 'expense') {
          monthExpense += Number(t.amount);
          hasData = true;
        }
      }
    });

    incomes.push(monthIncome);
    expenses.push(monthExpense);
  });

  // Se non ci sono dati, mostra il placeholder vuoto
  if (!hasData) {
    if (chartInstance) {
      chartInstance.destroy();
    }
    canvas.classList.add('hidden');
    placeholder.classList.remove('hidden');
    return null;
  }

  canvas.classList.remove('hidden');
  placeholder.classList.add('hidden');

  const theme = getChartThemeConfig();

  // Se il grafico esiste già, aggiorna i dati
  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = incomes;
    chartInstance.data.datasets[1].data = expenses;
    chartInstance.options.scales.x.ticks.color = theme.textColor;
    chartInstance.options.scales.y.ticks.color = theme.textColor;
    chartInstance.options.scales.x.grid.color = theme.gridColor;
    chartInstance.options.scales.y.grid.color = theme.gridColor;
    chartInstance.options.plugins.legend.labels.color = theme.textColor;
    chartInstance.update();
    return chartInstance;
  }

  // Altrimenti, crea un nuovo grafico
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Entrate',
          data: incomes,
          backgroundColor: '#10b981', // Verde
          borderRadius: 4
        },
        {
          label: 'Uscite',
          data: expenses,
          backgroundColor: '#ef4444', // Rosso
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: theme.gridColor,
            drawBorder: false
          },
          ticks: {
            color: theme.textColor,
            font: { family: 'Inter', size: 10 }
          }
        },
        y: {
          grid: {
            color: theme.gridColor,
            drawBorder: false
          },
          ticks: {
            color: theme.textColor,
            font: { family: 'Inter', size: 10 },
            callback: function(value) {
              return value.toLocaleString('it-IT') + ' €';
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: theme.textColor,
            font: { family: 'Inter', size: 11, weight: 500 },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipColor,
          bodyColor: theme.tooltipColor,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          bodyFont: { family: 'Inter' },
          titleFont: { family: 'Inter', weight: 'bold' },
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const val = context.raw;
              return ` ${label}: ${val.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}`;
            }
          }
        }
      }
    }
  });
}
