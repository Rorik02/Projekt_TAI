import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    prefix: "+48",
    password: "",
    confirm_password: "",
    role: "Klient",
    street: "",
    city: "",
    postal_code: "",
    terms_accepted: true,
    marketing_consent: false,
    data_processing_consent: true,
  });

  const [emailValid, setEmailValid] = useState(null);
  const [phoneValid, setPhoneValid] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [responseMessage, setResponseMessage] = useState(null);

  // REGEX-y
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,}$/;

  function handleChange(e) {
  const { name, value } = e.target;

  // najpierw aktualizujemy stan lokalnie (nie w React!)
  const updatedForm = { ...form, [name]: value };

  setForm(updatedForm);

  // EMAIL
  if (name === "email") {
    setEmailValid(emailRegex.test(value));
  }

  // TELEFON
  if (name === "phone_number") {
    setPhoneValid(value.length === 9);
  }

  // HASŁO – zawsze sprawdzamy na podstawie updatedForm
  if (name === "password" || name === "confirm_password") {
    const pass = updatedForm.password;
    const confirm = updatedForm.confirm_password;

    if (!passwordRegex.test(pass)) {
      setPasswordError("Hasło nie spełnia wymagań.");
    } else if (confirm && pass !== confirm) {
      setPasswordError("Hasła nie są takie same.");
    } else {
      setPasswordError(null);
    }
  }
}

  async function handleSubmit(e) {
    e.preventDefault();

    if (!emailValid) {
      setResponseMessage("Niepoprawny adres email.");
      return;
    }

    if (!phoneValid) {
      setResponseMessage("Numer telefonu musi mieć 9 cyfr.");
      return;
    }

    if (passwordError) {
      setResponseMessage(passwordError);
      return;
    }

    const payload = {
      ...form,
      phone_number: `${form.prefix}${form.phone_number}`,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.detail === "Konto o podanym email już istnieje") {
          setResponseMessage("Konto o podanym email już istnieje");
        } else {
          setResponseMessage("Nie udało się utworzyć konta.");
        }
        return;
      }

      setResponseMessage(null);
      navigate("/app");

    } catch (error) {
      setResponseMessage("Błąd połączenia z serwerem.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-lg"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Rejestracja</h1>

        <div className="grid gap-4">

          <input
            className="p-3 rounded bg-gray-700"
            type="text"
            name="first_name"
            placeholder="Imię"
            onChange={handleChange}
            required
          />

          <input
            className="p-3 rounded bg-gray-700"
            type="text"
            name="last_name"
            placeholder="Nazwisko"
            onChange={handleChange}
            required
          />

          {/* EMAIL */}
          <div>
            <input
              className="p-3 rounded bg-gray-700 w-full"
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            {emailValid === false && (
              <p className="text-red-400 text-sm mt-1">Niepoprawny adres email.</p>
            )}
            {emailValid === true && (
              <p className="text-green-400 text-sm mt-1">Email poprawny.</p>
            )}
          </div>

          {/* TELEFON + PREFIX */}
          <div className="flex gap-2">
            <select
              name="prefix"
              className="p-3 rounded bg-gray-700 w-24"
              onChange={handleChange}
            >
              <option value="+48">+48 PL</option>
              <option value="+49">+49 GER</option>
              <option value="+44">+44 UK</option>
              <option value="+1">+1 USA</option>
            </select>

            <div className="w-full">
              <input
                className="p-3 rounded bg-gray-700 w-full"
                type="text"
                name="phone_number"
                placeholder="Numer telefonu"
                onChange={handleChange}
                required
              />
              {phoneValid === false && (
                <p className="text-red-400 text-sm mt-1">Numer telefonu musi mieć 9 cyfr.</p>
              )}
              {phoneValid === true && (
                <p className="text-green-400 text-sm mt-1">Numer poprawny.</p>
              )}
            </div>
          </div>

          {/* HASŁO */}
          <div className="relative">
            <input
              className="p-3 rounded bg-gray-700 w-full"
              type="password"
              name="password"
              placeholder="Hasło"
              onChange={handleChange}
              required
            />

            {/* TOOLTIP */}
            <div className="absolute right-2 top-3 group cursor-pointer">
              <span className="bg-gray-600 px-2 py-1 rounded text-sm font-bold">i</span>
              <div className="hidden group-hover:block absolute right-0 mt-2 w-64 bg-gray-700 text-white p-2 rounded shadow-lg text-sm">
                <ul className="list-disc ml-4">
                  <li>Min. 9 znaków</li>
                  <li>Jedna duża litera</li>
                  <li>Jedna cyfra</li>
                  <li>Jeden znak specjalny</li>
                </ul>
              </div>
            </div>
          </div>

          {/* POTWIERDZENIE HASŁA */}
          <input
            className="p-3 rounded bg-gray-700"
            type="password"
            name="confirm_password"
            placeholder="Potwierdź hasło"
            onChange={handleChange}
            required
          />

          {/* BŁĄD HASEŁ */}
          {passwordError && (
            <p className="text-red-400 text-sm -mt-2">{passwordError}</p>
          )}

          <input
            className="p-3 rounded bg-gray-700"
            type="text"
            name="street"
            placeholder="Ulica"
            onChange={handleChange}
            required
          />

          <input
            className="p-3 rounded bg-gray-700"
            type="text"
            name="city"
            placeholder="Miasto"
            onChange={handleChange}
            required
          />

          <input
            className="p-3 rounded bg-gray-700"
            type="text"
            name="postal_code"
            placeholder="Kod pocztowy"
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold shadow"
        >
          Utwórz konto
        </button>

        {responseMessage && (
          <p className="text-center mt-4 text-red-400 font-semibold">
            {responseMessage}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
        >
          Powrót
        </button>
      </form>
    </div>
  );
}
