// Variables globales
let prices = [];
let total = 0;

document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const priceInput = document.getElementById("priceInput");
    const confirmPrice = document.getElementById("confirmPrice");
    const totalText = document.getElementById("totalText");
    const priceList = document.getElementById("priceList");
    const imagePreview = document.getElementById("imagePreview");
    const warningText = document.getElementById("warningText");

    // Escanear la imagen y detectar el precio
    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Mostrar vista previa de la imagen
        const reader = new FileReader();
        reader.onload = async () => {
            const image = new Image();
            image.src = reader.result;

            // Mostrar la imagen en el contenedor de vista previa
            imagePreview.innerHTML = `<img src="${reader.result}" alt="Vista previa de la imagen">`;

            image.onload = async () => {
                const { createWorker } = Tesseract;
                const worker = await createWorker();
                await worker.loadLanguage("eng");
                await worker.initialize("eng");
                const { data: { text } } = await worker.recognize(image);
                await worker.terminate();

                // Extraer el precio del texto detectado
                const priceMatch = text.match(/\d+[.,]?\d*/g);
                if (priceMatch) {
                    const price = parseFloat(priceMatch[0].replace(",", "."));
                    priceInput.value = price.toFixed(2); // Asignar el valor al campo de entrada
                    warningText.innerText = ""; // Limpiar mensaje de advertencia
                } else {
                    priceInput.value = ""; // Limpiar si no se detecta un precio
                    warningText.innerText = "No se detectó un precio válido. Corrígelo manualmente.";
                }
            };
        };
        reader.readAsDataURL(file);
    });

    // Confirmar el precio y agregarlo a la lista
    confirmPrice.addEventListener("click", () => {
        const price = parseFloat(priceInput.value);
        if (!isNaN(price)) {
            prices.push(price); // Agregar el precio al array
            total += price; // Actualizar el total
            updateList(); // Actualizar la lista y el total en la interfaz
            priceInput.value = ""; // Limpiar el campo de entrada
            warningText.innerText = ""; // Limpiar mensaje de advertencia
        } else {
            warningText.innerText = "Por favor, ingresa un precio válido.";
        }
    });
});

// Función global para eliminar un elemento
function removeItem(index) {
    total -= prices[index]; // Restar el precio eliminado del total
    prices.splice(index, 1); // Eliminar el precio del array
    updateList(); // Actualizar la lista y el total en la interfaz
}

// Función global para actualizar la lista y el total
function updateList() {
    const priceList = document.getElementById("priceList");
    const totalText = document.getElementById("totalText");

    // Limpiar la lista actual
    priceList.innerHTML = "";

    // Agregar cada precio a la lista
    prices.forEach((price, index) => {
        const li = document.createElement("li");
        li.innerHTML = `$${price.toFixed(2)} <button onclick="removeItem(${index})">X</button>`;
        priceList.appendChild(li);
    });

    // Actualizar el total acumulado
    totalText.innerText = `Total acumulado: $${total.toFixed(2)}`;
}