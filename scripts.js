// 1. CLASE CITA
class Cita {
    constructor(id, fechaCita, hora, minuto, nombre, apellidos, dni, fechaNacimiento, telefono, observaciones) {
        this.id = id;
        this.fechaCita = fechaCita;
        this.hora = hora;
        this.minuto = minuto;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dni = dni;
        this.fechaNacimiento = fechaNacimiento;
        this.telefono = telefono;
        this.observaciones = observaciones;
    }
}

// 2. FUNCIONES PARA COOKIES
function guardarCitasEnCookie(listaCitas) {
    const textoJSON = encodeURIComponent(JSON.stringify(listaCitas));
    document.cookie = "citas=" + textoJSON + "; max-age=" + (30 * 24 * 60 * 60) + "; path=/";
}

function obtenerCitasDeCookie() {
    const cookies = document.cookie.split("; ");
    
    for (let i = 0; i < cookies.length; i++) {
        const partes = cookies[i].split("=");
        if (partes[0] === "citas" && partes[1] !== "") {
            return JSON.parse(decodeURIComponent(partes[1]));
        }
    }
    
    return [];
}

// CONTROLES EN TIEMPO REAL AL ESCRIBIR EN LOS CAMPOS

// Evitar letras en hora y minuto mientras se escribe
const inputHora = document.getElementById("hora");
const inputMinuto = document.getElementById("minuto");

inputHora.addEventListener("input", function() {
    this.value = this.value.replace(/[^0-9]/g, "").slice(0, 2);
});

inputMinuto.addEventListener("input", function() {
    this.value = this.value.replace(/[^0-9]/g, "").slice(0, 2);
});

// Evitar números en nombre y apellidos mientras se escribe
const inputNombre = document.getElementById("nombre");
const inputApellidos = document.getElementById("apellidos");

inputNombre.addEventListener("input", function() {
    this.value = this.value.replace(/[0-9]/g, "");
});

inputApellidos.addEventListener("input", function() {
    this.value = this.value.replace(/[0-9]/g, "");
});

// Control y cálculo automático de la letra del DNI
const inputDni = document.getElementById("dni");

inputDni.addEventListener("input", function(evento) {
    const letrasValidas = "TRWAGMYFPDXBNJZSQVHLCKE";
    let numeros = this.value.slice(0, 8).replace(/[^0-9]/g, "");

    // Si está borrando hacia atrás desde los 9 caracteres, quitamos letra y último número
    if (evento.inputType === "deleteContentBackward" && numeros.length === 8) {
        this.value = numeros.slice(0, 7);
        return;
    }

    // Al llegar al 8.º número, añadimos automáticamente su letra oficial
    if (numeros.length === 8) {
        const letraCalculada = letrasValidas.charAt(parseInt(numeros, 10) % 23);
        this.value = numeros + letraCalculada;
    } else {
        this.value = numeros;
    }
});

// Control del teléfono: avisa en tiempo real si se introducen letras y limita a 9 caracteres
const inputTelefono = document.getElementById("telefono");

inputTelefono.addEventListener("input", function() {
    if (this.value.length > 9) {
        this.value = this.value.slice(0, 9);
    }

    if (/[^0-9]/.test(this.value)) {
        this.classList.add("error");
        this.nextElementSibling.textContent = "El teléfono no puede contener letras.";
    } else {
        this.classList.remove("error");
        this.nextElementSibling.textContent = "";
    }
});

// 3. VALIDACIÓN DEL FORMULARIO
function validarFormulario() {
    let esValido = true;

    const fechaCita = document.getElementById("fechaCita");
    const hora = document.getElementById("hora");
    const minuto = document.getElementById("minuto");
    const nombre = document.getElementById("nombre");
    const apellidos = document.getElementById("apellidos");
    const dni = document.getElementById("dni");
    const fechaNacimiento = document.getElementById("fechaNacimiento");
    const telefono = document.getElementById("telefono");

    // Limpiar errores previos en todos los campos y sus span
    const campos = [fechaCita, hora, minuto, nombre, apellidos, dni, fechaNacimiento, telefono];
    for (let i = 0; i < campos.length; i++) {
        campos[i].classList.remove("error");
        campos[i].nextElementSibling.textContent = "";
    }

    // Función corta para marcar el campo y escribir en el <span> siguiente
    function marcarError(input, mensaje) {
        input.classList.add("error");
        input.nextElementSibling.textContent = mensaje;
        esValido = false;
    }

    // Fecha actual en formato AAAA-MM-DD
    const hoy = new Date().toISOString().split("T")[0];

    if (fechaCita.value === "") {
        marcarError(fechaCita, "Fecha obligatoria.");
    } else if (fechaCita.value < hoy) {
        marcarError(fechaCita, "No puede ser anterior a hoy.");
    }

    // Hora: obligatoria, solo dígitos y entre 0 y 23
    const horaVal = hora.value.trim();
    if (horaVal === "" || !/^[0-9]+$/.test(horaVal) || parseInt(horaVal, 10) < 0 || parseInt(horaVal, 10) > 23) {
        marcarError(hora, "Hora inválida (solo números de 0 a 23).");
    }

    // Minuto: obligatorio, solo dígitos y entre 0 y 59
    const minutoVal = minuto.value.trim();
    if (minutoVal === "" || !/^[0-9]+$/.test(minutoVal) || parseInt(minutoVal, 10) < 0 || parseInt(minutoVal, 10) > 59) {
        marcarError(minuto, "Minuto inválido (solo números de 0 a 59).");
    }

    // Nombre: obligatorio y sin ningún número
    if (nombre.value.trim() === "") {
        marcarError(nombre, "Nombre obligatorio.");
    } else if (/[0-9]/.test(nombre.value)) {
        marcarError(nombre, "El nombre no puede contener números.");
    }

    // Apellidos: obligatorios y sin ningún número
    if (apellidos.value.trim() === "") {
        marcarError(apellidos, "Apellidos obligatorios.");
    } else if (/[0-9]/.test(apellidos.value)) {
        marcarError(apellidos, "Los apellidos no pueden contener números.");
    }

    // Comprobar formato y letra oficial del DNI (módulo 23)
    const valorDni = dni.value.trim().toUpperCase();
    const letrasValidas = "TRWAGMYFPDXBNJZSQVHLCKE";

    if (!/^[0-9]{8}[A-Z]$/.test(valorDni)) {
        marcarError(dni, "DNI inválido (8 números y 1 letra).");
    } else {
        const numeroDni = parseInt(valorDni.slice(0, 8), 10);
        const letraEscrita = valorDni.charAt(8);
        const letraCorrecta = letrasValidas.charAt(numeroDni % 23);

        if (letraEscrita !== letraCorrecta) {
            marcarError(dni, "La letra del DNI no es correcta.");
        }
    }

    // Calcular fechas límite (mínimo 5 años, máximo 100 años)
    const limite5Anios = new Date();
    limite5Anios.setFullYear(limite5Anios.getFullYear() - 5);
    const fechaMaximaNacimiento = limite5Anios.toISOString().split("T")[0];

    const limite100Anios = new Date();
    limite100Anios.setFullYear(limite100Anios.getFullYear() - 100);
    const fechaMinimaNacimiento = limite100Anios.toISOString().split("T")[0];

    // Comprobar fecha de nacimiento (obligatoria, no futura, mayor de 5 años y menor de 100)
    if (fechaNacimiento.value === "") {
        marcarError(fechaNacimiento, "Fecha obligatoria.");
    } else if (fechaNacimiento.value > hoy) {
        marcarError(fechaNacimiento, "La fecha de nacimiento no puede ser futura.");
    } else if (fechaNacimiento.value > fechaMaximaNacimiento) {
        marcarError(fechaNacimiento, "El paciente debe ser mayor de 5 años.");
    } else if (fechaNacimiento.value < fechaMinimaNacimiento) {
        marcarError(fechaNacimiento, "La edad no puede ser superior a 100 años.");
    }

    // Comprobar teléfono (obligatorio, sin letras y exactamente 9 números)
    if (telefono.value.trim() === "") {
        marcarError(telefono, "Teléfono obligatorio.");
    } else if (/[^0-9]/.test(telefono.value.trim())) {
        marcarError(telefono, "El teléfono no puede contener letras.");
    } else if (!/^[0-9]{9}$/.test(telefono.value.trim())) {
        marcarError(telefono, "Teléfono inválido (debe tener 9 números).");
    }

    return esValido;    
}

// 4. CREAR O MODIFICAR CITA AL ENVIAR EL FORMULARIO
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    if (validarFormulario()) {
        let listaCitas = obtenerCitasDeCookie();
        const idOculto = document.getElementById("idCita").value;

        if (idOculto !== "") {
            // MODO EDICIÓN: Buscamos la cita por su ID y actualizamos sus datos
            for (let i = 0; i < listaCitas.length; i++) {
                if (listaCitas[i].id == idOculto) {
                    listaCitas[i].fechaCita = document.getElementById("fechaCita").value;
                    listaCitas[i].hora = document.getElementById("hora").value.trim();
                    listaCitas[i].minuto = document.getElementById("minuto").value.trim();
                    listaCitas[i].nombre = document.getElementById("nombre").value.trim();
                    listaCitas[i].apellidos = document.getElementById("apellidos").value.trim();
                    listaCitas[i].dni = document.getElementById("dni").value.trim().toUpperCase();
                    listaCitas[i].fechaNacimiento = document.getElementById("fechaNacimiento").value;
                    listaCitas[i].telefono = document.getElementById("telefono").value.trim();
                    listaCitas[i].observaciones = document.getElementById("observaciones").value.trim();
                    break;
                }
            }
        } else {
            // MODO CREACIÓN: Creamos una cita nueva con instante único
            const idUnico = Date.now();
            const nuevaCita = new Cita(
                idUnico,
                document.getElementById("fechaCita").value,
                document.getElementById("hora").value.trim(),
                document.getElementById("minuto").value.trim(),
                document.getElementById("nombre").value.trim(),
                document.getElementById("apellidos").value.trim(),
                document.getElementById("dni").value.trim().toUpperCase(),
                document.getElementById("fechaNacimiento").value,
                document.getElementById("telefono").value.trim(),
                document.getElementById("observaciones").value.trim()
            );
            listaCitas.push(nuevaCita);
        }

        guardarCitasEnCookie(listaCitas);
        mostrarCitas();

        // Limpiamos el formulario y vaciamos el ID oculto para volver a modo creación
        formulario.reset();
        document.getElementById("idCita").value = "";
    }
});

// 5. MOSTRAR CITAS EN LA TABLA Y CONTROLAR "DATO VACÍO"
function mostrarCitas() {
    const cuerpoTabla = document.getElementById("cuerpoTabla");
    const listaCitas = obtenerCitasDeCookie();

    cuerpoTabla.innerHTML = "";

    if (listaCitas.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center;">dato vacío</td>
            </tr>
        `;
        return;
    }

    for (let i = 0; i < listaCitas.length; i++) {
        const cita = listaCitas[i];
        const orden = i + 1;
        const minutoFormateado = cita.minuto.toString().padStart(2, "0");

        const fila = document.createElement("tr");
        fila.setAttribute("data-id", cita.id);

        fila.innerHTML = `
            <td>${orden}</td>
            <td>${cita.fechaCita}</td>
            <td>${cita.hora}:${minutoFormateado}</td>
            <td>${cita.nombre}</td>
            <td>${cita.apellidos}</td>
            <td>${cita.dni}</td>
            <td>${cita.fechaNacimiento}</td>
            <td>${cita.telefono}</td>
            <td>${cita.observaciones}</td>
            <td>
                <button type="button" class="btn-editar" onclick="editarCita(${cita.id})">Editar</button>
                <button type="button" class="btn-borrar" onclick="borrarCita(${cita.id})">Borrar</button>
            </td>
        `;

        cuerpoTabla.appendChild(fila);
    }
}

// Cargar citas al abrir la aplicación
window.addEventListener("DOMContentLoaded", mostrarCitas);

// 6. EDITAR CITA (LEYENDO DIRECTAMENTE DESDE LA COOKIE)
function editarCita(id) {
    // Leemos las citas desde la cookie (NO desde la tabla HTML)
    const listaCitas = obtenerCitasDeCookie();

    // Buscamos la cita que coincida con el id oculto
    for (let i = 0; i < listaCitas.length; i++) {
        if (listaCitas[i].id === id) {
            const cita = listaCitas[i];

            // Guardamos el ID en el campo oculto del formulario
            document.getElementById("idCita").value = cita.id;

            // Rellenamos el resto de campos con los datos de la cookie
            document.getElementById("fechaCita").value = cita.fechaCita;
            document.getElementById("hora").value = cita.hora;
            document.getElementById("minuto").value = cita.minuto;
            document.getElementById("nombre").value = cita.nombre;
            document.getElementById("apellidos").value = cita.apellidos;
            document.getElementById("dni").value = cita.dni;
            document.getElementById("fechaNacimiento").value = cita.fechaNacimiento;
            document.getElementById("telefono").value = cita.telefono;
            document.getElementById("observaciones").value = cita.observaciones;

            break;
        }
    }
}

// 7. BORRAR CITA
function borrarCita(id) {
    let listaCitas = obtenerCitasDeCookie();

    // Filtramos dejando todas las citas MENOS la que tiene el id que queremos borrar
    listaCitas = listaCitas.filter(function(cita) {
        return cita.id !== id;
    });

    // Guardamos la lista actualizada en la cookie
    guardarCitasEnCookie(listaCitas);

    // Si estábamos editando justo la cita que acabamos de borrar, limpiamos el formulario
    if (document.getElementById("idCita").value == id) {
        formulario.reset();
        document.getElementById("idCita").value = "";
    }

    // Volvemos a pintar la tabla (si queda vacía, volverá a salir "dato vacío")
    mostrarCitas();
}