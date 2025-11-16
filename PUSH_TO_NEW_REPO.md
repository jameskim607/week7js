# 📤 How to Push Code to a Different Repository

## Option 1: Add a Second Remote (Recommended)
This allows you to push to multiple repositories while keeping the original.

### Step 1: Add the new remote
```bash
# Replace <NEW_REPO_URL> with your new repository URL
git remote add backup <NEW_REPO_URL>
```

Example:
```bash
git remote add backup https://github.com/yourusername/your-new-repo.git
```

### Step 2: Verify remotes
```bash
git remote -v
```
You should see both `origin` and `backup`

### Step 3: Push to the new repository
```bash
# Push to the new remote
git push backup main

# Or if the new repo uses a different branch name
git push backup main:main
```

### Step 4: Continue pushing to both (optional)
```bash
# Push to original
git push origin main

# Push to new repo
git push backup main
```

---

## Option 2: Change the Remote URL
This replaces the original remote with the new one.

### Step 1: Update the remote URL
```bash
# Replace <NEW_REPO_URL> with your new repository URL
git remote set-url origin <NEW_REPO_URL>
```

Example:
```bash
git remote set-url origin https://github.com/yourusername/your-new-repo.git
```

### Step 2: Verify the change
```bash
git remote -v
```

### Step 3: Push to the new repository
```bash
git push origin main
```

**Note:** This will no longer push to the original repository.

---

## Option 3: Remove Old Remote and Add New One
If you want to completely switch repositories.

### Step 1: Remove the old remote
```bash
git remote remove origin
```

### Step 2: Add the new remote
```bash
git remote add origin <NEW_REPO_URL>
```

### Step 3: Verify
```bash
git remote -v
```

### Step 4: Push
```bash
git push -u origin main
```

---

## Common Repository URLs Format

### HTTPS:
```
https://github.com/username/repository-name.git
```

### SSH:
```
git@github.com:username/repository-name.git
```

---

## Important Notes

⚠️ **Before pushing to a new repository:**

1. **Create the repository on GitHub first** (if it doesn't exist)
   - Go to GitHub
   - Click "New repository"
   - Create it (don't initialize with README if you're pushing existing code)

2. **Check authentication**
   - For HTTPS: You may need a Personal Access Token
   - For SSH: Make sure your SSH key is set up

3. **Branch names**
   - Make sure the branch exists on the new repo
   - Use `git push backup main:main` if branch names differ

4. **First push to new repo**
   ```bash
   # If pushing for the first time
   git push -u backup main
   # The -u flag sets upstream tracking
   ```

---

## Troubleshooting

### Error: "remote origin already exists"
- Use `git remote set-url origin <NEW_URL>` instead of `git remote add origin`

### Error: "Permission denied"
- Check your authentication (Personal Access Token for HTTPS)
- Verify you have write access to the repository

### Error: "Repository not found"
- Make sure the repository exists on GitHub
- Verify the repository URL is correct
- Check if repository is private and you have access

---

## Quick Reference

```bash
# View all remotes
git remote -v

# Add new remote
git remote add <name> <url>

# Change remote URL
git remote set-url origin <new-url>

# Remove remote
git remote remove <name>

# Push to specific remote
git push <remote-name> <branch>

# Push to multiple remotes at once
git push origin main && git push backup main
```

