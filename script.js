// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

// Category dropdown toggle
const categoryToggle = document.getElementById("categoryToggle");
const categoryMenu = document.getElementById("categoryMenu");

if (categoryToggle) {
  categoryToggle.addEventListener("click", () => {
    categoryMenu.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (
      !categoryToggle.contains(e.target) &&
      !categoryMenu.contains(e.target)
    ) {
      categoryMenu.classList.remove("active");
    }
  });
}

// Contact form handling (front-end only for now)
const form = document.getElementById("contactForm");
form.addEventListener("submit", function (e) {
  e.preventDefault();
  alert(
    "Thanks for reaching out!   Seven Pharmacy will get back to you shortly.",
  );
  form.reset();
});

// Product search — filters the cards in the Shop section
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const productCards = document.querySelectorAll("#productGrid .product-card");
const noResults = document.getElementById("noResults");

function filterProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;
  productCards.forEach((card) => {
    const name = card.getAttribute("data-name") || "";
    const matches = query === "" || name.includes(query);
    card.style.display = matches ? "" : "none";
    if (matches) visibleCount++;
  });
  noResults.hidden = visibleCount !== 0;
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
}

searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  filterProducts();
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;
  productCards.forEach((card) => {
    const name = card.getAttribute("data-name") || "";
    const matches = query === "" || name.includes(query);
    card.style.display = matches ? "" : "none";
    if (matches) visibleCount++;
  });
  noResults.hidden = visibleCount !== 0;
});
