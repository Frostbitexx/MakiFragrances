// ========================
// Licznik koszyka
// ========================

function isAvailable(product) {
  if (!product) return true;
  const v = product.availability;
  if (typeof v === "boolean") return v;
  if (v == null) return true; // brak pola = dostępny
  const s = String(v).toLowerCase();
  return !["no","nie","false","0","out","niedostępny","niedostepny"].includes(s);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = totalItems;
}

// ========================
// Dodawanie do koszyka
// ========================
function addToCart(event) {
  if (event) event.stopPropagation();

  let id = null;
  let qty = 1;
  const qtyInput = document.getElementById("qty");

  if (qtyInput) {
    qty = parseInt(qtyInput.value);
    id = new URLSearchParams(window.location.search).get("id");
  } else {
    id = event?.target?.dataset?.id;
  }

  if (!id) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }
  const p = (typeof products === "object") ? products[id] : null;
  if (p && !isAvailable(p)) {
    alert("Produkt jest tymczasowo niedostępny.");
    return;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  
  updateCartCount();
  openSideCartPanel(id, qty);
}
// === SIDE CART (panel po dodaniu do koszyka) ===
function ensureSideCartPanel() {


  // jeśli już jest – nic nie rób
  if (document.querySelector('.side-cart')) return;

  // tło
  const overlay = document.createElement('div');
  overlay.className = 'overlay-dim';
  overlay.addEventListener('click', closeSideCartPanel);

  // panel
  const panel = document.createElement('aside');
  panel.className = 'side-cart';
  panel.innerHTML = `
    <div class="side-cart-header">
      <span>Produkt dodany do koszyka:</span>
      <button class="side-cart-close" aria-label="Zamknij" title="Zamknij">×</button>
    </div>
    <div class="side-cart-body"></div>
    <div class="side-cart-actions">
      <button class="btn btn-secondary" id="sideCartContinue">Kontynuuj zakupy</button>
      <button class="btn btn-primary" id="sideCartGoCart">Przejdź do koszyka</button>
    </div>
  `;

  panel.querySelector('.side-cart-close').addEventListener('click', closeSideCartPanel);
  panel.querySelector('#sideCartContinue').addEventListener('click', closeSideCartPanel);
  panel.querySelector('#sideCartGoCart').addEventListener('click', () => {
    window.location.href = 'koszyk.html';
  });

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // ESC zamyka
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSideCartPanel();
  });
}

function openSideCartPanel(productId, qty) {
  ensureSideCartPanel();

  const overlay = document.querySelector('.overlay-dim');
  const panel   = document.querySelector('.side-cart');
  const bodyEl  = document.querySelector('.side-cart-body');
  const product = products?.[productId];

  // fallback na qty
  const quantity = Math.max(1, parseInt(qty || 1));

  // bez produktu — tylko informacja (nie powinno się zdarzyć, bo wszędzie używamy products)
  if (!product) {
    bodyEl.innerHTML = `<p style >Dodano do koszyka.</p>`;
  } else {
    const lineTotal = (product.price * quantity).toFixed(2);
    const title = product.category === 'packages'
      ? (product.setType === 'set3' ? 'SET OF 3 CANDLES'
         : product.setType === 'set2+1' ? 'CANDLES(2) & DIFFUSER SET'
         : 'CANDLE & DIFFUSER SET')
      : (product.name || '');

    const subtitle = product.productSubtitle || product.subtitle || '';
    const imgSrc   = product.images?.[0] || product.mainImage;

    bodyEl.innerHTML = `
      <div class="side-cart-product">
        <img src="${imgSrc}" alt="${title}">
        <div>
          <div class="side-cart-title">${title}</div>
          <div class="side-cart-sub">${subtitle} ${product.weight}</div>
          <div class="side-cart-line">Ilość: <b>${quantity}</b></div>
          <div class="side-cart-line">Cena: <b>${product.price.toFixed(2)} zł</b></div>
          <div class="side-cart-summary">Razem: ${lineTotal} zł</div>
        </div>
      </div>
    `;
  }

  // pokaż
  overlay.classList.add('show');
  panel.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeSideCartPanel() {
  const overlay = document.querySelector('.overlay-dim');
  const panel   = document.querySelector('.side-cart');
  if (overlay) overlay.classList.remove('show');
  if (panel)   panel.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

// utwórz strukturę panelu po załadowaniu DOM (na każdej stronie)
document.addEventListener('DOMContentLoaded', ensureSideCartPanel);

// ========================
// Menu
// ========================
function toggleMenu() {
  const menuList = document.querySelector('.menu ul');
  if (menuList) {
    menuList.classList.toggle('active');
  }
}

function toggleSection(header) {
  if (!header) return;
  const body = header.nextElementSibling;
  const icon = header.querySelector("i");
  if (body) body.classList.toggle("visible");
  if (icon) icon.classList.toggle("rotated");
}

// ========================
// Render katalogu
// ========================
function renderProducts() {
  const productList = document.getElementById("productList");
  if (!productList || typeof products !== "object") return;

  productList.innerHTML = "";

  Object.entries(products).forEach(([id, product]) => {
    const div = document.createElement("div");
    div.className = "product_item";
    div.onclick = () => {
      localStorage.setItem("scrollPosition", window.scrollY);
      location.href = `produkt.html?id=${id}&category=${product.category}`;
    };

    const available = isAvailable(product);
    if (!available) div.classList.add("unavailable");


    div.innerHTML = `
      <div class="product_img_slider">
        <div class="slider-track">
          <img src="${product.mainImage}" alt="Zdjęcie 1">
          <img src="${product.thumbs?.[0] || product.mainImage}" alt="Zdjęcie 2">
        </div>
      </div>

      ${available ? "" : `<span class="badge-unavail">Tymczasowo niedostępny</span>`}

      <h3 class="tile-title">${
        product.category === "packages"
          ? (product.setType === "set3"
                ? "SET OF 3 CANDLES"
                : (product.setType === "set2+1" ? "CANDLES(2) & DIFFUSER SET" : "CANDLE & DIFFUSER SET"))
          : product.name.toUpperCase()
      }</h3>

      <hr class="hr">
      <p class="tile-subtitle">${product.subtitle || ""} ${product.weight || ""}</p>
      <p class="tile-subtitle2">${product.subtitle2 || ""}</p>
      <hr class="hr">

      <div class="basket-line">
        ${available ? `
          <span class="min-basket">
            <i class="fas fa-cart-arrow-down" data-id="${id}" onclick="addToCart(event)"></i>
          </span>` : ``}
        <span class="price">${product.price} zł</span>
      </div>
    `;


    productList.appendChild(div);
  });
  
}

function renderCatalogFiltered(selectedCategory) {
  const productList = document.getElementById("productList");
  if (!productList || typeof products !== "object") return;

  productList.innerHTML = "";

  Object.entries(products).forEach(([id, product]) => {
    if (product.category !== selectedCategory) return;

    const div = document.createElement("div");
    div.className = "product_item";
      div.onclick = () => {
        localStorage.setItem("scrollPosition", window.scrollY);
        location.href = `produkt.html?id=${id}&category=${product.category}`;
      };

    const available = isAvailable(product);
    if (!available) div.classList.add("unavailable");


    div.innerHTML = `
      <div class="product_img_slider">
        <div class="slider-track">
          <img src="${product.mainImage}" alt="Zdjęcie 1">
          <img src="${product.thumbs?.[0] || product.mainImage}" alt="Zdjęcie 2">
        </div>
      </div>

      ${available ? "" : `<span class="badge-unavail">Tymczasowo niedostępny</span>`}

      <h3 class="tile-title">${
        product.category === "packages"
          ? (product.setType === "set3"
                ? "SET OF 3 CANDLES"
                : (product.setType === "set2+1" ? "CANDLES(2) & DIFFUSER SET" : "CANDLE & DIFFUSER SET"))
          : product.name.toUpperCase()
      }</h3>

      <hr class="hr">
      <p class="tile-subtitle">${product.subtitle || ""} ${product.weight || ""}</p>
      <p class="tile-subtitle2">${product.subtitle2 || ""}</p>
      <hr class="hr">

      <div class="basket-line">
        ${available ? `
          <span class="min-basket">
            <i class="fas fa-cart-arrow-down" data-id="${id}" onclick="addToCart(event)"></i>
          </span>` : ``}
        <span class="price">${product.price} zł</span>
      </div>
    `;


    productList.appendChild(div);
  });
}

// ========================
// Obsługa DOMContentLoaded
// ========================
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();

  const url = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");

  const isCatalogPage = url.includes("catalog.html");

if (isCatalogPage) {
  if (selectedCategory) {
    renderCatalogFiltered(selectedCategory);
  } else {
    renderProducts();
  }

  const savedScroll = localStorage.getItem("scrollPosition");
  if (savedScroll !== null) {
    window.scrollTo({ top: parseInt(savedScroll), behavior: 'smooth' });

    localStorage.removeItem("scrollPosition");
  }
}


  // Generowanie danych do formularza (tylko checkout)
  const displayNumber = document.getElementById("orderNumberDisplay");
  const displaySummary = document.getElementById("orderSummaryDisplay");
  const displayTotal = document.getElementById("orderTotalDisplay");
  const inputNumber = document.getElementById("orderNumberInput");
  const inputSummary = document.getElementById("orderSummaryInput");
  const inputTotal = document.getElementById("orderTotalInput");

  if (displayNumber && displaySummary && displayTotal && inputNumber && inputSummary && inputTotal) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const orderNumber = `ZAM${new Date().toISOString().replace(/\D/g, "").slice(0, 17)}`;

    let summary = "";
    let total = 0;

cart.forEach(item => {
  const product = products[item.id];
  if (product) {
    const itemTotal = product.price * item.qty;
    total += itemTotal;

    // Budowanie pełnej nazwy produktu
    let fullName = product.name;
    if (product.subtitle) fullName += " – " + product.subtitle;
    if (product.subtitle2) fullName += " " + product.subtitle2;

    summary += `${fullName} x${item.qty}, `;
  }
});


    summary = summary.slice(0, -2);

// koszt dostawy – tylko poniżej progu darmowej wysyłki
const FREE_SHIPPING_THRESHOLD = 200;
const BASE_DELIVERY_COST = 14.99;

const deliveryCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_DELIVERY_COST;
const grandTotal = total + deliveryCost;


displayNumber.innerText = orderNumber;
displaySummary.innerText = summary;
displayTotal.innerText = total.toFixed(2);

// nowa linia: razem z dostawą
const displayGrandTotal = document.getElementById("orderGrandTotalDisplay");
const inputGrandTotal = document.getElementById("orderGrandTotalInput");

if (displayGrandTotal && inputGrandTotal) {
  displayGrandTotal.innerText = grandTotal.toFixed(2);
  inputGrandTotal.value = grandTotal.toFixed(2);
}

inputNumber.value = orderNumber;
inputSummary.value = summary;
inputTotal.value = total.toFixed(2); 

  }
});

// ========================
// Strona produktu
// ========================
(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = id ? products[id] : null;
    const available = isAvailable(product);

  // plakietka na zdjęciu
  if (!available) {
    const viewer = document.querySelector(".image-viewer");
    if (viewer) {
      const badge = document.createElement("span");
      badge.className = "badge-unavail";
      badge.textContent = "Tymczasowo niedostępny";
      viewer.appendChild(badge);
    }
  }

  // przycisk „Dodaj do koszyka” -> zastąp komunikatem
  if (!available) {
    const addBtn = document.querySelector('button.add-to-cart');
    if (addBtn) {
      const note = document.createElement("div");
      note.className = "product-unavail-note";
      note.textContent = "Produkt tymczasowo niedostępny";
      addBtn.replaceWith(note);
    }
    const qty = document.getElementById("qty");
    if (qty) qty.disabled = true;
  }


  const productPage = document.querySelector(".product-page");

  if (!product && productPage) {
    productPage.innerHTML = "<p>Nie znaleziono produktu.</p>";
    return;
  }
  if (!product) return;

  const mainImg = document.querySelector(".product-main-img");
  if (mainImg) mainImg.src = product.mainImage;

const titleEl = document.querySelector(".product-title");
if (titleEl) {
  if (product.category === "packages") {
    titleEl.innerText =
      product.setType === "set3"
        ? "SET OF 3 CANDLES"
        : product.setType === "set2+1"
          ? "CANDLES(2) & DIFFUSER SET"
          : "CANDLE & DIFFUSER SET";
    titleEl.style.fontSize = "20px";
  } else {
    titleEl.innerText = product.name.toUpperCase();
  }
}


  const subtitleEl = document.querySelector(".product-subtitle");
  if (subtitleEl) subtitleEl.innerText = product.productSubtitle;

  const priceEl = document.querySelector(".product-price");
  if (priceEl) priceEl.innerText = product.price.toFixed(2) + " zł";

  const weightEl = document.querySelector(".productWeight");
  if (weightEl) weightEl.innerText = product.weight || "";

  const descEl = document.querySelector(".product-description p");
  if (descEl) descEl.innerText = product.desc;

  const bodies = document.querySelectorAll('.product-toggle-body');
  if (bodies.length > 0) bodies[0].innerText = product.about || "Informacje o produkcie niedostępne.";
  if (bodies.length > 1) bodies[1].innerText = product.ingredients || "Składniki niedostępne.";

const thumbsContainer = document.getElementById("thumbnails");
if (thumbsContainer) {
  thumbsContainer.innerHTML = "";

  // zawsze najpierw mainImage, potem thumbs w kolejności
  const allThumbs = [product.mainImage, ...product.thumbs];

  allThumbs.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "thumb";
    if (index === 0) img.classList.add("active"); // podświetl main

    img.addEventListener("click", () => {
      const mainImage = document.getElementById("mainImage");
      if (mainImage) {
        mainImage.src = src;
      }

      // podświetlenie aktywnej
      document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
      img.classList.add("active");
    });

    thumbsContainer.appendChild(img);
  });
}


  const select = document.getElementById("color");
  if (select && id) {
    const currentNum = parseInt(id.replace("prod", ""));
    select.value = currentNum % 2 === 1 ? "Przezroczysty" : "Bursztynowy";

    select.addEventListener("change", function () {
      let newId;
      const num = parseInt(id.replace("prod", ""));
      if (this.value === "Przezroczysty") {
        newId = "prod" + (num - 1);
      } else {
        newId = "prod" + (num + 1);
      }
      window.location.href = "produkt.html?id=" + newId;
    });
  }
})();

function swapImage(thumb) {
  const mainImage = document.getElementById("mainImage");
  if (!mainImage) return;
  const current = mainImage.src;
  mainImage.src = thumb.src;
  thumb.src = current;
}

// ========================
// Koszyk
// ========================
(function () {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsDiv = document.getElementById("cartItems");
  const cartTotalDiv = document.getElementById("cartTotal");

  if (!cartItemsDiv || !cartTotalDiv) return;

  let total = 0;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "<p>Twój koszyk jest pusty.</p>";
    const btn = document.querySelector(".checkout-btn");
    if (btn) btn.style.display = "none";
  } else {
    cart.forEach((item, index) => {
      const product = products[item.id];
      if (!product) return;

      const itemTotal = product.price * item.qty;
      total += itemTotal;

cartItemsDiv.innerHTML += `
  <div class="cart-item">
    <div class="cart-left">
      <a href="produkt.html?id=${item.id}">
        <img src="${product.images?.[0] || product.mainImage}" alt="${product.name}" class="cart-item-img" />
      </a>
      <div class="cart-actions-row">
        <button class="icon-btn" onclick="updateQty(${index}, -1)" aria-label="Zmniejsz ilość"><i class="fas fa-minus"></i></button>
        <span class="qty-badge">${item.qty}</span>
        <button class="icon-btn" onclick="updateQty(${index}, 1)" aria-label="Zwiększ ilość"><i class="fas fa-plus"></i></button>
        <button class="icon-btn" onclick="removeFromCart(${index})" aria-label="Usuń z koszyka"><i class="fas fa-trash"></i></button>
      </div>
    </div>

    <div class="cart-right">
      <a href="produkt.html?id=${item.id}" class="cart-item-link">
        <div class="cart-item-text">
          <span class="cart-title">${
            product.category === "packages"
              ? (product.setType === "set3" ? "Set of 3 candles" : "Candle & Diffuser Set")
              : product.name
          } (x${item.qty})</span>
          <span class="cart-price">${product.price.toFixed(2)} zł / ${itemTotal.toFixed(2)} zł</span>
          <p class="cart-subtitle">${product.productSubtitle}  ${product.weight}</p>
        </div>
      </a>
    </div>
  </div>
`;

    });

      // koszt dostawy
// koszt dostawy – tylko poniżej progu darmowej wysyłki
const FREE_SHIPPING_THRESHOLD = 200;
const BASE_DELIVERY_COST = 14.99;

const deliveryCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_DELIVERY_COST;
const grandTotal = total + deliveryCost;

const deliveryLabel = deliveryCost === 0
  ? `0,00 zł <span style="color:#2e7d32; font-weight:600;">(darmowa dostawa od ${FREE_SHIPPING_THRESHOLD} zł)</span>`
  : `${deliveryCost.toFixed(2)} zł`;

cartTotalDiv.innerHTML = `
  <p style="line-height:1.5;">Suma produktów: ${total.toFixed(2)} zł</p>
  <p style="line-height:1.5;">Dostawa: ${deliveryLabel}</p>
  <hr style="border:none; border-top:1px solid #ddd;">
  <p style="line-height:1.5;">Razem do zapłaty: ${grandTotal.toFixed(2)} zł</p>
`;


  }

  // helpery do zapisu i przeładowania
  function saveCart(updatedCart) {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    location.reload();
  }

  // globalne, bo wywoływane z onclick
  window.updateQty = (index, change) => {
    const cartNow = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cartNow[index]) return;
    cartNow[index].qty += change;
    if (cartNow[index].qty <= 0) cartNow.splice(index, 1);
    saveCart(cartNow);
  };

  window.removeFromCart = (index) => {
    const cartNow = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cartNow[index]) return;
    cartNow.splice(index, 1);
    saveCart(cartNow);
  };
})();


function generateOrderNumber() {
  const now = new Date();
  return `ZAM${now.getDate().toString().padStart(2, '0')}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getFullYear()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
}

function goToForm() {
  const orderNumber = generateOrderNumber();
  localStorage.setItem("orderNumber", orderNumber);
  window.location.href = "checkout.html";
}

function clearCart() {
  if (confirm("Czy na pewno chcesz wyczyścić koszyk?")) {
    localStorage.removeItem("cart");
    location.reload();
  }
}

// ========================
// Formularz checkout
// ========================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("orderForm");
  const overlay = document.getElementById("loadingOverlay");

  if (form && overlay) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      overlay.style.display = "flex";

      const formData = new FormData(form);

      fetch("https://script.google.com/macros/s/AKfycbx4A6qZ_2Fc6Ap8K8K0BGqwwa7FkU2udLDE5Fzuoyc5nVqBtGwXNQak9Pxq6rGEg9CDYQ/exec", {
        method: "POST",
        body: formData
      })
      .then(() => {
        localStorage.removeItem("cart");
        window.location.href = "thankyou.html";
      })
      .catch((error) => {
        overlay.style.display = "none";
        alert("Wystąpił błąd podczas składania zamówienia.");
        console.error(error);
      });
    });
  }
});

// ========================
// Wyszukiwarka
// ========================
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (searchInput && searchResults && typeof products === "object") {
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      searchResults.innerHTML = "";

      if (!query) {
        searchResults.style.display = "none";
        return;
      }

      const matches = Object.entries(products).filter(([id, product]) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.subtitle.toLowerCase().includes(query) ||
          product.desc.toLowerCase().includes(query)
        );
      });

      if (matches.length === 0) {
        const noResultItem = document.createElement("div");
        noResultItem.textContent = "Nie znaleziono wyników pasujących do szukanej frazy.";
        noResultItem.style.padding = "20px 10px";
        noResultItem.style.color = "#666";
        noResultItem.style.textAlign = "center";
        searchResults.appendChild(noResultItem);
        searchResults.style.display = "block";
        return;
      }

matches.forEach(([id, product]) => {
  const resultItem = document.createElement("div");
  resultItem.textContent = product.name + " – " + product.subtitle;

  if (product.subtitle2) {
    resultItem.textContent += " " + product.subtitle2;
  }

  resultItem.onclick = () => {
    window.location.href = `produkt.html?id=${id}`;
  };

  searchResults.appendChild(resultItem);
});


      searchResults.style.display = "block";
    });

    document.addEventListener("click", function (e) {
      if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.style.display = "none";
      }
    });
  }
});

// ========================
// Slider
// ========================
document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".slider");
  const slides = document.querySelectorAll(".slider img");
  const dots = document.querySelectorAll(".slider-nav .dot");

  if (slider && slides.length && dots.length) {
    let index = 0;

    function updateDots() {
      dots.forEach(dot => dot.classList.remove("active"));
      if (dots[index]) dots[index].classList.add("active");
    }

    dots.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        slider.scrollTo({
          left: i * slider.clientWidth,
          behavior: "smooth"
        });
        index = i;
        updateDots();
      });
    });

    setInterval(() => {
      index = (index + 1) % slides.length;
      slider.scrollTo({
        left: index * slider.clientWidth,
        behavior: "smooth"
      });
      updateDots();
    }, 7000);
  }
});
document.querySelectorAll(".product_img_slider").forEach(slider => {
  let startX = 0;
  let moved = false;

  slider.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    moved = false;
  });

  slider.addEventListener("touchmove", e => {
    const dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 50) { // przesunięcie w bok
      const track = slider.querySelector(".slider-track");
      if (dx < 0) {
        track.style.transform = "translateX(-50%)"; // następne zdjęcie
      } else {
        track.style.transform = "translateX(0)"; // pierwsze zdjęcie
      }
      moved = true;
    }
  });
});

// ========================
// Obsługa zdjęć produktu
// ========================
let currentImageIndex = 0;
let imageList = [];

(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = id ? products[id] : null;

  if (product) {
    imageList = [product.mainImage, ...product.thumbs];
    const mainImg = document.querySelector(".product-main-img");
    if (mainImg) mainImg.src = imageList[0];
  }
})();

function showPrevImage() {
  if (imageList.length === 0) return;
  currentImageIndex = (currentImageIndex - 1 + imageList.length) % imageList.length;
  updateMainImage();
}

function showNextImage() {
  if (imageList.length === 0) return;
  currentImageIndex = (currentImageIndex + 1) % imageList.length;
  updateMainImage();
}

function updateMainImage() {
  const mainImg = document.querySelector(".product-main-img");
  if (mainImg) mainImg.src = imageList[currentImageIndex];
}

// ========================
// zmiana hover na swipe na mobile
// ========================


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".product_img_slider").forEach(slider => {
    const track = slider.querySelector(".slider-track");
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let currentTranslate = 0;

    // === SWIPE ===
    slider.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
      isDragging = true;
      track.style.transition = "none";
    });

    slider.addEventListener("touchmove", e => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const dx = currentX - startX;
      const percent = (dx / slider.offsetWidth) * 100;

      let newTranslate = currentTranslate + percent;
      if (newTranslate > 0) newTranslate = 0;
      if (newTranslate < -50) newTranslate = -50;

      track.style.transform = `translateX(${newTranslate}%)`;

      // ukryj hint w trakcie przesuwania
      if (slider.querySelector(".swipe-hint")) {
        slider.querySelector(".swipe-hint").style.opacity = "0";
      }
    });

    slider.addEventListener("touchend", e => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = "transform 0.3s ease";

      const dx = e.changedTouches[0].clientX - startX;
      if (dx < -50) {
        currentTranslate = -50;
      } else if (dx > 50) {
        currentTranslate = 0;
      }
      track.style.transform = `translateX(${currentTranslate}%)`;

      // pokaż hint z powrotem po 3 sekundach
      const hint = slider.querySelector(".swipe-hint");
      if (hint) {
        setTimeout(() => {
          hint.style.opacity = "1";
        }, 3000);
      }
    });

    // === HINT ===
    if (window.innerWidth <= 768) {
      const hint = document.createElement("div");
      hint.className = "swipe-hint";
      hint.textContent = "Przesuń, aby zobaczyć więcej";
      slider.style.position = "relative";
      slider.appendChild(hint);
    }
  });
});

// Reset transform na desktop
window.addEventListener("resize", () => {
  document.querySelectorAll(".product_img_slider").forEach(slider => {
    const track = slider.querySelector(".slider-track");

    if (window.innerWidth > 768) {
      // Reset transform na desktop
      if (track) {
        track.style.removeProperty("transform");
      }

      // Usuń hint, jeśli istnieje
      const hint = slider.querySelector(".swipe-hint");
      if (hint) {
        hint.remove();
      }
    } else {
      // Dodaj hint jeśli nie ma
      if (!slider.querySelector(".swipe-hint")) {
        const hint = document.createElement("div");
        hint.className = "swipe-hint";
        hint.textContent = "Przesuń, aby zobaczyć więcej";
        slider.style.position = "relative";
        slider.appendChild(hint);
      }
    }
  });
});

//generowanie przycisku powrotu do kategorii
document.addEventListener("DOMContentLoaded", function () {
  const url = window.location.pathname;
  const isProductPage = url.includes("produkt.html");
  const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");


  if (isProductPage) {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const backLink = document.getElementById("backToCategory");

if (backLink && productId) {
  const product = products[productId];
  if (product) {
    const category = product.category;
    const categoryNames = {
      candles: "Świece",
      diffuzers: "Dyfuzory",
      packages: "Zestawy"
    };

    const categoryLabel = categoryNames[category] || category;

    backLink.href = `catalog.html?category=${category}`;
    backLink.innerHTML = `<i class="fas fa-undo"></i> <span style="font-family: 'CutiveMono', monospace; font-weight: 600; font-size: 19px;"><b>Powrót do kategorii: ${categoryLabel}</b></span>`;
    backLink.style.display = "inline-block";
  }
}

  }
});

// ========================
// Obsługa wyboru dostawy (kurier/paczkomat)
// ========================
document.addEventListener("DOMContentLoaded", function () {
  const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
  const paczkomatField = document.getElementById("paczkomatField");
  const paczkomatInput = document.getElementById("paczkomatInput");

  if (deliveryOptions.length && paczkomatField && paczkomatInput) {
    deliveryOptions.forEach(option => {
      option.addEventListener("change", () => {
        if (option.value === "paczkomat" && option.checked) {
          paczkomatField.style.display = "block";
          paczkomatInput.required = true;   // teraz wymagane
        } else if (option.value === "kurier" && option.checked) {
          paczkomatField.style.display = "none";
          paczkomatInput.required = false;  // wyłączamy wymagane
          paczkomatInput.value = "";        // czyścimy wartość
        }
      });
    });
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  // === konfiguracja "kafelków" kategorii ===
  // USTAW docelowe linki (np. do sekcji na index.html lub strony kategorii)
  const CATEGORY_CARDS = [
    {
      key: "candles",
      names: ["świeca", "świece", "swieca", "swiece", "świeczka", "świeczki", "swieczka", "swieczki"],
      label: "Kategoria: Świece",
      href: "catalog.html?category=candles",          // <- ZMIEŃ jeśli masz inny adres
      img: "images/categories/catcan.webp"
    },
    {
      key: "diffuzers",
      names: ["dyfuzor", "dyfuzory", "diffuzer", "diffuzery"],
      label: "Kategoria: Dyfuzory",
      href: "catalog.html?category=diffuzers",
      img: "images/categories/catdiff.webp"
    },
    {
      key: "packages",
      names: ["zestaw", "zestawy"],
      label: "Kategoria: Zestawy",
      href: "catalog.html?category=packages",
      img: "images/categories/catpack.webp"
    }
  ];

    // helper: porównania bez ogonków
  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  function renderCategoryCard(card) {
    const a = document.createElement("a");
    a.className = "category-hint";
    a.href = card.href;

    const img = document.createElement("img");
    img.src = card.img;
    img.alt = card.label;

    const text = document.createElement("div");
    text.className = "category-hint__text";
    text.textContent = card.label;

    a.appendChild(img);
    a.appendChild(text);
    return a;
  }

  if (searchInput && searchResults && typeof products === "object") {
    searchInput.addEventListener("input", function () {
      const raw = this.value || "";
      const qNorm = normalize(raw);

      searchResults.innerHTML = "";
      if (!qNorm) {
        searchResults.style.display = "none";
        return;
      }

      // --- A) Kategorie: pokazuj od pierwszej litery (prefix) bez ogonków ---
      const matchedCards = CATEGORY_CARDS.filter((c) =>
        c.names.some((n) => normalize(n).startsWith(qNorm))
      );

      if (matchedCards.length) {
        const header = document.createElement("div");
        header.className = "category-hint__header";
        header.textContent = "Szybki skrót do kategorii:";
        searchResults.appendChild(header);

        matchedCards.forEach((c) => {
          searchResults.appendChild(renderCategoryCard(c));
        });

        const divider = document.createElement("div");
        divider.className = "category-hint__divider";
        searchResults.appendChild(divider);
      }

      // --- B) Produkty: wyszukiwanie bez ogonków ---
      const matches = Object.entries(products).filter(([id, product]) => {
        const nameN = normalize(product.name);
        const subtitleN = normalize(product.subtitle);
        const descN = normalize(product.desc);
        return (
          nameN.includes(qNorm) ||
          subtitleN.includes(qNorm) ||
          descN.includes(qNorm)
        );
      });

      if (matches.length === 0) {
        const noResultItem = document.createElement("div");
        noResultItem.textContent = "Nie znaleziono wyników pasujących do szukanej frazy.";
        noResultItem.style.padding = "20px 10px";
        noResultItem.style.color = "#666";
        noResultItem.style.textAlign = "center";
        searchResults.appendChild(noResultItem);
        searchResults.style.display = "block";
        return;
      }

      matches.forEach(([id, product]) => {
        const resultItem = document.createElement("div");
        resultItem.className = "search-result-item";
        resultItem.textContent = (product.name || "") + " – " + (product.subtitle || "");
        if (product.subtitle2) {
          resultItem.textContent += " " + product.subtitle2;
        }
        resultItem.onclick = () => {
          window.location.href = `produkt.html?id=${id}`;
        };
        searchResults.appendChild(resultItem);
      });

      searchResults.style.display = "block";
    });

    document.addEventListener("click", function (e) {
      if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.style.display = "none";
      }
    });
  }
});
(function(){
  const form = document.getElementById('orderForm');
  const deliveryRadios = form.querySelectorAll('input[name="delivery"]');
  const paczkomatField = document.getElementById('paczkomatField');
  const paczkomatInput = document.getElementById('paczkomatInput');
  const mapContainer = document.getElementById('paczkomatMap');
  const searchInput = document.getElementById('lockerSearchInput');
  const searchBtn = document.getElementById('lockerSearchBtn');
  const useFormBtn = document.getElementById('lockerUseFormBtn');

  // Odczyt pól adresowych z formularza (do przycisku "Użyj adresu z formularza")
  const addrStreet = form.querySelector('input[name="address"]');
  const addrCity   = form.querySelector('input[name="city"]');

  // Publiczne API
  const OVERPASS_URL      = "https://overpass-api.de/api/interpreter";
  const NOMINATIM_SEARCH  = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&accept-language=pl&q=";
  const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=1&accept-language=pl";

  // Mapa: start w PL, większy zoom
  const POLAND_CENTER = [52.0, 19.0];
  const INITIAL_ZOOM  = 13;

  let map, markersLayer, mapReady = false;
  let debounceTimer = null, lastBBoxKey = null, pendingController = null;
  let popupSeq = 0; // unikalne id do spanów z adresem w popupach

  function togglePaczkomatField(){
    const selected = form.querySelector('input[name="delivery"]:checked')?.value;
    if (selected === 'paczkomat') {
      paczkomatField.style.display = 'block';
      if (!mapReady) initMap();
      setTimeout(() => map?.invalidateSize(), 50);
    } else {
      paczkomatField.style.display = 'none';
      paczkomatInput.value = '';
    }
  }
  deliveryRadios.forEach(r => r.addEventListener('change', togglePaczkomatField));
  togglePaczkomatField();

  function initMap(){
    map = L.map(mapContainer).setView(POLAND_CENTER, INITIAL_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);

    map.whenReady(loadLockers);
    map.on('moveend', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadLockers, 350);
    });

    // Wyszukiwarka
    searchBtn.addEventListener('click', () => doSearch(searchInput.value));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doSearch(searchInput.value); }
    });
    useFormBtn.addEventListener('click', () => {
      const q = [addrStreet?.value || '', addrCity?.value || ''].filter(Boolean).join(', ');
      if (!q.trim()) { alert('Uzupełnij najpierw adres i/lub miasto w formularzu.'); return; }
      doSearch(q);
    });

    mapReady = true;
  }

  function doSearch(query){
    const q = (query || '').trim();
    if (!q) return;
    fetch(NOMINATIM_SEARCH + encodeURIComponent(q), { headers: { 'Accept': 'application/json' }})
      .then(r => r.json())
      .then(res => {
        if (!Array.isArray(res) || res.length === 0) {
          alert('Nie znaleziono lokalizacji. Spróbuj doprecyzować adres.');
          return;
        }
        const { lat, lon } = res[0];
        map.setView([parseFloat(lat), parseFloat(lon)], 15);
      })
      .catch(() => alert('Błąd wyszukiwania lokalizacji.'));
  }

  function bboxKey(bounds) {
    const f = x => x.toFixed(4);
    return `${f(bounds.getSouth())},${f(bounds.getWest())},${f(bounds.getNorth())},${f(bounds.getEast())}`;
  }

  function buildOverpassQuery(bounds){
    const s = bounds.getSouth(), w = bounds.getWest(),
          n = bounds.getNorth(), e = bounds.getEast();
    // Paczkomaty InPost w widocznym bbox (node/way, różne schematy tagów)
    return `
      [out:json][timeout:25];
      (
        node["amenity"="vending_machine"]["vending"~"parcel_locker|parcel locker"]["operator"~"InPost|InPost Paczkomaty"](${s},${w},${n},${e});
        node["amenity"="parcel_locker"]["operator"~"InPost|InPost Paczkomaty"](${s},${w},${n},${e});
        way["amenity"="vending_machine"]["vending"~"parcel_locker|parcel locker"]["operator"~"InPost|InPost Paczkomaty"](${s},${w},${n},${e});
        way["amenity"="parcel_locker"]["operator"~"InPost|InPost Paczkomaty"](${s},${w},${n},${e});
      );
      out center tags;
    `;
  }

  // Z OSM: zwracamy DWIE linie – 1) ulica + numer, 2) kod pocztowy (jeśli jest)
  function formatAddressOSM_HTML(tags) {
    const street = tags['addr:street'] || '';
    const number = tags['addr:housenumber'] || '';
    const postcode = tags['addr:postcode'] || '';
    const line1 = [street, number].filter(Boolean).join(' ').trim();
    const line2 = (postcode || '').trim();
    if (line1 && line2) return `${escapeHTML(line1)}<br/>${escapeHTML(line2)}`;
    if (line1) return `${escapeHTML(line1)}`;
    if (line2) return `${escapeHTML(line2)}`;
    return '';
  }

  // Reverse Nominatim → taki sam układ (ulica + nr) w 1. linii, kod w 2.
  function formatAddressReverse_HTML(a) {
    const street = a.road || '';
    const number = a.house_number || '';
    const postcode = a.postcode || '';
    const line1 = [street, number].filter(Boolean).join(' ').trim();
    const line2 = (postcode || '').trim();
    if (line1 && line2) return `${escapeHTML(line1)}<br/>${escapeHTML(line2)}`;
    if (line1) return `${escapeHTML(line1)}`;
    if (line2) return `${escapeHTML(line2)}`;
    return 'Brak adresu';
  }

  function escapeHTML(str){
    return String(str).replace(/[&<>"']/g, s => (
      { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[s]
    ));
  }

  function loadLockers(){
    const bounds = map.getBounds();
    const key = bboxKey(bounds);
    if (key === lastBBoxKey) return;
    lastBBoxKey = key;

    const query = buildOverpassQuery(bounds);

    if (pendingController) pendingController.abort();
    pendingController = new AbortController();

    fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: query,
      signal: pendingController.signal
    })
    .then(r => r.json())
    .then(data => {
      markersLayer.clearLayers();
      if (!data?.elements) return;

      data.elements.forEach(el => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        if (!lat || !lon) return;

        const t = el.tags || {};
        const code = (t.ref || t['ref:inpost'] || '').toUpperCase();
        const name = code ? `Paczkomat ${code}` : 'Paczkomat InPost';

        const addrHTML = formatAddressOSM_HTML(t); // może być pusty

        const marker = L.marker([lat, lon]).addTo(markersLayer);

        // unikalny span na adres (jeśli brak w OSM, dociągniemy reverse)
        const addrSpanId = `addr-${popupSeq++}`;
        const safeAddrHtml = addrHTML
          ? `${addrHTML}<br/>`
          : `<span id="${addrSpanId}">Ładowanie adresu…</span><br/>`;

        marker.bindPopup(`
          <b>${escapeHTML(name)}</b><br/>
          ${safeAddrHtml}
          <small>${escapeHTML(t.operator || '')}</small><br/><br/>
          <button type="button" form="__noform" class="pick-locker" data-code="${escapeHTML(code)}">Wybierz ten punkt</button>
        `);

        marker.on('popupopen', (e) => {
          const popupEl = e.popup.getElement();

          // Jeśli nie mamy adresu w OSM, dociągnij reverse z Nominatim
          if (!addrHTML) {
            const span = document.getElementById(addrSpanId);
            if (span) {
              fetch(`${NOMINATIM_REVERSE}&lat=${lat}&lon=${lon}`, {
                headers: { 'Accept': 'application/json' }
              })
              .then(r => r.json())
              .then(data => {
                const a = data.address || {};
                span.innerHTML = formatAddressReverse_HTML(a);
              })
              .catch(() => { span.textContent = 'Nie udało się pobrać adresu'; });
            }
          }

          // Obsługa przycisku wyboru punktu
const btn = popupEl.querySelector('.pick-locker');
  if (btn) {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();      // <- nie pozwól przypadkiem wysłać formularza
      ev.stopPropagation();     // <- i nie bąbelkuj do form
      const chosen = (btn.getAttribute('data-code') || '').toUpperCase();
      if (!chosen) {
        alert('Ten punkt nie ma kodu w OSM. Wpisz kod ręcznie z wyszukiwarki InPost.');
        return;
      }
      paczkomatInput.value = chosen;
      e.popup.remove();
    }, { once: true });
  }
});
      });
    })
    .catch(err => { if (err.name !== 'AbortError') console.error('Błąd Overpass:', err); })
    .finally(() => { pendingController = null; });
  }

// --- Walidacja paczkomatu (wklej w miejsce starego handlera 'submit') ---
(function(){
  const form = document.getElementById('orderForm');
  const paczkomatInput = document.getElementById('paczkomatInput');

  // 3 litery + 2-3 cyfry + opcjonalnie 1 litera na końcu (np. WAW123A)
  const LOCKER_CODE_RE = /^[A-ZĆŁÓŚŹŻŃ]{3}\d{2,3}[A-ZĆŁÓŚŹŻŃ]?$/;

  function isPaczkomatSelected() {
    const checked = form.querySelector('input[name="delivery"]:checked');
    return checked && checked.value === 'paczkomat';
  }

  // Usuń ewentualny poprzedni listener, jeśli był przypięty wielokrotnie
  // (opcjonalnie; tylko jeśli w kodzie zdarzało Ci się re-dodawać handler).
  // form.removeEventListener('submit', oldHandlerReference);

  form.addEventListener('submit', function onSubmit(e) {
    if (!isPaczkomatSelected()) return; // kurier → nic nie sprawdzamy

    const raw = (paczkomatInput?.value || '').trim().toUpperCase();
    const valid = LOCKER_CODE_RE.test(raw);

    if (!valid) {
      // ZATRZYMAJ W 100%
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }

      alert('Wpisz poprawny kod paczkomatu (np. WAW123 lub WAW123A).');
      if (paczkomatInput) {
        paczkomatInput.focus();
        paczkomatInput.select?.();
      }
      return false; // dla starszych przeglądarek
    }

    // jeśli poprawny, normalizujemy i przepuszczamy submit
    if (paczkomatInput) paczkomatInput.value = raw;
  });

  // Dodatkowo – upewnij się, że te przyciski NIE są submitami:
  const btns = [
    document.getElementById('lockerSearchBtn'),
    document.getElementById('lockerUseFormBtn')
  ].filter(Boolean);
  btns.forEach(btn => {
    if (btn.getAttribute('type') !== 'button') btn.setAttribute('type', 'button');
  });
})();
})();





