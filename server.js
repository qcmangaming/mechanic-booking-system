const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const cron = require("node-cron");

const app = express();
app.use(bodyParser.json());

// ENV variables (safe)
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let users = [{ email: "test@test.com", password: "1234" }];
let appointments = [];

// LOGIN
app.post("/api/login", (req, res) => {
  const user = users.find(
    u => u.email === req.body.email && u.password === req.body.password
  );
  res.json({ user });
});

// GET HISTORY
app.get("/api/appointments", (req, res) => {
  const data = appointments.filter(a => a.email === req.query.email);
  res.json(data);
});

// BOOK
app.post("/api/book", async (req, res) => {
  const appt = { ...req.body, id: Date.now() };
  appointments.push(appt);

  await client.messages.create({
    body: `Confirmed: ${appt.date} at ${appt.time}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: appt.phone
  });

  res.json({ success: true });
});

// ⏰ REMINDER SYSTEM
cron.schedule("0 * * * *", async () => {
  const now = new Date();

  for (const a of appointments) {
    const apptTime = new Date(`${a.date}T${a.time}:00`);
    const diff = (apptTime - now) / (1000 * 60 * 60);

    if (diff > 23 && diff < 24) {
      await client.messages.create({
        body: `Reminder: Appointment tomorrow at ${a.time}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: a.phone
      });
    }
  }
});

app.listen(3000, () => console.log("Server running"));
