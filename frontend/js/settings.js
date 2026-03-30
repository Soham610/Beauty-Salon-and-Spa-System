document.addEventListener('DOMContentLoaded', () => {
  window.createCrudModule({
    endpoint: '/api/settings',
    formId: 'settingsForm',
    tableBodyId: 'settingsTableBody',
    searchInputId: 'settingsSearchInput',
    searchButtonId: 'settingsSearchButton',
    resetButtonId: 'settingsResetButton',
    deleteButtonId: 'settingsDeleteButton',
    navigatorLabelId: 'settingsNavigatorLabel',
    navGroup: 'settings',
    messageId: 'settingsMessage',
    emptyColspan: 5,
    recordLabel: (record) => record.site_title,
    renderRow: (record) => `
      <tr>
        <td>#${record.id}</td>
        <td>${window.escapeHtml(record.site_title)}</td>
        <td>${window.escapeHtml(record.meta_title)}</td>
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
