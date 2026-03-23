import { useEffect, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { createUser, registerWithGoogle } from "../../services/RegisterService";
import type { Seniority } from "../../types/RegisterType";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";

import logo from "../../assets/logo-deadlock-sem-fundo.png";
import "./Register.css";
import { getErrorMessage } from "../../utils/errorMessage";
import { env } from "../../config/env";

type FormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  seniorityId: Seniority | "";
};

export default function Register() {
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    seniorityId: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUser({
        email: form.email,
        username: form.username,
        password: form.password,
        confirmPassword: form.confirmPassword,
        seniorityId: form.seniorityId as Seniority,
      });

      alert("Usuário cadastrado com sucesso!");
    } catch (error: unknown) {
        alert(getErrorMessage(error, "Erro ao cadastrar usuário"));
    }
  };

  const handleGoogleRegister = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      const credential = credentialResponse.credential;
      if (!credential) {
        throw new Error("Resposta do Google inválida");
      }

      const result = await registerWithGoogle(credential);
      if (result.isNewUser === false) {
        alert("Essa conta já foi cadastrada!");
        return;
      }
      alert("Usuário cadastrado com sucesso!");
    } catch (error: unknown) {
        alert(getErrorMessage(error, "Erro ao cadastrar com Google"));
    }
  };

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const provider = params.get("provider");
    const isNewUser = params.get("isNewUser");
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (provider === "github" && accessToken && refreshToken) {
      if (isNewUser === "false") {
        alert("Essa conta já foi cadastrada!");
      } else {
        alert("Usuário cadastrado com sucesso!");
      }
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);

  return (
    <div className="registerPage">
      <div className="registerCard">
        <div className="registerAside">
          <img className="registerLogo" src={logo} alt="Deadlock" />
        </div>
        <div className="registerContent">
          <form className="registerForm" onSubmit={handleSubmit}>
            <h2 className="registerTitle">Crie sua conta</h2>

            <div className="registerGrid">
              <Input
                label="Usuário"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="USUARIO"
              />

              <Input
                label="Email"
                name="email"
                type="email"
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

              <Input
                label="Confirmar Senha"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="CONFIRMAR SENHA"
              />

              <div className="registerGridFull">
                <Select
                  label="Senioridade"
                  name="seniorityId"
                  value={form.seniorityId}
                  onChange={handleChange}
                  options={[
                    { label: "Estudante", value: "STUDENDT" },
                    { label: "Junior", value: "JUNIOR" },
                    { label: "Pleno", value: "PLENO" },
                    { label: "Senior", value: "SENIOR" },
                    { label: "Tech lead", value: "TECH_LEAD" },
                    { label: "C Level", value: "C_LEVEL" },
                  ]}
                />
              </div>
            </div>

            <button className="registerSubmit" type="submit">
              Cadastrar
            </button>

            <div className="registerOauthRow">
              {googleEnabled ? (
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    void handleGoogleRegister(credentialResponse);
                  }}
                  onError={() => {
                    alert("Login com Google falhou");
                  }}
                  text="signup_with"
                  shape="pill"
                />
              ) : (
                <button
                  type="button"
                  className="registerOauthFallback"
                  onClick={() => {
                    alert("Configure VITE_GOOGLE_CLIENT_ID para habilitar o Google");
                  }}
                >
                  Sign up with Google
                </button>
              )}

              <a className="registerOauthGithub" href={`${env.apiURL}/auth/github`}>
                <span className="registerOauthGithubIcon" aria-hidden="true">
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
          </form>
        </div>
      </div>
    </div>
  );
}
