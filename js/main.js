window.KORA_SITE_CONFIG = {
  apiBaseUrl: "https://kora-agent.grubtok.com",
  businessId: "96560c14-e994-45fe-b22a-5d16572c7730",
  recaptchaSiteKey: "6LcsdJYsAAAAAAur-h7cYlZuGJTmijNHmOi5kFH7",
};

function setFormStatus(form, text, kind) {
  const statusEl = form.querySelector(".form-status, [data-form-status]");
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle("is-visible", Boolean(text));
  statusEl.classList.remove(
    "form-status--error",
    "form-status--success",
    "form-status--neutral",
    "is-error",
    "is-success"
  );
  if (kind === "error") statusEl.classList.add("form-status--error", "is-error");
  else if (kind === "success") statusEl.classList.add("form-status--success", "is-success");
  else if (kind) statusEl.classList.add("form-status--neutral");
}

function setSubmittingState(form, isSubmitting, busyLabel) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  if (isSubmitting) {
    submitBtn.dataset.originalText = submitBtn.textContent || "Submit";
    submitBtn.textContent = busyLabel || "Sending...";
    submitBtn.disabled = true;
    return;
  }
  submitBtn.textContent = submitBtn.dataset.originalText || "Submit";
  submitBtn.disabled = false;
}

function parseApiError(data, fallback) {
  const detail = data && data.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const joined = detail.map((d) => d.msg || d.message || "").filter(Boolean).join(" ");
    if (joined) return joined;
  }
  if (data && typeof data.message === "string" && data.message.trim()) return data.message;
  return fallback;
}

let recaptchaScriptPromise = null;
const RECAPTCHA_W = 304;
const RECAPTCHA_H = 78;
const responsiveRecaptchaBoxes = [];

function scaleRecaptcha(box) {
  const wrap = box.parentElement;
  if (!wrap || !wrap.classList.contains("g-recaptcha-scale")) return;
  const available = wrap.clientWidth;
  if (!available) return;
  const scale = Math.min(1, available / RECAPTCHA_W);
  box.style.transform = scale < 1 ? "scale(" + scale.toFixed(4) + ")" : "none";
  wrap.style.height = Math.ceil(RECAPTCHA_H * scale) + "px";
}

function makeRecaptchaResponsive(box) {
  if (!box || box.dataset.koraRecaptchaResponsive === "true") return;
  box.dataset.koraRecaptchaResponsive = "true";

  let wrap = box.parentElement;
  if (!wrap || !wrap.classList.contains("g-recaptcha-scale")) {
    wrap = document.createElement("div");
    wrap.className = "g-recaptcha-scale";
    box.parentNode.insertBefore(wrap, box);
    wrap.appendChild(box);
  }

  scaleRecaptcha(box);
  const observer = new MutationObserver(() => scaleRecaptcha(box));
  observer.observe(box, { childList: true, subtree: true });
  responsiveRecaptchaBoxes.push(box);
}

let recaptchaResizeTimer = null;
window.addEventListener("resize", () => {
  window.clearTimeout(recaptchaResizeTimer);
  recaptchaResizeTimer = window.setTimeout(() => {
    responsiveRecaptchaBoxes.forEach(scaleRecaptcha);
  }, 150);
});

function ensureRecaptchaScript(siteKey) {
  if (!siteKey) return Promise.resolve();
  if (typeof window.grecaptcha !== "undefined") return Promise.resolve();
  if (recaptchaScriptPromise) return recaptchaScriptPromise;
  recaptchaScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-kora-recaptcha="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("reCAPTCHA failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.dataset.koraRecaptcha = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("reCAPTCHA failed to load"));
    document.head.appendChild(script);
  });
  return recaptchaScriptPromise;
}

function getRecaptchaToken(form) {
  if (typeof window.grecaptcha === "undefined") return "";
  const recaptchaEl = form.querySelector(".g-recaptcha");
  if (!recaptchaEl) return "";
  return window.grecaptcha.getResponse() || "";
}

function resetRecaptcha(form) {
  if (typeof window.grecaptcha === "undefined") return;
  if (form.querySelector(".g-recaptcha")) window.grecaptcha.reset();
}

/**
 * Kora public forms API — POST {apiBaseUrl}/api/v1/public/forms/submit
 * Requires reCAPTCHA v2 token (captcha_token) + business_id matching the Kora site.
 */
function initContactForm() {
  const form = document.getElementById("contact-form") || document.querySelector("[data-contact-form]");
  if (!form || form.dataset.bound) return;
  form.dataset.bound = "true";

  const config = window.KORA_SITE_CONFIG || {};
  const apiBaseUrl = (config.apiBaseUrl || "").replace(/\/+$/, "");
  const businessId = config.businessId || "";
  const recaptchaSiteKey = (config.recaptchaSiteKey || "").trim();
  const recaptchaEl = form.querySelector(".g-recaptcha");

  if (recaptchaEl && recaptchaSiteKey) {
    recaptchaEl.setAttribute("data-sitekey", recaptchaSiteKey);
    makeRecaptchaResponsive(recaptchaEl);
    form.addEventListener(
      "focusin",
      () => {
        ensureRecaptchaScript(recaptchaSiteKey).catch(() => {
          setFormStatus(form, "Security check failed to load. Please refresh and try again.", "error");
        });
      },
      { once: true }
    );
  } else if (recaptchaEl && !recaptchaSiteKey) {
    recaptchaEl.style.display = "none";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = ((form.querySelector('[name="name"]') || {}).value || "").trim();
    const email = ((form.querySelector('[name="email"]') || {}).value || "").trim();
    const phone = ((form.querySelector('[name="phone"]') || {}).value || "").trim();
    const topic = ((form.querySelector('[name="topic"]') || {}).value || "").trim();
    const message = ((form.querySelector('[name="message"]') || {}).value || "").trim();

    if (!name || !email || !message) {
      setFormStatus(form, "Please fill in your name, email, and message.", "error");
      return;
    }

    if (!businessId || !apiBaseUrl) {
      setFormStatus(form, "Form submission is not configured for this site.", "error");
      return;
    }

    if (recaptchaEl && !recaptchaSiteKey) {
      setFormStatus(form, "Form temporarily unavailable.", "error");
      return;
    }

    if (recaptchaEl && recaptchaSiteKey) {
      try {
        await ensureRecaptchaScript(recaptchaSiteKey);
      } catch (err) {
        setFormStatus(form, "Security check failed to load. Please refresh and try again.", "error");
        return;
      }
      const captchaCheck = getRecaptchaToken(form);
      if (!captchaCheck) {
        setFormStatus(form, "Please complete the security check.", "error");
        return;
      }
    }

    const captchaToken = getRecaptchaToken(form);
    setSubmittingState(form, true, "Sending...");
    setFormStatus(form, "Sending...", "neutral");

    const formData = {
      name: name,
      email: email,
      message: topic ? `[${topic}] ${message}` : message,
    };
    if (phone) formData.phone = phone;
    if (topic) formData.topic = topic;

    try {
      const response = await fetch(apiBaseUrl + "/api/v1/public/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          form_type: "contact",
          form_data: formData,
          submitter_email: email,
          captcha_token: captchaToken || "",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          parseApiError(data, "Something went wrong. Please try again or call us at (937) 999-4545.")
        );
      }
      form.reset();
      resetRecaptcha(form);
      setFormStatus(form, data.message || "Thank you! Your message has been received.", "success");
    } catch (error) {
      resetRecaptcha(form);
      setFormStatus(
        form,
        (error && error.message) || "Something went wrong. Please try again or call us at (937) 999-4545.",
        "error"
      );
    } finally {
      setSubmittingState(form, false);
    }
  });
}

/* Green Chili Indian interactions — unique menu rail + ledger */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* The menu is drawn into the page by Kora (kora:data:menu), so search engines read it as HTML.
     This reads it back so the tabs, rail and scroll-spy below can present it; the container they
     fill replaces the plain list. */
  function readRenderedMenu() {
    const root = document.querySelector(".kora-menu");
    if (!root) return null;
    const text = (el, selector) => {
      const node = el.querySelector(selector);
      return node ? node.textContent.trim() : "";
    };
    const categories = [...root.querySelectorAll(".kora-menu__section")].map((section) => {
      const name = text(section, ".kora-menu__section-title");
      return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        name,
        items: [...section.querySelectorAll(".kora-menu__item")].map((li) => ({
          name: text(li, ".kora-menu__item-name"),
          price: text(li, ".kora-menu__item-price") || text(li, ".kora-menu__prices"),
          description: text(li, ".kora-menu__item-desc"),
        })),
      };
    });
    return { categories };
  }

  function padNum(i) {
    return String(i + 1).padStart(2, "0");
  }

  function itemRows(items) {
    return (items || [])
      .map(
        (item, i) => `
      <article class="menu-row" style="animation-delay:${Math.min(i, 12) * 0.03}s">
        <h4>${item.name}</h4>
        <div class="price">${item.price || ""}</div>
        ${item.description ? `<p>${item.description}</p>` : ""}
      </article>`
      )
      .join("");
  }

  ready(function () {
    const reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("is-in"));
    }

    const menu = readRenderedMenu();
    const links = window.GCI_LINKS || {};
    const cats = (menu && menu.categories) || [];

    /* Home: sticky category rail + panel (Jaipore-style select + scroll-into-view) */
    const rail = document.querySelector("[data-menu-rail]");
    const menuSticky = document.querySelector("[data-menu-sticky]");
    const menuPanel = document.querySelector("[data-menu-panel]");
    const panelNum = document.querySelector("[data-panel-num]");
    const panelTitle = document.querySelector("[data-panel-title]");
    const panelItems = document.querySelector("[data-panel-items]");
    const menuHeader = document.querySelector(".site-header");
    let homeMenuActiveId = "";

    /** Scroll so the category panel top sits just under header + sticky rail. */
    function scrollHomeMenuIntoView() {
      if (!menuPanel) return;
      const headerH = menuHeader ? menuHeader.offsetHeight : 72;
      const stickyH = menuSticky ? menuSticky.offsetHeight : 0;
      const offset = headerH + stickyH + 8;
      const top = menuPanel.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }

    function centerHomeRailButton(btn) {
      if (!rail || !btn || rail.scrollWidth <= rail.clientWidth + 4) return;
      const railRect = rail.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const offset = btnRect.left - railRect.left - (railRect.width - btnRect.width) / 2;
      rail.scrollBy({ left: offset, behavior: "smooth" });
    }

    function showCategory(id, { scroll = true } = {}) {
      const idx = cats.findIndex((c) => c.id === id);
      const cat = cats[idx];
      if (!cat) return;

      homeMenuActiveId = id;
      if (panelNum) panelNum.textContent = padNum(idx);
      if (panelTitle) panelTitle.textContent = cat.name;
      if (panelItems) {
        panelItems.innerHTML = itemRows(cat.items);
        panelItems.querySelectorAll(".menu-row").forEach((row, i) => {
          row.style.animation = "none";
          void row.offsetWidth;
          row.style.animation = "";
          row.style.animationDelay = Math.min(i, 12) * 0.03 + "s";
        });
      }

      let activeBtn = null;
      if (rail) {
        rail.querySelectorAll(".menu-rail-btn").forEach((btn) => {
          const on = btn.getAttribute("data-cat") === id;
          btn.classList.toggle("is-active", on);
          btn.setAttribute("aria-selected", on ? "true" : "false");
          if (on) activeBtn = btn;
        });
      }

      if (scroll) {
        if (activeBtn) centerHomeRailButton(activeBtn);
        /* Wait a frame so new panel content lays out, then pin panel top under sticky rail. */
        requestAnimationFrame(() => {
          requestAnimationFrame(scrollHomeMenuIntoView);
        });
      }
    }

    if (rail && cats.length) {
      rail.innerHTML = cats
        .map(
          (cat, i) => `
        <button type="button" class="menu-rail-btn${i === 0 ? " is-active" : ""}" role="tab"
          data-cat="${cat.id}" aria-selected="${i === 0 ? "true" : "false"}">
          <b>${padNum(i)}</b>
          <span>${cat.name}</span>
        </button>`
        )
        .join("");
      rail.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-cat]");
        if (!btn) return;
        const id = btn.getAttribute("data-cat");
        if (id === homeMenuActiveId) {
          centerHomeRailButton(btn);
          requestAnimationFrame(scrollHomeMenuIntoView);
          return;
        }
        showCategory(id, { scroll: true });
      });
      showCategory(cats[0].id, { scroll: false });
    }

    /* Duplicate popular track for seamless marquee */
    const track = document.querySelector("[data-popular-track]");
    if (track && track.children.length) {
      track.innerHTML = track.innerHTML + track.innerHTML;
    }

    /* Menu page: scroll-spy — last section whose top has crossed sticky chrome */
    const ledgerNav = document.querySelector("[data-ledger-nav]");
    const ledgerBody = document.querySelector("[data-ledger-body]");
    const ledgerRoot = document.querySelector(".menu-ledger");
    const ledgerHeader = document.querySelector(".site-header");
    let ledgerSpyPaused = false;
    let ledgerSpyTimer = null;
    let ledgerActiveId = "";
    let ledgerScrollRaf = 0;
    /** Gap below chrome for scroll-margin; spy adds a tiny subpixel slack. */
    const LEDGER_SCROLL_MARGIN = 12;
    const LEDGER_SPY_SLACK = 2;
    const LEDGER_END_PIN_PX = 48;

    function isLedgerMobile() {
      return window.matchMedia("(max-width: 899px)").matches;
    }

    /** Stable sticky chrome height (header + mobile category bar). */
    function getLedgerChromeHeight() {
      const headerH = ledgerHeader ? ledgerHeader.offsetHeight : 72;
      const navH = isLedgerMobile() && ledgerNav ? ledgerNav.offsetHeight : 0;
      return headerH + navH;
    }

    function getLedgerScrollMargin() {
      return getLedgerChromeHeight() + LEDGER_SCROLL_MARGIN;
    }

    /** Activation Y: match real scroll-margin used by sections (+ subpixel slack). */
    function getLedgerSpyLine() {
      const sample = ledgerBody && ledgerBody.querySelector("[data-ledger-section]");
      if (sample) {
        const margin = parseFloat(getComputedStyle(sample).scrollMarginTop);
        if (!Number.isNaN(margin) && margin > 0) return margin + LEDGER_SPY_SLACK;
      }
      return getLedgerScrollMargin() + LEDGER_SPY_SLACK;
    }

    function updateLedgerStickyOffset() {
      if (!ledgerNav) return;
      const value = getLedgerScrollMargin() + "px";
      /* Must set on .menu-ledger — it defines --ledger-sticky-offset and would
         shadow a :root/documentElement assignment used by scroll-margin-top. */
      if (ledgerRoot) {
        ledgerRoot.style.setProperty("--ledger-sticky-offset", value);
        ledgerRoot.classList.toggle("is-nav-sticky", isLedgerMobile());
      }
      document.documentElement.style.setProperty("--ledger-sticky-offset", value);
    }

    function setActiveLedgerLink(id, { scrollBtnIntoView = false, updateHash = false } = {}) {
      if (!ledgerNav || !id || id === ledgerActiveId) return;
      ledgerActiveId = id;
      let activeBtn = null;
      ledgerNav.querySelectorAll("[data-ledger-link]").forEach((a) => {
        const on = a.getAttribute("data-ledger-link") === id;
        a.classList.toggle("is-active", on);
        if (on) {
          a.setAttribute("aria-current", "true");
          activeBtn = a;
        } else {
          a.removeAttribute("aria-current");
        }
      });
      if (scrollBtnIntoView && activeBtn && ledgerNav.scrollWidth > ledgerNav.clientWidth + 4) {
        const navRect = ledgerNav.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        const offset = btnRect.left - navRect.left - (navRect.width - btnRect.width) / 2;
        ledgerNav.scrollBy({ left: offset, behavior: "smooth" });
      }
      if (updateHash) {
        try {
          history.replaceState(null, "", "#" + id);
        } catch (_) {}
      }
    }

    function resolveLedgerActiveId(sections) {
      if (!sections.length) return "";

      const scrollingEl = document.scrollingElement || document.documentElement;
      const scrollBottom = scrollingEl.scrollTop + window.innerHeight;
      const docHeight = scrollingEl.scrollHeight;
      /* Pin last category near the document end (avoids short final sections). */
      if (docHeight - scrollBottom <= LEDGER_END_PIN_PX) {
        return sections[sections.length - 1].getAttribute("data-ledger-section");
      }

      const line = getLedgerSpyLine();
      let currentId = sections[0].getAttribute("data-ledger-section");
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) {
          currentId = sections[i].getAttribute("data-ledger-section");
        } else {
          break;
        }
      }
      return currentId;
    }

    function syncLedgerSpyFromScroll(sections) {
      if (ledgerSpyPaused || !sections.length) return;
      const currentId = resolveLedgerActiveId(sections);
      if (currentId) setActiveLedgerLink(currentId, { scrollBtnIntoView: true });
    }

    function scrollToLedgerCategory(id, sections) {
      const section = document.getElementById("cat-" + id);
      if (!section) return;

      ledgerSpyPaused = true;
      clearTimeout(ledgerSpyTimer);
      updateLedgerStickyOffset();
      setActiveLedgerLink(id, { scrollBtnIntoView: true, updateHash: true });

      /* Defer scroll one frame so --ledger-sticky-offset is applied to scroll-margin. */
      requestAnimationFrame(() => {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      let settled = false;
      const resume = () => {
        if (settled) return;
        settled = true;
        ledgerSpyPaused = false;
        window.removeEventListener("scrollend", resume);
        clearTimeout(ledgerSpyTimer);
        /* Keep the clicked category after programmatic scroll. Re-syncing here
           often picks the previous section when the target sits just under the
           sticky chrome (scroll-margin landing). User scroll resumes spy. */
        setActiveLedgerLink(id, { scrollBtnIntoView: true });
      };

      window.addEventListener("scrollend", resume, { once: true });
      ledgerSpyTimer = setTimeout(resume, 900);
    }

    if (ledgerNav && ledgerBody && cats.length) {
      ledgerNav.innerHTML = cats
        .map(
          (cat, i) =>
            `<button type="button" class="ledger-link${i === 0 ? " is-active" : ""}" data-ledger-link="${cat.id}"${i === 0 ? ' aria-current="true"' : ""}>${cat.name}</button>`
        )
        .join("");

      ledgerBody.innerHTML =
        cats
          .map(
            (cat, i) => `
        <section class="ledger-block" id="cat-${cat.id}" data-ledger-section="${cat.id}">
          <div class="ledger-block-head">
            <h2>${cat.name}</h2>
            <span>${padNum(i)}</span>
          </div>
          <div class="menu-item-list">${itemRows(cat.items)}</div>
        </section>`
          )
          .join("") +
        `<div class="menu-actions ledger-order">
          <a class="btn btn-primary" data-order-regular href="${links.ORDER || "#"}" target="_blank" rel="noopener noreferrer">Order Online</a>
        </div>`;

      const sections = [...ledgerBody.querySelectorAll("[data-ledger-section]")];
      ledgerActiveId = cats[0].id;

      ledgerNav.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-ledger-link]");
        if (!btn) return;
        scrollToLedgerCategory(btn.getAttribute("data-ledger-link"), sections);
      });

      const onScrollOrResize = () => {
        if (ledgerScrollRaf) return;
        ledgerScrollRaf = requestAnimationFrame(() => {
          ledgerScrollRaf = 0;
          updateLedgerStickyOffset();
          syncLedgerSpyFromScroll(sections);
        });
      };

      window.addEventListener("scroll", onScrollOrResize, { passive: true });
      window.addEventListener("resize", onScrollOrResize, { passive: true });
      updateLedgerStickyOffset();
      syncLedgerSpyFromScroll(sections);

      const hashId = (location.hash || "").replace(/^#/, "");
      if (cats.some((c) => c.id === hashId)) {
        requestAnimationFrame(() => scrollToLedgerCategory(hashId, sections));
      }
    }

    document.querySelectorAll("[data-order-regular]").forEach((a) => {
      a.href = links.ORDER || a.href;
    });
    document.querySelectorAll("[data-order-menu]").forEach((a) => {
      a.href = links.ORDER_MENU || a.href;
    });

    const lb = document.querySelector("[data-lightbox]");
    const lbImg = document.querySelector("[data-lightbox-img]");
    const lbClose = document.querySelector("[data-lightbox-close]");
    document.querySelectorAll("[data-gallery-item]").forEach((el) => {
      el.addEventListener("click", () => {
        const src = getComputedStyle(el).backgroundImage.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
        if (!src || !lb) return;
        lbImg.src = src;
        lb.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });
    function closeLb() {
      if (!lb) return;
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    lbClose && lbClose.addEventListener("click", closeLb);
    lb &&
      lb.addEventListener("click", (e) => {
        if (e.target === lb) closeLb();
      });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLb();
    });

    initContactForm();
  });
})();

