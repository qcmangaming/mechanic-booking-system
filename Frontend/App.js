import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 🔗 REPLACE with your real backend URL
const BACKEND_URL = "https://rdl-mecanique-mobile.onrender.com";

export default function App() {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState({ email: "", password: "" });
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", service: "" });
  const [appointments, setAppointments] = useState([]);

  const times = ["09:00","10:00","11:00","13:00","14:00","15:00"];

  const login = async () => {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auth)
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      loadHistory(data.user.email);
    } else {
      alert("Login failed");
    }
  };

  const loadHistory = async (email) => {
    const res = await fetch(`${BACKEND_URL}/appointments?email=${email}`);
    const data = await res.json();
    setAppointments(data);
  };

  const book = async () => {
    await fetch(`${BACKEND_URL}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, email: user.email })
    });

    alert("Booked! SMS sent.");
    loadHistory(user.email);
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto p-6">
          <h2 className="text-xl mb-4">Login</h2>
          <Input placeholder="Email" onChange={e => setAuth({...auth,email:e.target.value})} />
          <Input type="password" placeholder="Password" className="mt-2" onChange={e => setAuth({...auth,password:e.target.value})} />
          <Button className="mt-4 w-full" onClick={login}>Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl mb-2">Book Appointment</h2>
          <Input placeholder="Name" onChange={e => setForm({...form,name:e.target.value})} />
          <Input placeholder="Phone" className="mt-2" onChange={e => setForm({...form,phone:e.target.value})} />
          <Input type="date" className="mt-2" onChange={e => setForm({...form,date:e.target.value})} />

          <div className="grid grid-cols-3 gap-2 mt-2">
            {times.map(t => (
              <Button key={t} onClick={()=>setForm({...form,time:t})}>{t}</Button>
            ))}
          </div>

          <Input placeholder="Service" className="mt-2" onChange={e => setForm({...form,service:e.target.value})} />
          <Button className="mt-3 w-full" onClick={book}>Book</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl mb-2">History</h2>
          {appointments.map(a => (
            <div key={a.id} className="border p-2 mb-2">
              {a.date} {a.time} - {a.service}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
      }
      
