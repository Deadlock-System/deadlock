import { useEffect, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { createUser, registerWithGoogle } from "../../services/RegisterService";
import type { Seniority } from "../../types/RegisterType";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";

import logo from "../../assets/logo-deadlock-sem-fundo.png";
import "./Register.css";
import { getErrorMessage } from "../../utils/ErrorMessage";
import { env } from "../../config/Env";

type FormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  seniorityId: Seniority | "";
};

export default function Register() {
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    seniorityId: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormMessage(null);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[e.target.name as keyof FormState];
      return next;
    });
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getErrorText = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = (error as { message: unknown }).message;
      if (Array.isArray(message)) {
        return message.map(String).join("\n");
      }
    }
    return getErrorMessage(error, fallback);
  };

  const isStrongPassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

  const validateForm = (): Partial<Record<keyof FormState, string>> => {
    const errors: Partial<Record<keyof FormState, string>> = {};

    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;
    const seniorityId = form.seniorityId;

    if (!username) errors.username = "O nome de usuário não pode estar vazio";

    if (!email) {
      errors.email = "Informe seu e-mail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "E-mail inválido";
    }

    if (!password) {
      errors.password = "A senha não pode estar vazia";
    } else if (!isStrongPassword(password)) {
      errors.password =
        "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "A confirmação de senha não pode estar vazia";
    } else if (!isStrongPassword(confirmPassword)) {
      errors.confirmPassword =
        "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial";
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem";
    }

    if (seniorityId === "") {
      errors.seniorityId = "Selecione sua senioridade";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormMessage({ type: "error", text: "Corrija os campos destacados" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        seniorityId: form.seniorityId as Seniority,
      });

      setFormMessage({ type: "success", text: "Usuário cadastrado com sucesso!" });
      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        seniorityId: "",
      });
      setFieldErrors({});
    } catch (error: unknown) {
      const text = getErrorText(error, "Erro ao cadastrar usuário");
      setFormMessage({ type: "error", text });
      const normalized = text.toLowerCase();
      if (normalized.includes("e-mail inválido") || normalized.includes("e-mail invalido")) {
        setFieldErrors((prev) => ({ ...prev, email: "E-mail inválido" }));
      }
      if (normalized.includes("senha deve conter") || normalized.includes("senha deve conter pelo menos")) {
        setFieldErrors((prev) => ({
          ...prev,
          password:
            "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial",
        }));
      }
      if (normalized.includes("confirma") && normalized.includes("senha")) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: "As senhas não coincidem",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async (
    credentialResponse: CredentialResponse
  ) => {
    setIsSubmitting(true);
    try {
      const credential = credentialResponse.credential;
      if (!credential) {
        throw new Error("Resposta do Google inválida");
      }

      const result = await registerWithGoogle(credential);
      if (result.isNewUser === false) {
        setFormMessage({ type: "error", text: "Essa conta já foi cadastrada!" });
        return;
      }
      setFormMessage({ type: "success", text: "Usuário cadastrado com sucesso!" });
    } catch (error: unknown) {
      setFormMessage({
        type: "error",
        text: getErrorText(error, "Erro ao cadastrar com Google"),
      });
    } finally {
      setIsSubmitting(false);
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
        setFormMessage({ type: "error", text: "Essa conta já foi cadastrada!" });
      } else {
        setFormMessage({ type: "success", text: "Usuário cadastrado com sucesso!" });
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

            {formMessage ? (
              <div
                className={
                  formMessage.type === "success"
                    ? "registerMessage registerMessageSuccess"
                    : "registerMessage registerMessageError"
                }
                role={formMessage.type === "error" ? "alert" : "status"}
              >
                {formMessage.text}
              </div>
            ) : null}

            <div className="registerGrid">
              <div className="registerField">
                <Input
                  label="Usuário"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="USUARIO"
                />
                {fieldErrors.username ? (
                  <p className="registerFieldError">{fieldErrors.username}</p>
                ) : null}
              </div>

              <div className="registerField">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="EMAIL"
                />
                {fieldErrors.email ? (
                  <p className="registerFieldError">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div
                className="registerField"
                onFocus={() => setShowPasswordHint(true)}
                onBlur={() => setShowPasswordHint(false)}
              >
                <Input
                  label="Senha"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="SENHA"
                />
                {showPasswordHint ? (
                  <div className="registerPasswordHint" role="note">
                    <div className="registerPasswordHintTitle">
                      A senha deve conter:
                    </div>
                    <ul className="registerPasswordHintList">
                      <li>Mínimo de 8 caracteres</li>
                      <li>Pelo menos 1 letra maiúscula</li>
                      <li>Pelo menos 1 letra minúscula</li>
                      <li>Pelo menos 1 número</li>
                      <li>Pelo menos 1 caractere especial</li>
                    </ul>
                  </div>
                ) : null}
                {fieldErrors.password ? (
                  <p className="registerFieldError">{fieldErrors.password}</p>
                ) : null}
              </div>

              <div className="registerField">
                <Input
                  label="Confirmar Senha"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="CONFIRMAR SENHA"
                />
                {fieldErrors.confirmPassword ? (
                  <p className="registerFieldError">
                    {fieldErrors.confirmPassword}
                  </p>
                ) : null}
              </div>

              <div className="registerGridFull">
                <div className="registerField">
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
                  {fieldErrors.seniorityId ? (
                    <p className="registerFieldError">{fieldErrors.seniorityId}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <button className="registerSubmit" type="submit" disabled={isSubmitting}>
              Cadastrar
            </button>

            <div className="registerOauthRow">
              {googleEnabled ? (
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    void handleGoogleRegister(credentialResponse);
                  }}
                  onError={() => setFormMessage({ type: "error", text: "Login com Google falhou" })}
                  text="signup_with"
                  shape="pill"
                />
              ) : (
                <button
                  type="button"
                  className="registerOauthFallback"
                  onClick={() => {
                    setFormMessage({
                      type: "error",
                      text: "Configure VITE_GOOGLE_CLIENT_ID para habilitar o Google",
                    });
                  }}
                  disabled={isSubmitting}
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

            <a className="registerLoginLink" href="/login">
              Já tem conta? Clique aqui!
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
