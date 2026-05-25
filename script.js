// ===== CONTACTS MODULE =====
// Events: click (open/close modal), input (live validation), blur (on-leave validation), submit

// --- DOM ---
const openBtn      = document.getElementById('open-modal-btn');
const modalOverlay = document.getElementById('modal');
const closeBtn     = document.getElementById('modal-close-btn');
const form         = document.getElementById('contact-form');
const successMsg   = document.getElementById('success-msg');

const fieldName    = document.getElementById('iname');
const fieldEmail   = document.getElementById('iemail');
const fieldMessage = document.getElementById('imessage');

// --- Fields array (map/forEach для работы с DOM) ---
const fields = [
  { el: fieldName,    key: 'contact_name',    minLen: 2, label: 'Jméno' },
  { el: fieldEmail,   key: 'contact_email',   minLen: 0, label: 'E-mail' },
  { el: fieldMessage, key: 'contact_message', minLen: 5, label: 'Zpráva' },
];

// --- LocalStorage: восстановить сохранённые значения ---
fields.forEach(({ el, key }) => {
  const saved = localStorage.getItem(key);
  if (saved) el.value = saved;
});

// --- Validation ---
function validateField({ el, label, minLen }) {
  const val = el.value.trim();
  let error = '';

  if (!val) {
    error = `${label} je povinné pole.`;
  } else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    error = 'Zadejte platný e-mail.';
  } else if (minLen && val.length < minLen) {
    error = `${label} musí mít alespoň ${minLen} znaky.`;
  }

  showError(el, error);
  return error === '';
}

function showError(el, message) {
  const wrapper = el.parentElement;
  let span = wrapper.querySelector('.field-error');
  if (!span) {
    span = document.createElement('span');
    span.className = 'field-error';
    wrapper.appendChild(span);
  }
  span.textContent = message;
  el.classList.toggle('input-error', !!message);
  el.classList.toggle('input-ok', !message && el.value.trim() !== '');
}

// --- EVENT 1: input — save to LocalStorage + live validation ---
fields.forEach(({ el, key, ...rest }) => {
  el.addEventListener('input', () => {
    localStorage.setItem(key, el.value);
    if (el.classList.contains('input-error')) {
      validateField({ el, key, ...rest });
    }
  });
});

// --- EVENT 2: blur — validate on leave ---
fields.forEach((field) => {
  field.el.addEventListener('blur', () => validateField(field));
});

// --- Modal open/close ---
function openModal() {
  modalOverlay.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('modal-open');
  document.body.style.overflow = '';
}

// EVENT 3 (click): open
openBtn.addEventListener('click', openModal);

// EVENT 3 (click): close button
closeBtn.addEventListener('click', closeModal);

// EVENT 3 (click): click on overlay backdrop
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// EVENT 4: keydown Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// --- EVENT 5: submit ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const allValid = fields.map(validateField).every(Boolean);
  if (!allValid) return;

  const data = new FormData(form);
  const response = await fetch(form.action, {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' },
  });

  if (response.ok) {
    form.style.display = 'none';
    successMsg.style.display = 'block';
    fields.forEach(({ key }) => localStorage.removeItem(key));
  }
});