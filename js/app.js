"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Smooth navigation for links to sections on this page.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // Add a simple entrance effect to game cards.
  const cards = document.querySelectorAll(".game-card");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    cards.forEach((card) => observer.observe(card));
  }

  // Display the current year in the footer.
  const copyright = document.querySelector(".site-footer p:last-child");

  if (copyright) {
    copyright.innerHTML =
      `&copy; ${new Date().getFullYear()} IGEE ARENA. All rights reserved.`;
  }

  console.log("IGEE ARENA homepage loaded successfully.");
});
