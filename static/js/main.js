// MEMZO Frontend JavaScript

document.addEventListener('DOMContentLoaded', function () {
  // 1. Landing Page Feature Tabs
  const tabBtns = document.querySelectorAll('.feature-tab-btn');
  const tabPanes = document.querySelectorAll('.feature-tab-content');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        tabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const target = this.getAttribute('data-tab');
        if (target && tabPanes.length > 0) {
          tabPanes.forEach(pane => {
            if (pane.id === target) {
              pane.style.display = 'grid';
            } else {
              pane.style.display = 'none';
            }
          });
        }
      });
    });
  }

  // 2. Auto-dismiss flash messages after 6 seconds
  const flashAlerts = document.querySelectorAll('.alert-dismissible');
  flashAlerts.forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.4s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 400);
    }, 6000);
  });
});
