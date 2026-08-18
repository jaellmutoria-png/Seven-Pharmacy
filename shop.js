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

var client = ShopifyBuy.buildClient({
  domain: "junripharmacy.myshopify.com",
  storefrontAccessToken: "YOUR-STOREFRONT-ACCESS-TOKEN",
});

ShopifyBuy.UI.onReady(client).then(function (ui) {
  ui.createComponent("collection", {
    id: "YOUR-COLLECTION-ID",
    node: document.getElementById("shopify-shop-container"),
    moneyFormat: "%24%7B%7Bamount%7D%7D",
    options: {
      product: {
        styles: {
          product: {
            "@media (min-width: 601px)": {
              "max-width": "calc(33.33% - 1.5rem)",
              "margin-left": "0.75rem",
              "margin-bottom": "1.5rem",
            },
          },
          title: {
            "font-family": "'Fraunces', serif",
            "font-weight": "600",
            color: "#120B7A",
          },
          button: {
            "background-color": "#00B85E",
            ":hover": { "background-color": "#00944B" },
            "border-radius": "4px",
            "font-family": "'Inter', sans-serif",
          },
          price: {
            "font-family": "'IBM Plex Mono', monospace",
            color: "#4A4768",
          },
        },
        contents: { options: false },
        text: { button: "Buy Now" },
      },
      productSet: {
        styles: {
          products: {
            "@media (min-width: 601px)": { "margin-left": "-0.75rem" },
          },
        },
      },
      cart: {
        styles: {
          button: {
            "background-color": "#1B0FAE",
            ":hover": { "background-color": "#120B7A" },
            "border-radius": "4px",
          },
        },
        text: { total: "Subtotal", button: "Checkout" },
      },
      toggle: {
        styles: {
          toggle: { "background-color": "#1B0FAE" },
        },
      },
    },
  });
});
