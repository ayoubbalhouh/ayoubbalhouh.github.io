// Anno nel footer
document.getElementById('year').textContent = new Date().getFullYear();

// Effetto "macchina da scrivere" sul ruolo
const roles = ['Junior Web Developer', 'Laravel & PHP', 'WordPress', 'Digital Marketing'];
const typed = document.querySelector('.typed');
let roleIndex = 0, charIndex = roles[0].length, deleting = true;

function typeLoop() {
  const word = roles[roleIndex];
  typed.textContent = word.slice(0, charIndex);
  if (deleting) {
    charIndex--;
    if (charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
  } else {
    charIndex++;
    if (charIndex === roles[roleIndex].length) { deleting = true; setTimeout(typeLoop, 1800); return; }
  }
  setTimeout(typeLoop, deleting ? 45 : 90);
}
setTimeout(typeLoop, 2000);

// Chiude il menu mobile dopo un click
document.querySelectorAll('.links a').forEach(link =>
  link.addEventListener('click', () => document.body.classList.remove('menu-open'))
);

// Animazione delle sezioni allo scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.card, .project, .timeline li, .facts').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});
