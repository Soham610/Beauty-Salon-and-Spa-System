async function apiRequest(endpoint, options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    credentials: 'same-origin',
    body: options.body,
  };

  const response = await fetch(endpoint, config);
  const payload = await response.json().catch(() => ({ message: 'Unexpected server response.' }));

  if (response.status === 401 && document.body.dataset.protected === 'true') {
    window.location.href = '/index.html';
    throw new Error('Session expired.');
  }

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function showMessage(elementId, message, type = 'success') {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = `message ${type}`;
  element.classList.remove('hidden');
}

function clearMessage(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  element.textContent = '';
  element.className = 'message hidden';
}

function formToObject(form) {
  const data = {};

  Array.from(form.elements).forEach((element) => {
    if (!element.name) {
      return;
    }

    if (element.multiple) {
      data[element.name] = Array.from(element.selectedOptions).map((option) => option.value);
      return;
    }

    data[element.name] = element.value;
  });

  return data;
}

function setFormValues(form, values) {
  Array.from(form.elements).forEach((element) => {
    if (!element.name) {
      return;
    }

    const value = values[element.name];

    if (element.multiple && Array.isArray(value)) {
      Array.from(element.options).forEach((option) => {
        option.selected = value.map(String).includes(option.value);
      });
      return;
    }

    element.value = value ?? '';
  });
}

function resetFormState(form, defaults = {}) {
  form.reset();
  setFormValues(form, defaults);
}

function populateSelect(selectId, items, options = {}) {
  const select = document.getElementById(selectId);
  if (!select) {
    return;
  }

  const {
    valueKey = 'id',
    labelKey = 'name',
    placeholder = 'Select an option',
    includePlaceholder = true,
  } = options;

  const placeholderOption = includePlaceholder
    ? `<option value="">${escapeHtml(placeholder)}</option>`
    : '';

  select.innerHTML =
    placeholderOption +
    items
      .map((item) => `<option value="${escapeHtml(item[valueKey])}">${escapeHtml(item[labelKey])}</option>`)
      .join('');
}

function renderStatusChip(status) {
  return `<span class="status-chip ${escapeHtml(status)}">${escapeHtml(String(status).replaceAll('_', ' '))}</span>`;
}

function renderInvoice(containerId, invoiceData) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  if (!invoiceData || !invoiceData.items || !invoiceData.items.length) {
    container.innerHTML = '<p class="helper-text">No invoice selected yet.</p>';
    return;
  }

  const appointment = invoiceData.appointment;
  const items = invoiceData.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.service_name || item.title)}</td>
          <td>${formatCurrency(item.price)}</td>
        </tr>
      `
    )
    .join('');

  container.innerHTML = `
    <div class="invoice">
      ${
        appointment
          ? `
        <div class="invoice-meta">
          <div><strong>Appointment ID:</strong> #${escapeHtml(appointment.id)}</div>
          <div><strong>Customer:</strong> ${escapeHtml(appointment.name)}</div>
          <div><strong>Date:</strong> ${escapeHtml(appointment.appt_date)}</div>
          <div><strong>Time:</strong> ${escapeHtml(appointment.appt_time)}</div>
          <div><strong>Parlour:</strong> ${escapeHtml(appointment.parlour_name || '')}</div>
          <div><strong>Status:</strong> ${renderStatusChip(appointment.status)}</div>
        </div>
      `
          : ''
      }
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Service Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
        </table>
      </div>
      <div class="invoice-total">
        <span>Total Amount</span>
        <span>${formatCurrency(invoiceData.total)}</span>
      </div>
    </div>
  `;
}

window.apiRequest = apiRequest;
window.formatCurrency = formatCurrency;
window.escapeHtml = escapeHtml;
window.showMessage = showMessage;
window.clearMessage = clearMessage;
window.formToObject = formToObject;
window.setFormValues = setFormValues;
window.resetFormState = resetFormState;
window.populateSelect = populateSelect;
window.renderStatusChip = renderStatusChip;
window.renderInvoice = renderInvoice;
