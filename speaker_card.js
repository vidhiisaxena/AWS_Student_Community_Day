const SAVED_SESSIONS_KEY = "awsStudentCommunitySavedSessions";

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function handleScroll() {
  const cards = document.querySelectorAll(".speaker-card");

  cards.forEach((card) => {
    if (isElementInViewport(card)) {
      card.classList.add("show");
    } else {
      card.classList.remove("show");
    }
  });
}

function getSavedSessions() {
  try {
    const savedSessions = localStorage.getItem(SAVED_SESSIONS_KEY);
    const parsedSessions = JSON.parse(savedSessions || "[]");
    return Array.isArray(parsedSessions) ? parsedSessions : [];
  } catch (error) {
    return [];
  }
}

function saveSessions(sessionIds) {
  localStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(sessionIds));
}

function updateSavedCount(savedSessions) {
  const countElement = document.getElementById("saved-sessions-count");

  if (!countElement) {
    return;
  }

  const sessionLabel = savedSessions.length === 1 ? "session" : "sessions";
  countElement.textContent = `${savedSessions.length} saved ${sessionLabel}`;
}

function updateCardState(card, isSaved) {
  const button = card.querySelector(".schedule-button");

  card.classList.toggle("saved-session", isSaved);

  if (button) {
    button.textContent = isSaved ? "Remove from My Schedule" : "Add to My Schedule";
    button.setAttribute("aria-pressed", String(isSaved));
  }
}

function setupScheduleButtons() {
  const cards = document.querySelectorAll(".speaker-card[data-session-id]");
  const savedSessions = new Set(getSavedSessions());

  cards.forEach((card) => {
    const sessionId = card.dataset.sessionId;
    const button = card.querySelector(".schedule-button");

    if (!sessionId || !button) {
      return;
    }

    updateCardState(card, savedSessions.has(sessionId));

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (savedSessions.has(sessionId)) {
        savedSessions.delete(sessionId);
      } else {
        savedSessions.add(sessionId);
      }

      const updatedSessions = Array.from(savedSessions);
      saveSessions(updatedSessions);
      updateCardState(card, savedSessions.has(sessionId));
      updateSavedCount(updatedSessions);
    });
  });

  updateSavedCount(Array.from(savedSessions));
}

window.addEventListener("scroll", handleScroll);

document.addEventListener("DOMContentLoaded", () => {
  handleScroll();
  setupScheduleButtons();
});
