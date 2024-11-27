#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
npx prisma migrate reset --force
npx prisma generate
npx prisma db push --accept-data-loss

# Start the application
echo "Starting the application..."
node .next/standalone/server.js 