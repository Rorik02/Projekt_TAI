// src/pages/LoginPage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // dla przekierowania po zalogowaniu

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Przechowuje wiadomość o błędzie
  const [success, setSuccess] = useState(""); // Przechowuje sukces

  const navigate = useNavigate(); // Hook do przekierowania po udanym logowaniu

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Wysyłamy dane do backendu
    try {
      const response = await fetch("http://127.0.0.1:8000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Jeśli logowanie jest udane, przekierowujemy do aplikacji
        setSuccess("Zalogowano pomyślnie!");
        setTimeout(() => navigate("/restaurants"), 1000); // Przekierowanie po 1 sekundzie
      } else {
        // Jeśli logowanie nieudane, pokazujemy błąd
        setError(data.detail || "Błąd logowania");
      }
    } catch (error) {
      setError("Błąd połączenia z serwerem");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white flex justify-center items-center">
      <div className="w-96 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center mb-6">Zaloguj się</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-mail
            </label>
            <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-2 border border-gray-300 rounded-lg text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hasło
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mt-2 border border-gray-300 rounded-lg text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}

          {success && (
            <div className="text-green-600 text-sm mb-4">{success}</div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            Zaloguj się
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>
            Nie masz konta?{" "}
            <a href="/register" className="text-purple-600 hover:underline">
              Zarejestruj się
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
