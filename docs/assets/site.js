// Theme switcher logic
function applyTheme(theme) {
    document.body.removeAttribute('data-theme');
    
    // Remove existing theme stylesheets
    const existingLinks = document.querySelectorAll('link[data-theme-style]');
    existingLinks.forEach(link => link.remove());

    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'assets/theme-b.css';
        link.setAttribute('data-theme-style', 'true');
        document.head.appendChild(link);
    } else if (theme === 'm42') {
        document.body.setAttribute('data-theme', 'm42');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'assets/theme-c.css';
        link.setAttribute('data-theme-style', 'true');
        document.head.appendChild(link);
    }
}

// Check URL params first, then localStorage
const urlParams = new URLSearchParams(window.location.search);
const urlTheme = urlParams.get('theme');

let currentTheme;

if (urlTheme) {
    if (urlTheme === 'a' || urlTheme === 'light') {
        currentTheme = 'light';
    } else if (urlTheme === 'b' || urlTheme === 'dark') {
        currentTheme = 'dark';
    } else if (urlTheme === 'c' || urlTheme === 'm42') {
        currentTheme = 'm42';
    }
    localStorage.setItem('theme', currentTheme);
} else {
    currentTheme = localStorage.getItem('theme') || 'light'; // Default to light
}

applyTheme(currentTheme);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

document.addEventListener("click", (event) => {
  const button = event.target.closest(".team-toggle");

  // If a toggle button was clicked
  if (button) {
    const cardToToggle = button.closest(".team-card");
    if (!cardToToggle) return;
    const isCurrentlyExpanded = cardToToggle.classList.contains("is-expanded");

    // Close all other expanded cards
    document.querySelectorAll(".team-card.is-expanded").forEach(card => {
      if (card !== cardToToggle) {
        card.classList.remove("is-expanded");
        const otherButton = card.querySelector(".team-toggle");
        if (otherButton) {
          otherButton.textContent = "Read more →";
        }
      }
    });

    // Toggle the clicked card
    cardToToggle.classList.toggle("is-expanded");
    button.textContent = isCurrentlyExpanded ? "Read more →" : "Read less ←";
    
    return;
  }

  // If clicked outside of any expanded card
  const expandedCard = document.querySelector(".team-card.is-expanded");
  if (expandedCard && !expandedCard.contains(event.target)) {
    expandedCard.classList.remove("is-expanded");
    const toggleButton = expandedCard.querySelector(".team-toggle");
    if (toggleButton) {
      toggleButton.textContent = "Read more →";
    }
  }

  // Keep the group toggle logic for other potential uses
  const groupButton = event.target.closest("[data-team-group-toggle]");
  if (groupButton) {
    const group = groupButton.closest(".team-group");
    if (!group) return;
    const hiddenCards = group.querySelectorAll(".team-card.is-hidden");
    const isHidden = hiddenCards.length > 0;

    if (isHidden) {
      group.querySelectorAll('.team-card[data-overflow="true"]').forEach((card) => {
        card.classList.remove("is-hidden");
      });
      groupButton.textContent = "-";
    } else {
      group.querySelectorAll('.team-card[data-overflow="true"]').forEach((card) => {
        card.classList.add("is-hidden");
      });
      groupButton.textContent = "+";
    }
    return;
  }
});

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return escapeHtml(isoDate);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const renderNewsCard = (item) => {
  const metaParts = [item.category, formatDate(item.date)].filter(Boolean);
  const meta = metaParts.join(" - ");
  const linkText = item.linkText || item.title || "";
  const linkHref = item.id ? `news.html#news-${escapeHtml(item.id)}` : "#";
  return `
    <article class="news-card">
      <a href="${linkHref}" class="news-card-link">
        <div class="news-card-media" style="background-image: url('${escapeHtml(item.image || "")}')"></div>
        ${meta ? `<span class=\"news-card-date\">${escapeHtml(meta)}</span>` : ""}
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.excerpt)}</p>
        ${linkText ? `<span class="news-card-link-text">${escapeHtml(linkText)}</span>` : ""}
      </a>
    </article>
  `;
};

const renderNewsArticle = (item) => {
  const metaParts = [item.category, formatDate(item.date)].filter(Boolean);
  const meta = metaParts.join(" - ");
  return `
    <article class="news-article reveal" id="news-${escapeHtml(item.id)}">
      <div class="news-article-head">
        ${meta ? `<span class="news-card-date">${escapeHtml(meta)}</span>` : ""}
        <h2>${escapeHtml(item.title)}</h2>
      </div>
      <div class="news-article-body">
        <img src="${escapeHtml(item.image || "")}" alt="${escapeHtml(item.title)}" class="news-article-image">
        <div class="news-article-content">${escapeHtml(item.content)}</div>
      </div>
    </article>
  `;
};

const renderTeamCard = (member) => {
  const avatar = member.image
    ? `<img class="team-avatar" src="assets/images/team/${escapeHtml(member.image)}" alt="${escapeHtml(member.name)}">`
    : `<div class="team-avatar team-placeholder" data-initials="${escapeHtml(member.initials)}"></div>`;

  return `
    <article class="team-card reveal">
      ${avatar}
      <div class="team-role">${escapeHtml(member.role)}</div>
      <h4>${escapeHtml(member.name)}</h4>
      <p class="team-bio">${escapeHtml(member.bio_short)}</p>
      <p class="team-bio--full">${escapeHtml(member.bio_full)}</p>
      <button class="team-toggle" data-team-toggle>+</button>
    </article>
  `;
};

const loadNews = async () => {
  const response = await fetch("assets/data/news.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load news");
  }
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data;
};

const loadTeam = async () => {
  const response = await fetch("assets/data/team.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load team");
  }
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data;
};

const initNewsStrip = (items) => {
  const strip = document.getElementById("news-strip");
  if (!strip) return;
  strip.innerHTML = items.map(renderNewsCard).join("");
};

const initNewsPage = (items) => {
  const list = document.getElementById("news-page");
  if (!list) return;
  list.innerHTML = items.map(renderNewsArticle).join("");
};

const initTeam = (team) => {
  const lydiaRxGrid = document.querySelector("#lydiarx-team .team-grid");
  const premiumGrid = document.querySelector("#premium-team .team-grid");

  if (lydiaRxGrid) {
    const lydiaRxMembers = team.filter(m => m.group === "LydiaRX");
    lydiaRxGrid.innerHTML = lydiaRxMembers.map(renderTeamCard).join("");
  }

  if (premiumGrid) {
    const premiumMembers = team.filter(m => m.group === "Premium");
    premiumGrid.innerHTML = premiumMembers.map(renderTeamCard).join("");
  }
};

loadNews()
  .then((items) => {
    initNewsStrip(items);
    initNewsPage(items);
  })
  .catch(() => {
    const strip = document.getElementById("news-strip");
    const list = document.getElementById("news-page");
    if (strip) strip.innerHTML = "<p class=\"news-empty\">No news available.</p>";
    if (list) list.innerHTML = "<p class=\"news-empty\">No news available.</p>";
  });

loadTeam()
  .then(initTeam)
  .catch(() => {
    const lydiaRxGrid = document.querySelector("#lydiarx-team .team-grid");
    const premiumGrid = document.querySelector("#premium-team .team-grid");
    if (lydiaRxGrid) lydiaRxGrid.innerHTML = "<p class=\"news-empty\">No team members available.</p>";
    if (premiumGrid) premiumGrid.innerHTML = "<p class=\"news-empty\">No team members available.</p>";
  });
