/* Copleys Solicitors, interactions */
(function () {
  "use strict";

  /* Mobile menu */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Sticky header + scroll progress bar */
  var header = document.querySelector(".site-header");
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  var ticking = false;
  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (header) { header.classList.toggle("is-stuck", window.scrollY > 8); }
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? doc.scrollTop / max : 0) + ")";
      ticking = false;
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* Cursor-follow spotlight on cards */
  document.querySelectorAll(".svc-card, .profile").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Accordion */
  document.querySelectorAll(".acc-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var item = head.closest(".acc-item");
      var body = item.querySelector(".acc-body");
      var open = item.classList.toggle("open");
      head.setAttribute("aria-expanded", open ? "true" : "false");
      body.style.maxHeight = open ? body.scrollHeight + "px" : null;
    });
  });

  /* Contact form, sends via EmailJS (https://www.emailjs.com) */
  var form = document.querySelector("#contact-form");
  if (form) {
    var serviceID = form.getAttribute("data-emailjs-service");
    var templateID = form.getAttribute("data-emailjs-template");
    var publicKey = form.getAttribute("data-emailjs-public-key");
    var note = form.querySelector(".form-success");
    var errBox = form.querySelector(".form-error");
    var btn = form.querySelector("button[type=submit]");
    var btnHTML = btn ? btn.innerHTML : "";

    var configured = window.emailjs && serviceID && templateID && publicKey &&
      publicKey.indexOf("YOUR_") !== 0 &&
      serviceID.indexOf("YOUR_") !== 0 &&
      templateID.indexOf("YOUR_") !== 0;

    if (configured) { emailjs.init({ publicKey: publicKey }); }

    var showError = function (msg) {
      if (!errBox) return;
      errBox.textContent = msg;
      errBox.classList.add("show");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      if (note) note.classList.remove("show");
      if (errBox) errBox.classList.remove("show");

      /* Honeypot: a real user can't see/fill this field, so if it has a value
         it's a bot, quietly show success without sending anything. */
      var honeypot = form.querySelector("[name=company]");
      if (honeypot && honeypot.value) {
        if (note) note.classList.add("show");
        form.reset();
        return;
      }

      if (!configured) {
        showError("Sorry, the form isn't fully set up yet. Please call us or email directly and we'll be glad to help.");
        return;
      }

      if (btn) { btn.disabled = true; btn.classList.add("is-loading"); btn.textContent = "Sending…"; }

      emailjs.sendForm(serviceID, templateID, form)
        .then(function () {
          if (note) note.classList.add("show");
          form.reset();
        })
        .catch(function (error) {
          showError("Sorry, something went wrong sending your message. Please try again, or call us directly.");
          if (window.console && console.error) { console.error("EmailJS error:", error); }
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.classList.remove("is-loading"); btn.innerHTML = btnHTML; }
        });
    });
  }

  /* Footer year */
  var y = document.querySelector("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
