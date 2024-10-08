document.addEventListener("DOMContentLoaded", () => {
  const quoteForm = document.getElementById("quoteForm");
  const quoteResult = document.getElementById("quoteResult");
  const distanceForm = document.getElementById("distanceForm");
  const distanceResult = document.getElementById("distanceResult");

  // Obtener la fecha de hoy en formato 'YYYY-MM-DD'
  const today = new Date().toISOString().split("T")[0];

  // Establecer el valor mínimo de las fechas de retiro y devolución
  document.getElementById("pickup-date").setAttribute("min", today);
  document.getElementById("return-date").setAttribute("min", today);

  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipoVehiculo = document.getElementById("tipoVehiculo").value;
    const pickupDate = document.getElementById("pickup-date").value;
    const pickupTime = document.getElementById("pickup-time").value;
    const returnDate = document.getElementById("return-date").value;
    const returnTime = document.getElementById("return-time").value;
    const kilometros = parseFloat(document.getElementById("kilometros").value);

    if (!pickupDate || !pickupTime || !returnDate || !returnTime) {
      quoteResult.textContent = "Por favor, complete todas las fechas y horas.";
      quoteResult.style.color = "red";
      return;
    }

    // Crear objetos Date para las fechas y horas de retiro y devolución
    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
    const returnDateTime = new Date(`${returnDate}T${returnTime}`);

    if (pickupDateTime >= returnDateTime) {
      quoteResult.textContent =
        "La fecha y hora de devolución debe ser después de la fecha y hora de retiro.";
      quoteResult.style.color = "red";
      return;
    }

    // Calcular la diferencia en horas
    const differenceInMilliseconds = returnDateTime - pickupDateTime;
    const differenceInHours = Math.ceil(
      differenceInMilliseconds / (1000 * 60 * 60)
    );

    // Validar que la diferencia sea al menos 8 horas
    if (differenceInHours < 8) {
      quoteResult.textContent =
        "La diferencia entre la hora de retiro y la hora de devolución debe ser de al menos 8 horas.";
      quoteResult.style.color = "red";
      return;
    }

    let precioKm = 0.4; // Precio base en USD
    let precioHora = 0.4; // Precio base en USD

    // Ajustar los precios según el tipo de vehículo
    if (tipoVehiculo === "minibus") {
      precioKm *= 2;
      precioHora *= 2;
    } else if (tipoVehiculo === "pickup") {
      precioKm *= 1.5; // Precio intermedio entre Auto y Mini Bus
      precioHora *= 1.5;
    }

    // Calcular el costo total en USD
    const costoKmUSD = kilometros * precioKm;
    const costoHoraUSD = differenceInHours * precioHora;
    const costoTotalUSD = costoKmUSD + costoHoraUSD;

    // Obtener el tipo de cambio
    try {
      const response = await fetch("https://dolarapi.com/v1/dolares/oficial");
      const data = await response.json();
      const valorVenta = data.venta;
      const costoTotalARS = (costoTotalUSD * valorVenta).toFixed(2);

      quoteResult.innerHTML = `
        Costo Total: $${costoTotalARS} ARS<br />
        Costo Total: $${costoTotalUSD.toFixed(2)} USD<br />
        Total Horas: ${differenceInHours} horas<br />
        Total Kilómetros: ${kilometros} km
      `;
      quoteResult.style.color = "black";
    } catch (error) {
      quoteResult.textContent = `Error al obtener el tipo de cambio: ${error.message}`;
      quoteResult.style.color = "red";
    }
  });

  distanceForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Mostrar el mensaje "Calculando..."
    distanceResult.innerHTML = "<p>Calculando...</p>";
    distanceResult.style.color = "black"; // Asegúrate de que el texto sea visible

    const origen = encodeURIComponent(
      document.getElementById("origen").value + ", Argentina"
    );
    const destino = encodeURIComponent(
      document.getElementById("destino").value + ", Argentina"
    );

    try {
      const responseOrigen = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${origen}&format=json&limit=1`
      );
      const responseDestino = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${destino}&format=json&limit=1`
      );

      const dataOrigen = await responseOrigen.json();
      const dataDestino = await responseDestino.json();

      if (dataOrigen.length === 0 || dataDestino.length === 0) {
        throw new Error("No se pudo encontrar una de las ubicaciones.");
      }

      const lat1 = parseFloat(dataOrigen[0].lat);
      const lon1 = parseFloat(dataOrigen[0].lon);
      const lat2 = parseFloat(dataDestino[0].lat);
      const lon2 = parseFloat(dataDestino[0].lon);

      // Fórmula de Haversine para calcular la distancia
      const R = 6371; // Radio de la Tierra en kilómetros
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distancia = R * c;

      distanceResult.innerHTML = `La distancia entre ${decodeURIComponent(
        document.getElementById("origen").value
      )} y ${decodeURIComponent(
        document.getElementById("destino").value
      )} es ${distancia.toFixed(2)} km.`;
      distanceResult.style.color = "black";
    } catch (error) {
      distanceResult.textContent = `Error: ${error.message}`;
      distanceResult.style.color = "red";
    }
  });
});
