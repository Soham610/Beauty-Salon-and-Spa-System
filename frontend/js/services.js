document.addEventListener('DOMContentLoaded', () => {
  window.createCrudModule({
    endpoint: '/api/services',
    formId: 'serviceForm',
    tableBodyId: 'serviceTableBody',
    searchInputId: 'serviceSearchInput',
    searchButtonId: 'serviceSearchButton',
    resetButtonId: 'serviceResetButton',
    deleteButtonId: 'serviceDeleteButton',
    navigatorLabelId: 'serviceNavigatorLabel',
    navGroup: 'services',
    messageId: 'serviceMessage',
    emptyColspan: 7,
    defaultValues: {
      status: 'active',
    },
    beforeInit: async () => {
      const [categoriesResponse, usersResponse] = await Promise.all([
        window.apiRequest('/api/categories'),
        window.apiRequest('/api/users'),
      ]);

      return {
        categories: categoriesResponse.data,
        parlours: usersResponse.data.filter((user) => Number(user.is_parlour) === 1),
      };
    },
    onLookupsLoaded: (lookups) => {
      window.populateSelect('serviceType', lookups.categories, {
        valueKey: 'id',
        labelKey: 'title',
        placeholder: 'Select category',
      });
      window.populateSelect('serviceCreatedBy', lookups.parlours, {
        valueKey: 'id',
        labelKey: 'name',
        placeholder: 'Select parlour',
      });
    },
    preparePayload: (data) => ({
      ...data,
      service_type: Number(data.service_type),
      created_by: Number(data.created_by),
      price: Number(data.price),
    }),
    recordLabel: (record) => record.title,
    renderRow: (record) => `
      <tr>
        <td>#${record.id}</td>
        <td>${window.escapeHtml(record.title)}</td>
        <td>${window.escapeHtml(record.category_title || '')}</td>
        <td>${window.escapeHtml(record.created_by_name || '')}</td>
        <td>${window.formatCurrency(record.price)}</td>
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
