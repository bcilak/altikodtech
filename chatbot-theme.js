(function () {
  "use strict";

  const style = document.createElement("style");
  style.id = "altikod-chatbot-theme";
  style.textContent = `
    #nxc-toggle {
      width: 64px !important;
      height: 64px !important;
      border: 4px solid #000 !important;
      border-radius: 0 !important;
      background: #ce4e4d !important;
      box-shadow: 7px 7px 0 #000 !important;
      transition: transform 100ms linear, box-shadow 100ms linear !important;
    }

    #nxc-toggle:hover {
      transform: translate(-2px, -2px) !important;
      box-shadow: 10px 10px 0 #000 !important;
    }

    #nxc-toggle:active {
      transform: translate(5px, 5px) !important;
      box-shadow: none !important;
    }

    #nxc-toggle.open {
      display: none !important;
    }

    #nxc-toggle svg {
      width: 30px !important;
      height: 30px !important;
    }

    #altikod-chat-greeting {
      position: fixed;
      right: 104px;
      bottom: 25px;
      z-index: 2147483644;
      width: min(310px, calc(100vw - 140px));
      border: 4px solid #000;
      border-radius: 0;
      background: #fffdf5;
      box-shadow: 7px 7px 0 #000;
      color: #000;
      cursor: pointer;
      font-family: "Space Grotesk", system-ui, sans-serif;
      padding: 14px 18px;
      text-align: left;
      transition: transform 120ms linear, opacity 120ms linear;
    }

    #altikod-chat-greeting::after {
      position: absolute;
      right: -16px;
      bottom: 15px;
      width: 24px;
      height: 24px;
      border-top: 4px solid #000;
      border-right: 4px solid #000;
      background: #fffdf5;
      content: "";
      transform: rotate(45deg);
    }

    #altikod-chat-greeting:hover {
      transform: translate(-2px, -2px);
    }

    #altikod-chat-greeting strong,
    #altikod-chat-greeting span {
      position: relative;
      z-index: 1;
      display: block;
    }

    #altikod-chat-greeting strong {
      margin-bottom: 4px;
      color: #ce4e4d;
      font-size: 0.95rem;
      font-weight: 900;
      text-transform: uppercase;
    }

    #altikod-chat-greeting span {
      font-size: 0.86rem;
      font-weight: 700;
      line-height: 1.35;
    }

    #altikod-chat-greeting.is-hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px);
    }

    #nxc-badge {
      top: -10px !important;
      right: -10px !important;
      width: 24px !important;
      height: 24px !important;
      border: 3px solid #000 !important;
      border-radius: 0 !important;
      background: #ffd93d !important;
      color: #000 !important;
    }

    #nxc-container {
      --nxc-accent: #ce4e4d !important;
      --nxc-accent-end: #9f3635 !important;
      --nxc-accent-rgb: 206, 78, 77 !important;
      --nxc-text-on-accent: #fff !important;
      border: 4px solid #000 !important;
      border-radius: 0 !important;
      background: #fffdf5 !important;
      box-shadow: 12px 12px 0 #000 !important;
      color: #000 !important;
      font-family: "Space Grotesk", system-ui, sans-serif !important;
    }

    #nxc-container .nxc-header {
      border-bottom: 4px solid #000 !important;
      background: #ce4e4d !important;
    }

    #nxc-container .nxc-header::before,
    #nxc-container .nxc-header::after {
      display: none !important;
    }

    #nxc-container .nxc-avatar,
    #nxc-container .nxc-close-btn {
      border: 3px solid #000 !important;
      border-radius: 0 !important;
      background: #ffd93d !important;
      box-shadow: 4px 4px 0 #000 !important;
    }

    #nxc-container .nxc-avatar svg {
      fill: #000 !important;
    }

    #nxc-container .nxc-close-btn svg {
      stroke: #000 !important;
    }

    #nxc-container .nxc-header-text h3,
    #nxc-container .nxc-header-text p {
      color: #fff !important;
    }

    #nxc-container .nxc-messages {
      background-color: #fffdf5 !important;
      background-image:
        linear-gradient(to right, rgba(0, 0, 0, .07) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, .07) 1px, transparent 1px) !important;
      background-size: 28px 28px !important;
    }

    #nxc-container .nxc-date-divider {
      color: #000 !important;
      font-weight: 700 !important;
    }

    #nxc-container .nxc-date-divider::before,
    #nxc-container .nxc-date-divider::after {
      background: #000 !important;
      height: 2px !important;
    }

    #nxc-container .nxc-msg,
    #nxc-container .nxc-typing {
      border: 3px solid #000 !important;
      border-radius: 0 !important;
      box-shadow: 4px 4px 0 #000 !important;
      font-weight: 600 !important;
    }

    #nxc-container .nxc-msg.bot,
    #nxc-container .nxc-typing {
      background: #fff !important;
      color: #000 !important;
    }

    #nxc-container .nxc-msg.user {
      background: #ce4e4d !important;
      color: #fff !important;
    }

    #nxc-container .nxc-msg-time,
    #nxc-container .nxc-msg.bot .nxc-msg-time {
      color: currentColor !important;
    }

    #nxc-container .nxc-chip {
      border: 3px solid #000 !important;
      border-radius: 0 !important;
      background: #ffd93d !important;
      box-shadow: 3px 3px 0 #000 !important;
      color: #000 !important;
      font-weight: 800 !important;
    }

    #nxc-container .nxc-input-area {
      border-top: 4px solid #000 !important;
      background: #fff !important;
    }

    #nxc-container .nxc-attach,
    #nxc-container .nxc-input-field,
    #nxc-container .nxc-send {
      border: 3px solid #000 !important;
      border-radius: 0 !important;
      box-shadow: 3px 3px 0 #000 !important;
    }

    #nxc-container .nxc-attach {
      background: #ffd93d !important;
      color: #000 !important;
    }

    #nxc-container .nxc-input-field {
      background: #fffdf5 !important;
      color: #000 !important;
    }

    #nxc-container .nxc-input-field::placeholder {
      color: rgba(0, 0, 0, .55) !important;
    }

    #nxc-container .nxc-send {
      background: #ce4e4d !important;
    }

    #nxc-container .nxc-branding {
      border-top: 2px solid #000 !important;
      background: #ffd93d !important;
      color: #000 !important;
      font-weight: 700 !important;
    }

    #nxc-container .nxc-branding a {
      color: #000 !important;
    }

    @media (max-width: 480px) {
      #altikod-chat-greeting {
        right: 92px;
        bottom: 24px;
        width: min(245px, calc(100vw - 120px));
        padding: 11px 13px;
      }

      #altikod-chat-greeting strong {
        font-size: 0.8rem;
      }

      #altikod-chat-greeting span {
        font-size: 0.76rem;
      }

      #nxc-container {
        border: 0 !important;
        box-shadow: none !important;
      }
    }
  `;

  document.head.appendChild(style);

  function mountGreeting() {
    const toggle = document.querySelector("#nxc-toggle");
    const container = document.querySelector("#nxc-container");
    if (!toggle || !container || document.querySelector("#altikod-chat-greeting")) return false;

    const brandingLink = container.querySelector(".nxc-branding a");
    if (brandingLink) {
      brandingLink.href = "https://chatbot.altikodtech.com.tr/";
      brandingLink.target = "_blank";
      brandingLink.rel = "noopener noreferrer";
      brandingLink.setAttribute("aria-label", "ChatGenius web sitesini yeni sekmede aç");
    }

    const greeting = document.createElement("button");
    greeting.id = "altikod-chat-greeting";
    greeting.type = "button";
    greeting.setAttribute("aria-label", "Altıkod Yapay Zeka Asistanı ile sohbeti aç");
    greeting.innerHTML = `
      <strong>Merhaba!</strong>
      <span>Ben Altıkod Yapay Zeka Asistanı. Size nasıl yardımcı olabilirim?</span>
    `;
    document.body.appendChild(greeting);

    const syncVisibility = () => {
      greeting.classList.toggle("is-hidden", container.classList.contains("open"));
    };

    greeting.addEventListener("click", () => {
      if (!container.classList.contains("open")) toggle.click();
    });

    new MutationObserver(syncVisibility).observe(container, {
      attributes: true,
      attributeFilter: ["class"]
    });
    syncVisibility();
    return true;
  }

  if (!mountGreeting()) {
    const observer = new MutationObserver(() => {
      if (mountGreeting()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true });
  }
})();
