import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Zapisujemy dane potrzebne do sesji i Avatara
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_name", data.first_name);
        localStorage.setItem("user_last_name", data.last_name); // Ważne dla inicjałów w kółku
        
        // Pobieramy rolę
        const rawRole = data.role || "klient";
        const userRole = rawRole.trim().toLowerCase();
        
        localStorage.setItem("user_role", data.role);
        
        if (userRole === "właściciel" || userRole === "owner") {
             localStorage.setItem("owner_username", email);
        }

        // 2. PRZEKIEROWANIE (POPRAWIONE)
        // Niezależnie czy to Klient, czy Właściciel -> idziemy do restauracji
        // Właściciel ma przycisk "Panel" w Navbarze, jeśli będzie chciał tam wejść.
        navigate("/restaurants");
        
        window.location.reload(); 

      } else {
        setError(data.detail || "Błędny email lub hasło");
      }
    } catch (error) {
      console.error(error);
      setError("Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
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