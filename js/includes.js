/* Green Chili Indian shared chrome — unique layout */
(function () {
  const ORDER = "https://www.greenchilioh.com/#menu";
  const ORDER_MENU = "https://www.greenchilioh.com/#menu";
  const PHONE = "9379994545";
  const PHONE_DISPLAY = "(937) 999-4545";
  const MAPS = "https://maps.app.goo.gl/GBnJEeNAktCb8hV2A";
  const LOGO = "https://quseprdus1.blob.core.windows.net/kora-business-images/user-media/96560c14-e994-45fe-b22a-5d16572c7730/de8c94d8-887e-4625-825f-ec262dbc28df/1786115865_bgrw31.png";

  window.GCI_LINKS = { ORDER, ORDER_MENU, PHONE, PHONE_DISPLAY, MAPS };

  const icon = {
    menu: '<svg class="icon-stroke" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg class="icon-stroke" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  function mountHeader(el, page) {
    const active = (id) => (page === id ? ' aria-current="page"' : "");
    el.innerHTML = `
      <div class="nav-shell">
        <a class="brand" href="index.html" aria-label="Green Chili Indian Restaurant home">
          <img src="${LOGO}" width="100" height="48" alt="Green Chili Indian Restaurant logo">
          <span class="brand-text"><strong>Green Chili</strong><span>Indian Restaurant</span></span>
        </a>
        <nav class="nav-links" aria-label="Primary">
          <a href="index.html"${active("home")}>Home</a>
          <a href="menu.html"${active("menu")}>Menu</a>
          <a href="index.html#about">About</a>
          <a href="index.html#gallery">Gallery</a>
          <a href="contact.html"${active("contact")}>Contact</a>
          <a class="nav-cta" data-order-regular href="${ORDER}" target="_blank" rel="noopener noreferrer">Order Online</a>
        </nav>
        <a class="nav-meta" href="tel:${PHONE}">${PHONE_DISPLAY}</a>
        <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-nav-open>${icon.menu}</button>
      </div>`;
  }

  function mountMobile(el) {
    el.innerHTML = `
      <a href="index.html">Home</a>
      <a href="menu.html">Menu</a>
      <a href="index.html#about">About</a>
      <a href="index.html#gallery">Gallery</a>
      <a href="index.html#catering">Catering</a>
      <a href="contact.html">Contact</a>
      <a href="${ORDER}" target="_blank" rel="noopener noreferrer">Order Online</a>
      <a href="tel:${PHONE}">Call ${PHONE_DISPLAY}</a>
      <a href="${MAPS}" target="_blank" rel="noopener noreferrer">Directions</a>`;
  }

  function mountFooter(el) {
    el.innerHTML = `
      <div class="footer-shell">
        <div class="footer-brand">
          <img src="${LOGO}" width="117" height="56" alt="Green Chili Indian Restaurant">
          <strong>Green Chili</strong>
          <p>Authentic Indian cuisine in Dayton — curries, tandoori, biryani, and warm hospitality at 1501 Lyons Road.</p>
        </div>
        <div class="footer-links">
          <div>
            <h4>Visit</h4>
            <a href="${MAPS}" target="_blank" rel="noopener noreferrer">1501 Lyons Road<br>Dayton, OH 45458</a>
            <a href="tel:${PHONE}">${PHONE_DISPLAY}</a>
          </div>
          <div>
            <h4>Explore</h4>
            <a href="index.html#about">About</a>
            <a href="menu.html">Menu</a>
            <a href="index.html#gallery">Gallery</a>
            <a href="index.html#catering">Catering</a>
            <a href="contact.html">Contact</a>
            <a href="${ORDER}" target="_blank" rel="noopener noreferrer">Order Online</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} Green Chili Indian Restaurant</p>
        <p>Dine-in · Dayton, OH</p>
      </div>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page || "home";
    const header = document.querySelector("[data-header]");
    const footer = document.querySelector("[data-footer]");
    const mobile = document.querySelector("[data-mobile-nav]");
    if (header) mountHeader(header, page);
    if (footer) mountFooter(footer);
    if (mobile) mountMobile(mobile);

    const openBtn = document.querySelector("[data-nav-open]");

    function setChromeHeight() {
      const siteHeader = document.querySelector(".site-header");
      const headH = siteHeader ? siteHeader.offsetHeight : 72;
      document.documentElement.style.setProperty("--header-h", headH + "px");
      document.documentElement.style.setProperty("--site-chrome-h", headH + "px");
      if (mobile) mobile.style.top = headH + "px";
    }

    function openNav() {
      if (!mobile) return;
      mobile.classList.add("is-open");
      document.body.classList.add("nav-open");
      if (openBtn) {
        openBtn.setAttribute("aria-expanded", "true");
        openBtn.setAttribute("aria-label", "Close menu");
        openBtn.innerHTML = icon.close;
      }
    }

    function closeNav() {
      if (!mobile) return;
      mobile.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      if (openBtn) {
        openBtn.setAttribute("aria-expanded", "false");
        openBtn.setAttribute("aria-label", "Open menu");
        openBtn.innerHTML = icon.menu;
      }
    }

    openBtn && openBtn.addEventListener("click", () => {
      if (document.body.classList.contains("nav-open")) closeNav();
      else openNav();
    });
    mobile && mobile.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    const siteHeader = document.querySelector(".site-header");
    const onScroll = () => siteHeader && siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", setChromeHeight, { passive: true });
    onScroll();
    setChromeHeight();
    requestAnimationFrame(setChromeHeight);
  });
})();
