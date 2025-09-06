// ========================
// Licznik koszyka
// ========================
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

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

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



    div.innerHTML = `
      <div class="product_img_slider">
        <div class="slider-track">
          <img src="${product.mainImage}" alt="Zdjęcie 1">
          <img src="${product.thumbs?.[0] || product.mainImage}" alt="Zdjęcie 2">
        </div>
      </div>
<h3 class="tile-title">${
  product.category === "packages"
    ? (
        product.setType === "set3"
          ? "SET OF 3 CANDLES"
          : product.setType === "set2+1"
            ? "CANDLES(2) & DIFFUSER SET"
            : "CANDLE & DIFFUSER SET"
      )
    : product.name.toUpperCase()
}</h3>




      <hr class="hr">
      <p class="tile-subtitle">${product.subtitle}</p>
      <p class="tile-subtitle2">${product.subtitle2 || ""}</p>
      <hr class="hr">
      <div class="basket-line">
        <span class="min-basket">
          <i class="fas fa-cart-arrow-down" data-id="${id}" onclick="addToCart(event)"></i>
        </span>
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



    div.innerHTML = `
      <div class="product_img_slider">
        <div class="slider-track">
          <img src="${product.mainImage}" alt="Zdjęcie 1">
          <img src="${product.thumbs?.[0] || product.mainImage}" alt="Zdjęcie 2">
        </div>
      </div>
<h3 class="tile-title">${
  product.category === "packages"
    ? (
        product.setType === "set3"
          ? "SET OF 3 CANDLES"
          : product.setType === "set2+1"
            ? "CANDLES(2) & DIFFUSER SET"
            : "CANDLE & DIFFUSER SET"
      )
    : product.name.toUpperCase()
}</h3>



      <hr class="hr">
      <p class="tile-subtitle">${product.subtitle}</p>
      <p class="tile-subtitle2">${product.subtitle2 || ""}</p>
      <hr class="hr">
      <div class="basket-line">
        <span class="min-basket">
          <i class="fas fa-cart-arrow-down" data-id="${id}" onclick="addToCart(event)"></i>
        </span>
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

// koszt dostawy
const deliveryCost = 20;
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
inputTotal.value = total.toFixed(2); // to zostawiamy jako suma produktów (może być przydatne)

  }
});

// ========================
// Strona produktu
// ========================
(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = id ? products[id] : null;

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
          <p class="cart-subtitle">${product.productSubtitle}</p>
        </div>
      </a>
    </div>
  </div>
`;

    });

      // koszt dostawy
  const deliveryCost = 20;
  const grandTotal = total + deliveryCost;

  cartTotalDiv.innerHTML = `
    <p style="line-height: 1.5;">Suma produktów: ${total.toFixed(2)} zł</p>
    <p style="line-height: 1.5;">Dostawa: ${deliveryCost.toFixed(2)} zł</p>
    <hr style="border:none; border-top:1px solid #ddd;">
    <p style="line-height: 1.5;">Razem do zapłaty: ${grandTotal.toFixed(2)} zł</p>
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

      fetch("https://script.google.com/macros/s/AKfycbxZjvaT-ftJJ-eDmaehc25Lp57UIGm6Kky5PY1GTDZcPTwUpCNU7PRo3DVE4vTfajI4LA/exec", {
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

