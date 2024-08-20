document.addEventListener("DOMContentLoaded", () => {
  const quoteForm = document.getElementById("quoteForm");
  const quoteResult = document.getElementById("quoteResult");
  const distanceForm = document.getElementById("distanceForm");
  const distanceResult = document.getElementById("distanceResult");

  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const tipoVehiculo = document.getElementById("tipoVehiculo").value;
    const kilometros = parseFloat(document.getElementById("kilometros").value);
    const horas = parseFloat(document.getElementById("horas").value);

    let precioKm = 0.8; // en USD
    let precioHora = 0.4; // en USD

    if (tipoVehiculo === "van") {
      precioKm *= 2;
      precioHora *= 2;
    }

    if (kilometros < 100 || horas < 8) {
      quoteResult.textContent =
        "Error: El mínimo aforo es de 100 km y 8 horas.";
      quoteResult.style.color = "red";
      return;
    }

    const costoKmUSD = kilometros * precioKm;
    const costoHoraUSD = horas * precioHora;
    const costoTotalUSD = costoKmUSD + costoHoraUSD;

    fetch("https://dolarapi.com/v1/dolares/oficial")
      .then((response) => response.json())
      .then((data) => {
        const valorVenta = data.venta;
        const costoTotalARS = (costoTotalUSD * valorVenta).toFixed(2);
        quoteResult.innerHTML = `
                    Costo Total: $${costoTotalARS} ARS<br />
                    Costo Total: $${costoTotalUSD.toFixed(2)} USD
                `;
        quoteResult.style.color = "black";
      })
      .catch((error) => {
        quoteResult.textContent = `Error al obtener el tipo de cambio: ${error.message}`;
        quoteResult.style.color = "red";
      });
  });

  distanceForm.addEventListener("submit", async (e) => {
    e.preventDefault();

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

      // Verifica las coordenadas obtenidas
      console.log(`Coordenadas Origen: Lat ${lat1}, Lon ${lon1}`);
      console.log(`Coordenadas Destino: Lat ${lat2}, Lon ${lon2}`);

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
