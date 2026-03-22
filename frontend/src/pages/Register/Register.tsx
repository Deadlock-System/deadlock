import { useEffect, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { createUser, registerWithGoogle } from "../../services/RegisterService";
import type { Seniority } from "../../types/RegisterType";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";

import logo from "../../assets/logo-deadlock-sem-fundo.png";
import "./Register.css";

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
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Erro ao cadastrar usuário";

      alert(message);
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
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Erro ao cadastrar com Google";

      alert(message);
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
                    { label: "STUDENDT", value: "STUDENDT" },
                    { label: "JUNIOR", value: "JUNIOR" },
                    { label: "PLENO", value: "PLENO" },
                    { label: "SENIOR", value: "SENIOR" },
                    { label: "TECH_LEAD", value: "TECH_LEAD" },
                    { label: "C_LEVEL", value: "C_LEVEL" },
                  ]}
                />
              </div>
            </div>

            <button className="registerSubmit" type="submit">
              Cadastrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
