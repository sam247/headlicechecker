# Scan inference (DETECTION_API_URL) setup

The inference service runs at **https://scan-inference.onrender.com**.

To enable scans on the live site, set this in Vercel:

1. Open [Vercel → headlicechecker → Settings → Environment Variables](https://vercel.com/sam-pettifords-projects/headlicechecker/settings/environment-variables).
2. Add:
   - **Key:** `DETECTION_API_URL`
   - **Value:** `https://scan-inference.onrender.com`
   - **Environments:** Production (and Preview if you want scans in preview deploys).
3. Redeploy the project (Deployments → ⋮ on latest → Redeploy) so the new variable is used.

After that, the live site will use your YOLO model for the scan flow.
