import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import logo from "../../assets/logo_deadlock_white.png";
import "./Login.css";
import {
  getGithubLoginUrl,
  getGoogleLoginUrl,
  useSignIn,
} from "../../services/LoginService";

type FormState = {
  email: string;
  password: string;
};

function getLoginErrorText(error: unknown, fallback: string) {
  const code = typeof (error as { code?: unknown } | null)?.code === "string" ? (error as { code: string }).code : null;
  switch (code) {
    case "INVALID_CREDENTIALS":
      return "Usuário não cadastrado ou senha incorreta!";
    case "INVALID_RESPONSE":
      return "Resposta inválida do servidor";
    default:
      return fallback;
  }
}

export default function Login() {
  return <LoginContent />;
}

function LoginContent() {
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const signInMutation = useSignIn();
  const isSubmitting = signInMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setFormMessage(null);
      await signInMutation.mutateAsync({
        email: form.email.trim(),
        password: form.password,
      });

      setFormMessage({ type: "success", text: "Login realizado com sucesso!" });
      queryClient.removeQueries({ queryKey: ["me"] });
      navigate("/profile", { replace: true });
    } catch (error: unknown) {
      setFormMessage({
        type: "error",
        text: getLoginErrorText(error, "Erro ao fazer login"),
      });
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

            {formMessage ? (
              <div
                className={
                  formMessage.type === "success"
                    ? "loginMessage loginMessageSuccess"
                    : "loginMessage loginMessageError"
                }
                role={formMessage.type === "error" ? "alert" : "status"}
              >
                {formMessage.text}
              </div>
            ) : null}

            <div className="loginGrid">
              <Input
                label="Usuário ou e-mail"
                name="email"
                type="text"
                value={form.email}
                onChange={handleChange}
                placeholder="EMAIL"
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
                <a className="loginOauthGithub" href={getGoogleLoginUrl()}>
                  <span className="loginOauthGithubIcon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.6 12.273c0-.709-.064-1.39-.182-2.045H12v3.869h5.386a4.605 4.605 0 0 1-1.999 3.02v2.51h3.232c1.89-1.741 2.98-4.305 2.98-7.354Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 22c2.7 0 4.96-.895 6.613-2.423l-3.232-2.51c-.895.6-2.04.955-3.381.955-2.605 0-4.81-1.759-5.597-4.123H3.062v2.591A9.996 9.996 0 0 0 12 22Z"
                        fill="#34A853"
                      />
                      <path
                        d="M6.403 13.9A5.99 5.99 0 0 1 6.09 12c0-.66.114-1.3.313-1.9V7.51H3.062A9.996 9.996 0 0 0 2 12c0 1.614.386 3.14 1.062 4.49l3.341-2.59Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.978c1.468 0 2.785.504 3.822 1.495l2.867-2.868C16.955 2.99 14.696 2 12 2A9.996 9.996 0 0 0 3.062 7.51l3.341 2.59C7.19 7.737 9.395 5.978 12 5.978Z"
                        fill="#EA4335"
                      />
                    </svg>
                  </span>
                  <span>Sign in with Google</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="loginOauthFallback"
                  onClick={() => {
                    setFormMessage({
                      type: "error",
                      text: "Configure VITE_GOOGLE_CLIENT_ID para habilitar o Google",
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Sign in with Google
                </button>
              )}

              <a className="loginOauthGithub" href={getGithubLoginUrl()}>
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
