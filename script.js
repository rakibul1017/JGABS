/* script.js - robust behavior for JGABS pages */

document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLink();
  initTabs();
  initIssueFiltersAndLatest();
  initForms();
});

// highlight nav link based on filename
function setActiveNavLink() {
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (!href) return;
    if (href === current || (href === 'index.html' && (current === '' || current === 'index.html'))) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

// generic tab init
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  if (!tabs.length) return;
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      // toggle active classes
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      const el = document.getElementById(target);
      if (el) el.classList.add('active');
      // if latest tab selected, repopulate latest area
      if (target === 'latest') populateLatestFromIssueCard();
    });
  });
  // activate first or existing .active
  const start = document.querySelector('.tab-btn.active') || tabs[0];
  if (start) start.click();
}

// Initialize issue filters (volume/issue) and populate Latest tab from data-latest
function initIssueFiltersAndLatest() {
  const volumeSelect = document.getElementById('volumeSelect');
  const issueSelect = document.getElementById('issueSelect');
  const issueCards = document.querySelectorAll('.issue-card');

  function filterIssues() {
    const v = volumeSelect ? volumeSelect.value : 'all';
    const i = issueSelect ? issueSelect.value : 'all';
    issueCards.forEach(card => {
      const cv = card.dataset.volume || '';
      const ci = card.dataset.issue || '';
      let show = true;
      if (v !== 'all' && cv !== v) show = false;
      if (i !== 'all' && ci !== i) show = false;
      card.style.display = show ? '' : 'none';
    });
  }

  if (volumeSelect) volumeSelect.addEventListener('change', filterIssues);
  if (issueSelect) issueSelect.addEventListener('change', filterIssues);
  // initial filter
  if (volumeSelect || issueSelect) filterIssues();

  // populate latest once at start
  populateLatestFromIssueCard();
}

// Build the Latest tab from the .issue-card that has data-latest="true"
function populateLatestFromIssueCard() {
  const latestContainer = document.getElementById('latest-articles');
  if (!latestContainer) return;
  latestContainer.innerHTML = ''; // clear

  // find .issue-card with data-latest="true"
  let latest = document.querySelector('.issue-card[data-latest="true"]');
  if (!latest) {
    // fallback: take the first visible issue-card
    const all = document.querySelectorAll('.issue-card');
    if (all.length) latest = all[0];
  }
  if (!latest) {
    latestContainer.innerHTML = '<p>No issues found.</p>';
    return;
  }

  // read list items inside latest (li elements with view/download anchors)
  const lis = latest.querySelectorAll('ul li');
  if (!lis.length) {
    // if no list items, clone entire card
    const clone = latest.cloneNode(true);
    clone.classList.remove('issue-card');
    clone.classList.add('article-card');
    clone.removeAttribute('data-volume');
    clone.removeAttribute('data-issue');
    clone.removeAttribute('data-latest');
    latestContainer.appendChild(clone);
    return;
  }

  // create article cards from list items
  const grid = document.createElement('div');
  grid.className = 'articles';
  lis.forEach(li => {
    const titleSpan = li.querySelector('.title') || li;
    const titleText = titleSpan.textContent.trim();
    // try to find a view/download link inside LI (links with class 'view-link' / 'download-link')
    const viewA = li.querySelector('a.view-link');
    const downloadA = li.querySelector('a.download-link');
    const articleDiv = document.createElement('div');
    articleDiv.className = 'article-card';

    const h3 = document.createElement('h3'); h3.textContent = titleText;
    articleDiv.appendChild(h3);

    if (viewA) {
      const p = document.createElement('p');
      p.style.marginBottom = '8px';
      const authorText = viewA.dataset.author || '';
      if (authorText) p.textContent = `Author: ${authorText}`;
      articleDiv.appendChild(p);
    }

    const actions = document.createElement('div');
    actions.className = 'article-actions';

    if (viewA) {
      const v = viewA.cloneNode(true);
      v.classList.add('btn'); v.classList.remove('view-link');
      v.target = '_blank';
      actions.appendChild(v);
    }
    if (downloadA) {
      const d = downloadA.cloneNode(true);
      d.classList.add('btn', 'secondary'); d.classList.remove('download-link');
      actions.appendChild(d);
    }

    articleDiv.appendChild(actions);
    grid.appendChild(articleDiv);
  });

  latestContainer.appendChild(grid);
}

// basic form handlers (submission/contact)
function initForms() {
  const submissionForm = document.getElementById('submissionForm');
  if (submissionForm) {
    submissionForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('✅ Manuscript received. It will be reviewed and scheduled for the next issue.');
      submissionForm.reset();
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('📩 Thank you — your message was sent. We will reply soon.');
      contactForm.reset();
    });
  }
}
