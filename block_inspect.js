document.addEventListener('contextmenu', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
  e.preventDefault();
});
document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && e.key.toUpperCase() === 'U')
  ) {
    e.preventDefault();
  }
});
