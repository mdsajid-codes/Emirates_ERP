import axios from 'axios';
import fs from 'fs';

async function test() {
    try {
        const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
            username: 'sajid@star.in',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log("Got token:", token ? "yes" : "no");
        
        const res = await axios.get('http://localhost:8080/api/accounts/reports/trial-balance/export/excel', {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'arraybuffer'
        });
        fs.writeFileSync('test.xlsx', Buffer.from(res.data));
        console.log("Saved test.xlsx, size:", res.data.length);
    } catch(e) {
        console.error(e.message);
    }
}
test();
