// =========================
// FORMULARIO DE CONTACTO
// =========================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    const contactStatus = document.getElementById("contactStatus");
    const contactSubmit = document.getElementById("contactSubmit");

    const showStatus = (message, isError) => {
        if (!contactStatus) return;
        contactStatus.textContent = message;
        contactStatus.classList.toggle("text-danger", isError);
        contactStatus.classList.toggle("text-success", !isError);
    };

    contactForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (!contactForm.checkValidity()) {
            contactForm.classList.add("was-validated");
            return;
        }

        const payload = {
            name: document.getElementById("contactName").value.trim(),
            email: document.getElementById("contactEmail").value.trim(),
            subject: document.getElementById("contactSubject").value.trim(),
            message: document.getElementById("contactMessage").value.trim(),
        };

        contactSubmit.disabled = true;
        showStatus("Enviando mensaje...", false);

        try {

            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("request-failed");
            }

            showStatus("¡Gracias! Tu mensaje fue enviado correctamente.", false);
            contactForm.reset();
            contactForm.classList.remove("was-validated");

        } catch (err) {

            showStatus("No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.", true);

        } finally {

            contactSubmit.disabled = false;

        }

    });

}
