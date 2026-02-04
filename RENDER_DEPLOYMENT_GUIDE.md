# Render Deployment Guide

This guide will help you deploy your Digital Classroom application to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your project should be pushed to a GitHub repository
3. **Cloudinary Account**: For file uploads (optional but recommended)

## Deployment Steps

### 1. Push Code to GitHub

First, ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Services on Render

#### A. Backend Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New Web Service"
3. Connect your GitHub repository
4. Configure the backend service:
   - **Name**: `digital-classroom-backend`
   - **Environment**: Java
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
   - **Branch**: `main`

5. Add Environment Variables:
   - `SPRING_PROFILES_ACTIVE`: `production`
   - `CLOUDINARY_CLOUD_NAME`: [Your Cloudinary Cloud Name]
   - `CLOUDINARY_API_KEY`: [Your Cloudinary API Key]
   - `CLOUDINARY_API_SECRET`: [Your Cloudinary API Secret]
   - `JWT_SECRET`: [Generate a secure JWT secret]

#### B. Frontend Service

1. Click "New Static Site"
2. Connect your GitHub repository
3. Configure the frontend service:
   - **Name**: `digital-classroom-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Branch**: `main`

4. The frontend will automatically get the backend URL from the environment.

#### C. Database

1. Click "New PostgreSQL Database"
2. Configure the database:
   - **Name**: `digital-classroom-db`
   - **Plan**: Free (for testing) or choose appropriate plan
   - **Region**: Choose closest to your users

### 3. Update Environment Variables

After creating the database, Render will provide a connection string. Update your backend service environment variables:

- `SPRING_DATASOURCE_URL`: [Render PostgreSQL Connection String]

### 4. Alternative: Using render.yaml

Instead of manual setup, you can use the provided `render.yaml` file:

1. Push the `render.yaml` file to your repository
2. Go to Render Dashboard
3. Click "Import from Git"
4. Connect your repository
5. Render will automatically detect and create all services based on the YAML configuration

## Post-Deployment Setup

### 1. Initial Admin Setup

After deployment, you'll need to set up the initial admin user. The default admin credentials are:
- **Username**: `admin`
- **Password**: `admin`

### 2. Database Initialization

The application will automatically:
- Create database tables based on your entities
- Run the `schema.sql` and `data.sql` scripts
- Create the default super admin user

### 3. Testing the Application

1. **Backend API**: Visit `https://digital-classroom-backend.onrender.com`
2. **Frontend**: Visit `https://digital-classroom-frontend.onrender.com`

## Environment Variables Reference

### Backend Service
- `SPRING_PROFILES_ACTIVE`: `production`
- `SPRING_DATASOURCE_URL`: Database connection string
- `SPRING_DATASOURCE_USERNAME`: Database username (optional)
- `SPRING_DATASOURCE_PASSWORD`: Database password (optional)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `JWT_SECRET`: JWT secret for authentication

### Frontend Service
- `REACT_APP_BACKEND_URL`: Backend API URL (auto-configured)

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Java version compatibility (using Java 17)
   - Ensure all dependencies are properly defined in `pom.xml`

2. **Database Connection**:
   - Verify database URL format
   - Check if database is running and accessible

3. **Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names

4. **File Uploads**:
   - Verify Cloudinary credentials are correct
   - Check Cloudinary account limits

### Logs and Monitoring

- View logs in Render Dashboard under each service
- Check deployment status and error messages
- Monitor resource usage and scale as needed

## Scaling Considerations

### Free Tier Limitations
- **Backend**: 750 free hours per month
- **Frontend**: Free static site hosting
- **Database**: Free PostgreSQL with limited storage

### Paid Plans
Consider upgrading when:
- You exceed free tier limits
- Need more storage or compute resources
- Require custom domains or SSL certificates

## Security Notes

1. **Change Default Admin Password**: Update the default admin credentials after deployment
2. **Secure JWT Secret**: Use a strong, unique JWT secret
3. **Environment Variables**: Never commit secrets to your repository
4. **HTTPS**: Render automatically provides SSL certificates

## Support

For additional help:
- [Render Documentation](https://render.com/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)