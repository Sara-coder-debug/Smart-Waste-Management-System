// ===============================
// Smart Waste Monitoring Dashboard
// ===============================

// Waste type rotation list
const WASTE_TYPES = ["Plastic", "Paper", "Organic"];

// Initial bin data structure
const bins = [
  {
    id: "Bin #1",
    wasteType: "Plastic",
    nirValue: 0,
    fillLevel: 0,
    status: "Normal",
  },
  {
    id: "Bin #2",
    wasteType: "Paper",
    nirValue: 0,
    fillLevel: 0,
    status: "Normal",
  },
  {
    id: "Bin #3",
    wasteType: "Organic",
    nirValue: 0,
    fillLevel: 0,
    status: "Normal",
  },
];

// Cache DOM references once for performance
const binCards = document.querySelectorAll(".bin-card");
const lastUpdatedEl = document.getElementById("last-updated");
const avgFillEl = document.getElementById("avg-fill");
const alertCountEl = document.getElementById("alert-count");
const maxNirEl = document.getElementById("max-nir");
const toggleAutoBtn = document.getElementById("toggle-auto");
const manualRefreshBtn = document.getElementById("manual-refresh");
const ecoScoreEl = document.getElementById("eco-score");
const collectionHintEl = document.getElementById("collection-hint");
const recyclingTipEl = document.getElementById("recycling-tip");

// Used to rotate waste types across refreshes
let wasteTypeRotationOffset = 0;
// Auto-refresh interval in milliseconds
const REFRESH_INTERVAL_MS = 5000;
let refreshIntervalId = null;
let autoRefreshEnabled = true;

/**
 * Returns a random integer between min and max (inclusive).
 */
const getRandomIntInclusive = (min, max) => {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
};

/**
 * Generates simulated sensor data for each bin.
 * - Random NIR values (800–1200)
 * - Random fill levels (0–100%)
 * - Status based on fill level
 * - Rotates waste types among Plastic, Paper, Organic
 */
const generateBinData = () => {
  wasteTypeRotationOffset =
    (wasteTypeRotationOffset + 1) % WASTE_TYPES.length;

  bins.forEach((bin, index) => {
    const nir = getRandomIntInclusive(800, 1200);
    const fill = getRandomIntInclusive(0, 100);
    const wasteTypeIndex =
      (index + wasteTypeRotationOffset) % WASTE_TYPES.length;

    bin.nirValue = nir;
    bin.fillLevel = fill;
    bin.wasteType = WASTE_TYPES[wasteTypeIndex];
    bin.status = fill >= 80 ? "Alert - Bin Full" : "Normal";
  });
};

/**
 * Returns CSS class for progress bar modifier based on fill level.
 */
const getProgressClassForFill = (fillLevel) =>
  fillLevel >= 80 ? "progress__bar--alert" : "progress__bar--normal";

/**
 * Returns CSS class for badge modifier based on status.
 */
const getBadgeClassForStatus = (status) =>
  status === "Normal" ? "badge--normal" : "badge--alert";

/**
 * Returns a short recycling tip based on waste type.
 */
const getRecyclingTip = (wasteType) => {
  const tipsByType = {
    Plastic:
      "Rinse plastic bottles and remove caps before placing them in the plastic bin.",
    Paper:
      "Keep paper clean and dry—greasy pizza boxes and wet paper should go to organic or general waste.",
    Organic:
      "Organic bins work best when you avoid plastic bags—use compostable liners or plain paper instead.",
  };

  const genericTips = [
    "Consistent sorting keeps bins lighter and collection routes more efficient.",
    "Small behavior changes, like flattening boxes, can free up a lot of bin space.",
    "Check labels on packaging—many items are recyclable even if they don’t look like it.",
  ];

  if (tipsByType[wasteType]) return tipsByType[wasteType];
  return genericTips[Math.floor(Math.random() * genericTips.length)];
};

/**
 * Formats the current date/time for display in the footer.
 */
const getFormattedTimestamp = () => {
  const now = new Date();
  return now.toLocaleString(undefined, {
    hour12: false,
  });
};

/**
 * Updates all UI elements to reflect the latest bin data.
 * Handles:
 * - Text content for ID, waste type, NIR value, fill level, status
 * - Progress bar width and color
 * - Status badge color and icon
 * - Last updated timestamp
 */
const updateUI = () => {
  let totalFill = 0;
  let alertCount = 0;
  let maxNir = 0;
   const wasteCounts = {
    Plastic: 0,
    Paper: 0,
    Organic: 0,
  };

  binCards.forEach((card, index) => {
    const bin = bins[index];
    if (!bin) return;

    totalFill += bin.fillLevel;
    if (bin.fillLevel >= 80) {
      alertCount += 1;
    }
    if (bin.nirValue > maxNir) {
      maxNir = bin.nirValue;
    }
    if (wasteCounts[bin.wasteType] !== undefined) {
      wasteCounts[bin.wasteType] += 1;
    }

    // Elements within each card
    const idEl = card.querySelector(".bin-card__id");
    const typeTextEl = card.querySelector(".type-text");
    const nirValueEl = card.querySelector(".nir-value");
    const fillLevelTextEl = card.querySelector(".fill-level-text");
    const progressBarEl = card.querySelector(".progress__bar");
    const statusBadgeEl = card.querySelector(".bin-card__status");
    const statusTextEl = card.querySelector(".status-text");
    const statusIconEl = statusBadgeEl.querySelector("i");

    // Update basic text
    if (idEl) idEl.textContent = bin.id;
    if (typeTextEl) typeTextEl.textContent = bin.wasteType;
    if (nirValueEl) nirValueEl.textContent = bin.nirValue.toString();
    if (fillLevelTextEl) fillLevelTextEl.textContent =
      bin.fillLevel.toString();

    // Update progress bar
    if (progressBarEl) {
      const fill = Math.max(0, Math.min(100, bin.fillLevel));
      progressBarEl.style.width = `${fill}%`;

      // Remove previous modifiers
      progressBarEl.classList.remove(
        "progress__bar--normal",
        "progress__bar--alert"
      );
      // Add new modifier
      progressBarEl.classList.add(getProgressClassForFill(fill));
    }

    // Update status badge
    if (statusBadgeEl && statusTextEl && statusIconEl) {
      statusTextEl.textContent = bin.status;

      statusBadgeEl.classList.remove("badge--normal", "badge--alert");
      statusBadgeEl.classList.add(
        getBadgeClassForStatus(bin.status)
      );

      // Icon based on status
      if (bin.status === "Normal") {
        statusIconEl.className = "fas fa-check-circle";
      } else {
        statusIconEl.className = "fas fa-exclamation-triangle";
      }
    }
  });

  // Update summary stats
  if (avgFillEl && bins.length > 0) {
    const avg = Math.round(totalFill / bins.length);
    avgFillEl.textContent = avg.toString();
  }
  if (alertCountEl) {
    alertCountEl.textContent = alertCount.toString();
  }
  if (maxNirEl) {
    maxNirEl.textContent = maxNir.toString();
  }

  // Derived eco score (higher is better: fewer full bins)
  const binsCount = bins.length || 1;
  const avgFill = Math.round(totalFill / binsCount);
  const ecoScoreRaw = 100 - avgFill;
  const ecoScore = Math.max(0, Math.min(100, ecoScoreRaw));

  if (ecoScoreEl) {
    ecoScoreEl.textContent = ecoScore.toString();
  }

  if (collectionHintEl) {
    if (alertCount > 0) {
      collectionHintEl.textContent =
        "Dispatch a collection truck soon for bins marked as full.";
    } else if (avgFill > 50) {
      collectionHintEl.textContent =
        "Plan a collection round in the next window to keep bins below 80%.";
    } else {
      collectionHintEl.textContent =
        "All routes are normal. No immediate collection needed.";
    }
  }

  if (recyclingTipEl) {
    const dominantType =
      Object.keys(wasteCounts).reduce((best, type) =>
        wasteCounts[type] > (wasteCounts[best] ?? -1) ? type : best
      ) || "Plastic";
    recyclingTipEl.textContent = getRecyclingTip(dominantType);
  }

  // Update footer timestamp
  if (lastUpdatedEl) {
    lastUpdatedEl.textContent = `Last updated: ${getFormattedTimestamp()}`;
  }
};

/**
 * Runs one refresh cycle: generate new data and update the UI.
 */
const runRefreshCycle = () => {
  generateBinData();
  updateUI();
};

/**
 * Starts the auto-refresh interval if not already running.
 */
const startAutoRefresh = () => {
  if (refreshIntervalId !== null) return;
  refreshIntervalId = setInterval(runRefreshCycle, REFRESH_INTERVAL_MS);
};

/**
 * Stops the auto-refresh interval if running.
 */
const stopAutoRefresh = () => {
  if (refreshIntervalId === null) return;
  clearInterval(refreshIntervalId);
  refreshIntervalId = null;
};

/**
 * Initializes the dashboard:
 * - Generates initial data
 * - Renders UI
 * - Starts the auto-refresh interval
 */
const initDashboard = () => {
  runRefreshCycle();
  startAutoRefresh();

  if (toggleAutoBtn) {
    toggleAutoBtn.addEventListener("click", () => {
      autoRefreshEnabled = !autoRefreshEnabled;

      if (autoRefreshEnabled) {
        startAutoRefresh();
        toggleAutoBtn.classList.remove("btn--danger");
        toggleAutoBtn.classList.add("btn--primary");
        toggleAutoBtn.innerHTML =
          '<i class="fas fa-pause-circle"></i> Pause auto-refresh';
      } else {
        stopAutoRefresh();
        toggleAutoBtn.classList.remove("btn--primary");
        toggleAutoBtn.classList.add("btn--danger");
        toggleAutoBtn.innerHTML =
          '<i class="fas fa-play-circle"></i> Resume auto-refresh';
      }
    });
  }

  if (manualRefreshBtn) {
    manualRefreshBtn.addEventListener("click", () => {
      runRefreshCycle();
      manualRefreshBtn.classList.add("btn--pulse");
      setTimeout(() => {
        manualRefreshBtn.classList.remove("btn--pulse");
      }, 300);
    });
  }
};

// Run initialization after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}
