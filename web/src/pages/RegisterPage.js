// src/pages/RegisterPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    role: "Klient",
    street: "",
    city: "",
    postal_code: "",
    terms_accepted: true,
    marketing_consent: false,
    data_processing_consent: true,
  });

  const [responseMessage, setResponseMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;

    // Walidacja hasła
    if (name === "password") {
      const valid =
        value.length >= 9 &&
        /[A-Z]/.test(value) &&
        /[0-9]/.test(value) &&
        /[^A-Za-z0-9]/.test(value);

      if (!valid) {
        setPasswordError(
          "Hasło nie spełnia wymagań. Wymagana jest duża litera, cyfra i znak specjalny."
        );
      } else {
        setPasswordError(null);
      }
    }

    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordError) {
      setResponseMessage("Błąd: Hasło nie spełnia wymagań.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();

        if (err.detail && err.detail.includes("Konto o podanym email już istnieje")) {
          setResponseMessage("Błąd: Konto o podanym email już istnieje");
        } else {
          setResponseMessage("Błąd: Nie udało się utworzyć konta.");
        }
        return;
      }

      setResponseMessage("Konto zostało utworzone pomyślnie!");

      // przekierowanie po 2 sekundach
      setTimeout(() => navigate("/app"), 2000);

    } catch (error) {
      setResponseMessage("Błąd: Brak połączenia z serwerem.");
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 flex items-center justify-center px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Rejestracja</h1>

        <div className="grid gap-4">

          {/* Imię */}
          <input
            className="p-2 rounded bg-white dark:bg-gray-700"
            type="text"
            name="first_name"
            placeholder="Imię"
            onChange={handleChange}
            required
          />

          {/* Nazwisko */}
          <input
            className="p-2 rounded bg-white dark:bg-gray-700"
            type="text"
            name="last_name"
            placeholder="Nazwisko"
            onChange={handleChange}
            required
          />

          {/* Email */}
          <input
            className="p-2 rounded bg-white dark:bg-gray-700"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          {/* Telefon */}
          <input
            className="p-2 rounded bg-white dark:bg-gray-700"
            type="text"
            name="phone_number"
            placeholder="Numer telefonu"
            onChange={handleChange}
            required
          />

          {/* Hasło + ikonka */}
          <div className="relative">
            <input
              className="p-2 rounded w-full bg-white dark:bg-gray-700"
              type="password"
              name="password"
              placeholder="Hasło"
              onChange={handleChange}
              required
            />

            {/* Kwadrat z "i" */}
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="absolute right-2 top-2 w-6 h-6 flex items-center justify-center bg-gray-500 text-white rounded cursor-pointer"
            >
              i
            </button>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 text-white text-sm p-3 rounded shadow-lg z-10">
                <ul className="list-disc ml-4 space-y-1">
                  <li>Przynajmniej 9 znaków</li>
                  <li>Jedna duża litera</li>
                  <li>Jedna cyfra</li>
                  <li>Jeden znak specjalny</li>
                </ul>
              </div>
            )}
          </div>

          {/* BŁĄD POD HASŁEM */}
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}

          {/* Ulica */}
          <input
            className="p-2 rounded bg-white dark:bg-gray-700"
            type="text"
            name="street"
            placeholder="Ulica"
            onChange={handleChange}
            required
          />

          {/* Miasto */}
          <input
            className="p-2 rounded bg-white dark:bg-gray-700"
            type="text"
            name="city"
            placeholder="Miasto"
            onChange={handleChange}
            required
          />

          {/* Kod pocztowy */}
          <input
            className="p-2 rounded bg-white dark:bg-gray-700"
            type="text"
            name="postal_code"
            placeholder="Kod pocztowy"
            onChange={handleChange}
            required
          />
        </div>

        {/* Przycisk */}
        <button
          type="submit"
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold shadow"
        >
          Utwórz konto
        </button>

        {/* Komunikat pod formularzem */}
        {responseMessage && (
          <p className={`text-center mt-4 font-semibold ${
            responseMessage.includes("Błąd") ? "text-red-500" : "text-green-500"
          }`}>
            {responseMessage}
          </p>
        )}

        {/* Przycisk powrotu */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold shadow"
        >
          Powrót
        </button>
      </form>
    </div>
  );
}
