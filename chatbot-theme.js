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
      #nxc-container {
        border: 0 !important;
        box-shadow: none !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
