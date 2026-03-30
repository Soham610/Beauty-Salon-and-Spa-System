document.addEventListener('DOMContentLoaded', () => {
  window.createCrudModule({
    endpoint: '/api/admins',
    formId: 'adminForm',
    tableBodyId: 'adminTableBody',
    searchInputId: 'adminSearchInput',
    searchButtonId: 'adminSearchButton',
    resetButtonId: 'adminResetButton',
    deleteButtonId: 'adminDeleteButton',
    navigatorLabelId: 'adminNavigatorLabel',
    navGroup: 'admins',
    messageId: 'adminMessage',
    emptyColspan: 7,
    defaultValues: {
      type: 'manager',
      status: 'active',
    },
    recordLabel: (record) => record.name,
    renderRow: (record) => `
      <tr>
        <td>#${record.id}</td>
        <td>${window.escapeHtml(record.name)}</td>
        <td>${window.escapeHtml(record.email)}</td>
        <td>${window.renderStatusChip(record.type)}</td>
        <td>${window.renderStatusChip(record.status)}</td>
        <td>${window.escapeHtml(record.date)}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="mini-button" data-action="edit" data-id="${record.id}">Edit</button>
            <button type="button" class="mini-button" data-action="delete" data-id="${record.id}">Delete</button>
          </div>
        </td>
      </tr>
    `,
  });
});
