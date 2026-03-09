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

    // FIX: Select h2, h3, h4 tags that are NOT inside our sidebar
    const headers = document.querySelectorAll('h2:not(#chat-outline-sidebar *), h3:not(#chat-outline-sidebar *), h4:not(#chat-outline-sidebar *)');
    
    const fragment = document.createDocumentFragment();

    headers.forEach((header) => {
      // Safety check: ensure the header actually has text
      if (!header.textContent.trim()) return;

      const li = document.createElement('li');
      li.textContent = header.textContent.replace(/#/g, '').trim();
      
      const level = header.tagName.toLowerCase();
      li.classList.add(`level-${level}`);
      
      li.onclick = () => header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      fragment.appendChild(li);
    });

    list.innerHTML = '';
    list.appendChild(fragment);

    updateHighlight();
  }, 300); 
};

// Create the Sidebar Container
const sidebar = document.createElement('div');
sidebar.id = 'chat-outline-sidebar';
sidebar.className = 'sidebar-open';
sidebar.innerHTML = `
  <button id="outline-toggle">☰</button>
  <div class="sidebar-container">
    <div class="sidebar-header">
      <h3>Chat Outline</h3>
    </div>
    <div class="sidebar-scroll-area">
      <ul id="outline-list"></ul>
    </div>
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