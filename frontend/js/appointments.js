document.addEventListener('DOMContentLoaded', () => {
  const state = {
    appointments: [],
    services: [],
    users: [],
    currentId: null,
  };

  const form = document.getElementById('appointmentForm');
  const tableBody = document.getElementById('appointmentTableBody');
  const serviceSelect = document.getElementById('appointmentServices');
  const searchInput = document.getElementById('appointmentSearchInput');
  const navigatorLabel = document.getElementById('appointmentNavigatorLabel');

  const renderPreviewFromSelection = () => {
    const selectedIds = Array.from(serviceSelect.selectedOptions).map((option) => Number(option.value));
    const selectedServices = state.services.filter((service) => selectedIds.includes(Number(service.id)));
    const preview = {
      items: selectedServices.map((service) => ({
        title: service.title,
        price: service.price,
      })),
      total: selectedServices.reduce((sum, service) => sum + Number(service.price), 0),
    };
    window.renderInvoice('invoicePreview', preview);
  };

  const populateFormWithAppointment = async (appointment) => {
    if (!appointment) {
      state.currentId = null;
      window.resetFormState(form, { status: 'booked' });
      navigatorLabel.textContent = 'Current Record: none selected';
      renderPreviewFromSelection();
      return;
    }

    const invoiceResponse = await window.apiRequest(`/api/appointments/${appointment.id}/invoice`);
    const serviceIds = invoiceResponse.data.items.map((item) => String(item.service_id));
    state.currentId = appointment.id;
    window.setFormValues(form, {
      ...appointment,
      serviceIds,
    });
    navigatorLabel.textContent = `Current Record: #${appointment.id} - ${appointment.name}`;
    window.renderInvoice('invoicePreview', invoiceResponse.data);
  };

  const renderTable = () => {
    tableBody.innerHTML = state.appointments.length
      ? state.appointments
          .map(
            (appointment) => `
              <tr>
                <td>#${appointment.id}</td>
                <td>${window.escapeHtml(appointment.name)}</td>
                <td>${window.escapeHtml(appointment.service)}</td>
                <td>${window.escapeHtml(appointment.appt_date)} ${window.escapeHtml(appointment.appt_time)}</td>
                <td>${window.escapeHtml(appointment.parlour_name || '')}</td>
                <td>${window.renderStatusChip(appointment.status)}</td>
                <td>${window.formatCurrency(appointment.total_bill)}</td>
                <td>
                  <div class="table-actions">
                    <button type="button" class="mini-button" data-action="edit" data-id="${appointment.id}">Edit</button>
                    <button type="button" class="mini-button" data-action="bill" data-id="${appointment.id}">Bill</button>
                    <button type="button" class="mini-button" data-action="delete" data-id="${appointment.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="8">No appointments found.</td></tr>';
  };

  const loadLookups = async () => {
    const [usersResponse, servicesResponse] = await Promise.all([
      window.apiRequest('/api/users'),
      window.apiRequest('/api/services'),
    ]);

    state.users = usersResponse.data;
    state.services = servicesResponse.data.filter((service) => service.status === 'active');

    window.populateSelect(
      'appointmentParlour',
      state.users.filter((user) => Number(user.is_parlour) === 1),
      {
        valueKey: 'id',
        labelKey: 'name',
        placeholder: 'Select parlour',
      }
    );

    window.populateSelect('appointmentCreatedBy', state.users, {
      valueKey: 'id',
      labelKey: 'name',
      placeholder: 'Select booking user',
    });

    const serviceOptions = state.services
      .map(
        (service) =>
          `<option value="${service.id}">${window.escapeHtml(service.title)} - ${window.formatCurrency(service.price)}</option>`
      )
      .join('');
    serviceSelect.innerHTML = serviceOptions;
  };

  const loadAppointments = async (search = '') => {
    const endpoint = search ? `/api/appointments?search=${encodeURIComponent(search)}` : '/api/appointments';
    const response = await window.apiRequest(endpoint);
    state.appointments = response.data;
    renderTable();

    if (state.currentId) {
      const currentRecord = state.appointments.find((item) => Number(item.id) === Number(state.currentId));
      if (currentRecord) {
        await populateFormWithAppointment(currentRecord);
        return;
      }
    }

    if (state.appointments[0]) {
      await populateFormWithAppointment(state.appointments[0]);
    } else {
      await populateFormWithAppointment(null);
    }
  };

  const navigate = async (direction) => {
    const query = new URLSearchParams({
      direction,
      ...(state.currentId ? { currentId: state.currentId } : {}),
    });
    const response = await window.apiRequest(`/api/appointments/navigate?${query.toString()}`);
    await populateFormWithAppointment(response.data);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    window.clearMessage('appointmentMessage');

    try {
      const data = window.formToObject(form);
      const id = data.id;
      delete data.id;

      const payload = {
        ...data,
        parlour: Number(data.parlour),
        created_by: data.created_by ? Number(data.created_by) : null,
        serviceIds: (data.serviceIds || []).map(Number),
      };

      const response = await window.apiRequest(id ? `/api/appointments/${id}` : '/api/appointments', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      window.showMessage('appointmentMessage', response.message);
      await loadAppointments(searchInput.value || '');
      await populateFormWithAppointment(response.data);
    } catch (error) {
      window.showMessage('appointmentMessage', error.message, 'error');
    }
  });

  document.getElementById('appointmentResetButton').addEventListener('click', async () => {
    state.currentId = null;
    window.resetFormState(form, { status: 'booked' });
    renderPreviewFromSelection();
    navigatorLabel.textContent = 'Current Record: none selected';
  });

  document.getElementById('appointmentDeleteButton').addEventListener('click', async () => {
    if (!state.currentId) {
      window.showMessage('appointmentMessage', 'Select an appointment first.', 'error');
      return;
    }

    if (!window.confirm('Delete this appointment?')) {
      return;
    }

    try {
      await window.apiRequest(`/api/appointments/${state.currentId}`, { method: 'DELETE' });
      window.showMessage('appointmentMessage', 'Appointment deleted successfully.');
      await loadAppointments(searchInput.value || '');
    } catch (error) {
      window.showMessage('appointmentMessage', error.message, 'error');
    }
  });

  document.getElementById('appointmentSearchButton').addEventListener('click', async () => {
    try {
      await loadAppointments(searchInput.value || '');
    } catch (error) {
      window.showMessage('appointmentMessage', error.message, 'error');
    }
  });

  searchInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await loadAppointments(searchInput.value || '');
    }
  });

  serviceSelect.addEventListener('change', renderPreviewFromSelection);

  document.querySelectorAll('.navigator [data-direction]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await navigate(button.dataset.direction);
      } catch (error) {
        window.showMessage('appointmentMessage', error.message, 'error');
      }
    });
  });

  tableBody.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) {
      return;
    }

    const id = Number(target.dataset.id);
    const action = target.dataset.action;
    const record = state.appointments.find((appointment) => Number(appointment.id) === id);

    try {
      if (action === 'edit' && record) {
        await populateFormWithAppointment(record);
      }

      if (action === 'bill') {
        window.location.href = `/billing.html?appointment=${id}`;
      }

      if (action === 'delete') {
        state.currentId = id;
        document.getElementById('appointmentDeleteButton').click();
      }
    } catch (error) {
      window.showMessage('appointmentMessage', error.message, 'error');
    }
  });

  (async () => {
    try {
      await loadLookups();
      window.resetFormState(form, { status: 'booked' });
      renderPreviewFromSelection();
      await loadAppointments();
    } catch (error) {
      window.showMessage('appointmentMessage', error.message, 'error');
    }
  })();
});
