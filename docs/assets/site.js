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
  // Close if clicked outside any team details
  const clickedDetails = event.target.closest('.team-card--details');
  const clickedCard = event.target.closest('.team-card');
  
  if (!clickedDetails && !clickedCard) {
    // Hide all details
    document.querySelectorAll('.team-card--details').forEach(detail => {
      detail.style.display = 'none';
    });
    
    // Reset all buttons
    document.querySelectorAll('.team-toggle').forEach(btn => {
      if (btn.textContent === '-') {
        btn.textContent = '+';
      }
    });
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

  const cardId = `team-${escapeHtml(member.name).toLowerCase().replace(/\s+/g, '-')}`;

  return `
    <article class="team-card reveal" data-member-id="${cardId}">
      ${avatar}
      <div class="team-role">${escapeHtml(member.role)}</div>
      <h4>${escapeHtml(member.name)}</h4>
      <p class="team-bio">${escapeHtml(member.bio_short)}</p>
      <button class="team-toggle" onclick="toggleTeamDetails('${cardId}')">+</button>
    </article>
  `;
};

const renderTeamDetails = (member) => {
  const avatar = member.image
    ? `<img class="team-avatar" src="assets/images/team/${escapeHtml(member.image)}" alt="${escapeHtml(member.name)}">`
    : `<div class="team-avatar team-placeholder" data-initials="${escapeHtml(member.initials)}"></div>`;

  const cardId = `team-${escapeHtml(member.name).toLowerCase().replace(/\s+/g, '-')}`;

  return `
    <div class="team-card--details" id="${cardId}" style="display: none;">
      ${avatar}
      <div class="team-role">${escapeHtml(member.role)}</div>
      <h4>${escapeHtml(member.name)}</h4>
      <p class="team-bio--full">${escapeHtml(member.bio_full)}</p>
      <button class="team-toggle" onclick="toggleTeamDetails('${cardId}')">×</button>
    </div>
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

const toggleTeamDetails = (cardId) => {
  const details = document.getElementById(cardId);
  if (!details) return;
  
  // Hide all other details
  document.querySelectorAll('.team-card--details').forEach(detail => {
    if (detail.id !== cardId) {
      detail.style.display = 'none';
    }
  });
  
  // Toggle current details
  const isVisible = details.style.display === 'block';
  details.style.display = isVisible ? 'none' : 'block';
  
  // Update button text
  document.querySelectorAll(`[data-member-id="${cardId}"] .team-toggle`).forEach(btn => {
    btn.textContent = isVisible ? '+' : '-';
  });
};

const initTeam = (team) => {
  const lydiaRxGrid = document.querySelector("#lydiarx-team .team-grid");
  const premiumGrid = document.querySelector("#premium-team .team-grid");

  if (lydiaRxGrid) {
    const lydiaRxMembers = team.filter(m => m.group === "LydiaRX");
    lydiaRxGrid.innerHTML = lydiaRxMembers.map(renderTeamCard).join("");
    
    // Add details container after the grid
    const lydiaRxDetails = document.createElement('div');
    lydiaRxDetails.className = 'team-details-container';
    lydiaRxDetails.innerHTML = lydiaRxMembers.map(renderTeamDetails).join("");
    lydiaRxGrid.parentNode.appendChild(lydiaRxDetails);
  }

  if (premiumGrid) {
    const premiumMembers = team.filter(m => m.group === "Premium");
    premiumGrid.innerHTML = premiumMembers.map(renderTeamCard).join("");
    
    // Add details container after the grid
    const premiumDetails = document.createElement('div');
    premiumDetails.className = 'team-details-container';
    premiumDetails.innerHTML = premiumMembers.map(renderTeamDetails).join("");
    premiumGrid.parentNode.appendChild(premiumDetails);
  }
};

const scrollCarousel = (containerId, direction) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let grid;
  if (containerId === 'news-strip') {
    grid = container; // news-strip is the direct element
  } else {
    grid = container.querySelector('.team-grid');
  }
  
  if (!grid) return;
  
  const cardWidth = 280 + parseInt(getComputedStyle(grid).gap);
  const scrollAmount = cardWidth * direction;
  
  grid.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
  
  // Update button states
  setTimeout(() => updateCarouselButtons(containerId), 300);
};

const updateCarouselButtons = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let grid;
  if (containerId === 'news-strip') {
    grid = container; // news-strip is the direct element
  } else {
    grid = container.querySelector('.team-grid');
  }
  
  if (!grid) return;
  
  let prevBtn, nextBtn;
  if (containerId === 'news-strip') {
    // For news-strip, buttons are siblings of the carousel container
    const carouselContainer = container.closest('.carousel-container');
    prevBtn = carouselContainer?.querySelector('.carousel-nav.prev');
    nextBtn = carouselContainer?.querySelector('.carousel-nav.next');
  } else {
    // For team grids, buttons are inside the container
    prevBtn = container.querySelector('.carousel-nav.prev');
    nextBtn = container.querySelector('.carousel-nav.next');
  }
  
  if (prevBtn) {
    prevBtn.classList.toggle('disabled', grid.scrollLeft <= 0);
  }
  
  if (nextBtn) {
    const isAtEnd = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 10;
    nextBtn.classList.toggle('disabled', isAtEnd);
  }
};

// Initialize carousel button states
document.addEventListener('DOMContentLoaded', () => {
  const carousels = ['lydiarx-team', 'premium-team', 'news-strip'];
  carousels.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      let grid;
      if (id === 'news-strip') {
        grid = container; // news-strip is the direct element
      } else {
        grid = container.querySelector('.team-grid');
      }
      
      if (grid) {
        grid.addEventListener('scroll', () => updateCarouselButtons(id));
        // Initial button state
        setTimeout(() => updateCarouselButtons(id), 100);
      }
    }
  });
});

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
