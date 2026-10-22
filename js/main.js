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
  form.addEventListener('input', (event) => event.target.removeAttribute('aria-invalid'));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = form.id === 'page-order-form'
      ? document.getElementById('page-success-message') : successMessage;
    message.hidden = true;
    const fields = Array.from(form.elements).filter((field) => field.willValidate);
    fields.forEach((field) => field.removeAttribute('aria-invalid'));
    if (!form.checkValidity()) {
      fields.filter((field) => !field.checkValidity())
        .forEach((field) => field.setAttribute('aria-invalid', 'true'));
      form.reportValidity();
      return;
    }
    message.hidden = false;
    form.reset();
    if (form.closest('dialog')) orderDialog.close();
  });
});
