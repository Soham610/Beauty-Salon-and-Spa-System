document.addEventListener('DOMContentLoaded', () => {
  window.createCrudModule({
    endpoint: '/api/categories',
    formId: 'categoryForm',
    tableBodyId: 'categoryTableBody',
    searchInputId: 'categorySearchInput',
    searchButtonId: 'categorySearchButton',
    resetButtonId: 'categoryResetButton',
    deleteButtonId: 'categoryDeleteButton',
    navigatorLabelId: 'categoryNavigatorLabel',
    navGroup: 'categories',
    messageId: 'categoryMessage',
    emptyColspan: 6,
    defaultValues: {
      status: 'active',
    },
    beforeInit: async () => {
      const response = await window.apiRequest('/api/admins');
      return { admins: response.data };
    },
    onLookupsLoaded: (lookups) => {
      window.populateSelect('categoryCreatedBy', lookups.admins, {
        valueKey: 'id',
        labelKey: 'name',
        placeholder: 'Select admin',
      });
    },
    preparePayload: (data) => ({
      ...data,
      created_by: Number(data.created_by),
    }),
    recordLabel: (record) => record.title,
    renderRow: (record) => `
      <tr>
        <td>#${record.id}</td>
        <td>${window.escapeHtml(record.title)}</td>
        <td>${window.escapeHtml(record.created_by_name || '')}</td>
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
