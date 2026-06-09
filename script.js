const replaceIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

replaceIcons();

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const contacts = document.querySelector(".header-contacts");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  nav?.classList.toggle("is-open", !isOpen);
  contacts?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

document.querySelectorAll(".main-nav a, .btn[href^='#'], .text-link[href^='#']").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
    contacts?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  });
});

const navLinks = [...document.querySelectorAll(".main-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const activateNav = () => {
  const offset = window.scrollY + 140;
  let current = sections[0]?.id;

  sections.forEach((section) => {
    if (section.offsetTop <= offset) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
};

window.addEventListener("scroll", activateNav, { passive: true });
activateNav();

const parallaxTargets = document.querySelectorAll("[data-parallax]");
const moveParallax = () => {
  parallaxTargets.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const shift = Math.max(-42, Math.min(42, rect.top * -0.06));
    const shiftVw = (shift / window.innerWidth) * 100;
    section.style.setProperty("--parallax-y", `${shiftVw}vw`);
  });
};

window.addEventListener("scroll", moveParallax, { passive: true });
moveParallax();

const form = document.querySelector(".consultation-form");
const status = document.querySelector(".form-status");

const setStatus = (message, isError = false) => {
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
};

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const consent = formData.get("consent") === "on";
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name) {
    setStatus("Укажите ваше имя.", true);
    form.elements.name.focus();
    return;
  }

  if (!emailIsValid) {
    setStatus("Укажите корректный E-mail.", true);
    form.elements.email.focus();
    return;
  }

  if (!consent) {
    setStatus("Подтвердите согласие на обработку персональных данных.", true);
    form.elements.consent.focus();
    return;
  }

  form.reset();
  setStatus("Заявка подготовлена. В рабочей версии здесь будет отправка на почту или CRM.");
});

document.querySelector(".to-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const initYandexMap = () => {
  const mapNode = document.querySelector("#yandex-map");
  if (!mapNode || !window.ymaps) return;

  const address = "Россия, Калининград, улица Маяковского, 16/2";
  const fallbackCoords = [54.729075, 20.472911];

  const createMap = (coords) => {
    const map = new ymaps.Map(
      mapNode,
      {
        center: coords,
        zoom: 15,
        controls: ["zoomControl"],
      },
      {
        suppressMapOpenBlock: true,
        yandexMapDisablePoiInteractivity: true,
      }
    );

    const placemark = new ymaps.Placemark(
      coords,
      {
        balloonContentHeader: "ЮК «ЭГИДА»",
        balloonContentBody: "г. Калининград, ул. Маяковского 16/2",
        hintContent: "ЮК «ЭГИДА»",
      },
      {
        preset: "islands#blueIcon",
      }
    );

    map.geoObjects.add(placemark);
    map.margin.setDefaultMargin([18, 18, 54, 18]);
    map.setCenter(coords, 15, {
      checkZoomRange: true,
      duration: 0,
    });
    map.behaviors.disable("scrollZoom");
    mapNode.classList.add("is-loaded");

    const fitMap = () => {
      map.container.fitToViewport();
      map.setCenter(coords, map.getZoom(), {
        checkZoomRange: true,
        duration: 0,
      });
    };

    requestAnimationFrame(fitMap);
    window.setTimeout(fitMap, 250);

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(fitMap);
      observer.observe(mapNode);
    } else {
      window.addEventListener("resize", fitMap);
    }
  };

  ymaps
    .geocode(address, { results: 1 })
    .then((result) => {
      const firstGeoObject = result.geoObjects.get(0);
      createMap(firstGeoObject ? firstGeoObject.geometry.getCoordinates() : fallbackCoords);
    })
    .catch(() => {
      createMap(fallbackCoords);
    });
};

if (window.ymaps) {
  ymaps.ready(initYandexMap);
}
