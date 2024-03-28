"use client"

import api from "@/utilities/api";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const userNameRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [participantes, setParticipantes] = useState<number | null>(null);
  const [sorteado, setSorteado] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const [userUuid, setUserUuid] = useState<string | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8085/ws");

    ws.current.onmessage = (message) => {
      const parsedMessage = JSON.parse(message.data);
      if (parsedMessage.action === 'sorteio') {
        if (parsedMessage.numeroSorteado === userUuid) {
          setSorteado(true);
        }
      }
      if (parsedMessage.action === 'participantes') {
        setParticipantes(parsedMessage.participantes);
      }
    };
  }, [userUuid]);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = userNameRef.current?.value;
    if (!user) return;
    const response = await api.login(user);
    if (!response) return;
    setLoggedIn(true);
    setUser(userNameRef.current?.value);
    setUserUuid(response.uuid);
    sessionStorage.setItem("user", response.uuid);

    if (ws.current) {
      ws.current.send(JSON.stringify({ action: "login", uuid: response.uuid }));
    }
  };

  const logout = async () => {
    if (!userUuid) return;
    await api.logout(userUuid);
    if (ws.current) {
      ws.current.send(JSON.stringify({ action: "logout", uuid: userUuid }));
    }
    setLoggedIn(false);
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 bg-fuchsia-200 ${sorteado && "bg-green-300"}`}>

      {!loggedIn && (
        <section className="bg-white border rounded-2xl">
          <form
            className="flex flex-col items-center gap-2 border shadow-lg p-6 rounded-xl"
            onSubmit={login}
          >
            <h1>Insira seu nome</h1>
            <input type="text" ref={userNameRef} className="border rounded-2xl p-2" />
            <button type="submit" className="bg-green-400 text-gray-700 px-4 py-2 border rounded-2xl">
              Entrar
            </button>
          </form>
        </section>
      )}

      {loggedIn && (
        <section className="bg-white flex flex-col items-center justify-center gap-2 border shadow-lg p-4 rounded-xl">
          {sorteado && (
            <div className="items-center justify-center">
              <h1 className="font-bold">Parabéns, você foi sorteado!</h1>
            </div>
          )}
          <div className="flex flex-col mx-4">
            <h1>Olá,
              <span className="text-nowrap">Seja bem-vindo{user && ` ${user}`}!</span></h1>
            <span className="text-nowrap">Seu ID é {userUuid && ` ${userUuid}`}!</span>
          </div>
          
             {
              participantes === -1 ? <span className="text-bold text-red-600">Sorteio resetado, favor aperte sair e insira seu nome novamente</span> :
              <p className="text-nowrap">Número de participantes: <span className="italic font-bold text-green-400">{participantes}</span> </p>
             }
         
          <button onClick={logout} className="bg-red-400 text-white px-4 py-2 border rounded-2xl">
            Sair
          </button>
        </section>
      )}
    </main>
  );
}
