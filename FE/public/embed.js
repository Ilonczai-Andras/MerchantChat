// MerchantChat Embed Script
// Használat: <script src="https://yoursite.com/embed.js?botId=YOUR_BOT_ID"></script>

(function() {
  // Leszedni a botId-t az URL paraméterből
  const scripts = document.getElementsByTagName('script');
  let botId = null;
  
  for (let script of scripts) {
    const src = script.src;
    if (src && src.includes('embed.js')) {
      const url = new URL(src);
      botId = url.searchParams.get('botId');
      break;
    }
  }

  if (!botId) {
    console.error('MerchantChat: botId paraméter hiányzik! Használat: <script src="...embed.js?botId=YOUR_BOT_ID"></script>');
    return;
  }

  // Widget konténer létrehozása
  const container = document.createElement('div');
  container.id = `merchant-chat-widget-${botId}`;
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    height: 600px;
    border-radius: 12px;
    box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  // Mobile responsiveness
  if (window.innerWidth < 480) {
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.bottom = '0';
    container.style.right = '0';
    container.style.borderRadius = '0';
  }

  // iFrame létrehozása
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
  `;

  // Az iframe src-je az embed oldal - rögzített origin a Next.js szerverhez
  const embedUrl = new URL(`/embed/${botId}`, 'http://localhost:3000');
  iframe.src = embedUrl.toString();
  iframe.allow = 'camera; microphone';

  container.appendChild(iframe);
  document.body.appendChild(container);

  // Toggle gomb (opcionális)
  const toggleButton = document.createElement('div');
  toggleButton.id = `merchant-chat-toggle-${botId}`;
  toggleButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: #3B82F6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    z-index: 999998;
    font-size: 24px;
    transition: all 0.3s ease;
  `;
  toggleButton.innerHTML = '💬';
  toggleButton.style.display = 'none'; // Alapértelmezettben nem látható

  let isOpen = true;
  toggleButton.addEventListener('click', function() {
    isOpen = !isOpen;
    container.style.display = isOpen ? 'block' : 'none';
    toggleButton.innerHTML = isOpen ? '✕' : '💬';
  });

  document.body.appendChild(toggleButton);

  console.log(`MerchantChat widget betöltve! Bot ID: ${botId}`);
})();
