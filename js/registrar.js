document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'register') return;
  const formulario = document.querySelector('[data-register-form]');
  if (!formulario || !window.FullGasForms) return;

  const camposAlfabeticos = Array.from(formulario.querySelectorAll('[data-alpha-field]'));
  const patronAlfabetico = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

  camposAlfabeticos.forEach((campo) => {
    campo.addEventListener('input', () => {
      const valor = String(campo.value || '').trim();
      const valido = valor.length >= 2 && patronAlfabetico.test(valor);
      campo.setCustomValidity(valido ? '' : 'Solo se permiten letras.');
    });
  });

  formulario.addEventListener('input', () => {
    FullGasForms.actualizarEstadoValidacion(formulario);
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const valido = formulario.checkValidity() && FullGasForms.actualizarEstadoValidacion(formulario);
    if (!valido) {
      formulario.classList.add('was-validated');
      return;
    }

    const datos = new FormData(formulario);
    const nombre = String(datos.get('firstName') || '').trim();
    const apellido = String(datos.get('lastName') || '').trim();
    const usuario = {
      name: `${nombre} ${apellido}`.trim(),
      email: String(datos.get('email') || '').trim(),
      phone: String(datos.get('phone') || '').trim(),
      address: String(datos.get('address') || '').trim(),
      role: 'Cliente',
      password: String(datos.get('password') || '').trim(),
      creadoEn: new Date().toISOString()
    };

    FullGasForms.guardarUsuario(usuario);
    FullGasForms.guardarSesion({
      name: usuario.name.trim(),
      email: usuario.email,
      phone: usuario.phone,
      address: usuario.address,
      role: 'Cliente'
    });

    FullGasForms.notificar('Registro creado correctamente.');
    window.location.href = 'profile.html';
  });
});
