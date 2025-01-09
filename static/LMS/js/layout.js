const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

// Toggle Sidebar
sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full"); // Show/hide sidebar
    overlay.classList.toggle("hidden"); // Show/hide overlay
});

// Close Sidebar when clicking on overlay
overlay.addEventListener("click", () => {
    sidebar.classList.add("-translate-x-full"); // Hide sidebar
    overlay.classList.add("hidden"); // Hide overlay
});