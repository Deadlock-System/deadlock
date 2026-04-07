#!/bin/sh

echo "🔄 Waiting for database..."

until echo 'SELECT 1' | npx prisma db execute --stdin > /dev/null 2>&1; do
  echo "⏳ DB not ready yet..."
  sleep 1
done

echo "✅ Database is ready!"

echo "🔄 Running Prisma Generate"
npx prisma generate

echo "🚀 Running migrations..."
npx prisma migrate deploy || {
  echo "❌ Migration failed"
}

echo "🔥 Starting app..."
npm run start