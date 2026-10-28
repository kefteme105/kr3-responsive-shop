// Учебная форма: проверяем данные локально, без отправки на сервер.
const orderDialog = document.getElementById('order-dialog');
const successMessage = document.getElementById('success-message');

if (orderDialog) {
  document.querySelectorAll('button[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      document.getElementById('selected-product').value = button.dataset.product;
      successMessage.hidden = true;
      orderDialog.showModal();
      document.getElementById('order-name').focus();
    });
  });
  ['close-order-dialog', 'cancel-order-dialog'].forEach((id) => {
    document.getElementById(id).addEventListener('click', () => orderDialog.close());
  });
  // Закрываем только при клике за границами окна, а не по его отступам.
  orderDialog.addEventListener('click', (event) => {
    const rect = orderDialog.getBoundingClientRect();
    if (event.target === orderDialog &&
        (event.clientX < rect.left || event.clientX > rect.right ||
         event.clientY < rect.top || event.clientY > rect.bottom)) {
      orderDialog.close();
    }
  });
}

const productSelect = document.getElementById('page-product');
if (productSelect) {
  const productId = new URLSearchParams(window.location.search).get('product');
  if (['1', '2', '3'].includes(productId)) productSelect.value = `Товар ${productId}`;
}

document.querySelectorAll('.order-form').forEach((form) => {
  const clearError = (field) => {
    field.removeAttribute('aria-invalid');
    const error = document.getElementById(`${field.id}-error`);
    if (error) error.remove();
    const descriptions = (field.getAttribute('aria-describedby') || '')
      .split(/\s+/).filter((id) => id && id !== `${field.id}-error`);
    if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' '));
    else field.removeAttribute('aria-describedby');
  };

  const showError = (field) => {
    const label = field.labels?.[0]?.textContent.trim() || 'Поле';
    let explanation = `Проверьте поле «${label}».`;
    if (field.validity.valueMissing) explanation = `Заполните поле «${label}».`;
    else if (field.validity.typeMismatch) explanation = `Введите корректный адрес электронной почты.`;
    else if (field.validity.patternMismatch) explanation = `Укажите телефон в формате +7 (900) 000-00-00.`;
    else if (field.validity.tooShort) explanation = `Введите не менее ${field.minLength} символов в поле «${label}».`;
    field.setAttribute('aria-invalid', 'true');
    const error = document.createElement('p');
    error.id = `${field.id}-error`;
    error.className = 'form-error';
    error.setAttribute('role', 'alert');
    error.textContent = explanation;
    field.closest('.order-form__field').append(error);
    const previous = field.getAttribute('aria-describedby');
    field.setAttribute('aria-describedby', [previous, error.id].filter(Boolean).join(' '));
  };

  form.addEventListener('input', (event) => {
    if (event.target.id) clearError(event.target);
  });
  form.addEventListener('change', (event) => {
    if (event.target.id) clearError(event.target);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = form.id === 'page-order-form'
      ? document.getElementById('page-success-message') : successMessage;
    message.hidden = true;
    const fields = Array.from(form.elements).filter((field) => field.willValidate);
    fields.forEach(clearError);
    if (!form.checkValidity()) {
      const invalidFields = fields.filter((field) => !field.checkValidity());
      invalidFields.forEach(showError);
      invalidFields[0].focus();
      return;
    }
    message.hidden = false;
    form.reset();
    if (form.closest('dialog')) orderDialog.close();
  });
});
