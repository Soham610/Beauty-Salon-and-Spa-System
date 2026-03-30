document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await window.apiRequest('/api/dashboard/stats');
    const stats = response.data.stats;
    const recentAppointments = response.data.recentAppointments;

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
      <article class="stat-card">
        <h4>Total Admins</h4>
        <strong>${stats.total_admins}</strong>
      </article>
      <article class="stat-card">
        <h4>Total Users</h4>
        <strong>${stats.total_users}</strong>
      </article>
      <article class="stat-card">
        <h4>Total Parlours</h4>
        <strong>${stats.total_parlours}</strong>
      </article>
      <article class="stat-card">
        <h4>Total Categories</h4>
        <strong>${stats.total_categories}</strong>
      </article>
      <article class="stat-card">
        <h4>Total Services</h4>
        <strong>${stats.total_services}</strong>
      </article>
      <article class="stat-card">
        <h4>Total Appointments</h4>
        <strong>${stats.total_appointments}</strong>
      </article>
      <article class="stat-card">
        <h4>Total Revenue</h4>
        <strong>${window.formatCurrency(stats.total_revenue)}</strong>
      </article>
      <article class="stat-card">
        <h4>Project Readiness</h4>
        <strong>Complete</strong>
      </article>
    `;

    document.getElementById('recentAppointmentsTable').innerHTML = recentAppointments.length
      ? recentAppointments
          .map(
            (appointment) => `
              <tr>
                <td>#${appointment.id}</td>
                <td>${window.escapeHtml(appointment.name)}</td>
                <td>${window.escapeHtml(appointment.service)}</td>
                <td>${window.escapeHtml(appointment.appt_date)} ${window.escapeHtml(appointment.appt_time)}</td>
                <td>${window.renderStatusChip(appointment.status)}</td>
                <td>${window.formatCurrency(appointment.total_bill)}</td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="6">No recent appointments found.</td></tr>';
  } catch (error) {
    window.showMessage('dashboardMessage', error.message, 'error');
  }
});
