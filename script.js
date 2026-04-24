/* Toggle Sidebar on mobile and desktop */
function toggleSidebar() {
  const backdrop = document.querySelector('.sidebar-backdrop');
  if (window.innerWidth <= 900) {
    document.body.classList.toggle('sidebar-open');
    if (backdrop) {
      backdrop.classList.toggle('active');
    }
  } else {
    const isHidden = document.body.classList.toggle('sidebar-hidden');
    sessionStorage.setItem('sidebarHidden', isHidden ? '1' : '0');
  }
}

/* Active link helper for sidebar navigation */
function updateSidebarActiveLink() {
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.sidebar ul li').forEach((li) => {
    const anchor = li.querySelector('a');
    if (!anchor) return;
    if (anchor.getAttribute('href').toLowerCase() === currentPage) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
}

/* Restore sidebar hidden state on desktop */
function restoreSidebarState() {
  if (window.innerWidth > 900 && sessionStorage.getItem('sidebarHidden') === '1') {
    document.body.classList.add('sidebar-hidden');
  }
}

/* Close mobile sidebar when a nav link is clicked */
function initSidebarLinkClose() {
  document.querySelectorAll('.sidebar ul li a').forEach((anchor) => {
    anchor.addEventListener('click', function () {
      if (window.innerWidth <= 900) {
        document.body.classList.remove('sidebar-open');
        const backdrop = document.querySelector('.sidebar-backdrop');
        if (backdrop) {
          backdrop.classList.remove('active');
        }
      }
    });
  });
}

/* Initialize sidebar on every page load */
function initSidebar() {
  restoreSidebarState();
  updateSidebarActiveLink();
  initSidebarLinkClose();
}

/* Run on page load */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebar);
} else {
  initSidebar(); // Already loaded
}

// Other functionality
function toggleCode(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = el.style.display === "block" ? "none" : "block";
  }
}

function copyCode(id, btn) {
  const code = document.getElementById(id);
  if (!code) return;
  
  navigator.clipboard.writeText(code.innerText)
    .then(() => {
      btn.innerText = "Copied!";
      btn.style.background = "#00b894";
      setTimeout(() => {
        btn.innerText = "Copy";
        btn.style.background = "#111";
      }, 1500);
    })
    .catch(() => {
      btn.innerText = "Error";
    });
}

// Search functionality
const searchInput = document.getElementById("searchInput");
const components = document.querySelectorAll(".component-card");
if (searchInput) {
  searchInput.addEventListener("keyup", function () {
    const value = this.value.toLowerCase();
    components.forEach((item) => {
      const text = item.dataset.name?.toLowerCase() || '';
      item.style.display = text.includes(value) ? "block" : "none";
    });
  });
}