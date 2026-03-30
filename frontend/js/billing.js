document.addEventListener('DOMContentLoaded', async () => {
  const appointmentSelect = document.getElementById('billingAppointmentSelect');
  const params = new URLSearchParams(window.location.search);
  const preselectedAppointmentId = params.get('appointment');

  const loadInvoice = async (appointmentId) => {
    if (!appointmentId) {
      window.showMessage('billingMessage', 'Select an appointment to load its invoice.', 'error');
      return;
    }

    try {
      const response = await window.apiRequest(`/api/appointments/${appointmentId}/invoice`);
      window.renderInvoice('billingInvoiceContainer', response.data);
      window.clearMessage('billingMessage');
    } catch (error) {
      window.showMessage('billingMessage', error.message, 'error');
    }
  };

  document.getElementById('loadInvoiceButton').addEventListener('click', async () => {
    await loadInvoice(appointmentSelect.value);
  });

  document.getElementById('printBillButton').addEventListener('click', () => {
    window.print();
  });

  try {
    const response = await window.apiRequest('/api/appointments');
    const appointments = response.data;

    appointmentSelect.innerHTML =
      '<option value="">Select appointment</option>' +
      appointments
        .map(
          (appointment) =>
            `<option value="${appointment.id}">#${appointment.id} - ${window.escapeHtml(
              appointment.name
            )} (${window.escapeHtml(appointment.appt_date)})</option>`
        )
        .join('');

    if (preselectedAppointmentId) {
      appointmentSelect.value = preselectedAppointmentId;
      await loadInvoice(preselectedAppointmentId);
    } else if (appointments[0]) {
      appointmentSelect.value = appointments[0].id;
      await loadInvoice(appointments[0].id);
    } else {
      window.renderInvoice('billingInvoiceContainer', null);
    }
  } catch (error) {
    window.showMessage('billingMessage', error.message, 'error');
  }
});
