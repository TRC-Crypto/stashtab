# GitHub App Setup Guide

This guide walks you through creating and configuring a GitHub App for branch protection setup.

## Why GitHub Apps?

GitHub Apps provide:

- ✅ **Fine-grained permissions** - Only grant what's needed
- ✅ **Better security** - Scoped to specific repositories
- ✅ **Better audit trail** - Shows which app made changes
- ✅ **No personal token exposure** - Uses app credentials instead

## Step-by-Step Setup

### Step 1: Create the GitHub App

1. Go to your organization's app settings:
   - For organizations: `https://github.com/organizations/TRC-Crypto/settings/apps`
   - For personal accounts: `https://github.com/settings/apps`

2. Click **"New GitHub App"**

3. Fill in the basic information:
   - **GitHub App name**: `Stashtab Branch Protection` (or any name you prefer)
   - **Homepage URL**: `https://github.com/TRC-Crypto/stashtab`
   - **User authorization callback URL**: Leave empty (not needed for this use case)
   - **Webhook**: Uncheck (not needed)
   - **Webhook URL**: Leave empty

4. Set **Repository permissions**:
   - **Administration**: **Read & write** (required for branch protection)
   - **Metadata**: **Read-only** (automatically enabled)

5. Leave all other permissions as "No access"

6. Under **"Where can this GitHub App be installed?"**:
   - Select **"Only on this account"** (for organization) or **"Any account"** (if you want flexibility)

7. Click **"Create GitHub App"**

### Step 2: Generate and Save the Private Key

1. After creating the app, you'll see the app's settings page
2. Scroll down to **"Private keys"** section
3. Click **"Generate a private key"**
4. **Important**: Download and save the `.pem` file securely - you can only download it once!
5. The file will be named something like `stashtab-branch-protection.YYYY-MM-DD.private-key.pem`

### Step 3: Note Your App ID

1. On the app settings page, you'll see your **App ID** at the top
2. Copy this number - you'll need it for authentication
3. It looks like: `123456` (just a number)

### Step 4: Install the App on Your Repository

1. On the app settings page, click **"Install App"** in the sidebar (or go to the bottom and click the button)
2. Select the account/organization where your repository is located
3. Choose **"Only select repositories"**
4. Select your repository: `stashtab`
5. Click **"Install"**

### Step 5: Get the Private Key Content

You need to get the content of the private key file you downloaded:

**Option A: Read the file directly**

```bash
# On Linux/Mac
cat path/to/your-app.private-key.pem

# On Windows (PowerShell)
Get-Content path\to\your-app.private-key.pem
```

**Option B: Copy from your text editor**

- Open the `.pem` file in any text editor
- Copy the entire content, including:
  - `-----BEGIN RSA PRIVATE KEY-----`
  - All the key content
  - `-----END RSA PRIVATE KEY-----`

### Step 6: Use the GitHub App for Authentication

Now you can use the GitHub App with the branch protection script:

```bash
# Set environment variables
export GITHUB_APP_ID="123456"  # Your App ID from Step 3
export GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
[entire key content]
...
-----END RSA PRIVATE KEY-----"

# Run the script
pnpm setup:branch-protection
```

**Or in a single command (Linux/Mac):**

```bash
GITHUB_APP_ID="123456" \
GITHUB_APP_PRIVATE_KEY="$(cat path/to/your-app.private-key.pem)" \
pnpm setup:branch-protection
```

**Or in PowerShell (Windows):**

```powershell
$env:GITHUB_APP_ID="123456"
$env:GITHUB_APP_PRIVATE_KEY=Get-Content -Raw path\to\your-app.private-key.pem
pnpm setup:branch-protection
```

## Security Best Practices

1. **Never commit the private key** to your repository
2. **Store the private key securely** (password manager, secret management service)
3. **Use environment variables** or a secrets manager
4. **Rotate keys periodically** (generate new key, update, then delete old one)
5. **Limit app installation** to only the repositories that need it

## Troubleshooting

### "GitHub App is not installed on repository"

**Solution**: Make sure you've installed the app on your repository (Step 4). The app must be installed on the specific repository you're trying to protect.

### "Permission denied"

**Solution**:

1. Check that the app has **"Administration: Read & write"** permission
2. Verify the app is installed on the repository
3. Make sure you're using the correct App ID

### "Failed to generate JWT"

**Solution**:

1. Verify the private key is complete (includes BEGIN and END lines)
2. Make sure newlines are preserved (use quotes around the key)
3. Check that `jsonwebtoken` package is installed: `pnpm add -D jsonwebtoken @types/jsonwebtoken`

### Private key format issues

The script automatically handles `\n` characters. You can provide the key in either format:

```bash
# With \n escape sequences
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"

# Or as a multi-line string (in a script file)
export GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"
```

## Alternative: Using a Secrets Manager

For production environments, consider using a secrets manager:

**GitHub Secrets** (for CI/CD):

```yaml
# In .github/workflows/setup-branch-protection.yml
env:
  GITHUB_APP_ID: ${{ secrets.GITHUB_APP_ID }}
  GITHUB_APP_PRIVATE_KEY: ${{ secrets.GITHUB_APP_PRIVATE_KEY }}
```

**Environment Variables** (for local development):

```bash
# .env file (add to .gitignore!)
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
```

Then load with:

```bash
source .env
pnpm setup:branch-protection
```

## Next Steps

Once authenticated, the script will:

1. Verify the repository and branch exist
2. Configure branch protection rules
3. Set up required status checks
4. Enable pull request requirements

See [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md) for details on the protection rules.
