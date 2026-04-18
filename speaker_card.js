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
    if (card.classList.contains("is-hidden")) {
      card.classList.remove("show");
      return;
    }

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

function getSpeakerCardData() {
  const cards = Array.from(
    document.querySelectorAll(".speaker-card[data-session-id]")
  );

  return cards.map((card) => {
    const details = card.querySelector(".speaker-details");
    const name = details?.querySelector("h3")?.textContent?.trim() || "";
    const paragraphs = details ? Array.from(details.querySelectorAll("p")) : [];
    const company = paragraphs[0]?.textContent?.trim() || "";
    const topic = paragraphs[paragraphs.length - 1]?.textContent?.trim() || "";

    return {
      card,
      searchableText: [name, topic, company].join(" ").toLowerCase(),
    };
  });
}

function updateSearchResultsStatus(visibleCount, totalCount, query) {
  const statusElement = document.getElementById("search-results-status");

  if (!statusElement) {
    return;
  }

  if (!query) {
    statusElement.textContent = "Showing all speakers";
    return;
  }

  if (visibleCount === 0) {
    statusElement.textContent = `No speakers found for "${query}"`;
    return;
  }

  const speakerLabel = visibleCount === 1 ? "speaker" : "speakers";
  statusElement.textContent = `Showing ${visibleCount} of ${totalCount} ${speakerLabel} for "${query}"`;
}

function setupSpeakerSearch() {
  const searchInput = document.getElementById("speaker-search");

  if (!searchInput) {
    return;
  }

  const speakerCards = getSpeakerCardData();
  const totalCount = speakerCards.length;

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    const visibleCards = speakerCards.filter(({ searchableText, card }) => {
      const isMatch = !query || searchableText.includes(query);
      card.classList.toggle("is-hidden", !isMatch);
      return isMatch;
    });

    updateSearchResultsStatus(visibleCards.length, totalCount, event.target.value.trim());
    handleScroll();
  });
}

window.addEventListener("scroll", handleScroll);

document.addEventListener("DOMContentLoaded", () => {
  handleScroll();
  setupScheduleButtons();
  setupSpeakerSearch();
});
