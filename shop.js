/* ==========================================================
   Junri Pharmacy — Shopify Buy Button integration

   SETUP CHECKLIST:
   1. domain — your STOREFRONT domain, not your admin URL.
      Find it at: Shopify admin > Settings > Domains
      Correct format: "junripharmacy.myshopify.com"
      WRONG:  "https://admin.shopify.com/store/junripharmacy"

   2. storefrontAccessToken — from Shopify admin > Sales channels >
      Buy Button > Create a Buy Button > Show embed code

   3. id — the Collection ID (or Product ID) you want to display,
      also shown in that same embed code screen

   NOTE ON PAYMENTS: M-Pesa / Airtel Money / Visa via Pesapal are
   configured in Shopify admin > Settings > Payments — NOT here.
   This file only displays products and hands off to Shopify's
   secure checkout, where Pesapal's options will appear automatically
   once it's connected in your admin.
   ========================================================== */

/* Junri Pharmacy cart and IntaSend checkout. */
(function () {
  "use strict";

  const CART_STORAGE_KEY = "junri-pharmacy-cart";
  const INTASEND_PUBLIC_KEY = "ISPubKey_test_YOUR_KEY";
  const intasend = window.IntaSend
    ? new window.IntaSend({
        publicAPIKey: INTASEND_PUBLIC_KEY,
        live: false,
      })
    : null;
  let cart = loadCart();

  function loadCart() {
    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
      return Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  function formatKES(amount) {
    return `KES ${amount.toLocaleString("en-KE")}`;
  }

  function createCartUI() {
    const drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.id = "cartDrawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <h2>Your cart</h2>
        <button type="button" class="cart-close" id="cartClose" aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-items" id="cartItems"></div>
      <p class="cart-total">Total <strong id="cartTotal">KES 0</strong></p>
      <form class="cart-checkout-form" id="cartCheckoutForm">
        <label>Email <input type="email" id="checkoutEmail" placeholder="you@example.com" required></label>
        <label>Phone <input type="tel" id="checkoutPhone" placeholder="2547XXXXXXXX" required></label>
        <button type="submit" class="btn btn-primary">Pay Now</button>
      </form>
      <p class="cart-status" id="cartStatus" role="status" aria-live="polite"></p>
    `;
    document.body.append(drawer);
    document.getElementById("cartClose").addEventListener("click", closeCart);
    document
      .getElementById("cartCheckoutForm")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        handleIntaSendCheckout(
          document.getElementById("checkoutEmail").value,
          document.getElementById("checkoutPhone").value,
        );
      });
    renderCart();
  }

  function renderCart() {
    const itemsElement = document.getElementById("cartItems");
    if (!itemsElement) return;
    itemsElement.innerHTML = cart.length
      ? cart
          .map(
            (item, index) => `
              <div class="cart-item">
                <div><strong>${item.name}</strong><span>${formatKES(item.price)} x ${item.quantity}</span></div>
                <button type="button" data-remove-cart-item="${index}" aria-label="Remove ${item.name}">Remove</button>
              </div>`,
          )
          .join("")
      : '<p class="cart-empty">Your cart is empty.</p>';
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    document.getElementById("cartTotal").textContent = formatKES(total);
    document.querySelectorAll("[data-remove-cart-item]").forEach((button) => {
      button.addEventListener("click", () => {
        cart.splice(Number(button.dataset.removeCartItem), 1);
        saveCart();
        renderCart();
      });
    });
  }

  function openCart() {
    const drawer = document.getElementById("cartDrawer");
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    const drawer = document.getElementById("cartDrawer");
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function addToCart(card) {
    const item = {
      name: card.querySelector("h3").textContent.trim(),
      price: Number(card.dataset.price || 0),
      quantity: 1,
    };
    const existingItem = cart.find((cartItem) => cartItem.name === item.name);
    if (existingItem) existingItem.quantity += 1;
    else cart.push(item);
    saveCart();
    renderCart();
    openCart();
  }

  function setCartStatus(message, type) {
    const status = document.getElementById("cartStatus");
    status.textContent = message;
    status.className = `cart-status ${type || ""}`;
  }

  function normalizePhone(phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("07")) return `254${digits.slice(1)}`;
    if (digits.startsWith("+254")) return digits.slice(1);
    return digits;
  }

  function handleIntaSendCheckout(customerEmail, customerPhone) {
    const email = customerEmail.trim();
    const phoneNumber = normalizePhone(customerPhone.trim());
    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (!cart.length)
      return setCartStatus("Add an item before checking out.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setCartStatus("Enter a valid email address.", "error");
    }
    if (!/^2547\d{8}$/.test(phoneNumber)) {
      return setCartStatus(
        "Enter a Kenyan phone number like 2547XXXXXXXX.",
        "error",
      );
    }
    if (cart.some((item) => item.price <= 0) || totalAmount <= 0) {
      return setCartStatus(
        "Some product prices are not configured yet.",
        "error",
      );
    }
    if (!intasend)
      return setCartStatus(
        "Payment service is unavailable. Please try again.",
        "error",
      );
    if (INTASEND_PUBLIC_KEY === "ISPubKey_test_YOUR_KEY") {
      return setCartStatus(
        "Add your IntaSend sandbox public key in shop.js first.",
        "error",
      );
    }

    setCartStatus("Opening secure payment...", "pending");
    intasend.run({
      amount: totalAmount,
      currency: "KES",
      email,
      phone_number: phoneNumber,
      api_ref: `JUNRI_ORD_${Date.now()}`,
      comment: "Junri Pharmacy Order Payment",
    });
  }

  window.handleIntaSendCheckout = handleIntaSendCheckout;

  if (intasend) {
    intasend.on("COMPLETE", () => {
      cart = [];
      saveCart();
      renderCart();
      setCartStatus("Payment successful. Thank you for your order!", "success");
    });
    intasend.on("FAILED", () => {
      alert("Payment failed. Your cart is still saved. Please try again.");
      setCartStatus("Payment failed. Your cart is still saved.", "error");
    });
    intasend.on("IN-PROGRESS", () =>
      setCartStatus("Payment is processing...", "pending"),
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    createCartUI();
    document.querySelectorAll("#productGrid .product-card").forEach((card) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-ghost add-cart-btn";
      button.textContent = "Add to cart";
      button.addEventListener("click", () => addToCart(card));
      card.querySelector(".product-body").append(button);
    });
    document.querySelector(".nav-cart")?.addEventListener("click", (event) => {
      event.preventDefault();
      openCart();
    });
  });

  // Keep the optional Shopify widget from breaking the static storefront.
  if (
    window.ShopifyBuy &&
    window.ShopifyBuy.UI &&
    window.ShopifyBuy.UI.onReady
  ) {
    const storefrontAccessToken = "YOUR-STOREFRONT-ACCESS-TOKEN";
    const collectionId = "YOUR-COLLECTION-ID";
    const client = window.ShopifyBuy.buildClient({
      domain: "junripharmacy.myshopify.com",
      storefrontAccessToken,
    });
    if (
      client &&
      storefrontAccessToken !== "YOUR-STOREFRONT-ACCESS-TOKEN" &&
      collectionId !== "YOUR-COLLECTION-ID"
    ) {
      window.ShopifyBuy.UI.onReady(client).then((ui) => {
        ui.createComponent("collection", {
          id: collectionId,
          node: document.getElementById("shopify-shop-container"),
          moneyFormat: "%24%7B%7Bamount%7D%7D",
          options: {
            product: {
              contents: { options: false },
              text: { button: "Buy Now" },
            },
            cart: { text: { total: "Subtotal", button: "Checkout" } },
          },
        });
      });
    }
  }
})();
