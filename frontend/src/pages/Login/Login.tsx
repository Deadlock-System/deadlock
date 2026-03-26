import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import Input from "../../components/Input/Input";
import logo from "../../assets/logo-deadlock-sem-fundo.png";
import "./Login.css";
import { getErrorMessage } from "../../utils/ErrorMessage";
import { env } from "../../config/Env";
import { loginWithGoogle, signIn } from "../../services/LoginService";

type FormState = {
  email: string;
  password: string;
};

export default function Login() {
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = (): string | null => {
    const email = form.email.trim();
    const password = form.password;

    if (!email) return "Informe seu e-mail";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido";
    if (!password) return "Informe sua senha";
    if (password.length < 6) return "A senha deve ter no mínimo 6 caracteres";

    return null;
  };

  const saveTokens = (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn({
        email: form.email.trim(),
        password: form.password,
      });
      saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      alert("Login realizado com sucesso!");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Erro ao fazer login");
      const normalized = message.toLowerCase();
      if (normalized.includes("credenciais inválidas") || normalized.includes("credenciais invalidas")) {
        alert("Usuário não cadastrado ou senha incorreta!");
        return;
      }
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    setIsSubmitting(true);
    try {
      const credential = credentialResponse.credential;
      if (!credential) {
        throw new Error("Resposta do Google inválida");
      }
      const result = await loginWithGoogle(credential);
      if (result.isNewUser === true) {
        alert("Usuário não cadastrado! Faça o cadastro antes de entrar.");
        return;
      }
      saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      alert("Login realizado com sucesso!");
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Erro ao entrar com Google"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginAside">
          <img className="loginLogo" src={logo} alt="Deadlock" />
        </div>
        <div className="loginContent">
          <form className="loginForm" onSubmit={(e) => void handleSubmit(e)}>
            <h2 className="loginTitle">Entre na sua conta</h2>

            <div className="loginGrid">
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="USUARIO/EMAIL"
              />

              <Input
                label="Senha"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="SENHA"
              />
            </div>

            <button className="loginSubmit" type="submit" disabled={isSubmitting}>
              Entrar
            </button>

            <div className="loginOauthRow">
              {googleEnabled ? (
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    void handleGoogleLogin(credentialResponse);
                  }}
                  onError={() => {
                    alert("Login com Google falhou");
                  }}
                  text="signin_with"
                  shape="pill"
                />
              ) : (
                <button
                  type="button"
                  className="loginOauthFallback"
                  onClick={() => {
                    alert("Configure VITE_GOOGLE_CLIENT_ID para habilitar o Google");
                  }}
                  disabled={isSubmitting}
                >
                  Sign in with Google
                </button>
              )}

              <a className="loginOauthGithub" href={`${env.apiURL}/auth/github`}>
                <span className="loginOauthGithubIcon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C6.477 2 2 6.58 2 12.253c0 4.532 2.865 8.377 6.839 9.735.5.095.682-.22.682-.49 0-.242-.009-.885-.014-1.737-2.782.616-3.369-1.37-3.369-1.37-.454-1.18-1.11-1.494-1.11-1.494-.908-.636.069-.623.069-.623 1.004.072 1.532 1.056 1.532 1.056.892 1.566 2.341 1.114 2.91.852.091-.666.35-1.115.636-1.372-2.22-.259-4.555-1.139-4.555-5.068 0-1.119.39-2.034 1.029-2.75-.103-.259-.446-1.301.098-2.713 0 0 .84-.276 2.75 1.051A9.36 9.36 0 0 1 12 7.07c.85.004 1.705.118 2.505.347 1.909-1.327 2.748-1.051 2.748-1.051.546 1.412.203 2.454.1 2.713.64.716 1.028 1.631 1.028 2.75 0 3.939-2.338 4.806-4.566 5.06.359.318.679.946.679 1.907 0 1.377-.013 2.487-.013 2.825 0 .272.18.59.688.489C19.138 20.626 22 16.78 22 12.253 22 6.58 17.523 2 12 2Z" />
                  </svg>
                </span>
                <span>Sign up with GitHub</span>
              </a>
            </div>

            <a className="loginRegisterLink" href="/register">
              Não tem conta ainda? Se inscreva aqui!
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
