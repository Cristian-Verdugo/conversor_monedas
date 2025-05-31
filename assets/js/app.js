const select = document.getElementById("monedaSelect");
const input = document.getElementById("clpInput");
const resultado = document.getElementById("resultado");
const ctx = document.getElementById("grafico");

const simbolos = {
    dolar: "$",
    euro: "€",
    bitcoin: "₿",
    uf: "UF"
};

async function obtenerDatos() {
    try {
        const res = await fetch("https://mindicador.cl/api");
        const data = await res.json();
        const monedas = ["dolar", "euro", "bitcoin", "uf"];
        monedas.forEach(mon => {
            if (data[mon]) {
                const option = document.createElement("option");
                option.value = mon;
                option.textContent = data[mon].nombre;
                select.appendChild(option);
            }
        });
    } catch (error) {
        resultado.textContent = "Error al cargar monedas.";
    }
}

async function convertirMoneda() {
    const clp = parseFloat(input.value.replace(/\./g, ""));
    const tipo = select.value;
    if (!clp || !tipo) return;

    try {
        const res = await fetch(`https://mindicador.cl/api/${tipo}`);
        const data = await res.json();
        const valor = data.serie[0].valor;
        const conversion = (clp / valor).toFixed(2);
        resultado.textContent = `Resultado: ${simbolos[tipo]} ${Intl.NumberFormat("es-CL").format(conversion)}`;

        // gráfico
        const labels = data.serie.slice(0, 10).reverse().map(d => d.fecha.slice(0, 10));
        const valores = data.serie.slice(0, 10).reverse().map(d => d.valor);
        renderChart(labels, valores, data.nombre);

    } catch (error) {
        resultado.textContent = "Error en la conversión.";
    }
}

let grafico;

function renderChart(labels, data, nombre) {
    if (grafico) grafico.destroy();
    grafico = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: `Historial últimos 10 días`,
                borderColor: "#ff5c8d",
                data: data
            }]
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    obtenerDatos();
    input.addEventListener("input", () => {
        input.value = input.value
            .replace(/\D/g, "")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    });
});