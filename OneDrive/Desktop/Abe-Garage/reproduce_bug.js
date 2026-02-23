
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function reproduce() {
    try {
        console.log("Attempting to login...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'me12033@gmail.com', // The email I found in the DB for ID 2
            password: 'password123'
        });

        const token = loginRes.data.data.token;
        console.log("Login successful. Token acquired.");

        console.log("Attempting to fetch appointment 2...");
        try {
            const apptRes = await axios.get(`${API_URL}/appointments/2`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Success! Appointment data:", JSON.stringify(apptRes.data, null, 2));
        } catch (err) {
            console.error("Failed to fetch appointment 2:");
            if (err.response) {
                console.error("Status:", err.response.status);
                console.error("Data:", JSON.stringify(err.response.data, null, 2));
            } else {
                console.error(err.message);
            }
        }
    } catch (err) {
        console.error("Login failed:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

reproduce();
