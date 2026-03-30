document.addEventListener('DOMContentLoaded', () => {
  window.createCrudModule({
    endpoint: '/api/users',
    formId: 'userForm',
    tableBodyId: 'userTableBody',
    searchInputId: 'userSearchInput',
    searchButtonId: 'userSearchButton',
    resetButtonId: 'userResetButton',
    deleteButtonId: 'userDeleteButton',
    navigatorLabelId: 'userNavigatorLabel',
    navGroup: 'users',
    messageId: 'userMessage',
    emptyColspan: 7,
    defaultValues: {
      status: 'active',
      is_parlour: '0',
    },
    preparePayload: (data) => ({
      ...data,
      is_parlour: Number(data.is_parlour || 0),
    }),
    recordLabel: (record) => record.name,
    renderRow: (record) => `
      <tr>
        <td>#${record.id}</td>
        <td>${window.escapeHtml(record.name)}</td>
        <td>${window.escapeHtml(record.mobile)}</td>
        <td>${window.escapeHtml(record.email)}</td>
        <td>${record.is_parlour ? 'Yes' : 'No'}</td>
        <td>${window.renderStatusChip(record.status)}</td>
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
