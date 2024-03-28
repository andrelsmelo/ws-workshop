"use client"
import { useEffect, useState } from "react";
import api from "@/utilities/api";

export interface Participante {
    uuid: number;
    name: string;
}

interface SorteioObject {
    participante_id: string,
    participante_name: string,
    premio_uuid: string,
    premio_name: string,
    data: string,
}
export default function Sorteador() {
    const [participantes, setParticipantes] = useState<Participante[] | null>(null);
    const [sorteio, setSorteio] = useState<SorteioObject | null>(null);

    const fetchData = async () => {
        const response: Participante[] = await api.getParticipantesDetails();
        response.length > 0 ? setParticipantes(response) : setParticipantes(null);
    };

    const sortear = async () => {
        try {
            const response: SorteioObject = await api.sortear();
            setSorteio(response);
        } catch (error) {
            console.error("Error sorting:", error);
        }
    }

    const resetSorteio = async () => {
        try {
            await api.resetSorteio();
        } catch (error) {
            console.error("Error resetting sorteio:", error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <section className="flex flex-col items-center justify-center">
                <h1>Lista de Participantes</h1>
                <ul className="overflow-y-scroll px-6 py-4 border rounded-2xl">
                    {participantes && participantes.map((participante, index) => (
                        <li key={index}>{participante.name}</li>
                    ))}
                </ul>
            </section>
            <section>
                <button onClick={sortear} className="bg-green-400 text-gray-700 px-4 py-2 border rounded-2xl">Sortear</button>
                <button onClick={resetSorteio} className="bg-red-400 text-white px-4 py-2 border rounded-2xl">Resetar</button>
            </section>
            {sorteio && (
                <section className="border rounded-2xl gap-y-4 shadow-md p-6">
                    <p className="text-nowrap">Sorteado: <span>{sorteio.participante_id} - {sorteio.participante_name}</span></p>
                    <p className="text-nowrap">Premio: <span>{sorteio.premio_uuid} - {sorteio.premio_name}</span></p>
                    <span className="text-nowrap">Data: {sorteio.data}</span>
                </section>
            )
            }
        </main>
    );
}
