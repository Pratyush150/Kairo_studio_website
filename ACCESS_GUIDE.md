# 🌐 How to Access Kairoverse

## ⚠️ IMPORTANT: This is a REMOTE Server

Your Kairoverse app is running on a **remote Oracle Cloud server**, not on your local computer.

**Server Details:**
- **Hostname:** instance-20251031-0047
- **Private IP:** 10.0.3.184
- **Public IP:** 152.67.2.20
- **Port:** 3000

---

## ❌ Why "localhost" Doesn't Work

When you try to access `http://localhost:3000` from your browser:
- Your browser looks for a server on YOUR local computer
- But the Kairoverse app is running on a REMOTE server (152.67.2.20)
- That's why you get "ERR_CONNECTION_REFUSED"

---

## ✅ How to Access Your App

### Option 1: Direct Public IP Access (RECOMMENDED)

**URL:** http://152.67.2.20:3000

**Status:**
- ✅ Dev server running on port 3000
- ✅ Server firewall opened for port 3000
- ⚠️ **Oracle Cloud Security List may need configuration**

**If you still can't access:**

You need to add an **Ingress Rule** in Oracle Cloud Console:

1. Go to **Oracle Cloud Console**
2. Navigate to **Networking → Virtual Cloud Networks**
3. Select your VCN → **Security Lists**
4. Click your security list → **Add Ingress Rules**
5. Add these details:
   - **Source CIDR:** 0.0.0.0/0 (or your specific IP for security)
   - **IP Protocol:** TCP
   - **Source Port Range:** All
   - **Destination Port Range:** 3000
   - **Description:** Kairoverse Dev Server
6. Click **Add Ingress Rule**

---

### Option 2: SSH Tunnel (If you can't modify firewall)

If you can't access the Oracle Cloud Console, use SSH port forwarding:

```bash
# On your LOCAL computer, run:
ssh -L 3000:localhost:3000 ubuntu@152.67.2.20

# Then access in your browser:
http://localhost:3000
```

This creates a secure tunnel from your local port 3000 to the server's port 3000.

---

### Option 3: Nginx Reverse Proxy on Port 80

If you want to use standard HTTP (port 80) which is already open:

```bash
# Install nginx
sudo apt update && sudo apt install -y nginx

# Create reverse proxy config
sudo tee /etc/nginx/sites-available/kairoverse << 'EOF'
server {
    listen 80;
    server_name 152.67.2.20;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable and restart
sudo ln -sf /etc/nginx/sites-available/kairoverse /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

Then access: http://152.67.2.20

---

## 🔍 Current Server Status

```
Dev Server: ✅ RUNNING
Port: 3000
Process: Vite v5.4.21
Response: HTTP 200 ✓

Listening on:
  ➜  Local:   http://localhost:3000/  (from server)
  ➜  Network: http://10.0.3.184:3000/ (private network)
  ➜  Public:  http://152.67.2.20:3000/ (internet)
```

**Firewall Status:**
- ✅ Server iptables: Port 3000 OPEN
- ⚠️ Oracle Cloud Security List: **May need configuration**

---

## 🧪 Quick Test

From your local computer's terminal:

```bash
# Test if port is accessible
curl http://152.67.2.20:3000

# If you get HTML response, it's working!
# If you get "Connection refused", check Oracle Cloud Security List
```

---

## 🚀 Recommended Next Steps

1. **Try accessing:** http://152.67.2.20:3000
2. **If it doesn't work:** Configure Oracle Cloud Security List (see Option 1)
3. **Alternative:** Use SSH tunnel (see Option 2)
4. **Production setup:** Use Nginx reverse proxy on port 80 (see Option 3)

---

## 📝 No Cloudflare Found

I've verified:
- ✅ No Cloudflare Tunnel configurations
- ✅ No Cloudflare references in code
- ✅ Fresh, clean installation
- ✅ All dependencies installed from scratch

---

## ⚡ Quick Access Commands

```bash
# Check if server is running
curl http://localhost:3000

# Restart dev server
cd /home/ubuntu/kairo_studio
npm run dev

# Check firewall
sudo iptables -L INPUT -n | grep 3000

# Check listening ports
ss -tuln | grep 3000
```

---

**Your app is ready!** Just need to configure network access. 🌌
