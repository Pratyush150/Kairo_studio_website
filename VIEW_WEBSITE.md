# How to View Kairo Studio Website

## Method 1: Copy to Your Local Machine

1. Download all files from this server to your computer
2. Open `index.html` in any browser
3. All features will work (except features requiring a server)

## Method 2: SSH Port Forwarding (Recommended)

On your local machine, run:
```bash
ssh -L 8000:localhost:8000 ubuntu@152.67.2.20
```

Then open: http://localhost:8000

## Method 3: Open Cloud Firewall

1. Oracle Cloud Console → Networking → VCN
2. Security Lists → Add Ingress Rule
3. Port 8000, TCP, Source: 0.0.0.0/0
4. Access: http://152.67.2.20:8000

## Method 4: Use Standard HTTP Port

If you have sudo access:
```bash
sudo python3 -m http.server 80 --bind 0.0.0.0
```

Then access: http://152.67.2.20
(Port 80 is usually open by default)

## Files Location
All files are in: /home/ubuntu/kairo_studio/
