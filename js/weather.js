const apiKey = "0329981244440ccff5d7a197a1417493"; // Reemplaza con tu clave de API de OpenWeatherMap
const units = "metric"; // O 'imperial' para Fahrenheit

async function fetchWeatherData(city, elementId) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}&lang=es`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener los datos");

    const data = await response.json();
    const temperature = data.main.temp;
    let description = data.weather[0].description;
    const iconCode = data.weather[0].icon;

    // Capitalizamos la primera letra de la descripción
    description = description.charAt(0).toUpperCase() + description.slice(1);

    // Construimos la URL del ícono
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Actualizamos el HTML con el clima y el ícono
    document.getElementById(elementId).innerHTML = `
        ${city}: ${temperature}°C, ${description}
        <img src="${iconUrl}" alt="${description}" />
      `;
  } catch (error) {
    document.getElementById(elementId).innerHTML = "Error al cargar el clima";
    console.error(error);
  }
}

// Llamamos a la API para obtener los datos del clima y mostrarlos en cada widget
fetchWeatherData("Sierra Grande", "weather-left");
fetchWeatherData("Punta Colorada", "weather-right");
