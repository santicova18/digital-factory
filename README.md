# Bootcamp Digital Factory 2026 — SENA Regional Atlántico

Página web pública de inscripción y control de asistencia al **Bootcamp Digital Factory 2026** (SENA Regional Atlántico / Nodo TIC Barranquilla; Inteligencia Artificial, Automatización, Productividad e Industria 4.0).

---

## 📋 Módulo de Verificación Rápida de Asistencia (`verificar.html`)

Módulo diseñado específicamente para dispositivos móviles (**Mobile-First**) para registrar la asistencia de aprendices e invitados durante las jornadas del evento mediante el escaneo de un código QR.

### 🔐 Control de Acceso por URL (QR Gate)
- **Acceso Directo Bloqueado:** Si un usuario intenta acceder directamente a `verificar.html` sin parámetros en la URL, el sistema bloquea el formulario y muestra la pantalla de **"Acceso Restringido"**, solicitando el escaneo del código QR oficial.
- **Acceso Exclusivo por QR:** El formulario solo se habilita si la URL incluye el parámetro de autorización:
  - Formato recomendado: `https://digital-factory-production.up.railway.app//verificar.html?access=qr`
  - Redirección automática: Si se escanea un código QR apuntando a la raíz con el parámetro (`https://digital-factory-production.up.railway.app/?access=qr`), el portal redirige automáticamente a `verificar.html?access=qr`.

### ⚡ Características y Validaciones
- **Entrada simplificada:** Un solo campo para *Documento de Identidad* con optimización de teclado numérico táctil (`inputmode="numeric"`).
- **Sanitización reactiva:** Filtrado automático de caracteres no numéricos y botón de borrado rápido.
- **Feedback visual dinámico:** Mensajes de estado integrados (Cargando, Asistencia confirmada con nombre y sello de tiempo, ya registrado, o no encontrado).
- **Identidad visual consistente:** Comparte la paleta oficial (Dark Tech `#0B0E2E`, Verde Neón `#D4F842`), tipografías (`Plus Jakarta Sans`, `Space Grotesk`) y componentes del SENA Centro Nacional Colombo Alemán.
