const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const chipBox = document.getElementById('chip-box');
const emailInput = document.getElementById('email-input');
const form = document.getElementById('send-form');
const sendBtn = document.getElementById('send-btn');
const statusEl = document.getElementById('status');

let recipients = [];

function renderChips() {
  chipBox.querySelectorAll('.chip').forEach((el) => el.remove());
  recipients.forEach((email, i) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `${email} <button type="button" data-i="${i}">×</button>`;
    chipBox.insertBefore(chip, emailInput);
  });
}

function addEmail(raw) {
  const email = raw.trim().replace(/,$/, '');
  if (!email) return;
  if (!EMAIL_RE.test(email)) {
    showStatus(`إيميل غير صالح: ${email}`, 'error');
    return;
  }
  if (recipients.includes(email)) return;
  recipients.push(email);
  renderChips();
}

emailInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addEmail(emailInput.value);
    emailInput.value = '';
  } else if (e.key === 'Backspace' && emailInput.value === '' && recipients.length > 0) {
    recipients.pop();
    renderChips();
  }
});

emailInput.addEventListener('blur', () => {
  if (emailInput.value.trim()) {
    addEmail(emailInput.value);
    emailInput.value = '';
  }
});

chipBox.addEventListener('click', (e) => {
  if (e.target.matches('button[data-i]')) {
    recipients.splice(Number(e.target.dataset.i), 1);
    renderChips();
  }
});

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = type;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (recipients.length === 0) {
    showStatus('أضف إيميل واحد على الأقل.', 'error');
    return;
  }

  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;

  sendBtn.disabled = true;
  showStatus('جارٍ الإرسال...', '');

  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients, subject, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل الإرسال');

    showStatus(`تم الإرسال بنجاح إلى ${data.sent} مستلم ✓`, 'success');
    recipients = [];
    renderChips();
    form.reset();
  } catch (err) {
    showStatus(err.message, 'error');
  } finally {
    sendBtn.disabled = false;
  }
});
