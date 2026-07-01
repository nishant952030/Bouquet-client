export default function handler(req, res) {
  res.status(403).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Denied</title>
  <style>
    body { margin: 0; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #fdf2f8; color: #831843; text-align: center; }
    .card { background: white; padding: 3rem 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); max-width: 90%; width: 400px; border: 1px solid #fbcfe8; }
    h1 { margin-top: 0; font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; }
    p { margin-bottom: 0; opacity: 0.8; line-height: 1.5; font-size: 0.95rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Access Denied</h1>
    <p>Sorry, Petals and Words is currently not available in your region.</p>
  </div>
</body>
</html>`);
}
