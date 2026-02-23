
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function reproduceCleanly() {
    try {
        const signupData = {
            email: 'testuser' + Date.now() + '@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            phone: '1234567890'
        };

        console.log("Registering new user...");
        const regRes = await axios.post(`${API_URL}/auth/register`, signupData);
        const user = regRes.data.data.user;
        const token = regRes.data.data.token;
        console.log(`New user created with ID: ${user.id}`);

        console.log("Creating appointment for new user...");
        const apptData = {
            serviceId: 1,
            appointmentDate: new Date(Date.now() + 86400000).toISOString(),
            appointmentTime: '10:00',
            carBrand: 'Toyota',
            carModel: 'Corolla',
            carYear: 2022,
            problemDescription: 'Test reproduction issue with access denied'
        };

        const createRes = await axios.post(`${API_URL}/appointments`, apptData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const appointmentId = createRes.data.data.appointment.id;
        console.log(`Appointment created with ID: ${appointmentId}`);

        console.log(`Fetching appointment ${appointmentId} to test access...`);
        try {
            const getRes = await axios.get(`${API_URL}/appointments/${appointmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("SUCCESS! Access granted.");
            console.log("Data match check:", String(getRes.data.data.appointment.customer_id) === String(user.id));
        } catch (err) {
            console.error("FAILURE! Access denied.");
            if (err.response) {
                console.error("Status:", err.response.status);
                console.error("Data:", JSON.stringify(err.response.data, null, 2));
            }
        }
    } catch (err) {
        console.error("Error during reproduction:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

reproduceCleanly();
