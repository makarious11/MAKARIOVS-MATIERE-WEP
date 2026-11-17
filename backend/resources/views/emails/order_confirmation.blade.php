<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your L’VENUS Extrait de Parfum Order Confirmation</title>
  <style>
    body {
      background-color: #FDFBF7;
      color: #14110F;
      font-family: 'EB Garamond', Georgia, serif;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #B08D57;
      padding: 40px;
      border-radius: 8px;
    }
    .header {
      text-align: center;
      border-bottom: 1px solid rgba(176,141,87,0.3);
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 26px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #14110F;
      margin: 0;
    }
    .tagline {
      font-style: italic;
      color: #B08D57;
      font-size: 15px;
      margin-top: 6px;
    }
    .seal-pill {
      display: inline-block;
      background: #6B1D2F;
      color: #FDFBF7;
      padding: 6px 16px;
      border-radius: 50px;
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin: 12px 0;
    }
    .order-number {
      font-size: 22px;
      font-weight: bold;
      color: #6B1D2F;
      letter-spacing: 0.1em;
    }
    .footer {
      text-align: center;
      margin-top: 36px;
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(20,17,15,0.6);
      border-top: 1px solid rgba(176,141,87,0.2);
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand">L’VENUS</h1>
      <p class="tagline">Extrait de Parfum — Crafted by Makarious</p>
      <div class="seal-pill">SEALED IN LE CAIRE · PARIS</div>
    </div>

    <p>Dear {{ $order->name ?? 'Valued Patron' }},</p>
    <p>We have the honor to confirm that your sovereign extrait commission has been entered into the private ledger of Maison L’VENUS.</p>

    <div style="background-color: #F1EADA; padding: 20px; border-radius: 6px; margin: 24px 0; border: 1px solid rgba(176,141,87,0.3);">
      <div style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #8C6E3D;">Order Number</div>
      <div class="order-number">{{ $order->number }}</div>
      <div style="font-size: 13px; margin-top: 8px;">Delivery to: {{ $order->address }}, {{ $order->city }}, {{ $order->governorate }}</div>
      <div style="font-size: 13px; margin-top: 4px; font-weight: bold;">Total: {{ number_format($order->total, 2) }} EGP</div>
    </div>

    <p>Each flacon is inspected, crowned with our hand-carved walnut cap, and hand-sealed with natural burgundy wax before departure via climate-controlled courier.</p>

    <div class="footer">
      L’VENUS MAISON DE PARFUM — LE CAIRE · PARIS
    </div>
  </div>
</body>
</html>

