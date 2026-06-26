# Quick Start - Deploy to AWS Amplify

## 5-Minute Deployment Checklist

### ✅ Already Done (Your Project is Ready!)
- [x] `amplify.yml` created
- [x] Next.js config optimized for Amplify
- [x] Environment variables documented
- [x] Validation script created and passed

### 📋 Your Action Items

#### 1. Push to GitHub (2 minutes)
```bash
git add .
git commit -m "Add Amplify deployment configuration"
git push origin main
```

#### 2. Set Environment Variables in Amplify (3 minutes)

Go to AWS Amplify Console → Your App → **App settings** → **Environment variables**

Add these 5 variables:

```env
# Database (from your Supabase or RDS)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# NextAuth (generate secret first)
NEXTAUTH_SECRET=[Run: openssl rand -base64 32]
NEXTAUTH_URL=https://[YOUR-APP-ID].amplifyapp.com

# Supabase Storage
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

**Generate NEXTAUTH_SECRET:**
- **Windows PowerShell:** `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
- **Mac/Linux:** `openssl rand -base64 32`

#### 3. Deploy (1 minute)
1. In Amplify Console, click **Hosting** → **Deploy**
2. Select your branch
3. Click **Save and deploy**

#### 4. Run Database Migrations (2 minutes)

After first deployment succeeds:

**Option A: Via Amplify Console (Recommended)**
1. Go to **App settings** → **Build settings**
2. Edit build settings
3. Add to build commands:
   ```yaml
   build:
     commands:
       - npm run build
       - npx prisma migrate deploy
   ```

**Option B: Manual**
```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### 🎉 You're Done!

Visit: `https://[YOUR-APP-ID].amplifyapp.com`

### ⚠️ Important Notes

1. **Supabase Storage Bucket**: Make sure you created a `wedding-photos` bucket in Supabase and set it to Public
2. **Database**: Your PostgreSQL database must be accessible from AWS Amplify (Supabase works great!)
3. **First Build**: Takes 3-5 minutes, subsequent builds are faster

### 🆘 Need Help?

- Full guide: See `DEPLOYMENT.md`
- Run validation: `node scripts/validate-deployment.js`
- Check logs: Amplify Console → **Hosting** → **Logs**

### 🔄 Future Deployments

Every time you push to GitHub, Amplify will automatically:
1. Detect the change
2. Build your app
3. Deploy the new version

No manual intervention needed!