function createCrudModule(config) {
  const state = {
    records: [],
    currentId: null,
    lookups: {},
  };

  const form = document.getElementById(config.formId);
  const tableBody = document.getElementById(config.tableBodyId);
  const searchInput = document.getElementById(config.searchInputId);
  const deleteButton = document.getElementById(config.deleteButtonId);
  const navigatorLabel = document.getElementById(config.navigatorLabelId);

  const getRecordById = (id) => state.records.find((record) => Number(record.id) === Number(id));

  const updateNavigatorLabel = (record) => {
    if (!navigatorLabel) {
      return;
    }

    navigatorLabel.textContent = record
      ? `Current Record: #${record.id} - ${config.recordLabel(record)}`
      : 'Current Record: none selected';
  };

  const populateForm = (record) => {
    state.currentId = record?.id || null;
    window.clearMessage(config.messageId);
    window.setFormValues(form, record || config.defaultValues || {});
    updateNavigatorLabel(record);
    if (config.onRecordSelected) {
      config.onRecordSelected(record, state);
    }
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetForm = () => {
    state.currentId = null;
    window.resetFormState(form, config.defaultValues || {});
    updateNavigatorLabel(null);
    if (config.onRecordSelected) {
      config.onRecordSelected(null, state);
    }
  };

  const renderTable = () => {
    tableBody.innerHTML = state.records.length
      ? state.records.map((record, index) => config.renderRow(record, index + 1, state)).join('')
      : `<tr><td colspan="${config.emptyColspan}">No records found.</td></tr>`;
  };

  const loadRecords = async (search = '') => {
    const endpoint = search ? `${config.endpoint}?search=${encodeURIComponent(search)}` : config.endpoint;
    const response = await window.apiRequest(endpoint);
    state.records = response.data;
    renderTable();

    if (state.currentId) {
      const currentRecord = getRecordById(state.currentId);
      if (currentRecord) {
        populateForm(currentRecord);
        return;
      }
    }

    if (state.records[0]) {
      populateForm(state.records[0]);
    } else {
      resetForm();
    }
  };

  const removeRecord = async (id) => {
    if (!window.confirm('Delete this record?')) {
      return;
    }

    await window.apiRequest(`${config.endpoint}/${id}`, { method: 'DELETE' });
    window.showMessage(config.messageId, 'Record deleted successfully.');
    await loadRecords(searchInput?.value || '');
  };

  const navigate = async (direction) => {
    const query = new URLSearchParams({
      direction,
      ...(state.currentId ? { currentId: state.currentId } : {}),
    });

    const response = await window.apiRequest(`${config.endpoint}/navigate?${query.toString()}`);
    populateForm(response.data);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    window.clearMessage(config.messageId);

    try {
      const rawData = window.formToObject(form);
      const id = rawData.id;
      delete rawData.id;

      const payload = config.preparePayload ? config.preparePayload(rawData, state) : rawData;
      const response = await window.apiRequest(id ? `${config.endpoint}/${id}` : config.endpoint, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      window.showMessage(config.messageId, response.message || 'Saved successfully.');
      await loadRecords(searchInput?.value || '');

      const latestRecord = id ? getRecordById(id) : response.data;
      if (latestRecord) {
        populateForm(latestRecord);
      }

      if (config.afterSave) {
        config.afterSave(response, state);
      }
    } catch (error) {
      window.showMessage(config.messageId, error.message, 'error');
    }
  });

  if (deleteButton) {
    deleteButton.addEventListener('click', async () => {
      if (!state.currentId) {
        window.showMessage(config.messageId, 'Select a record first.', 'error');
        return;
      }

      try {
        await removeRecord(state.currentId);
      } catch (error) {
        window.showMessage(config.messageId, error.message, 'error');
      }
    });
  }

  document.getElementById(config.resetButtonId)?.addEventListener('click', () => {
    resetForm();
    window.clearMessage(config.messageId);
  });

  document.getElementById(config.searchButtonId)?.addEventListener('click', async () => {
    try {
      await loadRecords(searchInput?.value || '');
    } catch (error) {
      window.showMessage(config.messageId, error.message, 'error');
    }
  });

  searchInput?.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await loadRecords(searchInput.value || '');
    }
  });

  document.querySelectorAll(`[data-nav-group="${config.navGroup}"] [data-direction]`).forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await navigate(button.dataset.direction);
      } catch (error) {
        window.showMessage(config.messageId, error.message, 'error');
      }
    });
  });

  tableBody.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) {
      return;
    }

    event.preventDefault();

    const id = target.dataset.id;
    const action = target.dataset.action;
    const record = getRecordById(id);

    try {
      if (action === 'edit' && record) {
        populateForm(record);
      } else if (action === 'delete') {
        await removeRecord(id);
      } else if (config.onTableAction) {
        await config.onTableAction(action, id, record, state);
      }
    } catch (error) {
      window.showMessage(config.messageId, error.message, 'error');
    }
  });

  (async () => {
    try {
      if (config.beforeInit) {
        state.lookups = await config.beforeInit();
      }
      if (config.onLookupsLoaded) {
        config.onLookupsLoaded(state.lookups, state);
      }
      resetForm();
      await loadRecords();
    } catch (error) {
      window.showMessage(config.messageId, error.message, 'error');
    }
  })();
}

window.createCrudModule = createCrudModule;
