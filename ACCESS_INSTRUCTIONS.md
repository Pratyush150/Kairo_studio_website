# 🌐 Kairo Studio - Access Instructions

## ✅ Server Status
- **Public IP**: 152.67.2.20
- **Private IP**: 10.0.3.184
- **Port**: 8080
- **Status**: ✅ RUNNING

---

## 🚀 **FASTEST METHOD: SSH Tunnel (Recommended)**

This works immediately without any cloud configuration!

### **Step 1: Open Your Terminal**

On **Windows**: Use PowerShell, CMD, or Git Bash
On **Mac/Linux**: Use Terminal

### **Step 2: Connect with SSH Tunnel**

Run this command (replace with your actual SSH key path if needed):

```bash
ssh -L 8080:localhost:8080 ubuntu@152.67.2.20
```

**If you use an SSH key file:**
```bash
ssh -L 8080:localhost:8080 -i /path/to/your-key.pem ubuntu@152.67.2.20
```

**You'll see**: Normal SSH login messages

### **Step 3: Keep Terminal Open & Access Site**

**While keeping the terminal open**, open your browser and go to:

```
http://localhost:8080/
```

✅ **The site will load!**

---

## 🎮 **What You Should See**

1. **Loading screen** (black background)
   - "KAIRO STUDIO" text pulsing
   - Progress bar filling up

2. **3D Scene loads** (~3 seconds)
   - Black space with blue grid floor
   - Rotating blue icosahedron in center
   - Floating particles everywhere
   - 4 colored walls (Blue, Cyan, Orange, Pink)
   - 3 project cards floating (CANON, AMUL, LOCAL)

3. **Performance Monitor** (top-right corner)
   - Shows "60 FPS" in green

4. **UI Elements**
   - Top-left: Motion toggle button
   - Bottom-right: Workflow timeline (Research → Strategy → Design → Development)
   - Bottom-left: Navigation hints

---

## 🎯 **Interactions to Try**

### Mouse:
- **Move cursor** → Camera follows smoothly
- **Hover walls** → They glow and scale up
- **Click wall** → Panel slides in from right
- **Click project card** → Card expands dramatically
- **Scroll wheel** → Zoom in/out

### Keyboard:
- **← Left Arrow** → About section
- **↑ Up Arrow** → Work section
- **→ Right Arrow** → Services section
- **↓ Down Arrow** → Contact section
- **1, 2, 3, 4** → Switch workflow steps
- **ESC** → Close panels/modals
- **Tab** → Navigate elements

---

## 🌩️ **Alternative: Direct Access (Requires Cloud Setup)**

If you want to access via `http://152.67.2.20:8080/` without SSH tunnel:

### **Oracle Cloud Configuration Required:**

1. **Log into Oracle Cloud Console**
2. Go to: **Networking** → **Virtual Cloud Networks**
3. Click your VCN → **Security Lists** → **Default Security List**
4. Click **"Add Ingress Rules"**
5. Configure:
   - **Source Type**: CIDR
   - **Source CIDR**: `0.0.0.0/0` (or your specific IP)
   - **IP Protocol**: TCP
   - **Destination Port Range**: `8080`
   - **Description**: Kairo Studio Web Server
6. Click **"Add Ingress Rules"**

**Then test**: `http://152.67.2.20:8080/`

✅ **Local firewall already configured** (port 8080 allowed)

---

## 🐛 **Troubleshooting**

### "Connection Refused" with SSH Tunnel
- Check your SSH key is correct
- Verify you can SSH normally: `ssh ubuntu@152.67.2.20`
- Make sure you're using the correct username (`ubuntu`)

### "Can't Reach This Page"
- Is the SSH tunnel still running? Check terminal
- Did you use `localhost:8080` (not `152.67.2.20`)?
- Try closing and reopening the tunnel

### "Nothing Loads" / Blank Screen
- Open browser console (F12)
- Look for errors
- Check if FPS monitor appears (top-right)
- Try refreshing the page

### Low FPS / Slow Performance
- Check FPS monitor (should be green, ~60 FPS)
- Close other browser tabs
- Try disabling motion (top-left toggle button)

---

## 📱 **Mobile Access**

Mobile works through SSH tunnel too!

**For iOS/Android with SSH app:**
1. Install: Terminus or ConnectBot
2. Set up port forwarding: Local 8080 → Remote 8080
3. Open phone browser: `http://localhost:8080/`

**Note**: Mobile shows warning screen due to limited performance. Click "Continue Anyway" to proceed.

---

## 🔄 **Server Management**

### Check Server Status:
```bash
curl http://localhost:8080/
```

### Restart Server:
```bash
# Stop
pkill -f "python3 -m http.server"

# Start
cd /home/ubuntu/kairo_studio
python3 -m http.server 8080 --bind 0.0.0.0 &
```

### View Logs:
```bash
ps aux | grep "python3 -m http.server"
```

---

## ✨ **Features Checklist**

Test these features after loading:

- [ ] Loading animation plays smoothly
- [ ] 3D scene renders with rotating hero object
- [ ] Particles float around
- [ ] Walls glow on hover
- [ ] Clicking wall opens panel
- [ ] Project cards expand when clicked
- [ ] FPS monitor shows 55-60 FPS (green)
- [ ] Keyboard navigation works
- [ ] Motion toggle works (top-left)
- [ ] Workflow timeline responds (bottom-right)

---

## 📞 **Need Help?**

**Common Issues:**
1. **Can't connect via SSH tunnel**: Check your SSH credentials
2. **Site won't load**: Verify terminal shows SSH connection is active
3. **Slow performance**: Your browser/computer may need more resources
4. **Errors in console**: Check browser compatibility (use Chrome/Firefox)

**Server Information:**
- Running on: Ubuntu (Oracle Cloud)
- Port: 8080 (HTTP)
- Libraries: Three.js v0.154.0, GSAP 3.12.5
- Performance: 60 FPS target

---

## 🎉 **You're All Set!**

**Quick Start:**
1. Open terminal
2. Run: `ssh -L 8080:localhost:8080 ubuntu@152.67.2.20`
3. Open browser: `http://localhost:8080/`
4. Enjoy the experience!

🚀 **Have fun exploring Kairo Studio OS v3.0!**
