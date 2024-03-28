const API_URL = "http://localhost:8085";

const api = {
    async login(name: string | undefined) {
        const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
        });
    
        if (!response.ok) {
        throw new Error("Failed to login");
        }
    
        return response.json();
    },
    
    async logout(uuid: string | null) {
        const response = await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuid: uuid}),
        });
    
        if (!response.ok) {
        throw new Error("Failed to logout");
        }
    },
    
    async getParticipantes() {
        const response = await fetch(`${API_URL}/api/participantes`);
    
        if (!response.ok) {
        throw new Error("Failed to get participantes");
        }
    
        return response.json();
    },

    async sortear() {
        const response = await fetch(`${API_URL}/api/sortear`);
    
        if (!response.ok) {
        throw new Error("Failed to sortear");
        }
    
        return response.json();
    },

    async resetSorteio() {
        const response = await fetch(`${API_URL}/api/reset-sorteio`);
    
        if (!response.ok) {
        throw new Error("Failed to reset sorteio");
        }
    
        return response.json();
    },
    async getParticipantesDetails() {
        const response = await fetch(`${API_URL}/api/participantes-details`);
    
        if (!response.ok) {
        throw new Error("Failed to get participantes");
        }
    
        return response.json();
    },
};

export default api;