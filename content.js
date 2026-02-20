let timeout = null;

const updateOutline = () => {
  // Debouncing: waits 300ms after the last change before running
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    const list = document.getElementById('outline-list');
    if (!list) return;

    // Only search for headers inside the chat container to save memory
    // Gemini usually uses 'main' or specific article tags
    const headers = document.querySelectorAll('h2, h3, h4');
    
    const fragment = document.createDocumentFragment();
    headers.forEach((header) => {
      const li = document.createElement('li');
      li.textContent = header.textContent.replace(/#/g, '').trim();
      li.onclick = () => header.scrollIntoView({ behavior: 'smooth' });
      fragment.appendChild(li);
    });

    list.innerHTML = '';
    list.appendChild(fragment);
  }, 300); 
};

// Create Sidebar (same as before)
const sidebar = document.createElement('div');
sidebar.id = 'chat-outline-sidebar';
sidebar.innerHTML = '<h3>Chat Outline</h3><ul id="outline-list"></ul>';
document.body.appendChild(sidebar);

// Observer - Only watch the chat area if possible, or use a filter
const observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    // Optimization: Ignore changes if they happened inside our own sidebar
    if (sidebar.contains(mutation.target)) return;
    
    updateOutline();
    break; 
  }
});

observer.observe(document.body, { childList: true, subtree: true });