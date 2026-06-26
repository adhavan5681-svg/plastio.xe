# AWS Amplify Deployment Guide

This guide will help you deploy your Wedding Photo Selector app to AWS Amplify.

## Prerequisites

1. **AWS Account** - Sign up at [aws.amazon.com](https://aws.amazon.com/)
2. **GitHub Repository** - Your code should be pushed to GitHub
3. **PostgreSQL Database** - Either Supabase (recommended) or AWS RDS
4. **Supabase Storage** - For photo uploads (or AWS S3)

## Step 1: Prepare Your Database

### Option A: Using Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Go to **Project Settings** → **Database** → **Connection string**
3. Copy the **URI** format connection string
4. Go to **Project Settings** → **API** to get your:
   - Project URL
   - Anon/Public key

### Option B: Using AWS RDS

1. Go to AWS Console → RDS → Create Database
2. Choose PostgreSQL engine
3. Configure security groups to allow connections
4. Note your database endpoint, username, and password

## Step 2: Set Up Supabase Storage

1. In your Supabase project, go to **Storage**
2. Create a new bucket named `wedding-photos`
3. Set it to **Public** for easy access
4. Note your Supabase URL and anon key

## Step 3: Configure Environment Variables

In AWS Amplify Console, go to **App Settings** → **Environment Variables** and add:

### Required Variables:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres

# NextAuth
NEXTAUTH_SECRET=[GENERATE_WITH: openssl rand -base64 32]
NEXTAUTH_URL=https://[YOUR_APP_ID].amplifyapp.com

# Supabase
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

### How to Generate NEXTAUTH_SECRET:

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

## Step 4: Deploy to AWS Amplify

### Method 1: Using AWS Amplify Console (Recommended)

1. **Go to AWS Amplify Console:**
   - Visit [aws.amazon.com/amplify](https://aws.amazon.com/amplify/)
   - Click **Get started** under **Amplify Hosting**

2. **Connect Your Repository:**
   - Click **Get started** under **Host your web app**
   - Choose **GitHub** as your repository provider
   - Authorize AWS Amplify to access your GitHub account
   - Select your repository and branch (usually `main` or `master`)

3. **Configure Build Settings:**
   - Amplify should auto-detect the `amplify.yml` file
   - Verify the build settings:
     ```
     Build command: npm run build
     Publish directory: .next
     ```
   - Click **Next**

4. **Review and Deploy:**
   - Review the configuration
   - Click **Save and deploy**
   - Wait for the build to complete (usually 3-5 minutes)

### Method 2: Using Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in your project
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

## Step 5: Run Database Migrations

After deployment, you need to run Prisma migrations on your production database.

### Option A: Using Amplify Console (Recommended)

1. Go to your Amplify app
2. Click **App settings** → **Build settings**
3. Scroll to **Build image settings** → **Edit**
4. Add a post-build hook:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
        - npx prisma migrate deploy
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Option B: Manual Migration

```bash
# Install Prisma CLI if not already installed
npm install -g prisma

# Run migrations against your production database
DATABASE_URL="your-production-database-url" npx prisma migrate deploy

# (Optional) Seed the database
DATABASE_URL="your-production-database-url" npx prisma db seed
```

## Step 6: Configure Custom Domain (Optional)

1. In Amplify Console, go to **App settings** → **Domain management**
2. Click **Add domain**
3. Enter your custom domain (e.g., `yourstudio.com`)
4. Follow the instructions to update your DNS settings

## Step 7: Test Your Deployment

1. Visit your Amplify app URL (e.g., `https://[app-id].amplifyapp.com`)
2. Test the following:
   - [ ] Homepage loads correctly
   - [ ] Registration works
   - [ ] Login works
   - [ ] Dashboard is accessible
   - [ ] Client creation works
   - [ ] Photo upload works
   - [ ] Gallery view works

## Common Issues and Solutions

### Issue 1: Build Fails with Sharp Error

**Error:** `sharp: Installation error: EACCES: permission denied`

**Solution:** The `amplify.yml` already includes proper caching. If you still face issues:

```yaml
# Update amplify.yml
build:
  commands:
    - npm run build
    - npm rebuild sharp
```

### Issue 2: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
- Verify your `DATABASE_URL` is correct
- Check that your database allows connections from AWS Amplify IPs
- For Supabase: Go to **Settings** → **Database** → **Connection pooling** and use the pooled connection string

### Issue 3: NextAuth Session Not Persisting

**Error:** Session doesn't persist after login

**Solution:**
- Ensure `NEXTAUTH_URL` matches your Amplify URL exactly (including https://)
- Verify `NEXTAUTH_SECRET` is set and is a valid base64 string
- Check that cookies are enabled in your browser

### Issue 4: File Upload Fails

**Error:** Photo upload returns 500 error

**Solution:**
- Verify Supabase storage bucket `wedding-photos` exists and is public
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Ensure the bucket policies allow uploads

### Issue 5: Environment Variables Not Loading

**Error:** `process.env.VARIABLE is undefined`

**Solution:**
- Go to Amplify Console → **App settings** → **Environment variables**
- Add all required variables
- **Redeploy** the app (environment variables are loaded at build time)

## Production Checklist

Before going live:

- [ ] All environment variables are set in Amplify Console
- [ ] Database migrations have been run
- [ ] Supabase storage bucket is configured
- [ ] NEXTAUTH_SECRET is a strong random string
- [ ] NEXTAUTH_URL is set to your production URL
- [ ] Test all major features (register, login, upload, gallery)
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure backup for your database
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic with Amplify)

## Monitoring and Maintenance

### View Logs
- Go to Amplify Console → **App settings** → **Build logs**
- Or go to **Hosting** → **Logs**

### Rollback Deployment
- Go to **Hosting** → **Deployments**
- Find the previous successful deployment
- Click **Actions** → **Rollback**

### Update Environment Variables
1. Go to **App settings** → **Environment variables**
2. Add/Edit variables
3. Click **Save**
4. **Redeploy** the app for changes to take effect

## Cost Estimation

AWS Amplify Pricing (as of 2024):
- **Build & Deploy:** Free for first 5 GB stored, 1000 build minutes/month
- **Hosting:** $0.023 per GB stored, $0.15 per GB served
- **Data Transfer:** First 5 GB free, then $0.15/GB

Supabase Pricing:
- **Free tier:** 500 MB database, 1 GB storage, 2 GB bandwidth
- **Pro tier:** $25/month for 8 GB database, 100 GB storage

## Support

If you encounter issues:
1. Check Amplify build logs for detailed error messages
2. Review this guide's "Common Issues" section
3. Check Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)
4. Check Amplify documentation: [docs.amplify.aws](https://docs.amplify.aws/)

## Next Steps

After successful deployment:
1. Set up a custom domain
2. Configure email notifications (optional)
3. Add analytics (e.g., Google Analytics)
4. Set up CI/CD for automatic deployments on git push
5. Configure monitoring and alerts