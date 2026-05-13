// Theme Toggle
const themeToggle =
  document.getElementById(
    "themeToggle"
  );

// Detect System Theme
const prefersDark =
  window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

if(prefersDark) {

  document.body.classList.add("dark");

  themeToggle.checked = true;

}

// Manual Toggle
themeToggle.addEventListener(
  "change",
  () => {

    document.body.classList.toggle(
      "dark"
    );

  }
);

// Sidebar Panel Animation
const panels =
  document.querySelectorAll(".panel");

panels.forEach((panel, index) => {

  panel.style.animationDelay =
    `${index * 0.1}s`;

});

// Smooth Fly Animation Utility
function smoothFly(lat, lng, zoom = 13) {

  map.flyTo(
    [lat, lng],
    zoom,
    {
      animate: true,
      duration: 2
    }
  );

}