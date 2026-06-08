document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'login') return;
  const formulario = document.querySelector('[data-login-form]');
  if (!formulario || !window.FullGasForms) return;

  FullGasForms.asegurarUsuariosDemo();

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
    const correo = String(datos.get('email') || '').trim();
    const clave = String(datos.get('password') || '').trim();
    const usuario = FullGasForms.obtenerUsuarioPorCorreo(correo);

    if (usuario && usuario.password !== clave) {
      FullGasForms.notificar('La contrasena no coincide con el usuario registrado.', 'danger');
      formulario.classList.add('was-validated');
      return;
    }

    const sesion = {
      name: usuario?.name || correo.split('@')[0] || 'Usuario',
      email: correo,
      phone: usuario?.phone || '',
      address: usuario?.address || 'Coronel, Concepcion',
      role: usuario?.role || 'Cliente'
    };

    FullGasForms.guardarSesion(sesion);
    if (usuario) {
      FullGasForms.guardarUsuario({ ...usuario, ultimoAcceso: new Date().toISOString() });
    }

    FullGasForms.notificar('Sesion iniciada correctamente.');
    if (['administrador', 'tecnico'].includes((sesion.role || '').toLowerCase())) {
      window.location.href = 'admin.html';
      return;
    }
    window.location.href = 'mis-compras.html';
  });
});
