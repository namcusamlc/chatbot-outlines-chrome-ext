let timeout = null;
let highlightObserver = null;

const updateHighlight = () => {
  if (highlightObserver) highlightObserver.disconnect();

  const headers = Array.from(document.querySelectorAll('h2, h3, h4'));
  const listItems = document.querySelectorAll('#outline-list li');
  const sidebarContent = document.querySelector('.sidebar-content');

  highlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = headers.indexOf(entry.target);
        
        listItems.forEach(li => li.classList.remove('active'));
        if (listItems[index]) {
          listItems[index].classList.add('active');
          
          // FIX: Only auto-scroll the sidebar if the user ISN'T currently 
          // hovering/scrolling the sidebar itself.
          const isUserInteractingWithSidebar = sidebarContent.matches(':hover');
          
          if (!isUserInteractingWithSidebar) {
            listItems[index].scrollIntoView({ 
              behavior: 'smooth', 
              block: 'nearest' 
            });
          }
        }
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -75% 0px', 
    threshold: 0
  });

  headers.forEach(header => highlightObserver.observe(header));
};

const updateOutline = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    const list = document.getElementById('outline-list');
    if (!list) return;

    const headers = document.querySelectorAll('h2, h3, h4');
    const fragment = document.createDocumentFragment();

    headers.forEach((header) => {
      const li = document.createElement('li');
      li.textContent = header.textContent.replace(/#/g, '').trim();
      
      // Add class for indentation (level-h2, level-h3, etc.)
      li.classList.add(`level-${header.tagName.toLowerCase()}`);
      
      li.onclick = () => header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      fragment.appendChild(li);
    });

    list.innerHTML = '';
    list.appendChild(fragment);

    // CRITICAL: Re-initialize the highlight observer after headers/list are rebuilt
    updateHighlight();
  }, 300); 
};

// Create the Sidebar Container
const sidebar = document.createElement('div');
sidebar.id = 'chat-outline-sidebar';
sidebar.className = 'sidebar-open';
sidebar.innerHTML = `
  <button id="outline-toggle">☰</button>
  <div class="sidebar-content">
    <h3>Chat Outline</h3>
    <ul id="outline-list"></ul>
  </div>
`;
document.body.appendChild(sidebar);

// Toggle Functionality
const toggleBtn = document.getElementById('outline-toggle');
toggleBtn.onclick = () => {
  sidebar.classList.toggle('sidebar-closed');
};

// Observer - Watch for chat updates
const observer = new MutationObserver((mutations) => {
  const isSidebarChange = mutations.some(m => sidebar.contains(m.target));
  if (!isSidebarChange) {
    updateOutline();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
updateOutline();