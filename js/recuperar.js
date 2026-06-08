document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'recover') return;
  const formulario = document.querySelector('[data-recover-form]');
  if (!formulario || !window.FullGasForms) return;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!formulario.checkValidity()) {
      formulario.classList.add('was-validated');
      return;
    }

    const datos = new FormData(formulario);
    FullGasForms.agregarRecuperacion({
      email: String(datos.get('email') || '').trim(),
      document: String(datos.get('document') || '').trim()
    });

    FullGasForms.notificar('Se guardo la solicitud de recuperacion en localStorage.');
    window.location.href = 'login.html';
  });
});
